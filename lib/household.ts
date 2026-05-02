import type { CouncilTaxBand, EarningsCurvePoint } from "@/lib/types";

export const PERIOD = 2026;
export const MAX_NON_DEPENDANTS = 3;

export interface AdultInputs {
  age: number;
  employmentIncome: number;
  selfEmploymentIncome: number;
  weeklyHours: number;
  privatePensionIncome: number;
  statePension: number;
  propertyIncome: number;
  dividendIncome: number;
  savingsInterestIncome: number;
  basicIncome: number;
  incomeTax: number;
  nationalInsurance: number;
  pensionContributions: number;
  carersAllowance: number;
  esaContrib: number;
  jsaContrib: number;
  maternityAllowance: number;
  statutorySickPay: number;
  statutoryMaternityPay: number;
  attendanceAllowance: number;
  pipDailyLiving: number;
  dlaCare: number;
  armedForcesIndependencePayment: number;
  isBlind: boolean;
  isDisabledForBenefits: boolean;
  careLeaver: boolean;
  selfEmploymentStartupPeriod: boolean;
  underlyingCarerEntitlement: boolean;
}

export interface NonDependantInputs {
  age: number;
  employmentIncome: number;
  selfEmploymentIncome: number;
  weeklyHours: number;
  privatePensionIncome: number;
  statePension: number;
  propertyIncome: number;
  dividendIncome: number;
  savingsInterestIncome: number;
  universalCredit: number;
  ucEarnedIncome: number;
  ucUnearnedIncome: number;
  ucReportedCapital: number;
  incomeSupport: number;
  jsaIncome: number;
  esaIncome: number;
  pensionCredit: number;
  attendanceAllowance: number;
  pipDailyLiving: number;
  dlaCare: number;
  isBlind: boolean;
  isDisabledForBenefits: boolean;
  fullTimeStudent: boolean;
  sourceExemption: boolean;
}

export interface HouseholdInputs {
  councilTax: number;
  adultCount: 1 | 2;
  childrenUnder5: number;
  children5To15: number;
  children16To19: number;
  disabledChildren: number;
  savings: number;
  childcareExpenses: number;
  claimsAllEntitledBenefits: boolean;
  councilTaxBenefitReported: number;
  claimant: AdultInputs;
  partner: AdultInputs;
  incomeSupport: number;
  jsaIncome: number;
  esaIncome: number;
  pensionCredit: number;
  childBenefit: number;
  taxCredits: number;
  universalCredit: number;
  wouldClaimUc: boolean;
  ucMaximumAmount: number;
  ucEarnedIncome: number;
  ucUnearnedIncome: number;
  ucReportedCapital: number;
  benefitsPremiums: number;
  ssmg: number;
  sourceProtectedGroup: boolean;
  warPensionProtected: boolean;
  bereavementProtected: boolean;
  ucRelevantPeriodPensioner: boolean;
  sourceDisabilityIncomeDisregard: boolean;
  wtcDisabilityElement: boolean;
  sourceSpecialEarningsDisregard: boolean;
  sourceDisabilityOrEsaComponent: boolean;
  sourceDisregardedIncome: number;
  sourceDisregardedUcElements: number;
  esaSupportComponent: number;
  severeDisablementAllowance: number;
  claimantSourceNonDepExemption: boolean;
  disabledBandReduction: boolean;
  nonDependantCount: number;
  nonDependants: NonDependantInputs[];
}

type PeriodValue = Record<string, number | string | boolean>;
type EntityRecord = Record<string, unknown>;

export interface PolicyEnginePayload {
  period: number;
  situation: {
    people: Record<string, EntityRecord>;
    benunits: Record<string, EntityRecord>;
    households: Record<string, EntityRecord>;
  };
}

export interface CalculationResponse {
  council_tax: number;
  council_tax_reduction: number;
  council_tax_less_benefit: number;
}

const SOURCE_CARE_LEAVER_PERSON_VARIABLES = [
  "ealing_council_tax_reduction_care_leaver",
  "havering_council_tax_reduction_care_leaver",
  "west_northamptonshire_council_tax_reduction_care_leaver",
];

