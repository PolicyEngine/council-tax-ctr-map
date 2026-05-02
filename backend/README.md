# Live Calculation Backend

The frontend can run as a static oracle or call a live Modal API for arbitrary
household inputs. Deploy `modal_app.py`, then build the frontend with:

```bash
NEXT_PUBLIC_CTR_API_URL=https://<modal-host>/calculate bun run build
```

The Modal image installs PolicyEngine UK from the CTR PR branch
`codex/ctr-framework`. The static dataset remains the fallback oracle for local
development, browser verification, and future Axiom comparisons.
