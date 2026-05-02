export const BANDS = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;

export type CouncilTaxBand = (typeof BANDS)[number];

export type MapMetric = "net" | "reduction" | "gross";

export interface ScenarioDefinition {
  id: string;
  label: string;
  description: string;
  household: {
    adultEarnings: number;
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

export type AuthorityScenarioResults = Record<
  string,
  Partial<Record<CouncilTaxBand, ScenarioBandResult>>
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
