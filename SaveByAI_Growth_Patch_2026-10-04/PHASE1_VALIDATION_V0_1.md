# SaveByAI Phase 1 Validation v0.1

## What changed

This release deliberately does only one new product experiment:

**Household Savings Check -> result -> optional manual beta review**

Existing shopping cashback remains live and unchanged as a separate savings mechanism.

No new D1 tables are required.

## URLs to test

- `/`
- `/household-savings.html`
- `/stores/bewakoof.html`
- `/stores/kama-ayurveda.html`
- `/my.html`

## What the Savings Check captures

The user's rough:
- household size
- city (optional)
- priority category
- monthly shopping
- fuel/transport
- subscriptions
- mobile/broadband
- groceries
- other recurring bills

The result deliberately does NOT promise a fixed amount of savings.

If a user requests a personalised beta review, the existing `leads` table receives:
- email
- source = `household-savings-check`
- a compact audit string in `interest`

## D1 query for manual beta-review requests

```sql
SELECT email, interest, country, created_at
FROM leads
WHERE source = 'household-savings-check'
ORDER BY created_at DESC;
```

## D1 query for funnel events

```sql
SELECT event_name, COUNT(*) AS total
FROM events
WHERE event_name IN (
  'savings_check_started',
  'savings_check_completed',
  'savings_review_requested'
)
GROUP BY event_name
ORDER BY event_name;
```

## 30-day validation

Do not treat this as PMF. It is a continue/stop signal.

Working targets:
- 100 qualified visitors
- 30 Savings Checks started
- 15+ completed
- 8-10 personalised reviews requested
- 10 recommendations delivered manually
- 4+ users act on at least one recommendation
- 3+ users ask SaveByAI to review another category

## Manual concierge control

For users 1-5:
- personal conversation + recommendation

For users 6-10:
- send a standard SaveByAI-style recommendation without personal coaching

This helps separate:
- "the founder persuaded me"
from
- "the product recommendation persuaded me"

## First recruitment message

> We're testing a free 2-minute household savings check for people in India.
> It does not ask for bank access, card numbers or documents.
> The goal is to identify which everyday expenses are actually worth reviewing.
> Early users can request a free manual savings review.
> We're looking for feedback, not trying to sell a financial product.

Use only in communities where self-promotion/research posts are permitted, or after admin approval.

## Product rule

**Recommend what saves the customer the most, even when SaveByAI earns nothing.**
