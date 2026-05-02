#!/usr/bin/env python3
"""Generate the static Council Tax / CTR dataset used by the app.

The frontend never hardcodes computed bill outputs. This script pulls gross
Council Tax from MHCLG, modeled CTR from a PolicyEngine UK worktree, and local
authority geometries from the ONS ArcGIS service.
"""

from __future__ import annotations

import json
import math
import os
import re
import subprocess
import sys
from datetime import datetime, timezone
from io import BytesIO
from pathlib import Path
from typing import Any
from urllib.request import urlopen

import pandas as pd


REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_POLICYENGINE_UK_PATH = Path(
    "/Users/maxghenis/pr-worktrees/policyengine-uk-1534-ctr"
)
POLICYENGINE_UK_PATH = Path(
    os.environ.get("POLICYENGINE_UK_PATH", DEFAULT_POLICYENGINE_UK_PATH)
).expanduser()

FISCAL_YEAR = "2026-27"
PERIOD = 2026
BANDS = ["A", "B", "C", "D", "E", "F", "G", "H"]
EARNINGS_POINTS = [
    0,
    5_000,
    10_000,
    15_000,
    20_000,
    25_000,
    30_000,
    35_000,
    40_000,
    45_000,
    50_000,
]
COUNCIL_TAX_SOURCE_PAGE = (
    "https://www.gov.uk/government/statistics/"
    "council-tax-levels-set-by-local-authorities-in-england-2026-to-2027"
)
BOUNDARIES_URL = (
    "https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/"
    "Local_Authority_Districts_December_2024_Boundaries_UK_BGC/"
    "FeatureServer/0/query?where=1%3D1&outFields=LAD24CD,LAD24NM,LONG,LAT"
    "&returnGeometry=true&outSR=4326&f=geojson&geometryPrecision=5"
)

EARNINGS_PROFILES = [
    {
        "id": "single_adult_no_savings",
        "label": "Single adult",
        "description": "Age 35, no savings, claims entitled benefits.",
        "adult_earnings": 0,
        "savings": 0,
        "children_ages": [],
        "would_claim_uc": False,
    },
    {
        "id": "single_adult_8k_savings",
        "label": "Single adult, GBP 8k savings",
        "description": "Age 35, GBP 8,000 household savings.",
        "adult_earnings": 0,
        "savings": 8_000,
        "children_ages": [],
        "would_claim_uc": False,
    },
    {
        "id": "lone_parent_one_child",
        "label": "Lone parent, one child",
        "description": (
            "Age 35 with one child aged 4, no savings, claims UC where entitled."
        ),
        "adult_earnings": 0,
        "savings": 0,
        "children_ages": [4],
        "would_claim_uc": True,
    },
]

SCENARIOS = [
    {
        "id": "single_no_earnings",
        "label": "Single adult, no earnings",
        "description": "Age 35, no earnings, no savings, claims entitled benefits.",
        "earnings_profile_id": "single_adult_no_savings",
        "adult_earnings": 0,
        "savings": 0,
        "children_ages": [],
        "would_claim_uc": False,
    },
    {
        "id": "single_20k_earnings",
        "label": "Single adult, GBP 20k earnings",
        "description": "Age 35, GBP 20,000 annual employment income, no savings.",
        "earnings_profile_id": "single_adult_no_savings",
        "adult_earnings": 20_000,
        "savings": 0,
        "children_ages": [],
        "would_claim_uc": False,
    },
    {
        "id": "single_35k_earnings",
        "label": "Single adult, GBP 35k earnings",
        "description": "Age 35, GBP 35,000 annual employment income, no savings.",
        "earnings_profile_id": "single_adult_no_savings",
        "adult_earnings": 35_000,
        "savings": 0,
        "children_ages": [],
        "would_claim_uc": False,
    },
    {
        "id": "single_8k_savings",
        "label": "Single adult, GBP 8k savings",
        "description": "Age 35, no earnings, GBP 8,000 household savings.",
        "earnings_profile_id": "single_adult_8k_savings",
        "adult_earnings": 0,
        "savings": 8_000,
        "children_ages": [],
        "would_claim_uc": False,
    },
    {
        "id": "lone_parent_15k_earnings",
        "label": "Lone parent, GBP 15k earnings",
        "description": (
            "Age 35 with one child aged 4, GBP 15,000 annual employment income, "
            "no savings, claims UC where entitled."
        ),
        "earnings_profile_id": "lone_parent_one_child",
        "adult_earnings": 15_000,
        "savings": 0,
        "children_ages": [4],
        "would_claim_uc": True,
    },
]


def slug(value: str) -> str:
    value = value.replace("'", "")
    value = value.replace("&", "and")
    return re.sub(r"_+", "_", re.sub(r"[^a-z0-9]+", "_", value.lower())).strip("_")


