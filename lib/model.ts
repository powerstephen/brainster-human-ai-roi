// lib/model.ts

// ------- Types -------
export type Currency = 'EUR' | 'USD' | 'GBP';
export type Team =
  | 'hr'
  | 'ops'
  | 'marketing'
  | 'sales'
  | 'support'
  | 'product';

export type Pain =
  | 'retention'
  | 'engagement'
  | 'quality'
  | 'throughput'
  | 'onboarding'
  | 'cost';

export interface Inputs {
  currency: Currency;
  team: Team;
  maturityScore: number;                 // 1–10
  employees: number;
  avgSalary: number;                     // per employee per year
  hoursSavedPerWeek: number;             // per person
  // retention (new, clearer model)
  baselineTurnoverPct: number;           // annual % leaving, e.g. 20
  turnoverImprovementPct: number;        // relative improvement %, e.g. 10 reduces 20% → 18%
  replacementCostFactor: number;         // as fraction of salary, e.g. 0.5 = 50%
  // training
  trainingPerEmployee: number;
  durationMonths: number;
  pains: Pain[];
}

// ------- Symbols -------
export function symbol(c: Currency): string {
  switch (c) {
    case 'EUR':
      return '€';
    case 'USD':
      return '$';
    case 'GBP':
      return '£';
    default:
      return '€';
  }
}

// ------- Team presets (hours & turnover baselines) -------
export function teamPresets(team: Team): {
  hours: number;
  baselineTurnoverPct: number;
} {
  switch (team) {
    case 'support':
      return { hours: 4.5, baselineTurnoverPct: 28 }; // contact centers are higher
    case 'sales':
      return { hours: 3.5, baselineTurnoverPct: 24 };
    case 'marketing':
      return { hours: 3.0, baselineTurnoverPct: 20 };
    case 'product':
      return { hours: 2.5, baselineTurnoverPct: 16 };
    case 'ops':
      return { hours: 3.0, baselineTurnoverPct: 18 };
    case 'hr':
    default:
      return { hours: 2.5, baselineTurnoverPct: 18 };
  }
}

// ------- Core calc -------
export function calc(i: Inputs) {
  // Productivity value from time saved
  const HOURS_PER_YEAR = 1800; // conservative working hours
  const hourlyCost = i.avgSalary / HOURS_PER_YEAR;
  const hoursTotalYear = i.hoursSavedPerWeek * i.employees * 52;
  const productivityAnnual = hoursTotalYear * hourlyCost;

  // Retention value (new)
  const baselineTurnover = clampPct(i.baselineTurnoverPct) / 100;       // 0..1
  const improvementRel = clampPct(i.turnoverImprovementPct) / 100;      // 0..1
  const turnoverAfter = baselineTurnover * (1 - improvementRel);
  const avoidedAttritions = i.employees * (baselineTurnover - turnoverAfter);
  const costPerAttrition = i.avgSalary * clampFactor(i.replacementCostFactor); // e.g., 0.5×salary
  const retentionValue = avoidedAttritions * costPerAttrition;

  // Training cost & ROI
  const trainingCostTotal = i.employees * i.trainingPerEmployee;
  const annualValue = productivityAnnual + retentionValue;

  const monthlySavings = annualValue / 12; // value side (you could subtract monthly amortized cost if desired)
  const paybackMonths =
    annualValue > 0 ? trainingCostTotal / (annualValue / 12) : Infinity;
  const roiMultiple =
    trainingCostTotal > 0 ? annualValue / trainingCostTotal : 0;

  return {
    hoursTotalYear,
    productivityAnnual,
    retentionValue,
    annualValue,
    monthlySavings,
    paybackMonths,
    roiMultiple,
  };
}

function clampPct(n: number): number {
  if (!isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}
function clampFactor(n: number): number {
  if (!isFinite(n)) return 0.0;
  // sensible bounds 0..1.5 (150% of salary if they want)
  return Math.max(0, Math.min(1.5, n));
}

// ------- URL encoding / decoding for sharing -------
export function encodeInputs(i: Inputs): string {
  const qs = new URLSearchParams();
  qs.set('currency', i.currency);
  qs.set('team', i.team);
  qs.set('maturityScore', String(i.maturityScore));
  qs.set('employees', String(i.employees));
  qs.set('avgSalary', String(i.avgSalary));
  qs.set('hoursSavedPerWeek', String(i.hoursSavedPerWeek));

  qs.set('baselineTurnoverPct', String(i.baselineTurnoverPct));
  qs.set('turnoverImprovementPct', String(i.turnoverImprovementPct));
  qs.set('replacementCostFactor', String(i.replacementCostFactor));

  qs.set('trainingPerEmployee', String(i.trainingPerEmployee));
  qs.set('durationMonths', String(i.durationMonths));
  if (i.pains?.length) qs.set('pains', i.pains.join(','));
  return qs.toString();
}

export function decodeInputs(
  params: URLSearchParams,
  defaults: Inputs
): Inputs {
  const getNum = (k: string, d: number) =>
    params.has(k) ? Number(params.get(k)) || d : d;
  const getStr = (k: string, d: string) =>
    params.has(k) ? String(params.get(k)) : d;

  const pains = params.get('pains')
    ? (params.get('pains')!.split(',').filter(Boolean) as Pain[])
    : defaults.pains;

  return {
    currency: (getStr('currency', defaults.currency) as Currency) || 'EUR',
    team: (getStr('team', defaults.team) as Team) || 'hr',
    maturityScore: getNum('maturityScore', defaults.maturityScore),
    employees: getNum('employees', defaults.employees),
    avgSalary: getNum('avgSalary', defaults.avgSalary),
    hoursSavedPerWeek: getNum('hoursSavedPerWeek', defaults.hoursSavedPerWeek),

    baselineTurnoverPct: getNum(
      'baselineTurnoverPct',
      defaults.baselineTurnoverPct
    ),
    turnoverImprovementPct: getNum(
      'turnoverImprovementPct',
      defaults.turnoverImprovementPct
    ),
    replacementCostFactor: getNum(
      'replacementCostFactor',
      defaults.replacementCostFactor
    ),

    trainingPerEmployee: getNum(
      'trainingPerEmployee',
      defaults.trainingPerEmployee
    ),
    durationMonths: getNum('durationMonths', defaults.durationMonths),
    pains,
  };
}
