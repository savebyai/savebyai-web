# Deploy v5 — five live merchant routes

No D1 schema change is required.

## Cloudflare root directory
Keep the existing root directory exactly:
`/SaveByAI_Growth_Patch_2026-10-04`

## After deploy test
1. Open `/stores/` and each of the 5 store pages.
2. Click each CTA once. India-targeted programmes such as Kama Ayurveda or DigiHaat may show GEO-specific behaviour when tested from outside India.
3. Confirm `/api/cashback/config` lists 5 live merchants.
4. Confirm D1 receives `affiliate_click` with a unique click ID.
5. Confirm Admitad reports clicks / SubID4 when available.
6. Open `/sitemap.xml` and verify the new store URLs appear.
7. In Google Search Console, inspect the 5 store URLs and request indexing.

## Live affiliate routes
- `/go/bewakoof`
- `/go/nilkamal`
- `/go/kama-ayurveda`
- `/go/digihaat`
- `/go/palmonas`
