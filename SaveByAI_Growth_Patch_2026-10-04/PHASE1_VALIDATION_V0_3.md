# SaveByAI Phase 1 Validation v0.3

This release is intentionally small.

## Added

- `/about.html`
- `/contact.html`
- A consistent site-wide footer with:
  - Savings Check
  - How it works
  - Shopping
  - My SaveByAI
  - About
  - Contact us
  - Affiliate disclosure
  - Privacy
  - Terms
- About and Contact pages added to the sitemap.

## Contact

The public contact address currently shown is:

`savebyai@gmail.com`

No contact-form database changes were added. This avoids overwriting household beta lead records in the existing `leads` table.

## Unchanged

- Household Savings Check logic
- Step 3 result logic
- Cashback tracking
- Claim Cashback
- D1 schema
- Cloudflare root directory

Cloudflare root remains:

`/SaveByAI_Growth_Patch_2026-10-04`

The repository-root GitHub Actions workflow should remain outside this Cloudflare application folder.
