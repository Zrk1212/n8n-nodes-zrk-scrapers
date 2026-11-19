import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ZrkScrapersApifyApi implements ICredentialType {
	name = 'zrkScrapersApifyApi';

	displayName = 'ZRK Scrapers (Apify) API';

	icon: Icon = {
		light: 'file:../nodes/ZrkScrapers/zrkScrapers.svg',
		dark: 'file:../nodes/ZrkScrapers/zrkScrapers.dark.svg',
	};

	documentationUrl = 'https://docs.apify.com/platform/integrations/api#api-token';

	properties: INodeProperties[] = [
		{
			displayName: 'Apify API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'Your Apify API token from console.apify.com/settings/integrations',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.apify.com/v2',
			url: '/users/me',
			method: 'GET',
		},
	};
}