const SOURCE_CLAIMANT_NON_DEP_EXEMPTION_VARIABLES = [
  "babergh_council_tax_reduction_claimant_source_non_dep_exemption",
  "bristol_council_tax_reduction_claimant_source_non_dep_exemption",
  "buckinghamshire_council_tax_reduction_claimant_source_non_dep_exemption",
  "cumberland_council_tax_reduction_claimant_source_non_dep_exemption",
  "herefordshire_council_tax_reduction_claimant_source_non_dep_exemption",
  "ipswich_council_tax_reduction_claimant_source_non_dep_exemption",
  "kingston_upon_hull_council_tax_reduction_claimant_source_non_dep_exemption",
  "mid_suffolk_council_tax_reduction_claimant_source_non_dep_exemption",
  "north_northamptonshire_council_tax_reduction_claimant_source_non_dep_exemption",
  "west_northamptonshire_council_tax_reduction_claimant_source_non_dep_exemption",
  "westmorland_and_furness_council_tax_reduction_claimant_source_non_dep_exemption",
];

const SOURCE_NON_DEP_EXEMPTION_VARIABLES = [
  "babergh_council_tax_reduction_non_dep_source_exemption",
  "bristol_council_tax_reduction_non_dep_source_exemption",
  "buckinghamshire_council_tax_reduction_non_dep_source_exemption",
  "cumberland_council_tax_reduction_non_dep_source_exemption",
  "herefordshire_council_tax_reduction_non_dep_source_exemption",
  "ipswich_council_tax_reduction_non_dep_source_exemption",
  "kingston_upon_hull_council_tax_reduction_non_dep_source_exemption",
  "mid_suffolk_council_tax_reduction_non_dep_source_exemption",
  "north_northamptonshire_council_tax_reduction_non_dep_source_exemption",
  "plymouth_council_tax_reduction_non_dep_source_exemption",
  "somerset_council_tax_reduction_non_dep_source_exemption",
  "west_northamptonshire_council_tax_reduction_non_dep_source_exemption",
  "westmorland_and_furness_council_tax_reduction_non_dep_source_exemption",
];

const SOURCE_WAR_PENSION_BENUNIT_VARIABLES = [
  "barnet_council_tax_reduction_war_pension_protected",
  "bury_council_tax_reduction_war_pension_protected",
  "enfield_council_tax_reduction_war_widow",
  "harrow_council_tax_reduction_war_pension_protected",
  "havering_council_tax_reduction_war_pension_protected",
  "plymouth_council_tax_reduction_war_pensioner",
  "west_northamptonshire_council_tax_reduction_war_pension_protected",
];

const SOURCE_UC_RELEVANT_PERIOD_VARIABLES = [
  "basildon_council_tax_reduction_uc_relevant_period_pensioner",
  "buckinghamshire_council_tax_reduction_uc_transitional_protection_pensioner",
  "kingston_upon_hull_council_tax_reduction_uc_relevant_period_pensioner",
  "north_yorkshire_council_tax_reduction_uc_relevant_period_pensioner",
  "plymouth_council_tax_reduction_uc_relevant_period_pensioner",
  "somerset_council_tax_reduction_uc_relevant_period_pensioner",
];

const SOURCE_UC_RELEVANT_PERIOD_PERSON_VARIABLES = [
  "west_northamptonshire_council_tax_reduction_uc_relevant_period_pensioner",
];

const SOURCE_DISREGARDED_INCOME_VARIABLES = [
  "basildon_council_tax_reduction_source_disregarded_income",
  "buckinghamshire_council_tax_reduction_source_disregarded_income",
  "plymouth_council_tax_reduction_source_disregarded_income",
];

const SOURCE_ESA_COMPONENT_VARIABLES = [
  "basildon_council_tax_reduction_esa_support_component",
  "buckinghamshire_council_tax_reduction_esa_support_component",
  "plymouth_council_tax_reduction_esa_support_component",
  "somerset_council_tax_reduction_esa_support_component",
];

