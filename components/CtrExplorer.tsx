"use client";

/* eslint-disable @next/next/no-img-element */

import {
  Badge,
  ChartContainer,
  DashboardShell,
  Header,
  InputGroup,
  InputPanel,
  MetricCard,
  PEBarChart,
  ResultsPanel,
  SegmentedControl,
  SelectInput,
  SidebarLayout,
  logos,
} from "@policyengine/ui-kit";
import { Calculator, ExternalLink, MapPinned } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AuthorityMap } from "@/components/AuthorityMap";
import {
  formatPounds,
  getBillValues,
  rankAuthorities,
} from "@/lib/calculations";
import {
  BANDS,
  type AuthorityDataset,
  type AuthorityRecord,
  type CouncilTaxBand,
  type GeoFeatureCollection,
  type MapMetric,
} from "@/lib/types";

const metricOptions = [
  { label: "Net bill", value: "net" },
  { label: "CTR", value: "reduction" },
  { label: "Gross", value: "gross" },
];

const bandOptions = BANDS.map((band) => ({ label: band, value: band }));

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

export function CtrExplorer() {
  const { dataset, geography, error } = useStaticData();
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [scenarioId, setScenarioId] = useState("single_no_earnings");
  const [band, setBand] = useState<CouncilTaxBand>("D");
  const [metric, setMetric] = useState<MapMetric>("net");

  const authorities = useMemo(() => dataset?.authorities ?? [], [dataset]);
  const scenarios = useMemo(() => dataset?.scenarios ?? [], [dataset]);
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

  const selectedBill = selectedAuthority
    ? getBillValues(selectedAuthority, scenarioId, band)
    : null;

  const scenario = scenarios.find((item) => item.id === scenarioId);
  const selectOptions = authorities.map((authority) => ({
    label: authority.authority,
    value: authority.onsCode,
  }));

  const topAuthorities = useMemo(
    () =>
      rankAuthorities(authorities, scenarioId, band, metric, {
        modeledOnly: metric !== "gross",
      })
        .slice(0, 8)
        .map((item) => ({
          authority: item.authority.authority,
          value: Math.round(item.value ?? 0),
        })),
    [authorities, band, metric, scenarioId],
  );

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
      <Header
        variant="dark"
        logo={
          <img
            src={logos.whiteWordmark}
            alt="PolicyEngine"
            className="h-5 w-auto"
          />
        }
        navLinks={[
          {
            slug: "source",
            text: "Sources",
            href: dataset.metadata.councilTaxSourcePage,
          },
        ]}
      >
        <span className="text-sm font-medium">Council Tax and CTR Map</span>
      </Header>

      <SidebarLayout
        className="min-h-[calc(100vh-var(--spacing-header))] bg-background-secondary"
        sidebarWidth="330px"
        sidebar={
          <InputPanel title="Household and bill">
            <div className="flex flex-col gap-5">
              <InputGroup label="Authority">
                <SelectInput
                  aria-label="Select authority"
                  options={selectOptions}
                  value={selectedAuthority.onsCode}
                  onChange={setSelectedCode}
                />
              </InputGroup>

              <InputGroup label="Council tax band">
                <SegmentedControl
                  value={band}
                  onValueChange={(value) => setBand(value as CouncilTaxBand)}
                  options={bandOptions}
                  size="xs"
                />
              </InputGroup>

              <InputGroup label="Household scenario">
                <SelectInput
                  aria-label="Select household scenario"
                  options={scenarios.map((item) => ({
                    label: item.label,
                    value: item.id,
                  }))}
                  value={scenarioId}
                  onChange={setScenarioId}
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  {scenario?.description}
                </p>
              </InputGroup>

              <InputGroup label="Map metric">
                <SegmentedControl
                  value={metric}
                  onValueChange={(value) => setMetric(value as MapMetric)}
                  options={metricOptions}
                  size="xs"
                />
              </InputGroup>

              <div className="rounded-md border border-border bg-background p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Calculator className="h-4 w-4" />
                  Generated from PolicyEngine UK
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {dataset.metadata.modeledAuthorityCount} modeled CTR schemes out of{" "}
                  {dataset.metadata.totalAuthorityCount} English billing authorities.
                </p>
              </div>
            </div>
          </InputPanel>
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
                scenarioId={scenarioId}
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
                  delta={selectedBill.modeled ? "Modeled" : "CTR pending"}
                />
              </div>

              <div className="rounded-md border border-border bg-background p-4">
                <h2 className="text-base font-semibold">Scheme path</h2>
                <dl className="mt-3 grid grid-cols-[120px_1fr] gap-x-3 gap-y-2 text-sm">
                  <dt className="text-muted-foreground">Enum</dt>
                  <dd>{selectedAuthority.localAuthorityEnum ?? "Not in CTR PR"}</dd>
                  <dt className="text-muted-foreground">Type</dt>
                  <dd>{selectedAuthority.schemeType ?? "Awaiting implementation"}</dd>
                  <dt className="text-muted-foreground">Output</dt>
                  <dd>
                    {selectedBill.modeled
                      ? "PolicyEngine CTR result"
                      : "Official gross council tax only"}
                  </dd>
                </dl>
              </div>

              <ChartContainer
                title={metric === "gross" ? "Highest gross bills" : "Highest modeled values"}
                subtitle={`Band ${band}, ${scenario?.label ?? ""}`}
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
