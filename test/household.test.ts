import { describe, expect, it } from "vitest";
import {
  buildPolicyEnginePayload,
  DEFAULT_HOUSEHOLD_INPUTS,
  getEarningsProfileId,
  getStaticScenarioId,
  nearestEarningsCurvePoint,
  type HouseholdInputs,
} from "@/lib/household";

function makeInputs(): HouseholdInputs {
  return structuredClone(DEFAULT_HOUSEHOLD_INPUTS);
}

describe("household input payload", () => {
  it("builds a PolicyEngine situation from full household inputs", () => {
    const inputs = makeInputs();
    inputs.councilTax = 2200;
    inputs.adultCount = 2;
    inputs.claimant.age = 42;
    inputs.claimant.employmentIncome = 20_000;
    inputs.partner.age = 40;
    inputs.partner.pipDailyLiving = 3_000;
    inputs.childrenUnder5 = 1;
    inputs.disabledChildren = 1;
    inputs.savings = 5_000;
    inputs.universalCredit = 1_200;
    inputs.ucEarnedIncome = 8_000;
    inputs.nonDependantCount = 1;
    inputs.nonDependants[0].age = 24;
    inputs.nonDependants[0].employmentIncome = 12_000;
    inputs.nonDependants[0].fullTimeStudent = true;

    const payload = buildPolicyEnginePayload(inputs, "CAMDEN", "D");

    expect(payload.period).toBe(2026);
    expect(payload.situation.people.claimant.age).toEqual({ 2026: 42 });
    expect(payload.situation.people.claimant.employment_income).toEqual({
      2026: 20_000,
    });
    expect(payload.situation.people.partner.pip_dl).toEqual({ 2026: 3_000 });
    expect(payload.situation.people.child_1.age).toEqual({ 2026: 4 });
    expect(payload.situation.people.child_1.is_disabled_for_benefits).toEqual({
      2026: true,
    });
    expect(payload.situation.people.non_dep_1.in_HE).toEqual({ 2026: true });
    expect(payload.situation.benunits.claimant_benunit.members).toEqual([
      "claimant",
      "partner",
      "child_1",
    ]);
    expect(payload.situation.benunits.claimant_benunit.is_couple).toEqual({
      2026: true,
    });
    expect(payload.situation.benunits.claimant_benunit.universal_credit).toEqual({
      2026: 1_200,
    });
    expect(payload.situation.households.household.members).toEqual([
      "claimant",
      "partner",
      "child_1",
      "non_dep_1",
    ]);
    expect(payload.situation.households.household.local_authority).toEqual({
      2026: "CAMDEN",
    });
  });

  it("maps generic source flags to current jurisdiction-scoped CTR variables", () => {
    const inputs = makeInputs();
    inputs.councilTax = 1800;
    inputs.sourceProtectedGroup = true;
    inputs.warPensionProtected = true;
    inputs.ucRelevantPeriodPensioner = true;
    inputs.sourceDisregardedIncome = 500;
    inputs.claimantSourceNonDepExemption = true;
    inputs.nonDependantCount = 1;
    inputs.nonDependants[0].sourceExemption = true;

    const payload = buildPolicyEnginePayload(inputs, "BARNET", "C");
    const claimant = payload.situation.people.claimant;
    const benunit = payload.situation.benunits.claimant_benunit;
    const nonDependant = payload.situation.people.non_dep_1;

    expect(benunit.basildon_council_tax_reduction_source_protected_group).toEqual({
      2026: true,
    });
    expect(benunit.barnet_council_tax_reduction_war_pension_protected).toEqual({
      2026: true,
    });
    expect(benunit.plymouth_council_tax_reduction_uc_relevant_period_pensioner).toEqual({
      2026: true,
    });
    expect(benunit.plymouth_council_tax_reduction_source_disregarded_income).toEqual({
      2026: 500,
    });
    expect(claimant.bristol_council_tax_reduction_claimant_source_non_dep_exemption).toEqual({
      2026: true,
    });
    expect(nonDependant.somerset_council_tax_reduction_non_dep_source_exemption).toEqual({
      2026: true,
    });
  });
});

describe("static oracle matching", () => {
  it("selects the closest generated static profile for fallback data", () => {
    const inputs = makeInputs();
    expect(getStaticScenarioId(inputs)).toBe("single_no_earnings");
    expect(getEarningsProfileId(inputs)).toBe("single_adult_no_savings");

    inputs.claimant.employmentIncome = 22_000;
    expect(getStaticScenarioId(inputs)).toBe("single_20k_earnings");

    inputs.savings = 8_000;
    expect(getStaticScenarioId(inputs)).toBe("single_8k_savings");
    expect(getEarningsProfileId(inputs)).toBe("single_adult_8k_savings");

    inputs.childrenUnder5 = 1;
    expect(getStaticScenarioId(inputs)).toBe("lone_parent_15k_earnings");
    expect(getEarningsProfileId(inputs)).toBe("lone_parent_one_child");
  });

  it("uses the nearest earnings point on a generated curve", () => {
    const point = nearestEarningsCurvePoint(
      [
        { earnings: 0, gross: 1000, reduction: 1000, net: 0, supported: true },
        {
          earnings: 20_000,
          gross: 1000,
          reduction: 400,
          net: 600,
          supported: true,
        },
      ],
      18_000,
    );

    expect(point?.earnings).toBe(20_000);
  });
});
