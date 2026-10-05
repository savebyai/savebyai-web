# SaveByAI Offer Watcher v1

This is intentionally a **review-first** watcher. It does not publish or remove offers automatically.

## What it watches now

- Bewakoof official clearance page
  - Up to 70% off clearance
  - Free shipping above ₹399
  - selected multi-buy language
- Kama Ayurveda official offer page
  - KAMA10
  - MobiKwik wallet cashback
  - first MobiKwik UPI cashback
  - American Express 10X reward language

The public source of truth is `public/data/verified-offers.json`.

## How it works

`python tools/offer_watcher.py`

The script fetches official merchant pages, confirms the known offer phrases are still present, and writes `offer-watch-report.json`. It also surfaces a small set of saving-related text snippets as possible new offers for human review.

It exits non-zero if a known offer disappears or a source cannot be checked.

## Daily automation

`.github/workflows/offer-watcher.yml` runs every day at 07:00 IST and can also be run manually from GitHub Actions. It uploads the report as an artifact. A failed workflow means **review required**; it does not change the live website.

## Cashback economics

The live merchant and cashback configuration now lives in `src/merchant-config.mjs`. Run:

`node tools/cashback_economics.mjs`

This checks the affiliate commission, customer cashback and minimum configured gross spread. Excel remains useful for audit/reporting, but it is no longer needed for every quick margin calculation.
