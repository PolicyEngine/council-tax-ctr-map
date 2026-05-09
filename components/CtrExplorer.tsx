"use client";

/* eslint-disable @next/next/no-img-element */

import {
  Badge,
  ChartContainer,
  DashboardShell,
  Header,
  MetricCard,
  PEBarChart,
  PELineChart,
  ResultsPanel,
  SidebarLayout,
} from "@policyengine/ui-kit";
import { Calculator, ExternalLink, MapPinned } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AuthorityMap } from "@/components/AuthorityMap";
import { HouseholdInputForm } from "@/components/HouseholdInputForm";
import {
  formatPounds,
  getBillValues,
  getEarningsCurve,
  rankAuthorities,
} from "@/lib/calculations";
import {
  buildPolicyEnginePayload,
  DEFAULT_HOUSEHOLD_INPUTS,
  getEarningsProfileId,
  getStaticScenarioId,
  nearestEarningsCurvePoint,
  totalAdultEarnings,
  type CalculationResponse,
} from "@/lib/household";
import {
  type AuthorityDataset,
  type AuthorityRecord,
  type CouncilTaxBand,
  type GeoFeatureCollection,
  type MapMetric,
} from "@/lib/types";

function formatEarnings(value: number) {
  return value === 0 ? "0" : `${Math.round(value / 1000)}k`;
}

function useStaticData() {
  const [dataset, setDataset] = useState<AuthorityDataset | null>(null);
  const [geography, setGeography] = useState<GeoFeatureCollection | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [datasetResponse, geographyResponse] = await Promise.all([
          fetch("/data/authority-results.json"),
          fetch("/data/england-local-authorities.geojson"),
        ]);

        if (!datasetResponse.ok || !geographyResponse.ok) {
          throw new Error("Generated data is missing. Run bun run generate:data.");
        }

        const [datasetJson, geographyJson] = await Promise.all([
          datasetResponse.json(),
          geographyResponse.json(),
        ]);

        if (!cancelled) {
          setDataset(datasetJson);
          setGeography(geographyJson);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load generated data.",
          );
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { dataset, geography, error };
}

function modeledAuthorities(authorities: AuthorityRecord[]) {
  return authorities.filter((authority) => authority.modeled);
}

function calculationApiUrl() {
  return process.env.NEXT_PUBLIC_CTR_API_URL?.trim();
}

