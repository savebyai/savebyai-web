# SaveByAI v0.1

Lean validation website for SaveByAI.

## Includes
- Responsive landing page
- Merchant search/filter
- 15 MVP merchant placeholders
- No invented cashback rates
- Affiliate buttons disabled until approval
- Cloudflare Pages Function scaffold at `/go/:merchant`
- Local-only waitlist placeholder

## Run locally
`python -m http.server 8000`

Open `http://localhost:8000`.

## Deployment path
1. Create GitHub repo `savebyai-web`
2. Push these files
3. Connect repo to Cloudflare Pages
4. No build command required
5. Deploy and test `*.pages.dev`
6. Add `savebyai.in` custom domain
7. After affiliate approval, add verified links, SubIDs and live rates
