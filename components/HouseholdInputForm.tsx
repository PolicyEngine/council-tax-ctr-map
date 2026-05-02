"use client";

import {
  CheckboxInput,
  CurrencyInput,
  InputPanel,
  NumberInput,
  SegmentedControl,
  SelectInput,
} from "@policyengine/ui-kit";
import type { ReactNode } from "react";
import type { AuthorityRecord, CouncilTaxBand, MapMetric } from "@/lib/types";
import type {
  AdultInputs,
  HouseholdInputs,
  NonDependantInputs,
} from "@/lib/household";

const metricOptions = [
  { label: "Net bill", value: "net" },
  { label: "CTR", value: "reduction" },
  { label: "Gross", value: "gross" },
];

const bandOptions = ["A", "B", "C", "D", "E", "F", "G", "H"].map((band) => ({
  label: band,
  value: band,
}));

const adultOptions = [
  { label: "1", value: "1" },
  { label: "2", value: "2" },
];

const nonDependantOptions = [
  { label: "0", value: "0" },
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
];

interface HouseholdInputFormProps {
  authorities: AuthorityRecord[];
  selectedAuthority: AuthorityRecord;
  band: CouncilTaxBand;
  metric: MapMetric;
  inputs: HouseholdInputs;
  onAuthorityChange: (code: string) => void;
  onBandChange: (band: CouncilTaxBand) => void;
  onMetricChange: (metric: MapMetric) => void;
  onInputsChange: (inputs: HouseholdInputs) => void;
}

function inputGridClassName() {
  return "grid grid-cols-1 gap-3";
}

function Section({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-md border border-border bg-background"
    >
      <summary className="cursor-pointer list-none px-3 py-2 text-sm font-semibold text-foreground">
        <span className="inline-flex w-full items-center justify-between">
          {title}
          <span className="text-muted-foreground transition group-open:rotate-90">
            &gt;
          </span>
        </span>
      </summary>
      <div className="border-t border-border p-3">{children}</div>
    </details>
  );
}

function MoneyField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <CurrencyInput
      label={label}
      value={value}
      onChange={onChange}
      currencySymbol="£"
      min={0}
    />
  );
}

function CountField({
  label,
  value,
  onChange,
  max = 10,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
}) {
  return (
    <NumberInput
      label={label}
      value={value}
      onChange={(nextValue) => onChange(Math.max(0, Math.min(max, nextValue)))}
      min={0}
      max={max}
      step={1}
    />
  );
}

