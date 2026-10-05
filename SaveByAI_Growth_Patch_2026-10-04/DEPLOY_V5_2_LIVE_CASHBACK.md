# SaveByAI v5.2 — Live Cashback

Focused release:

- Bewakoof: 10% SaveByAI cashback
- Kama Ayurveda: 12% SaveByAI cashback
- Cashback estimator shown in rupees from expected checkout spend
- Email popup before tracked redirect
- Simplified Bewakoof and Kama merchant pages
- Existing SubID4 click attribution preserved

## Deployment

Keep the existing Cloudflare root directory:

`SaveByAI_Growth_Patch_2026-10-04`

Replace the existing project contents with this folder and commit.

There is **no D1 schema change** in v5.2.

## Test after deployment

1. Open the homepage. Bewakoof should show approximately `₹200 back on ₹2,000`; Kama Ayurveda should show `₹240 back on ₹2,000`.
2. Click `Calculate & activate cashback` on Bewakoof. The popup should include planned spend and email.
3. Change spend to ₹3,000. Bewakoof estimate should become ₹300.
4. Submit a test email. The redirect should use the existing Admitad URL and a unique `subid4`.
5. Repeat on Kama Ayurveda: ₹3,000 should estimate ₹360.
6. Open `/stores/bewakoof.html` and `/stores/kama-ayurveda.html`. Each page should fit the main customer decision into the first screen on desktop: spend, rupee estimate, other savings, activate button.
7. Check D1 `events` for `affiliate_click` and `cashback_started` and Admitad Reports → SubID4 for the matching click ID.

## Important

The planned-spend cashback amount is an estimate only. The rate snapshot is stored on the tracked click; final cashback must later be calculated from the eligible transaction/order value confirmed by the affiliate network.
