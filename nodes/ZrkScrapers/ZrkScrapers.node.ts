import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError, sleep } from 'n8n-workflow';
import { properties, scrapers } from './properties';

const API = 'https://api.apify.com/v2';
const TERMINAL = ['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'];

export class ZrkScrapers implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ZRK Scrapers',
		name: 'zrkScrapers',
		icon: { light: 'file:zrkScrapers.svg', dark: 'file:zrkScrapers.dark.svg' },
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["scraper"]}}',
		description:
			'Jobs (Greenhouse, Lever, Ashby, Workday), PageSpeed audits, UK new companies, TikTok transcripts, Luma organizers, Google Hotels prices, Google Ads Transparency and Telegram channels, via Apify',
		defaults: {
			name: 'ZRK Scrapers',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'zrkScrapersApifyApi',
				required: true,
			},
		],
		properties,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const call = async (method: IHttpRequestMethods, path: string, body?: IDataObject) => {
			try {
				return (await this.helpers.httpRequestWithAuthentication.call(this, 'zrkScrapersApifyApi', {
					method,
					url: `${API}${path}`,
					body,
					json: true,
				})) as IDataObject;
			} catch (error) {
				throw new NodeApiError(this.getNode(), error as never);
			}
		};

		for (let i = 0; i < items.length; i++) {
			try {
				const tool = this.getNodeParameter('scraper', i) as string;
				const meta = scrapers[tool];
				const maxItems = this.getNodeParameter('maxItems', i, 50) as number;
				const options = this.getNodeParameter('options', i, {}) as IDataObject;
				const maxChargeUsd = (options.maxChargeUsd as number) ?? 1;
				const waitSecs = (options.waitSecs as number) ?? 300;

				let input: IDataObject = {};
				if (options.extraInput) {
					input =
						typeof options.extraInput === 'string'
							? (JSON.parse(options.extraInput) as IDataObject)
							: (options.extraInput as IDataObject);
				}
				for (const name of [...meta.listParams, ...meta.numberParams, ...meta.boolParams]) {
					const raw = this.getNodeParameter(name, i, undefined) as unknown;
					if (meta.listParams.includes(name)) {
						const list = String(raw ?? '')
							.split(',')
							.map((s) => s.trim())
							.filter(Boolean);
						if (list.length) input[name] = list;
					} else if (meta.numberParams.includes(name)) {
						if (typeof raw === 'number' && raw > 0) input[name] = raw;
					} else if (raw === true) {
						input[name] = true;
					}
				}
				const all = properties.filter(
					(p) => p.displayOptions?.show?.scraper?.includes(tool) && !(p.name in input),
				);
				for (const p of all) {
					if (meta.listParams.includes(p.name) || meta.numberParams.includes(p.name) || meta.boolParams.includes(p.name)) continue;
					const v = this.getNodeParameter(p.name, i, '') as string;
					if (v !== '' && v !== undefined) input[p.name] = v;
				}
				if (meta.limitParam && input[meta.limitParam] === undefined) input[meta.limitParam] = maxItems;

				const actorPath = meta.actor.replace('/', '~');
				const qs = `waitForFinish=60&maxTotalChargeUsd=${maxChargeUsd}`;
				let run = (await call('POST', `/acts/${actorPath}/runs?${qs}`, input)).data as IDataObject;
				const deadline = Date.now() + waitSecs * 1000;
				while (!TERMINAL.includes(run.status as string) && Date.now() < deadline) {
					await sleep(2000);
					run = (await call('GET', `/actor-runs/${run.id}?waitForFinish=50`)).data as IDataObject;
				}
				if (!TERMINAL.includes(run.status as string)) {
					throw new NodeOperationError(
						this.getNode(),
						`Run ${run.id} is still running after ${waitSecs}s. Raise "Wait Timeout" or check https://console.apify.com/view/runs/${run.id}`,
						{ itemIndex: i },
					);
				}
				if (run.status !== 'SUCCEEDED') {
					throw new NodeOperationError(
						this.getNode(),
						`Run ${run.id} ended with status ${run.status}. See https://console.apify.com/view/runs/${run.id}`,
						{ itemIndex: i },
					);
				}
				const rows = (await this.helpers.httpRequestWithAuthentication.call(this, 'zrkScrapersApifyApi', {
					method: 'GET',
					url: `${API}/datasets/${run.defaultDatasetId}/items?clean=true&format=json&limit=${maxItems}`,
					json: true,
				})) as IDataObject[];
				for (const row of rows) returnData.push({ json: row, pairedItem: { item: i } });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
