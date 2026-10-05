# Cashback rates — v5.2

Internal control note. Do not expose affiliate commission margins on customer pages.

| Merchant | Admitad commission | Cashback traffic | SaveByAI customer rate | Gross percentage-point spread |
|---|---:|---|---:|---:|
| Bewakoof | 15.40% | Allowed | 10.00% | 5.40 pp |
| Kama Ayurveda | 19.60% | Allowed | 12.00% | 7.60 pp |

Both customer rates are configured server-side in `src/index.js`. Static merchant pages fetch the live cashback configuration from `/api/cashback/config`, so the Worker configuration is the operational source for the customer rate.

Future work: replace hard-coded rate decisions with a merchant-economics/rules table once more networks and merchants are approved.