def as_float(value: Any) -> float:
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return 0
    return round(float(value), 2)


def fetch_bytes(url: str) -> bytes:
    with urlopen(url, timeout=90) as response:
        return response.read()


def discover_tables_url() -> str:
    html = fetch_bytes(COUNCIL_TAX_SOURCE_PAGE).decode("utf-8")
    matches = re.findall(
        r"https://assets\.publishing\.service\.gov\.uk/[^\"<>]+Tables_1-9_2026-27\.ods",
        html,
    )
    if not matches:
        raise RuntimeError("Could not find the MHCLG Tables 1-9 ODS asset URL")
    return matches[0]


def load_table_9(tables_url: str) -> list[dict[str, Any]]:
    table_bytes = fetch_bytes(tables_url)
    frame = pd.read_excel(
        BytesIO(table_bytes),
        sheet_name="Table_9",
        engine="odf",
        header=2,
    )
    frame = frame.rename(columns={"Band G ": "Band G"})
    frame = frame[frame["ONS Code"].notna()]

    records = []
    for row in frame.to_dict(orient="records"):
        authority = str(row["Authority"]).strip()
        records.append(
            {
                "onsCode": str(row["ONS Code"]).strip(),
                "authority": authority,
                "slug": slug(authority),
                "region": str(row["Region"]).strip(),
                "class": str(row["Class"]).strip(),
                "area": str(row["Area"]).strip(),
                "bands": {
                    band: as_float(row[f"Band {band}"])
                    for band in BANDS
                },
            }
        )
    return records


def parse_work_queue_sources() -> dict[str, dict[str, str]]:
    queue_path = (
        POLICYENGINE_UK_PATH
        / "policyengine_uk/variables/gov/local_authorities/council_tax_reduction/scheme_work_queue.md"
    )
    sources: dict[str, dict[str, str]] = {}
    if not queue_path.exists():
        return sources

    for line in queue_path.read_text().splitlines():
        if not line.startswith("|") or "Implemented" not in line:
            continue
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if len(cells) < 4 or cells[1] != "Implemented":
            continue
        authority, _, scheme_type, source = cells[:4]
        sources[slug(authority)] = {
            "schemeType": scheme_type,
            "source": source,
        }
    return sources


def load_policyengine_symbols():
    sys.path.insert(0, str(POLICYENGINE_UK_PATH))

    from policyengine_core.simulations import SimulationBuilder
    from policyengine_uk import CountryTaxBenefitSystem
    from policyengine_uk.variables.household.demographic.locations import (
        LocalAuthority,
    )

    return CountryTaxBenefitSystem, SimulationBuilder, LocalAuthority


def implemented_authorities(LocalAuthority: Any) -> dict[str, dict[str, str]]:
    base = POLICYENGINE_UK_PATH / "policyengine_uk/variables/gov/local_authorities"
    enum_by_slug = {slug(item.value): item for item in LocalAuthority}
    implemented: dict[str, dict[str, str]] = {}

    for path in sorted(base.iterdir()):
        if not path.is_dir() or path.name in {"__pycache__", "council_tax_reduction"}:
            continue
        enum_item = enum_by_slug.get(path.name)
        if enum_item is None:
            raise RuntimeError(f"Could not match {path.name} to LocalAuthority enum")
        implemented[path.name] = {
            "enum": enum_item.name,
            "name": enum_item.value,
        }

    return implemented


def build_household(
    index: int,
    authority_enum: str,
    band: str,
    council_tax: float,
    scenario: dict[str, Any],
) -> tuple[dict[str, Any], dict[str, Any], dict[str, Any], str]:
    adult_id = f"adult_{index}"
    benunit_id = f"benunit_{index}"
    household_id = f"household_{index}"
    child_ids = []

    people = {
        adult_id: {
            "age": {PERIOD: 35},
            "employment_income": {PERIOD: scenario["adult_earnings"]},
        }
    }
    for child_index, child_age in enumerate(scenario["children_ages"]):
        child_id = f"child_{index}_{child_index}"
        child_ids.append(child_id)
        people[child_id] = {"age": {PERIOD: child_age}}

    members = [adult_id, *child_ids]
    has_children = bool(child_ids)
    benunit = {
        benunit_id: {
            "members": members,
            "claims_all_entitled_benefits": {PERIOD: True},
            "would_claim_uc": {PERIOD: scenario["would_claim_uc"]},
            "is_single_person": {PERIOD: True},
            "is_couple": {PERIOD: False},
            "is_lone_parent": {PERIOD: has_children},
            "eldest_adult_age": {PERIOD: 35},
            "benefits_premiums": {PERIOD: 0},
        }
    }
    household = {
        household_id: {
            "members": members,
            "country": {PERIOD: "ENGLAND"},
            "local_authority": {PERIOD: authority_enum},
            "council_tax_band": {PERIOD: band},
            "council_tax": {PERIOD: council_tax},
            "savings": {PERIOD: scenario["savings"]},
        }
    }
    return people, benunit, household, household_id


