# n8n-nodes-zrk-scrapers

An [n8n](https://n8n.io) community node with 9 production web scrapers. Each one runs a maintained [Apify](https://apify.com/zrk1212) actor and returns one n8n item per result.

| Scraper | What it gets |
|---|---|
| ATS Jobs Scraper | Open jobs from Greenhouse, Lever, Ashby, SmartRecruiters, Workable, Recruitee, Personio, Teamtailor, Rippling ([actor](https://apify.com/zrk1212/ats-jobs-monitor)) |
| Workday Jobs Scraper | Every job on a Workday career site, past the 2,000 cap ([actor](https://apify.com/zrk1212/workday-jobs-scraper)) |
| Bulk PageSpeed & Core Web Vitals Checker | Lighthouse scores, real-user Core Web Vitals and top fixes ([actor](https://apify.com/zrk1212/pagespeed-bulk-auditor)) |
| UK New Company Leads | Newly incorporated UK companies with directors, from Companies House ([actor](https://apify.com/zrk1212/uk-new-company-leads)) |
| TikTok Transcript Scraper | Transcripts from TikTok video URLs or profiles ([actor](https://apify.com/zrk1212/tiktok-transcript-scraper)) |
| Luma Event Organizer Leads | Luma organizers with website, socials and audience size ([actor](https://apify.com/zrk1212/luma-organizer-leads)) |
| Google Hotels Prices Scraper | Prices from every seller on Google Hotels for exact dates ([actor](https://apify.com/zrk1212/google-hotels-prices-scraper)) |
| Google Ads Transparency Scraper | A brand's Google ads with Search ad copy as text ([actor](https://apify.com/zrk1212/google-ads-transparency-ad-copy)) |
| Telegram Channel Scraper | Public channel posts, views, reactions and subscriber counts ([actor](https://apify.com/zrk1212/telegram-channel-scraper-stats)) |

The node is usable as an AI Agent tool.

## Installation

In n8n: **Settings > Community Nodes > Install**, enter `n8n-nodes-zrk-scrapers`. See the [community nodes guide](https://docs.n8n.io/integrations/community-nodes/installation/).

## Credentials

Create a free Apify account and copy your API token from [console.apify.com/settings/integrations](https://console.apify.com/settings/integrations). In n8n, add a **ZRK Scrapers (Apify) API** credential and paste the token.

## Usage

1. Pick a **Scraper** and fill in its fields. List fields take comma-separated values.
2. **Max Items** limits how many results come back.
3. Under **Options**: **Max Charge (USD)** caps the cost of each run (default $1), **Wait Timeout** sets how long to wait for the run, and **Extra Input (JSON)** passes any other actor input field.

Each actor is pay-per-result on your Apify account (for example $0.60 per 1,000 Telegram posts, $2 per 1,000 jobs). Prices are on each actor page.

## Compatibility

Tested with n8n 1.x node API version 1.

## Resources

- [n8n community nodes docs](https://docs.n8n.io/integrations/#community-nodes)
- [Actors on the Apify Store](https://apify.com/zrk1212)
- MCP server version for AI agents: [zrk-scrapers-mcp](https://github.com/Zrk1212/scrapers-mcp)

## Version history

- 0.1.0: first release with 9 scrapers.
