# SaveByAI cashback MVP

## Customer flow
1. Browse/search without an account.
2. A merchant card only shows customer cashback when server config says `cashbackEnabled: true`.
3. On "Activate cashback & shop", ask only for email.
4. `/api/cashback/start` creates/reuses a silent cashback user, generates a unique click ID, writes it to D1, passes the same ID to Admitad as `subid4`, and returns the merchant redirect.
5. Recent click IDs are stored locally in the browser for claim recovery.
6. `/claim.html` lets a user attach an email to a matching anonymous click or submit a manual-review claim.

## Important safety switch
Nilkamal tracking is live, but customer cashback is deliberately OFF in `src/index.js` until:
- cashback/incentive traffic is expressly permitted for this programme; and
- SaveByAI chooses and verifies the customer payout rate.

When verified, edit the Nilkamal config in `src/index.js`:
- `cashbackEnabled: true`
- `cashbackLabel: '5% cashback'` (example only — use the verified rate)
- `cashbackRateBps: 500` (example only)

Do not use the affiliate commission itself as the customer cashback rate.

## D1 migration
Before testing cashback identity/claims on production, run:

`npm run db:remote`

The schema is additive and creates:
- `cashback_users`
- `cashback_clicks`
- `cashback_claims`

Existing `events` and `leads` tables are preserved.

## Test checklist
- Homepage loads and merchant cards render.
- Nilkamal "Shop via tracked link" still redirects and Admitad receives SubID4.
- D1 receives a row in `cashback_clicks`.
- Claim page lists the recent browser trip.
- A manual claim can be submitted with an email.
- After enabling a verified cashback programme, popup email is stored and the click row contains `user_id` + the snapshotted cashback rate/label.