def simulate_results(
    authority_records: list[dict[str, Any]],
    implemented: dict[str, dict[str, str]],
) -> dict[tuple[str, str, str], dict[str, Any]]:
    CountryTaxBenefitSystem, SimulationBuilder, _ = load_policyengine_symbols()
    system = CountryTaxBenefitSystem()
    authority_by_code = {item["onsCode"]: item for item in authority_records}

    people: dict[str, Any] = {}
    benunits: dict[str, Any] = {}
    households: dict[str, Any] = {}
    index: list[tuple[str, str, str]] = []

    count = 0
    for authority in authority_records:
        modeled = implemented.get(authority["slug"])
        if modeled is None:
            continue
        for scenario in SCENARIOS:
            for band in BANDS:
                person_rows, benunit_row, household_row, _ = build_household(
                    count,
                    modeled["enum"],
                    band,
                    authority["bands"][band],
                    scenario,
                )
                people.update(person_rows)
                benunits.update(benunit_row)
                households.update(household_row)
                index.append((authority["onsCode"], scenario["id"], band))
                count += 1

    simulation = SimulationBuilder().build_from_dict(
        system,
        {
            "people": people,
            "benunits": benunits,
            "households": households,
        },
    )
    reductions = simulation.calculate("council_tax_reduction", PERIOD)
    net_bills = simulation.calculate("council_tax_less_benefit", PERIOD)
    supported = simulation.calculate("council_tax_reduction_scheme_supported", PERIOD)

    results: dict[tuple[str, str, str], dict[str, Any]] = {}
    for position, key in enumerate(index):
        _, _, band = key
        authority = authority_by_code[key[0]]
        results[key] = {
            "gross": authority["bands"][band],
            "reduction": as_float(reductions[position]),
            "net": as_float(net_bills[position]),
            "supported": bool(supported[position]),
        }

    return results


def simulate_earnings_curves(
    authority_records: list[dict[str, Any]],
    implemented: dict[str, dict[str, str]],
) -> dict[tuple[str, str, str, int], dict[str, Any]]:
    CountryTaxBenefitSystem, SimulationBuilder, _ = load_policyengine_symbols()
    system = CountryTaxBenefitSystem()
    authority_by_code = {item["onsCode"]: item for item in authority_records}

    people: dict[str, Any] = {}
    benunits: dict[str, Any] = {}
    households: dict[str, Any] = {}
    index: list[tuple[str, str, str, int]] = []

    count = 0
    for authority in authority_records:
        modeled = implemented.get(authority["slug"])
        if modeled is None:
            continue
        for profile in EARNINGS_PROFILES:
            for earnings in EARNINGS_POINTS:
                profile_at_earnings = {**profile, "adult_earnings": earnings}
                for band in BANDS:
                    person_rows, benunit_row, household_row, _ = build_household(
                        count,
                        modeled["enum"],
                        band,
                        authority["bands"][band],
                        profile_at_earnings,
                    )
                    people.update(person_rows)
                    benunits.update(benunit_row)
                    households.update(household_row)
                    index.append((authority["onsCode"], profile["id"], band, earnings))
                    count += 1

    simulation = SimulationBuilder().build_from_dict(
        system,
        {
            "people": people,
            "benunits": benunits,
            "households": households,
        },
    )
    reductions = simulation.calculate("council_tax_reduction", PERIOD)
    net_bills = simulation.calculate("council_tax_less_benefit", PERIOD)
    supported = simulation.calculate("council_tax_reduction_scheme_supported", PERIOD)

    results: dict[tuple[str, str, str, int], dict[str, Any]] = {}
    for position, key in enumerate(index):
        _, _, band, _ = key
        authority = authority_by_code[key[0]]
        results[key] = {
            "gross": authority["bands"][band],
            "reduction": as_float(reductions[position]),
            "net": as_float(net_bills[position]),
            "supported": bool(supported[position]),
        }

    return results


