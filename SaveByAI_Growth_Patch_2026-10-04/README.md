# SaveByAI v4 — dashboard separation + API-first affiliate plan

This build separates **My SaveByAI** (dashboard/account-like area) from **Claim Cashback** (recovery-only flow). It also includes an API-first affiliate automation plan and an Admitad XML scanner under `tools/`.

**No D1 schema change is required for this build.**

Key files:
- `public/my.html` / `public/my.js` — lightweight dashboard
- `public/claim.html` / `public/claim.js` — missing-cashback recovery only
- `AFFILIATE_API_AUTOMATION.md` — network integration plan
- `ADMITAD_CASHBACK_CANDIDATES_2026-10-05.md` — candidates from the current program export
- `tools/admitad_program_scan.py` — repeatable XML scan

---

# SaveByAI v0.3 Growth Patch — 4 Oct 2026

Purpose: make the existing MVP ready for anonymous cold-user validation while affiliate approvals are pending.

## Covers the six priorities
1. Real analytics: Cloudflare Web Analytics for traffic + D1 event endpoint for product actions.
2. Early access: email + optional merchant/product interest stored in D1.
3. User testing: replaced friends/family testing with anonymous cold traffic from free public content.
4. Promotion engine: included `PROMO_CONTENT_PACK.md` with 10 scripts and a 7-day schedule.
5. SEO: added five useful buying guides without unverified rates.
6. Search Console: added `sitemap.xml`, improved `robots.txt`, canonical tags, and a verification checklist.

## Important
This patch intentionally does NOT enable affiliate redirects or claim live cashback rates.

See `DEPLOY_CHECKLIST.md` before deploying.

## v3 — 5 Oct 2026
- Cloudflare root-directory-safe package: top-level folder remains `SaveByAI_Growth_Patch_2026-10-04`.
- Navigation renamed from `Claim cashback` to `My Savings`.
- Claim page reframed as a lightweight savings area with recent tracked trips and missing-cashback recovery.
- Added beta Smart Deal Alerts/watchlist capture inspired by the useful distribution pattern seen in Indian deal communities, without turning SaveByAI into a bulk deal-feed clone.
- No D1 schema migration required for this version.
