export const BANDS = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;

export type CouncilTaxBand = (typeof BANDS)[number];

export type MapMetric = "net" | "reduction" | "gross";

export interface ScenarioDefinition {
  id: string;
  label: string;
  description: string;
  earningsProfileId: string;
  household: {
    adultEarnings: number;
    savings: number;
    children: number;
    wouldClaimUc: boolean;
  };
}

export interface EarningsProfileDefinition {
  id: string;
  label: string;
  description: string;
  household: {
    savings: number;
    children: number;
    wouldClaimUc: boolean;
  };
}

export interface ScenarioBandResult {
  gross: number;
  reduction: number;
  net: number;
  supported: boolean;
}

export interface EarningsCurvePoint extends ScenarioBandResult {
  earnings: number;
}

export type AuthorityScenarioResults = Record<
  string,
  Partial<Record<CouncilTaxBand, ScenarioBandResult>>
>;

export type AuthorityEarningsCurves = Record<
  string,
  Partial<Record<CouncilTaxBand, EarningsCurvePoint[]>>
>;

export interface AuthorityRecord {
  onsCode: string;
  authority: string;
  slug: string;
  region: string;
  class: string;
  area: string;
  bands: Record<CouncilTaxBand, number>;
  modeled: boolean;
  localAuthorityEnum: string | null;
  schemeType: string | null;
  source: string | null;
  results: AuthorityScenarioResults;
  earningsCurves: AuthorityEarningsCurves;
}

export interface AuthorityDataset {
  metadata: {
    generatedAt: string;
    fiscalYear: string;
    policyengineUkPath: string;
    policyengineUkHead: string | null;
    councilTaxSourcePage: string;
    councilTaxTablesUrl: string;
    boundariesUrl: string;
    totalAuthorityCount: number;
    modeledAuthorityCount: number;
  };
  scenarios: ScenarioDefinition[];
  earningsProfiles: EarningsProfileDefinition[];
  earningsPoints: number[];
  authorities: AuthorityRecord[];
}

export interface GeoFeature {
  type: "Feature";
  properties: {
    onsCode: string;
    authority: string;
  };
  geometry: GeoJSON.Geometry;
}

export interface GeoFeatureCollection {
  type: "FeatureCollection";
  features: GeoFeature[];
}