def policyengine_head() -> str | None:
    result = subprocess.run(
        ["git", "rev-parse", "--short", "HEAD"],
        cwd=POLICYENGINE_UK_PATH,
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        return None
    return result.stdout.strip()


def write_boundaries(authority_records: list[dict[str, Any]]) -> None:
    authority_by_code = {item["onsCode"]: item for item in authority_records}
    authority_by_slug = {item["slug"]: item for item in authority_records}
    geojson = json.loads(fetch_bytes(BOUNDARIES_URL))
    features = []

    for feature in geojson["features"]:
        code = feature["properties"].get("LAD24CD")
        authority = authority_by_code.get(code)
        if authority is None:
            authority = authority_by_slug.get(slug(feature["properties"].get("LAD24NM", "")))
        if authority is None:
            continue
        features.append(
            {
                "type": "Feature",
                "geometry": feature["geometry"],
                "properties": {
                    "onsCode": authority["onsCode"],
                    "authority": authority["authority"],
                },
            }
        )

    features.sort(key=lambda feature: authority_by_code[feature["properties"]["onsCode"]]["authority"])
    output = {"type": "FeatureCollection", "features": features}
    target = REPO_ROOT / "public/data/england-local-authorities.geojson"
    target.write_text(json.dumps(output, separators=(",", ":")))


def main() -> None:
    if not POLICYENGINE_UK_PATH.exists():
        raise RuntimeError(f"PolicyEngine UK worktree not found: {POLICYENGINE_UK_PATH}")

    tables_url = discover_tables_url()
    authority_records = load_table_9(tables_url)

    _, _, LocalAuthority = load_policyengine_symbols()
    implemented = implemented_authorities(LocalAuthority)
    sources = parse_work_queue_sources()
    simulation_results = simulate_results(authority_records, implemented)
    earnings_results = simulate_earnings_curves(authority_records, implemented)

    authorities = []
    for authority in authority_records:
        modeled = implemented.get(authority["slug"])
        source = sources.get(authority["slug"], {})
        results: dict[str, dict[str, Any]] = {}
        for scenario in SCENARIOS:
            profile_results = {}
            for band in BANDS:
                result = simulation_results.get(
                    (authority["onsCode"], scenario["id"], band)
                )
                if result is not None:
                    profile_results[band] = result
            if profile_results:
                results[scenario["id"]] = profile_results

        earnings_curves: dict[str, dict[str, list[dict[str, Any]]]] = {}
        for profile in EARNINGS_PROFILES:
            profile_curves = {}
            for band in BANDS:
                curve = []
                for earnings in EARNINGS_POINTS:
                    result = earnings_results.get(
                        (authority["onsCode"], profile["id"], band, earnings)
                    )
                    if result is not None:
                        curve.append({"earnings": earnings, **result})
                if curve:
                    profile_curves[band] = curve
            if profile_curves:
                earnings_curves[profile["id"]] = profile_curves

        authorities.append(
            {
                **authority,
                "modeled": modeled is not None,
                "localAuthorityEnum": modeled["enum"] if modeled else None,
                "schemeType": source.get("schemeType") if modeled else None,
                "source": source.get("source") if modeled else None,
                "results": results,
                "earningsCurves": earnings_curves,
            }
        )

    scenarios = [
        {
            "id": scenario["id"],
            "label": scenario["label"],
            "description": scenario["description"],
            "earningsProfileId": scenario["earnings_profile_id"],
            "household": {
                "adultEarnings": scenario["adult_earnings"],
                "savings": scenario["savings"],
                "children": len(scenario["children_ages"]),
                "wouldClaimUc": scenario["would_claim_uc"],
            },
        }
        for scenario in SCENARIOS
    ]
    earnings_profiles = [
        {
            "id": profile["id"],
            "label": profile["label"],
            "description": profile["description"],
            "household": {
                "savings": profile["savings"],
                "children": len(profile["children_ages"]),
                "wouldClaimUc": profile["would_claim_uc"],
            },
        }
        for profile in EARNINGS_PROFILES
    ]
    dataset = {
        "metadata": {
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "fiscalYear": FISCAL_YEAR,
            "policyengineUkPath": str(POLICYENGINE_UK_PATH),
            "policyengineUkHead": policyengine_head(),
            "councilTaxSourcePage": COUNCIL_TAX_SOURCE_PAGE,
            "councilTaxTablesUrl": tables_url,
            "boundariesUrl": BOUNDARIES_URL,
            "totalAuthorityCount": len(authorities),
            "modeledAuthorityCount": sum(1 for authority in authorities if authority["modeled"]),
        },
        "scenarios": scenarios,
        "earningsProfiles": earnings_profiles,
        "earningsPoints": EARNINGS_POINTS,
        "authorities": authorities,
    }

    data_dir = REPO_ROOT / "public/data"
    data_dir.mkdir(parents=True, exist_ok=True)
    (data_dir / "authority-results.json").write_text(json.dumps(dataset, indent=2))
    write_boundaries(authority_records)

    print(
        "Generated "
        f"{dataset['metadata']['modeledAuthorityCount']} modeled authorities "
        f"out of {dataset['metadata']['totalAuthorityCount']} billing authorities."
    )


if __name__ == "__main__":
    main()