export function CtrExplorer() {
  const { dataset, geography, error } = useStaticData();
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [band, setBand] = useState<CouncilTaxBand>("D");
  const [metric, setMetric] = useState<MapMetric>("net");
  const [householdInputs, setHouseholdInputs] = useState(
    DEFAULT_HOUSEHOLD_INPUTS,
  );
  const [liveResult, setLiveResult] = useState<CalculationResponse | null>(null);
  const [calculationStatus, setCalculationStatus] = useState<
    "static" | "loading" | "live" | "error"
  >("static");
  const [calculationError, setCalculationError] = useState<string | null>(null);

  const authorities = useMemo(() => dataset?.authorities ?? [], [dataset]);
  const scenarios = useMemo(() => dataset?.scenarios ?? [], [dataset]);
  const earningsProfiles = useMemo(
    () => dataset?.earningsProfiles ?? [],
    [dataset],
  );
  const selectedAuthority = useMemo(
    () =>
      authorities.find((authority) => authority.onsCode === selectedCode) ??
      modeledAuthorities(authorities)[0] ??
      authorities[0],
    [authorities, selectedCode],
  );

  useEffect(() => {
    if (!selectedCode && selectedAuthority) {
      setSelectedCode(selectedAuthority.onsCode);
    }
  }, [selectedAuthority, selectedCode]);

  useEffect(() => {
    if (!selectedAuthority) {
      return;
    }
    setHouseholdInputs((previous) => ({
      ...previous,
      councilTax: selectedAuthority.bands[band],
    }));
  }, [band, selectedAuthority]);

  const staticScenarioId = useMemo(
    () => getStaticScenarioId(householdInputs),
    [householdInputs],
  );
  const earningsProfileId = useMemo(
    () => getEarningsProfileId(householdInputs),
    [householdInputs],
  );
  const staticScenario = scenarios.find((item) => item.id === staticScenarioId);
  const earningsProfile = earningsProfiles.find(
    (profile) => profile.id === earningsProfileId,
  );

  const topAuthorities = useMemo(
    () =>
      rankAuthorities(authorities, staticScenarioId, band, metric, {
        modeledOnly: metric !== "gross",
      })
        .slice(0, 8)
        .map((item) => ({
          authority: item.authority.authority,
          value: Math.round(item.value ?? 0),
        })),
    [authorities, band, metric, staticScenarioId],
  );

  const earningsCurve = useMemo(() => {
    if (!selectedAuthority) {
      return [];
    }

    return getEarningsCurve(selectedAuthority, earningsProfileId, band);
  }, [band, earningsProfileId, selectedAuthority]);

  const earningsCurveChartData = useMemo(
    () =>
      earningsCurve.map((point) => ({
        earnings: point.earnings,
        earningsLabel: formatEarnings(point.earnings),
        net: Math.round(point.net),
        reduction: Math.round(point.reduction),
      })),
    [earningsCurve],
  );

  const fallbackBill = useMemo(() => {
    if (!selectedAuthority) {
      return null;
    }
    const curvePoint = nearestEarningsCurvePoint(
      earningsCurve,
      totalAdultEarnings(householdInputs),
    );
    if (curvePoint && selectedAuthority.modeled) {
      const gross = householdInputs.councilTax || curvePoint.gross;
      return {
        gross,
        reduction: curvePoint.reduction,
        net: Math.max(0, gross - curvePoint.reduction),
        modeled: true,
        supported: curvePoint.supported,
      };
    }
    return getBillValues(selectedAuthority, staticScenarioId, band);
  }, [
    band,
    earningsCurve,
    householdInputs,
    selectedAuthority,
    staticScenarioId,
  ]);

  const selectedBill =
    liveResult && fallbackBill
      ? {
          gross: liveResult.council_tax,
          reduction: liveResult.council_tax_reduction,
          net: liveResult.council_tax_less_benefit,
          modeled: true,
          supported: true,
        }
      : fallbackBill;

  useEffect(() => {
    const apiUrl = calculationApiUrl();
    const localAuthorityEnum = selectedAuthority?.localAuthorityEnum;
    if (!apiUrl || !selectedAuthority?.modeled || !localAuthorityEnum) {
      setLiveResult(null);
      setCalculationStatus("static");
      setCalculationError(null);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        setCalculationStatus("loading");
        setCalculationError(null);
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            buildPolicyEnginePayload(
              householdInputs,
              localAuthorityEnum,
              band,
            ),
          ),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Live calculation failed with ${response.status}`);
        }

        const result = (await response.json()) as CalculationResponse;
        if (!controller.signal.aborted) {
          setLiveResult(result);
          setCalculationStatus("live");
        }
      } catch (calculationFailure) {
        if (!controller.signal.aborted) {
          setLiveResult(null);
          setCalculationStatus("error");
          setCalculationError(
            calculationFailure instanceof Error
              ? calculationFailure.message
              : "Live calculation failed.",
          );
        }
      }
    }, 450);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [band, householdInputs, selectedAuthority]);

  if (error) {
    return (
      <DashboardShell>
        <main className="flex min-h-screen items-center justify-center bg-background-secondary p-6">
          <div className="max-w-xl rounded-md border border-border bg-card p-6 text-card-foreground">
            <p className="text-sm font-semibold text-destructive">Data load failed</p>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          </div>
        </main>
      </DashboardShell>
    );
  }

  if (!dataset || !geography || !selectedAuthority || !selectedBill) {
    return (
      <DashboardShell>
        <main className="flex min-h-screen items-center justify-center bg-background-secondary p-6">
          <div className="rounded-md border border-border bg-card p-6 text-sm text-muted-foreground">
            Loading generated council tax and CTR data...
          </div>
        </main>
      </DashboardShell>
    );
  }

  const reductionLabel =
    selectedBill.reduction === null
      ? "Not modeled"
      : formatPounds(selectedBill.reduction);

  const sourceHref = selectedAuthority.source ?? dataset.metadata.councilTaxSourcePage;

  return (
    <DashboardShell>
      {/* TODO(ui-kit-migration): re-add header subtitle "Council Tax and CTR Map" when Header supports children/title prop */}
      <Header
        navItems={[
          {
            label: "Sources",
            href: dataset.metadata.councilTaxSourcePage,
          },
        ]}
      />

      <SidebarLayout
        className="min-h-[calc(100vh-var(--spacing-header))] bg-background-secondary"
        sidebarWidth="430px"
        sidebar={
          <HouseholdInputForm
            authorities={authorities}
            selectedAuthority={selectedAuthority}
            band={band}
            metric={metric}
            inputs={householdInputs}
            onAuthorityChange={setSelectedCode}
            onBandChange={setBand}
            onMetricChange={setMetric}
            onInputsChange={setHouseholdInputs}
          />
        }
      >
        <main className="flex min-h-full flex-col gap-5 p-5">
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col justify-between gap-3 rounded-md border border-border bg-card p-4 text-card-foreground md:flex-row md:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <MapPinned className="h-5 w-5 text-primary" />
                    <h1 className="text-2xl font-semibold tracking-normal">
                      {selectedAuthority.authority}
                    </h1>
                    <Badge variant={selectedAuthority.modeled ? "default" : "secondary"}>
                      {selectedAuthority.modeled ? "CTR modeled" : "Gross only"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedAuthority.area} · {selectedAuthority.region} · Band {band}
                  </p>
                </div>
                <a
                  href={sourceHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary"
                >
                  Primary source
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              <AuthorityMap
                geography={geography}
                authorities={authorities}
                selectedCode={selectedAuthority.onsCode}
                scenarioId={staticScenarioId}
                band={band}
                metric={metric}
                onSelect={setSelectedCode}
              />
            </div>

            <ResultsPanel className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-3">
                <MetricCard
                  label="Gross council tax"
                  value={formatPounds(selectedBill.gross)}
                  format="string"
                />
                <MetricCard
                  label="Council Tax Reduction"
                  value={reductionLabel}
                  format="string"
                />
                <MetricCard
                  label="Net bill after CTR"
                  value={formatPounds(selectedBill.net)}
                  format="string"
                  trend={selectedBill.modeled ? "neutral" : "negative"}
                  delta={
                    calculationStatus === "live"
                      ? "Live PE"
                      : selectedBill.modeled
                        ? "Static oracle"
                        : "CTR pending"
                  }
                />
              </div>

              <div className="rounded-md border border-border bg-background p-4">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-primary" />
                  <h2 className="text-base font-semibold">Scheme path</h2>
                </div>
                <dl className="mt-3 grid grid-cols-[120px_1fr] gap-x-3 gap-y-2 text-sm">
                  <dt className="text-muted-foreground">Enum</dt>
                  <dd>{selectedAuthority.localAuthorityEnum ?? "Not in CTR PR"}</dd>
                  <dt className="text-muted-foreground">Type</dt>
                  <dd>{selectedAuthority.schemeType ?? "Awaiting implementation"}</dd>
                  <dt className="text-muted-foreground">Output</dt>
                  <dd>
                    {calculationStatus === "live"
                      ? "Live PolicyEngine result"
                      : selectedBill.modeled
                        ? "Generated static result"
                        : "Official gross council tax only"}
                  </dd>
                  <dt className="text-muted-foreground">Fallback</dt>
                  <dd>{staticScenario?.label ?? "Generated oracle"}</dd>
                  {calculationStatus === "loading" ? (
                    <>
                      <dt className="text-muted-foreground">Status</dt>
                      <dd>Calculating</dd>
                    </>
                  ) : null}
                  {calculationStatus === "error" ? (
                    <>
                      <dt className="text-muted-foreground">Status</dt>
                      <dd>{calculationError}</dd>
                    </>
                  ) : null}
                </dl>
              </div>

              <ChartContainer
                title="Earnings variation"
                subtitle={`Band ${band}, ${earningsProfile?.label ?? staticScenario?.label ?? ""}`}
              >
                {earningsCurveChartData.length > 0 ? (
                  <PELineChart
                    data={earningsCurveChartData}
                    xKey="earningsLabel"
                    series={[
                      {
                        dataKey: "net",
                        name: "Net bill",
                        color: "var(--chart-1)",
                      },
                      {
                        dataKey: "reduction",
                        name: "CTR",
                        color: "var(--chart-2)",
                      },
                    ]}
                    height={230}
                    showLegend
                    xLabel="Annual earnings"
                    yLabel="Annual amount"
                    formatTooltip={(value) => formatPounds(value)}
                  />
                ) : (
                  <div className="flex h-[230px] items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
                    CTR curve unavailable for this authority.
                  </div>
                )}
              </ChartContainer>

              <ChartContainer
                title={metric === "gross" ? "Highest gross bills" : "Highest modeled values"}
                subtitle={`Band ${band}, ${staticScenario?.label ?? ""}`}
              >
                <PEBarChart
                  data={topAuthorities}
                  xKey="authority"
                  yKey="value"
                  height={260}
                  fillColor="var(--chart-1)"
                  formatTooltip={(value) => formatPounds(value)}
                />
              </ChartContainer>
            </ResultsPanel>
          </section>
        </main>
      </SidebarLayout>
    </DashboardShell>
  );
}
