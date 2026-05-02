# Council Tax and CTR Map

PolicyEngine-style explorer for gross Council Tax and modeled Council Tax
Reduction across English billing authorities. The app exposes full household
inputs and falls back to generated oracle results unless a live PolicyEngine API
is configured.

## Data Contract

The app is a static Next.js export. It reads generated files in `public/data`:

- `authority-results.json`: MHCLG 2026-27 council tax bands plus PolicyEngine UK
  CTR outputs for modeled authorities, household scenarios, and earnings curves.
- `england-local-authorities.geojson`: ONS Local Authority District boundaries
  filtered to the English billing authorities in MHCLG Table 9.

Generated outputs come from `scripts/generate_static_data.py`; the frontend does
not hardcode bill calculations. For arbitrary household inputs, set
`NEXT_PUBLIC_CTR_API_URL` to the Modal `/calculate` endpoint in `backend/`.

Primary sources:

- MHCLG, Council Tax levels set by local authorities in England 2026 to 2027:
  https://www.gov.uk/government/statistics/council-tax-levels-set-by-local-authorities-in-england-2026-to-2027
- ONS Local Authority Districts December 2024 boundaries, UK BGC:
  https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/Local_Authority_Districts_December_2024_Boundaries_UK_BGC/FeatureServer

## Development

```bash
bun install
bun run generate:data
bun run dev
```

By default the generator reads the CTR worktree at
`/Users/maxghenis/pr-worktrees/policyengine-uk-1534-ctr`. Override it with:

```bash
POLICYENGINE_UK_PATH=/path/to/policyengine-uk bun run generate:data
```

## Verification

```bash
bun run lint
bun run test
bun run build
```

## Live Backend Path

The checked-in app remains an independent static oracle. To calculate exact CTR
for every household input in the form, deploy `backend/modal_app.py` and build
with `NEXT_PUBLIC_CTR_API_URL=https://<modal-host>/calculate`. Keep the generated
scenarios as regression fixtures for PolicyEngine UK and Axiom.