const adultDefaults: AdultInputs = {
  age: 35,
  employmentIncome: 0,
  selfEmploymentIncome: 0,
  weeklyHours: 0,
  privatePensionIncome: 0,
  statePension: 0,
  propertyIncome: 0,
  dividendIncome: 0,
  savingsInterestIncome: 0,
  basicIncome: 0,
  incomeTax: 0,
  nationalInsurance: 0,
  pensionContributions: 0,
  carersAllowance: 0,
  esaContrib: 0,
  jsaContrib: 0,
  maternityAllowance: 0,
  statutorySickPay: 0,
  statutoryMaternityPay: 0,
  attendanceAllowance: 0,
  pipDailyLiving: 0,
  dlaCare: 0,
  armedForcesIndependencePayment: 0,
  isBlind: false,
  isDisabledForBenefits: false,
  careLeaver: false,
  selfEmploymentStartupPeriod: false,
  underlyingCarerEntitlement: false,
};

const nonDependantDefaults: NonDependantInputs = {
  age: 25,
  employmentIncome: 0,
  selfEmploymentIncome: 0,
  weeklyHours: 0,
  privatePensionIncome: 0,
  statePension: 0,
  propertyIncome: 0,
  dividendIncome: 0,
  savingsInterestIncome: 0,
  universalCredit: 0,
  ucEarnedIncome: 0,
  ucUnearnedIncome: 0,
  ucReportedCapital: 0,
  incomeSupport: 0,
  jsaIncome: 0,
  esaIncome: 0,
  pensionCredit: 0,
  attendanceAllowance: 0,
  pipDailyLiving: 0,
  dlaCare: 0,
  isBlind: false,
  isDisabledForBenefits: false,
  fullTimeStudent: false,
  sourceExemption: false,
};

export const DEFAULT_HOUSEHOLD_INPUTS: HouseholdInputs = {
  councilTax: 0,
  adultCount: 1,
  childrenUnder5: 0,
  children5To15: 0,
  children16To19: 0,
  disabledChildren: 0,
  savings: 0,
  childcareExpenses: 0,
  claimsAllEntitledBenefits: true,
  councilTaxBenefitReported: 0,
  claimant: adultDefaults,
  partner: { ...adultDefaults },
  incomeSupport: 0,
  jsaIncome: 0,
  esaIncome: 0,
  pensionCredit: 0,
  childBenefit: 0,
  taxCredits: 0,
  universalCredit: 0,
  wouldClaimUc: false,
  ucMaximumAmount: 0,
  ucEarnedIncome: 0,
  ucUnearnedIncome: 0,
  ucReportedCapital: 0,
  benefitsPremiums: 0,
  ssmg: 0,
  sourceProtectedGroup: false,
  warPensionProtected: false,
  bereavementProtected: false,
  ucRelevantPeriodPensioner: false,
  sourceDisabilityIncomeDisregard: false,
  wtcDisabilityElement: false,
  sourceSpecialEarningsDisregard: false,
  sourceDisabilityOrEsaComponent: false,
  sourceDisregardedIncome: 0,
  sourceDisregardedUcElements: 0,
  esaSupportComponent: 0,
  severeDisablementAllowance: 0,
  claimantSourceNonDepExemption: false,
  disabledBandReduction: false,
  nonDependantCount: 0,
  nonDependants: Array.from({ length: MAX_NON_DEPENDANTS }, () => ({
    ...nonDependantDefaults,
  })),
};

export function totalChildren(inputs: HouseholdInputs) {
  return (
    inputs.childrenUnder5 + inputs.children5To15 + inputs.children16To19
  );
}

export function totalAdultEarnings(inputs: HouseholdInputs) {
  const partnerIncome =
    inputs.adultCount === 2
      ? inputs.partner.employmentIncome + inputs.partner.selfEmploymentIncome
      : 0;
  return (
    inputs.claimant.employmentIncome +
    inputs.claimant.selfEmploymentIncome +
    partnerIncome
  );
}

