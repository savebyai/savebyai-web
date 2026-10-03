# SaveByAI v0.2

## Improvements
- Stronger customer-facing positioning
- Search + category + priority filters
- Effective-price explanation
- Verification/trust section
- Affiliate status panel
- Disclosure/privacy/terms pages
- `/go/:merchant` scaffold

## Cloudflare Pages deployment
- Production branch: `main`
- Root directory: `savebyai-v0.2`
- Build command: `exit 0`
- Build output directory: `.`

For an external-DNS workaround, create a Pages project and add `www.savebyai.in` under Pages > Custom domains. Then at GoDaddy change the `www` CNAME to the exact `<project>.pages.dev` hostname. The apex `savebyai.in` still needs nameserver control or forwarding to `www`.
