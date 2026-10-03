# SaveByAI v0.3

## What changed
- Website data exported from the Excel control-plane rather than maintained as a separate manual list.
- Generic merchant-detail page.
- Manual effective-price calculator for product validation without fake rates.
- Local analytics-event scaffold (`savebyai_events` in browser localStorage).
- Merchant request CTA.
- Affiliate routes remain disabled until verified.

## Deploy
Use the same Cloudflare Worker deployment process you used for v0.2, with the GitHub root folder set to `savebyai-v0.3`.

## Important
Do not add live cashback rates or affiliate destinations until they are verified in the master workbook.
