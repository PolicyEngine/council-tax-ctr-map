"""Modal entrypoint for live CTR calculations."""

from __future__ import annotations

import modal


POLICYENGINE_UK_SPEC = (
    "git+https://github.com/PolicyEngine/policyengine-uk.git@codex/ctr-framework"
)

app = modal.App("policyengine-ctr-calculator")

image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "fastapi[standard]",
        "policyengine-core",
        POLICYENGINE_UK_SPEC,
    )
)


def calculate_policyengine_payload(payload: dict) -> dict:
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


@app.function(image=image)
@modal.asgi_app()
def web():
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware

    api = FastAPI()
    api.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "https://council-tax-ctr-map.vercel.app",
            "http://localhost:3067",
            "http://localhost:3000",
        ],
        allow_credentials=False,
        allow_methods=["POST", "OPTIONS"],
        allow_headers=["*"],
    )

    @api.post("/calculate")
    def calculate(payload: dict) -> dict:
        return calculate_policyengine_payload(payload)

    return api
