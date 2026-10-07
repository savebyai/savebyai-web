# SaveByAI Phase 1 Validation v0.4 — Focused Funnel

## Why this release exists

The homepage now has one acquisition objective:

**Savings Check started -> Savings Check completed -> Personalised review requested**

The following were removed from the homepage so they do not contaminate the validation signal:

- "I'm shopping now" hero CTA
- shopping search box
- merchant grid/search
- effective-price calculator
- buying-guide cards
- deal-alert/watchlist signup
- homepage cashback activation modal

They still exist elsewhere where appropriate:
- shopping: `/stores/`
- merchant cashback pages: `/stores/...`
- missing cashback: `/claim.html`
- SEO buying guides remain published and in the sitemap

## Does Step 3 submit real data?

Yes.

`public/household-savings.js` sends the review request to:

`POST /api/lead`

with:

- email
- source = `household-savings-check`
- consent = true
- compact household profile stored in `interest`

The Worker stores it in the existing D1 `leads` table.

The same flow sends these funnel events to `POST /api/event`:

- `savings_check_started`
- `savings_check_completed`
- `savings_review_requested`

No D1 migration is required.

## Exact D1 validation queries

### Funnel

```sql
SELECT
  event_name,
  COUNT(*) AS total
FROM events
WHERE event_name IN (
  'savings_check_started',
  'savings_check_completed',
  'savings_review_requested'
)
GROUP BY event_name
ORDER BY event_name;
```

### Recent beta-review requests

```sql
SELECT
  email,
  interest,
  country,
  created_at,
  updated_at
FROM leads
WHERE source = 'household-savings-check'
ORDER BY updated_at DESC;
```

### Daily funnel

```sql
SELECT
  substr(created_at,1,10) AS day,
  event_name,
  COUNT(*) AS total
FROM events
WHERE event_name IN (
  'savings_check_started',
  'savings_check_completed',
  'savings_review_requested'
)
GROUP BY day,event_name
ORDER BY day DESC,event_name;
```

## Important current behaviour

The existing `leads` table is keyed by email and the Worker currently upserts on email.
A later submission from the same email can therefore update that person's latest `interest` and `source`.

For this small validation test that is acceptable, but it is not a long-term CRM model.

## Cloudflare

No schema change.

Root directory stays exactly:

`/SaveByAI_Growth_Patch_2026-10-04`