export function getStaticScenarioId(inputs: HouseholdInputs) {
  if (totalChildren(inputs) > 0) {
    return "lone_parent_15k_earnings";
  }
  if (inputs.savings >= 8_000) {
    return "single_8k_savings";
  }
  const earnings = totalAdultEarnings(inputs);
  if (earnings <= 0) {
    return "single_no_earnings";
  }
  return earnings <= 27_500 ? "single_20k_earnings" : "single_35k_earnings";
}

export function getEarningsProfileId(inputs: HouseholdInputs) {
  if (totalChildren(inputs) > 0) {
    return "lone_parent_one_child";
  }
  if (inputs.savings >= 8_000) {
    return "single_adult_8k_savings";
  }
  return "single_adult_no_savings";
}

export function nearestEarningsCurvePoint(
  curve: EarningsCurvePoint[],
  earnings: number,
) {
  return curve.reduce<EarningsCurvePoint | null>((nearest, point) => {
    if (!nearest) {
      return point;
    }
    return Math.abs(point.earnings - earnings) <
      Math.abs(nearest.earnings - earnings)
      ? point
      : nearest;
  }, null);
}

function periodValue(value: number | string | boolean, period: number): PeriodValue {
  return { [period]: value };
}

function setValue(
  record: EntityRecord,
  variable: string,
  value: number | string | boolean,
  period: number,
) {
  record[variable] = periodValue(value, period);
}

function setPositiveNumber(
  record: EntityRecord,
  variable: string,
  value: number,
  period: number,
) {
  if (value > 0) {
    setValue(record, variable, value, period);
  }
}

function setTrue(
  record: EntityRecord,
  variable: string,
  value: boolean,
  period: number,
) {
  if (value) {
    setValue(record, variable, true, period);
  }
}

function setTrueForAll(
  record: EntityRecord,
  variables: string[],
  value: boolean,
  period: number,
) {
  for (const variable of variables) {
    setTrue(record, variable, value, period);
  }
}

function setPositiveNumberForAll(
  record: EntityRecord,
  variables: string[],
  value: number,
  period: number,
) {
  for (const variable of variables) {
    setPositiveNumber(record, variable, value, period);
  }
}

function addAdultInputs(
  person: EntityRecord,
  adult: AdultInputs,
  period: number,
) {
  setValue(person, "age", adult.age, period);
  setPositiveNumber(person, "employment_income", adult.employmentIncome, period);
  setPositiveNumber(
    person,
    "self_employment_income",
    adult.selfEmploymentIncome,
    period,
  );
  setPositiveNumber(person, "hours_worked", adult.weeklyHours * 52, period);
  setPositiveNumber(person, "private_pension_income", adult.privatePensionIncome, period);
  setPositiveNumber(person, "state_pension", adult.statePension, period);
  setPositiveNumber(person, "property_income", adult.propertyIncome, period);
  setPositiveNumber(person, "dividend_income", adult.dividendIncome, period);
  setPositiveNumber(
    person,
    "savings_interest_income",
    adult.savingsInterestIncome,
    period,
  );
  setPositiveNumber(person, "basic_income", adult.basicIncome, period);
  setPositiveNumber(person, "income_tax", adult.incomeTax, period);
  setPositiveNumber(person, "national_insurance", adult.nationalInsurance, period);
  setPositiveNumber(person, "pension_contributions", adult.pensionContributions, period);
  setPositiveNumber(person, "carers_allowance", adult.carersAllowance, period);
  setPositiveNumber(person, "esa_contrib", adult.esaContrib, period);
  setPositiveNumber(person, "jsa_contrib", adult.jsaContrib, period);
  setPositiveNumber(person, "maternity_allowance", adult.maternityAllowance, period);
  setPositiveNumber(person, "statutory_sick_pay", adult.statutorySickPay, period);
  setPositiveNumber(
    person,
    "statutory_maternity_pay",
    adult.statutoryMaternityPay,
    period,
  );
  setPositiveNumber(
    person,
    "attendance_allowance",
    adult.attendanceAllowance,
    period,
  );
  setPositiveNumber(person, "pip_dl", adult.pipDailyLiving, period);
  setPositiveNumber(person, "dla_sc", adult.dlaCare, period);
  setPositiveNumber(
    person,
    "armed_forces_independence_payment",
    adult.armedForcesIndependencePayment,
    period,
  );
  setTrue(person, "is_blind", adult.isBlind, period);
  setTrue(person, "is_disabled_for_benefits", adult.isDisabledForBenefits, period);
  setTrueForAll(person, SOURCE_CARE_LEAVER_PERSON_VARIABLES, adult.careLeaver, period);
  setTrue(
    person,
    "ealing_council_tax_reduction_self_employment_startup_period",
    adult.selfEmploymentStartupPeriod,
    period,
  );
  setTrue(
    person,
    "ealing_council_tax_reduction_underlying_carers_allowance_entitlement",
    adult.underlyingCarerEntitlement,
    period,
  );
}