function AdultFields({
  title,
  adult,
  onChange,
  showProtectedInputs = true,
}: {
  title: string;
  adult: AdultInputs;
  onChange: (adult: AdultInputs) => void;
  showProtectedInputs?: boolean;
}) {
  const update = <Key extends keyof AdultInputs>(
    key: Key,
    value: AdultInputs[Key],
  ) => onChange({ ...adult, [key]: value });

  return (
    <div className="rounded-md border border-border bg-card p-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-3 grid grid-cols-1 gap-3">
        <NumberInput
          label="Age"
          value={adult.age}
          onChange={(value) => update("age", value)}
          min={16}
          max={120}
          step={1}
        />
        <MoneyField
          label="Employment income"
          value={adult.employmentIncome}
          onChange={(value) => update("employmentIncome", value)}
        />
        <MoneyField
          label="Self-employment income"
          value={adult.selfEmploymentIncome}
          onChange={(value) => update("selfEmploymentIncome", value)}
        />
        <NumberInput
          label="Weekly work hours"
          value={adult.weeklyHours}
          onChange={(value) => update("weeklyHours", value)}
          min={0}
          max={80}
          step={1}
        />
        <MoneyField
          label="Pension contributions"
          value={adult.pensionContributions}
          onChange={(value) => update("pensionContributions", value)}
        />
        <MoneyField
          label="Private pension"
          value={adult.privatePensionIncome}
          onChange={(value) => update("privatePensionIncome", value)}
        />
        <MoneyField
          label="State pension"
          value={adult.statePension}
          onChange={(value) => update("statePension", value)}
        />
        <MoneyField
          label="Property income"
          value={adult.propertyIncome}
          onChange={(value) => update("propertyIncome", value)}
        />
        <MoneyField
          label="Dividend income"
          value={adult.dividendIncome}
          onChange={(value) => update("dividendIncome", value)}
        />
        <MoneyField
          label="Savings interest"
          value={adult.savingsInterestIncome}
          onChange={(value) => update("savingsInterestIncome", value)}
        />
        <MoneyField
          label="Basic income"
          value={adult.basicIncome}
          onChange={(value) => update("basicIncome", value)}
        />
        <MoneyField
          label="Income tax paid"
          value={adult.incomeTax}
          onChange={(value) => update("incomeTax", value)}
        />
        <MoneyField
          label="National Insurance paid"
          value={adult.nationalInsurance}
          onChange={(value) => update("nationalInsurance", value)}
        />
        <MoneyField
          label="Carer's Allowance"
          value={adult.carersAllowance}
          onChange={(value) => update("carersAllowance", value)}
        />
        <MoneyField
          label="Contribution ESA"
          value={adult.esaContrib}
          onChange={(value) => update("esaContrib", value)}
        />
        <MoneyField
          label="Contribution JSA"
          value={adult.jsaContrib}
          onChange={(value) => update("jsaContrib", value)}
        />
        <MoneyField
          label="Maternity Allowance"
          value={adult.maternityAllowance}
          onChange={(value) => update("maternityAllowance", value)}
        />
        <MoneyField
          label="Statutory sick pay"
          value={adult.statutorySickPay}
          onChange={(value) => update("statutorySickPay", value)}
        />
        <MoneyField
          label="Statutory maternity pay"
          value={adult.statutoryMaternityPay}
          onChange={(value) => update("statutoryMaternityPay", value)}
        />
        {showProtectedInputs ? (
          <div className="grid grid-cols-1 gap-2 border-t border-border pt-3">
            <MoneyField
              label="Attendance Allowance"
              value={adult.attendanceAllowance}
              onChange={(value) => update("attendanceAllowance", value)}
            />
            <MoneyField
              label="PIP daily living"
              value={adult.pipDailyLiving}
              onChange={(value) => update("pipDailyLiving", value)}
            />
            <MoneyField
              label="DLA care"
              value={adult.dlaCare}
              onChange={(value) => update("dlaCare", value)}
            />
            <MoneyField
              label="Armed Forces Independence Payment"
              value={adult.armedForcesIndependencePayment}
              onChange={(value) =>
                update("armedForcesIndependencePayment", value)
              }
            />
            <CheckboxInput
              label="Blind"
              checked={adult.isBlind}
              onChange={(checked) => update("isBlind", checked)}
            />
            <CheckboxInput
              label="Disabled"
              checked={adult.isDisabledForBenefits}
              onChange={(checked) => update("isDisabledForBenefits", checked)}
            />
            <CheckboxInput
              label="Care leaver"
              checked={adult.careLeaver}
              onChange={(checked) => update("careLeaver", checked)}
            />
            <CheckboxInput
              label="Self-employment startup period"
              checked={adult.selfEmploymentStartupPeriod}
              onChange={(checked) =>
                update("selfEmploymentStartupPeriod", checked)
              }
            />
            <CheckboxInput
              label="Underlying carer entitlement"
              checked={adult.underlyingCarerEntitlement}
              onChange={(checked) =>
                update("underlyingCarerEntitlement", checked)
              }
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function NonDependantFields({
  index,
  nonDependant,
  onChange,
}: {
  index: number;
  nonDependant: NonDependantInputs;
  onChange: (nonDependant: NonDependantInputs) => void;
}) {
  const update = <Key extends keyof NonDependantInputs>(
    key: Key,
    value: NonDependantInputs[Key],
  ) => onChange({ ...nonDependant, [key]: value });

  return (
    <div className="rounded-md border border-border bg-card p-3">
      <h3 className="text-sm font-semibold">Non-dependant {index + 1}</h3>
      <div className="mt-3 grid grid-cols-1 gap-3">
        <NumberInput
          label="Age"
          value={nonDependant.age}
          onChange={(value) => update("age", value)}
          min={0}
          max={120}
          step={1}
        />
        <MoneyField
          label="Employment income"
          value={nonDependant.employmentIncome}
          onChange={(value) => update("employmentIncome", value)}
        />
        <MoneyField
          label="Self-employment income"
          value={nonDependant.selfEmploymentIncome}
          onChange={(value) => update("selfEmploymentIncome", value)}
        />
        <NumberInput
          label="Weekly work hours"
          value={nonDependant.weeklyHours}
          onChange={(value) => update("weeklyHours", value)}
          min={0}
          max={80}
          step={1}
        />
        <MoneyField
          label="Universal Credit"
          value={nonDependant.universalCredit}
          onChange={(value) => update("universalCredit", value)}
        />
        <MoneyField
          label="UC earned income"
          value={nonDependant.ucEarnedIncome}
          onChange={(value) => update("ucEarnedIncome", value)}
        />
        <MoneyField
          label="UC unearned income"
          value={nonDependant.ucUnearnedIncome}
          onChange={(value) => update("ucUnearnedIncome", value)}
        />
        <MoneyField
          label="UC reported capital"
          value={nonDependant.ucReportedCapital}
          onChange={(value) => update("ucReportedCapital", value)}
        />
        <MoneyField
          label="Income Support"
          value={nonDependant.incomeSupport}
          onChange={(value) => update("incomeSupport", value)}
        />
        <MoneyField
          label="Income-based JSA"
          value={nonDependant.jsaIncome}
          onChange={(value) => update("jsaIncome", value)}
        />
        <MoneyField
          label="Income-related ESA"
          value={nonDependant.esaIncome}
          onChange={(value) => update("esaIncome", value)}
        />
        <MoneyField
          label="Pension Credit"
          value={nonDependant.pensionCredit}
          onChange={(value) => update("pensionCredit", value)}
        />
        <MoneyField
          label="Private pension"
          value={nonDependant.privatePensionIncome}
          onChange={(value) => update("privatePensionIncome", value)}
        />
        <MoneyField
          label="State pension"
          value={nonDependant.statePension}
          onChange={(value) => update("statePension", value)}
        />
        <MoneyField
          label="Property income"
          value={nonDependant.propertyIncome}
          onChange={(value) => update("propertyIncome", value)}
        />
        <MoneyField
          label="Dividend income"
          value={nonDependant.dividendIncome}
          onChange={(value) => update("dividendIncome", value)}
        />
        <MoneyField
          label="Savings interest"
          value={nonDependant.savingsInterestIncome}
          onChange={(value) => update("savingsInterestIncome", value)}
        />
        <MoneyField
          label="Attendance Allowance"
          value={nonDependant.attendanceAllowance}
          onChange={(value) => update("attendanceAllowance", value)}
        />
        <MoneyField
          label="PIP daily living"
          value={nonDependant.pipDailyLiving}
          onChange={(value) => update("pipDailyLiving", value)}
        />
        <MoneyField
          label="DLA care"
          value={nonDependant.dlaCare}
          onChange={(value) => update("dlaCare", value)}
        />
        <CheckboxInput
          label="Blind"
          checked={nonDependant.isBlind}
          onChange={(checked) => update("isBlind", checked)}
        />
        <CheckboxInput
          label="Disabled"
          checked={nonDependant.isDisabledForBenefits}
          onChange={(checked) => update("isDisabledForBenefits", checked)}
        />
        <CheckboxInput
          label="Full-time student"
          checked={nonDependant.fullTimeStudent}
          onChange={(checked) => update("fullTimeStudent", checked)}
        />
        <CheckboxInput
          label="Source non-dependant exemption"
          checked={nonDependant.sourceExemption}
          onChange={(checked) => update("sourceExemption", checked)}
        />
      </div>
    </div>
  );
}

export function HouseholdInputForm({
  authorities,
  selectedAuthority,
  band,
  metric,
  inputs,
  onAuthorityChange,
  onBandChange,
  onMetricChange,
  onInputsChange,
}: HouseholdInputFormProps) {
  const selectOptions = authorities.map((authority) => ({
    label: authority.authority,
    value: authority.onsCode,
  }));

  const update = <Key extends keyof HouseholdInputs>(
    key: Key,
    value: HouseholdInputs[Key],
  ) => onInputsChange({ ...inputs, [key]: value });

  const updateClaimant = (claimant: AdultInputs) =>
    onInputsChange({ ...inputs, claimant });

  const updatePartner = (partner: AdultInputs) =>
    onInputsChange({ ...inputs, partner });

  const updateNonDependant = (
    index: number,
    nonDependant: NonDependantInputs,
  ) =>
    onInputsChange({
      ...inputs,
      nonDependants: inputs.nonDependants.map((item, itemIndex) =>
        itemIndex === index ? nonDependant : item,
      ),
    });

  return (
    <InputPanel title="Household inputs">
      <div className="flex flex-col gap-4">
        <Section title="Location and bill" defaultOpen>
          <div className={inputGridClassName()}>
            <label className="text-sm font-medium text-foreground">
              Authority
              <SelectInput
                className="mt-1"
                aria-label="Select authority"
                options={selectOptions}
                value={selectedAuthority.onsCode}
                onChange={onAuthorityChange}
              />
            </label>
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">
                Council tax band
              </p>
              <SegmentedControl
                value={band}
                onValueChange={(value) => onBandChange(value as CouncilTaxBand)}
                options={bandOptions}
                size="xs"
              />
            </div>
            <MoneyField
              label="Annual council tax"
              value={inputs.councilTax}
              onChange={(value) => update("councilTax", value)}
            />
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">
                Map metric
              </p>
              <SegmentedControl
                value={metric}
                onValueChange={(value) => onMetricChange(value as MapMetric)}
                options={metricOptions}
                size="xs"
              />
            </div>
          </div>
        </Section>

        <Section title="Family and capital" defaultOpen>
          <div className={inputGridClassName()}>
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Adults</p>
              <SegmentedControl
                value={String(inputs.adultCount)}
                onValueChange={(value) =>
                  update("adultCount", Number(value) as 1 | 2)
                }
                options={adultOptions}
                size="xs"
              />
            </div>
            <CountField
              label="Children under 5"
              value={inputs.childrenUnder5}
              onChange={(value) => update("childrenUnder5", value)}
            />
            <CountField
              label="Children 5 to 15"
              value={inputs.children5To15}
              onChange={(value) => update("children5To15", value)}
            />
            <CountField
              label="Qualifying young people 16 to 19"
              value={inputs.children16To19}
              onChange={(value) => update("children16To19", value)}
            />
            <CountField
              label="Disabled children"
              value={inputs.disabledChildren}
              onChange={(value) => update("disabledChildren", value)}
            />
            <MoneyField
              label="Household savings"
              value={inputs.savings}
              onChange={(value) => update("savings", value)}
            />
            <MoneyField
              label="Childcare costs"
              value={inputs.childcareExpenses}
              onChange={(value) => update("childcareExpenses", value)}
            />
          </div>
        </Section>

        <Section title="Adults">
          <div className="grid grid-cols-1 gap-3">
            <AdultFields
              title="Claimant"
              adult={inputs.claimant}
              onChange={updateClaimant}
            />
            {inputs.adultCount === 2 ? (
              <AdultFields
                title="Partner"
                adult={inputs.partner}
                onChange={updatePartner}
              />
            ) : null}
          </div>
        </Section>

        <Section title="Benefits and UC">
          <div className={inputGridClassName()}>
            <CheckboxInput
              label="Claims all entitled benefits"
              checked={inputs.claimsAllEntitledBenefits}
              onChange={(checked) => update("claimsAllEntitledBenefits", checked)}
            />
            <MoneyField
              label="Reported CTR"
              value={inputs.councilTaxBenefitReported}
              onChange={(value) => update("councilTaxBenefitReported", value)}
            />
            <MoneyField
              label="Income Support"
              value={inputs.incomeSupport}
              onChange={(value) => update("incomeSupport", value)}
            />
            <MoneyField
              label="Income-based JSA"
              value={inputs.jsaIncome}
              onChange={(value) => update("jsaIncome", value)}
            />
            <MoneyField
              label="Income-related ESA"
              value={inputs.esaIncome}
              onChange={(value) => update("esaIncome", value)}
            />
            <MoneyField
              label="Pension Credit"
              value={inputs.pensionCredit}
              onChange={(value) => update("pensionCredit", value)}
            />
            <MoneyField
              label="Child Benefit"
              value={inputs.childBenefit}
              onChange={(value) => update("childBenefit", value)}
            />
            <MoneyField
              label="Tax credits"
              value={inputs.taxCredits}
              onChange={(value) => update("taxCredits", value)}
            />
            <MoneyField
              label="Benefits premiums"
              value={inputs.benefitsPremiums}
              onChange={(value) => update("benefitsPremiums", value)}
            />
            <MoneyField
              label="Sure Start Maternity Grant"
              value={inputs.ssmg}
              onChange={(value) => update("ssmg", value)}
            />
            <CheckboxInput
              label="Would claim UC"
              checked={inputs.wouldClaimUc}
              onChange={(checked) => update("wouldClaimUc", checked)}
            />
            <MoneyField
              label="Universal Credit award"
              value={inputs.universalCredit}
              onChange={(value) => update("universalCredit", value)}
            />
            <MoneyField
              label="UC maximum amount"
              value={inputs.ucMaximumAmount}
              onChange={(value) => update("ucMaximumAmount", value)}
            />
            <MoneyField
              label="UC earned income"
              value={inputs.ucEarnedIncome}
              onChange={(value) => update("ucEarnedIncome", value)}
            />
            <MoneyField
              label="UC unearned income"
              value={inputs.ucUnearnedIncome}
              onChange={(value) => update("ucUnearnedIncome", value)}
            />
            <MoneyField
              label="UC reported capital"
              value={inputs.ucReportedCapital}
              onChange={(value) => update("ucReportedCapital", value)}
            />
          </div>
        </Section>

        <Section title="Scheme-specific flags">
          <div className={inputGridClassName()}>
            <CheckboxInput
              label="Protected group"
              checked={inputs.sourceProtectedGroup}
              onChange={(checked) => update("sourceProtectedGroup", checked)}
            />
            <CheckboxInput
              label="War pension protected"
              checked={inputs.warPensionProtected}
              onChange={(checked) => update("warPensionProtected", checked)}
            />
            <CheckboxInput
              label="Bereavement protected"
              checked={inputs.bereavementProtected}
              onChange={(checked) => update("bereavementProtected", checked)}
            />
            <CheckboxInput
              label="UC relevant period pensioner"
              checked={inputs.ucRelevantPeriodPensioner}
              onChange={(checked) =>
                update("ucRelevantPeriodPensioner", checked)
              }
            />
            <CheckboxInput
              label="Disability income disregard"
              checked={inputs.sourceDisabilityIncomeDisregard}
              onChange={(checked) =>
                update("sourceDisabilityIncomeDisregard", checked)
              }
            />
            <CheckboxInput
              label="WTC disability element"
              checked={inputs.wtcDisabilityElement}
              onChange={(checked) => update("wtcDisabilityElement", checked)}
            />
            <CheckboxInput
              label="Special earnings disregard"
              checked={inputs.sourceSpecialEarningsDisregard}
              onChange={(checked) =>
                update("sourceSpecialEarningsDisregard", checked)
              }
            />
            <CheckboxInput
              label="Disability or ESA component"
              checked={inputs.sourceDisabilityOrEsaComponent}
              onChange={(checked) =>
                update("sourceDisabilityOrEsaComponent", checked)
              }
            />
            <CheckboxInput
              label="Claimant non-dependant exemption"
              checked={inputs.claimantSourceNonDepExemption}
              onChange={(checked) =>
                update("claimantSourceNonDepExemption", checked)
              }
            />
            <CheckboxInput
              label="Disabled band reduction"
              checked={inputs.disabledBandReduction}
              onChange={(checked) => update("disabledBandReduction", checked)}
            />
            <MoneyField
              label="Source-disregarded income"
              value={inputs.sourceDisregardedIncome}
              onChange={(value) => update("sourceDisregardedIncome", value)}
            />
            <MoneyField
              label="Disregarded UC elements"
              value={inputs.sourceDisregardedUcElements}
              onChange={(value) => update("sourceDisregardedUcElements", value)}
            />
            <MoneyField
              label="ESA support component"
              value={inputs.esaSupportComponent}
              onChange={(value) => update("esaSupportComponent", value)}
            />
            <MoneyField
              label="Severe Disablement Allowance"
              value={inputs.severeDisablementAllowance}
              onChange={(value) => update("severeDisablementAllowance", value)}
            />
          </div>
        </Section>

        <Section title="Non-dependants">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">
                Count
              </p>
              <SegmentedControl
                value={String(inputs.nonDependantCount)}
                onValueChange={(value) =>
                  update("nonDependantCount", Number(value))
                }
                options={nonDependantOptions}
                size="xs"
              />
            </div>
            {inputs.nonDependants
              .slice(0, inputs.nonDependantCount)
              .map((nonDependant, index) => (
                <NonDependantFields
                  key={index}
                  index={index}
                  nonDependant={nonDependant}
                  onChange={(nextValue) =>
                    updateNonDependant(index, nextValue)
                  }
                />
              ))}
          </div>
        </Section>
      </div>
    </InputPanel>
  );
}
