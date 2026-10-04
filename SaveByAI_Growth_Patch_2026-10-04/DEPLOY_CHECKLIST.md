# SaveByAI Growth Patch — deployment checklist

This is an operational patch to v0.3, not a cosmetic v0.4. It adds:
- consumer-facing homepage instead of affiliate-network status cards
- central anonymous product-event endpoint
- early-access email capture
- D1 schema for events + leads
- five SEO buying guides
- sitemap.xml + robots.txt
- Mitgo verification tag preserved
- updated privacy notice

## A. Create the D1 database

From the repository root after installing Node.js dependencies:

```bash
npm install
npx wrangler login
npx wrangler d1 create savebyai-growth
```

Copy the returned database ID into `wrangler.jsonc`, replacing:

`REPLACE_WITH_YOUR_D1_DATABASE_ID`

Then create the tables:

```bash
npm run db:remote
```

## B. Deploy

```bash
npm run deploy
```

The existing custom domains `savebyai.in` and `www.savebyai.in` should remain attached to the Worker. Confirm them in Cloudflare after deployment before changing anything else.

## C. Verify the APIs

Open:

`https://savebyai.in/api/health`

Expected:

```json
{"ok":true,"service":"savebyai"}
```

Then submit the early-access form once with your own test email. In Cloudflare D1, run:

```sql
SELECT * FROM leads ORDER BY created_at DESC LIMIT 10;
SELECT event_name, COUNT(*) AS n FROM events GROUP BY event_name ORDER BY n DESC;
```

## D. Enable Cloudflare Web Analytics

Cloudflare Dashboard → Web Analytics → Add a site → `savebyai.in`.

If Cloudflare supplies a beacon snippet, add it before `</body>` on the HTML pages, or use the dashboard's automatic setup if available for your deployment type.

Use Web Analytics for page views/referrers/device/country. Use the D1 `events` table for product actions such as searches and calculator usage.

## E. Google Search Console

1. Open Google Search Console.
2. Add a **Domain property** for `savebyai.in`.
3. Google will give you a TXT record.
4. Add that TXT record in Cloudflare DNS.
5. Return to Search Console and click Verify.
6. Submit sitemap: `https://savebyai.in/sitemap.xml`.

## F. Cold-user validation — no friends/family required

Do not run paid ads yet. Use anonymous brand accounts and free short-form content.

Initial target: 50–100 real site visitors from public content.

Watch these metrics:
- Activation = visitors who search OR use calculator
- Early-access conversion = visitors who leave email
- Most searched merchants/categories
- Guide clicks
- Repeat visits (Web Analytics)

Practical first thresholds after 100 visitors:
- 20+ search/calculator activations = useful signal
- 5+ early-access signups = strong early intent
- 10+ distinct merchant/product interests = enough to prioritise integrations

Do not treat these as success guarantees; they are stop/go evidence for the next iteration.
