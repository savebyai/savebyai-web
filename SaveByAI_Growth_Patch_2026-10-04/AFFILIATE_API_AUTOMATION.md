# SaveByAI affiliate API automation

## Decision
Use network APIs/feeds as the default source of merchant/program data. Manual searching becomes an exception for programme-specific rules that are not reliably exposed in structured data.

## What should be automated
1. Program discovery and access status
2. Commission/action rates
3. Program active/paused/declined status
4. Affiliate/deep-link generation
5. Coupons/offers where the network exposes them
6. Product feeds where individual advertisers expose them
7. Transactions/conversions and their validation status
8. Missing-transaction reconciliation
9. Daily/weekly reporting and rate-change alerts

## What must stay behind a verification gate
Never infer customer cashback purely from the affiliate commission. SaveByAI should publish cashback only when the programme explicitly permits cashback/loyalty/incentive traffic and the customer rate has been approved internally.

Suggested normalized fields:
- network
- network_program_id
- merchant_slug
- merchant_name
- site_url
- access_status
- programme_status
- commission_rule
- cookie_days
- cashback_permission: explicit_allowed | explicit_forbidden | unknown
- tracking_type
- deeplink_supported
- product_feed_supported
- last_synced_at
- source_updated_at

## Network order
### 1. Admitad — now
Already active. Use API/catalog/XML + SubID/postback/action reporting. Current XML export can already be machine-scanned rather than reviewed row by row.

### 2. Cuelinks — after publisher approval/API key
Cuelinks V3 is especially valuable because it normalizes campaigns from many underlying networks and exposes campaigns, offers, URL conversion, transactions, reports and missing transactions through one schema.

### 3. vCommission — after approval
Confirm exact publisher API/feed access with the account manager, then build an adapter into the same normalized model.

## Recommended sync cadence
- Program/rate/status: every 6 hours initially
- Offers/coupons: every 2–6 hours depending on API limits
- Transactions: every hour during beta (or webhooks/postbacks when available)
- Full reconciliation: once daily

## Security
Keep API credentials in Cloudflare Secrets only. Never put them in public JS, GitHub, merchant JSON, or chat transcripts.
