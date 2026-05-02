"use client";

import { geoMercator, geoPath } from "d3-geo";
import { useMemo } from "react";
import {
  getBillValues,
  getMetricValue,
} from "@/lib/calculations";
import type {
  AuthorityRecord,
  CouncilTaxBand,
  GeoFeatureCollection,
  MapMetric,
} from "@/lib/types";

interface AuthorityMapProps {
  geography: GeoFeatureCollection;
  authorities: AuthorityRecord[];
  selectedCode: string | null;
  scenarioId: string;
  band: CouncilTaxBand;
  metric: MapMetric;
  onSelect: (onsCode: string) => void;
}

const WIDTH = 680;
const HEIGHT = 780;

function bucketColor(value: number, min: number, max: number) {
  if (max <= min) {
    return "var(--chart-1)";
  }

  const ratio = (value - min) / (max - min);
  if (ratio < 0.2) return "var(--color-teal-50)";
  if (ratio < 0.4) return "var(--color-teal-200)";
  if (ratio < 0.6) return "var(--chart-1)";
  if (ratio < 0.8) return "var(--chart-3)";
  return "var(--color-blue-800)";
}

export function AuthorityMap({
  geography,
  authorities,
  selectedCode,
  scenarioId,
  band,
  metric,
  onSelect,
}: AuthorityMapProps) {
  const authorityByCode = useMemo(
    () => new Map(authorities.map((authority) => [authority.onsCode, authority])),
    [authorities],
  );

  const values = useMemo(
    () =>
      authorities
        .map((authority) => getMetricValue(authority, scenarioId, band, metric))
        .filter((value): value is number => value !== null),
    [authorities, band, metric, scenarioId],
  );

  const [minValue, maxValue] = useMemo(() => {
    if (values.length === 0) return [0, 1];
    return [Math.min(...values), Math.max(...values)];
  }, [values]);

  const path = useMemo(() => {
    const projection = geoMercator().fitSize([WIDTH, HEIGHT], geography);
    return geoPath(projection);
  }, [geography]);

  return (
    <div className="h-full min-h-[520px] overflow-hidden rounded-md border border-border bg-background">
      <svg
        role="img"
        aria-label="Map of English billing authorities"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-full min-h-[520px] w-full"
      >
        {geography.features.map((feature) => {
          const authority = authorityByCode.get(feature.properties.onsCode);
          if (!authority) return null;

          const value = getMetricValue(authority, scenarioId, band, metric);
          const bill = getBillValues(authority, scenarioId, band);
          const selected = authority.onsCode === selectedCode;
          const fill =
            value === null
              ? "var(--muted)"
              : bucketColor(value, minValue, maxValue);

          return (
            <path
              key={authority.onsCode}
              d={path(feature) ?? undefined}
              fill={fill}
              stroke={selected ? "var(--foreground)" : "var(--background)"}
              strokeWidth={selected ? 1.6 : 0.35}
              className="cursor-pointer transition-opacity hover:opacity-80"
              onClick={() => onSelect(authority.onsCode)}
            >
              <title>
                {authority.authority}: gross GBP {bill.gross.toFixed(0)}
                {bill.reduction !== null
                  ? `, CTR GBP ${bill.reduction.toFixed(0)}, net GBP ${bill.net.toFixed(0)}`
                  : ", CTR not modeled"}
              </title>
            </path>
          );
        })}
      </svg>
    </div>
  );
}