function addNonDependantInputs(
  person: EntityRecord,
  benunit: EntityRecord,
  nonDependant: NonDependantInputs,
  period: number,
) {
  setValue(person, "age", nonDependant.age, period);
  setPositiveNumber(person, "employment_income", nonDependant.employmentIncome, period);
  setPositiveNumber(
    person,
    "self_employment_income",
    nonDependant.selfEmploymentIncome,
    period,
  );
  setPositiveNumber(person, "hours_worked", nonDependant.weeklyHours * 52, period);
  setPositiveNumber(
    person,
    "private_pension_income",
    nonDependant.privatePensionIncome,
    period,
  );
  setPositiveNumber(person, "state_pension", nonDependant.statePension, period);
  setPositiveNumber(person, "property_income", nonDependant.propertyIncome, period);
  setPositiveNumber(person, "dividend_income", nonDependant.dividendIncome, period);
  setPositiveNumber(
    person,
    "savings_interest_income",
    nonDependant.savingsInterestIncome,
    period,
  );
  setPositiveNumber(
    person,
    "attendance_allowance",
    nonDependant.attendanceAllowance,
    period,
  );
  setPositiveNumber(person, "pip_dl", nonDependant.pipDailyLiving, period);
  setPositiveNumber(person, "dla_sc", nonDependant.dlaCare, period);
  setTrue(person, "is_blind", nonDependant.isBlind, period);
  setTrue(
    person,
    "is_disabled_for_benefits",
    nonDependant.isDisabledForBenefits,
    period,
  );
  setTrue(person, "in_HE", nonDependant.fullTimeStudent, period);
  setTrueForAll(
    person,
    SOURCE_NON_DEP_EXEMPTION_VARIABLES,
    nonDependant.sourceExemption,
    period,
  );
  setPositiveNumber(benunit, "universal_credit", nonDependant.universalCredit, period);
  setPositiveNumber(benunit, "uc_earned_income", nonDependant.ucEarnedIncome, period);
  setPositiveNumber(
    benunit,
    "uc_unearned_income",
    nonDependant.ucUnearnedIncome,
    period,
  );
  setPositiveNumber(
    benunit,
    "uc_reported_capital",
    nonDependant.ucReportedCapital,
    period,
  );
  setPositiveNumber(benunit, "income_support", nonDependant.incomeSupport, period);
  setPositiveNumber(benunit, "jsa_income", nonDependant.jsaIncome, period);
  setPositiveNumber(benunit, "esa_income", nonDependant.esaIncome, period);
  setPositiveNumber(benunit, "pension_credit", nonDependant.pensionCredit, period);
}

function addChildren(
  people: Record<string, EntityRecord>,
  members: string[],
  inputs: HouseholdInputs,
  period: number,
) {
  const ages = [
    ...Array.from({ length: inputs.childrenUnder5 }, () => 4),
    ...Array.from({ length: inputs.children5To15 }, () => 10),
    ...Array.from({ length: inputs.children16To19 }, () => 17),
  ];

  ages.forEach((age, index) => {
    const childId = `child_${index + 1}`;
    const child: EntityRecord = {};
    setValue(child, "age", age, period);
    if (index < inputs.disabledChildren) {
      setTrue(child, "is_disabled_for_benefits", true, period);
      setTrue(child, "basildon_council_tax_reduction_childcare_disabled_child", true, period);
      setTrue(child, "plymouth_council_tax_reduction_childcare_disabled_child", true, period);
    }
    people[childId] = child;
    members.push(childId);
  });
}

