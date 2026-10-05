# Deploy v5.3 — Verified Offers + Offer Watcher

No D1 schema change is required.

1. Keep Cloudflare Root Directory as `/SaveByAI_Growth_Patch_2026-10-04`.
2. Replace the current project folder with this package and commit.
3. Let Cloudflare deploy.
4. Test:
   - `/stores/bewakoof.html`
   - `/stores/kama-ayurveda.html`
   - cashback calculator + email popup
5. In GitHub → Actions → **SaveByAI Offer Watcher** → Run workflow once manually.
6. Open the uploaded `savebyai-offer-watch-report` artifact. A green workflow means all known offer assertions were still visible on the official pages.

The watcher does not auto-publish changes. That is deliberate for v1.
