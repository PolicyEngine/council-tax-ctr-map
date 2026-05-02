import { describe, expect, it } from "vitest";
import { getBillValues, rankAuthorities } from "@/lib/calculations";
import type { AuthorityRecord } from "@/lib/types";

const modeledAuthority: AuthorityRecord = {
  onsCode: "E00000001",
  authority: "Modeled",
  slug: "modeled",
  region: "L",
  class: "ILB",
  area: "Inner London",
  bands: {
    A: 1200,
    B: 1400,
    C: 1600,
    D: 1800,
    E: 2200,
    F: 2600,
    G: 3000,
    H: 3600,
  },
  modeled: true,
  localAuthorityEnum: "MODELED",
  schemeType: "Legacy",
  source: "https://example.test",
  results: {
    single: {
      D: {
        gross: 1800,
        reduction: 900,
        net: 900,
        supported: true,
      },
    },
  },
};

const grossOnlyAuthority: AuthorityRecord = {
  ...modeledAuthority,
  onsCode: "E00000002",
  authority: "Gross only",
  slug: "gross_only",
  modeled: false,
  localAuthorityEnum: null,
  source: null,
  results: {},
};

describe("bill value helpers", () => {
  it("uses generated PolicyEngine results when the authority and scenario are modeled", () => {
    expect(getBillValues(modeledAuthority, "single", "D")).toEqual({
      gross: 1800,
      reduction: 900,
      net: 900,
      modeled: true,
      supported: true,
    });
  });

  it("falls back to official gross council tax when CTR is not modeled", () => {
    expect(getBillValues(grossOnlyAuthority, "single", "D")).toEqual({
      gross: 1800,
      reduction: null,
      net: 1800,
      modeled: false,
      supported: false,
    });
  });

  it("ranks only authorities with modeled net bills when requested", () => {
    const ranked = rankAuthorities(
      [grossOnlyAuthority, modeledAuthority],
      "single",
      "D",
      "net",
      { modeledOnly: true },
    );

    expect(ranked).toHaveLength(1);
    expect(ranked[0].authority.authority).toBe("Modeled");
  });
});