export function buildPolicyEnginePayload(
  inputs: HouseholdInputs,
  localAuthorityEnum: string,
  band: CouncilTaxBand,
  period = PERIOD,
): PolicyEnginePayload {
  const people: Record<string, EntityRecord> = {};
  const benunits: Record<string, EntityRecord> = {};
  const households: Record<string, EntityRecord> = {};

  const members = ["claimant"];
  const claimant: EntityRecord = {};
  addAdultInputs(claimant, inputs.claimant, period);
  setPositiveNumber(claimant, "childcare_expenses", inputs.childcareExpenses, period);
  setPositiveNumber(claimant, "council_tax_benefit_reported", inputs.councilTaxBenefitReported, period);
  setPositiveNumber(claimant, "ssmg", inputs.ssmg, period);
  setTrueForAll(
    claimant,
    SOURCE_CLAIMANT_NON_DEP_EXEMPTION_VARIABLES,
    inputs.claimantSourceNonDepExemption,
    period,
  );
  setTrueForAll(
    claimant,
    SOURCE_UC_RELEVANT_PERIOD_PERSON_VARIABLES,
    inputs.ucRelevantPeriodPensioner,
    period,
  );
  people.claimant = claimant;

  if (inputs.adultCount === 2) {
    const partner: EntityRecord = {};
    addAdultInputs(partner, inputs.partner, period);
    setPositiveNumber(partner, "childcare_expenses", inputs.childcareExpenses, period);
    setTrue(partner, "basildon_council_tax_reduction_childcare_disabled_partner", inputs.partner.isDisabledForBenefits, period);
    setTrue(partner, "plymouth_council_tax_reduction_childcare_disabled_partner", inputs.partner.isDisabledForBenefits, period);
    people.partner = partner;
    members.push("partner");
  }

  addChildren(people, members, inputs, period);

  const claimantBenunit: EntityRecord = {
    members,
  };
  const childCount = totalChildren(inputs);
  const adultAges =
    inputs.adultCount === 2
      ? [inputs.claimant.age, inputs.partner.age]
      : [inputs.claimant.age];
  setValue(
    claimantBenunit,
    "claims_all_entitled_benefits",
    inputs.claimsAllEntitledBenefits,
    period,
  );
  setValue(claimantBenunit, "would_claim_uc", inputs.wouldClaimUc, period);
  setValue(
    claimantBenunit,
    "is_single_person",
    inputs.adultCount === 1 && childCount === 0,
    period,
  );
  setValue(claimantBenunit, "is_couple", inputs.adultCount === 2, period);
  setValue(
    claimantBenunit,
    "is_lone_parent",
    inputs.adultCount === 1 && childCount > 0,
    period,
  );
  setValue(claimantBenunit, "eldest_adult_age", Math.max(...adultAges), period);
  setPositiveNumber(claimantBenunit, "benefits_premiums", inputs.benefitsPremiums, period);
  setPositiveNumber(claimantBenunit, "income_support", inputs.incomeSupport, period);
  setPositiveNumber(claimantBenunit, "jsa_income", inputs.jsaIncome, period);
  setPositiveNumber(claimantBenunit, "esa_income", inputs.esaIncome, period);
  setPositiveNumber(claimantBenunit, "pension_credit", inputs.pensionCredit, period);
  setPositiveNumber(claimantBenunit, "child_benefit", inputs.childBenefit, period);
  setPositiveNumber(claimantBenunit, "tax_credits", inputs.taxCredits, period);
  setPositiveNumber(claimantBenunit, "universal_credit", inputs.universalCredit, period);
  setPositiveNumber(claimantBenunit, "uc_maximum_amount", inputs.ucMaximumAmount, period);
  setPositiveNumber(claimantBenunit, "uc_earned_income", inputs.ucEarnedIncome, period);
  setPositiveNumber(claimantBenunit, "uc_unearned_income", inputs.ucUnearnedIncome, period);
  setPositiveNumber(claimantBenunit, "uc_reported_capital", inputs.ucReportedCapital, period);
  setTrue(claimantBenunit, "basildon_council_tax_reduction_source_protected_group", inputs.sourceProtectedGroup, period);
  setTrue(claimantBenunit, "bury_council_tax_reduction_bereavement_protected", inputs.bereavementProtected, period);
  setTrue(
    claimantBenunit,
    "bury_council_tax_reduction_underlying_carer_protected",
    inputs.claimant.underlyingCarerEntitlement || inputs.partner.underlyingCarerEntitlement,
    period,
  );
  setTrueForAll(
    claimantBenunit,
    SOURCE_WAR_PENSION_BENUNIT_VARIABLES,
    inputs.warPensionProtected,
    period,
  );
  setTrueForAll(
    claimantBenunit,
    SOURCE_UC_RELEVANT_PERIOD_VARIABLES,
    inputs.ucRelevantPeriodPensioner,
    period,
  );
  setTrue(
    claimantBenunit,
    "buckinghamshire_council_tax_reduction_source_disability_income_disregard",
    inputs.sourceDisabilityIncomeDisregard,
    period,
  );
  setTrue(
    claimantBenunit,
    "plymouth_council_tax_reduction_source_disability_income_disregard",
    inputs.sourceDisabilityIncomeDisregard,
    period,
  );
  setTrue(
    claimantBenunit,
    "basildon_council_tax_reduction_working_tax_credit_disability_element",
    inputs.wtcDisabilityElement,
    period,
  );
  setTrue(
    claimantBenunit,
    "plymouth_council_tax_reduction_source_special_earnings_disregard",
    inputs.sourceSpecialEarningsDisregard,
    period,
  );
  setTrue(
    claimantBenunit,
    "plymouth_council_tax_reduction_source_disability_or_esa_component",
    inputs.sourceDisabilityOrEsaComponent,
    period,
  );
  setPositiveNumberForAll(
    claimantBenunit,
    SOURCE_DISREGARDED_INCOME_VARIABLES,
    inputs.sourceDisregardedIncome,
    period,
  );
  setPositiveNumber(
    claimantBenunit,
    "buckinghamshire_council_tax_reduction_source_disregarded_uc_elements",
    inputs.sourceDisregardedUcElements,
    period,
  );
  setPositiveNumberForAll(
    claimantBenunit,
    SOURCE_ESA_COMPONENT_VARIABLES,
    inputs.esaSupportComponent,
    period,
  );
  setPositiveNumber(
    claimantBenunit,
    "basildon_council_tax_reduction_severe_disablement_allowance",
    inputs.severeDisablementAllowance,
    period,
  );
  benunits.claimant_benunit = claimantBenunit;

  const householdMembers = [...members];
  inputs.nonDependants
    .slice(0, inputs.nonDependantCount)
    .forEach((nonDependant, index) => {
      const personId = `non_dep_${index + 1}`;
      const benunitId = `non_dep_benunit_${index + 1}`;
      const person: EntityRecord = {};
      const benunit: EntityRecord = { members: [personId] };
      addNonDependantInputs(person, benunit, nonDependant, period);
      people[personId] = person;
      benunits[benunitId] = benunit;
      householdMembers.push(personId);
    });

  const household: EntityRecord = {
    members: householdMembers,
  };
  setValue(household, "country", "ENGLAND", period);
  setValue(household, "local_authority", localAuthorityEnum, period);
  setValue(household, "council_tax_band", band, period);
  setValue(household, "council_tax", inputs.councilTax, period);
  setValue(household, "savings", inputs.savings, period);
  setTrue(
    household,
    "harrow_council_tax_reduction_disabled_band_reduction",
    inputs.disabledBandReduction,
    period,
  );
  setTrue(
    household,
    "stockport_council_tax_reduction_disabled_persons_relief",
    inputs.disabledBandReduction,
    period,
  );
  households.household = household;

  return {
    period,
    situation: {
      people,
      benunits,
      households,
    },
  };
}
