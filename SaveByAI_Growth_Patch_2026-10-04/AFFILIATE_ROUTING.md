# Affiliate routing

The Worker handles affiliate redirects through `/go/:merchant`.

Enabled merchants are defined in `src/index.js` under `AFFILIATE_MERCHANTS`.
Only add a merchant after its programme is approved and you have a valid affiliate URL.

For every affiliate click the Worker:
1. generates a UUID `click_id`;
2. stores an `affiliate_click` event in D1;
3. sends the same UUID to Admitad as `subid4`;
4. redirects the visitor to the affiliate URL.

Current test route:
- `/go/nilkamal`

After deployment, test `/go/nilkamal`, confirm a new D1 event, then check Admitad Reports -> On SubID and select SubID4 after reporting has updated.
