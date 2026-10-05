# Deploy this build without changing Cloudflare Root Directory

Cloudflare currently expects this exact repository folder:

`/SaveByAI_Growth_Patch_2026-10-04`

The previous v2 ZIP used a different top-level folder name, so Cloudflare stopped before the build and reported:

`Failed: root directory not found`

This v3 package intentionally restores the exact folder name Cloudflare already expects.

## GitHub
1. In the repository root, remove the wrongly named `SaveByAI_Cashback_MVP_v2_2026-10-05` folder if it was uploaded.
2. Upload/replace the folder `SaveByAI_Growth_Patch_2026-10-04` from this ZIP.
3. Commit the changes.
4. Do NOT change the Cloudflare Root Directory for this build.

## No database migration for v3
This build changes presentation/UX only. The D1 schema from the cashback MVP remains valid.

## Test after deployment
- `/` loads the updated homepage.
- Top navigation says `My Savings`.
- `/claim` opens the My Savings / missing cashback page.
- Submit a claim and confirm the large success receipt appears.
- The Smart Deal Alerts beta form writes to `leads` with source `deal_alert`.
- `/go/nilkamal` still creates an Admitad SubID4 tracked click.
