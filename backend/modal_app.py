"""Modal entrypoint sketch for live CTR calculations.

This is not used by the static export. Deploy this separately once arbitrary
household input needs to be served outside a local PolicyEngine UK worktree.
"""

from __future__ import annotations

import modal


app = modal.App("policyengine-ctr-calculator")

image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "policyengine-core",
        "git+https://github.com/PolicyEngine/policyengine-uk.git",
    )
)


@app.function(image=image)
@modal.fastapi_endpoint(method="POST")
def calculate(payload: dict) -> dict:
    """Return CTR outputs for a PolicyEngine-compatible household payload."""
    from policyengine_core.simulations import SimulationBuilder
    from policyengine_uk import CountryTaxBenefitSystem

    period = int(payload.get("period", 2026))
    situation = payload["situation"]
    simulation = SimulationBuilder().build_from_dict(
        CountryTaxBenefitSystem(),
        situation,
    )

    return {
        "council_tax": float(simulation.calculate("council_tax", period)[0]),
        "council_tax_reduction": float(
            simulation.calculate("council_tax_reduction", period)[0]
        ),
        "council_tax_less_benefit": float(
            simulation.calculate("council_tax_less_benefit", period)[0]
        ),
    }
