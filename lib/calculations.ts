import type {
  AuthorityRecord,
  CouncilTaxBand,
  MapMetric,
  ScenarioBandResult,
} from "@/lib/types";

export interface BillValues {
  gross: number;
  reduction: number | null;
  net: number;
  modeled: boolean;
  supported: boolean;
}

export function getScenarioResult(
  authority: AuthorityRecord,
  scenarioId: string,
  band: CouncilTaxBand,
): ScenarioBandResult | null {
  return authority.results[scenarioId]?.[band] ?? null;
}

export function getBillValues(
  authority: AuthorityRecord,
  scenarioId: string,
  band: CouncilTaxBand,
): BillValues {
  const result = getScenarioResult(authority, scenarioId, band);
  const gross = authority.bands[band];

  if (!result) {
    return {
      gross,
      reduction: null,
      net: gross,
      modeled: false,
      supported: false,
    };
  }

  return {
    gross: result.gross,
    reduction: result.reduction,
    net: result.net,
    modeled: authority.modeled,
    supported: result.supported,
  };
}

export function getMetricValue(
  authority: AuthorityRecord,
  scenarioId: string,
  band: CouncilTaxBand,
  metric: MapMetric,
): number | null {
  const values = getBillValues(authority, scenarioId, band);

  if (metric === "gross") {
    return values.gross;
  }

  if (!values.modeled) {
    return null;
  }

  return metric === "reduction" ? values.reduction : values.net;
}

export function rankAuthorities(
  authorities: AuthorityRecord[],
  scenarioId: string,
  band: CouncilTaxBand,
  metric: MapMetric,
  options: { modeledOnly?: boolean; ascending?: boolean } = {},
) {
  const { modeledOnly = false, ascending = false } = options;

  return authorities
    .map((authority) => ({
      authority,
      value: getMetricValue(authority, scenarioId, band, metric),
    }))
    .filter((item) => item.value !== null)
    .filter((item) => !modeledOnly || item.authority.modeled)
    .sort((a, b) =>
      ascending ? (a.value ?? 0) - (b.value ?? 0) : (b.value ?? 0) - (a.value ?? 0),
    );
}

export function formatPounds(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}
