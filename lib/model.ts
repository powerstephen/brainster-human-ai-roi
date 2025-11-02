// lib/model.ts

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
  // retention (clear model)
  baselineTurnoverPct: number;           // annual % leaving, e.g. 20
  turnoverImprovementPct: number;        // relative improvement %, e.g. 10 reduces 20% → 18%
  replacementCostFactor: number;         // as fraction of salary, e.g. 0.5 = 50%
  // training
  trainingPerEmployee: number;
  durationMonths: number;
  pains: Pain[];
}

export function symbol(c: Currency): string {
  switch (c) {
    case 'EUR': return '€';
    case 'USD': return '$';
    case 'GBP': return '£';
    default: return '€';
  }
}

export function teamPresets(team: Team): {
  hours: number;
  baselineTurnoverPct: number;
} {
  switch (team) {
    case 'support':   return { hours: 4.5, baselineTurnoverPct: 28 };
    case 'sales':     return { hours: 3.5, baselineTurnoverPct: 24 };
    case 'marketing': return { hours: 3.0, baselineTurnoverPct: 20 };
    case 'product':   return { hours: 2.5, baselineTurnoverPct: 16 };
    case 'ops':       return { hours: 3.0, baselineTurnoverPct: 18 };
    case 'hr':
    default:          return { hours: 2.5, baselineTurnoverPct: 18 };
  }
}

export function calc(i: Inputs) {
  // Productivity value from time saved
  const HOURS_PER_YEAR = 1800; // conservative working hours
  const hourlyCost = i.avgSalary / HOURS_PER_YEAR;
  const hoursTotalYear = i.hoursSavedPerWeek * i.employees * 52;
  const productivityAnnual = hoursTotalYear * hourlyCost;

  // Retention value
  const baselineTurnover = clampPct(i.baselineTurnoverPct) / 100;
  const improvementRel = clampPct(i.turnoverImprovementPct) / 100;
  const turnoverAfter = baselineTurnover * (1 - improvementRel);
  const avoidedAttritions = i.employees * (baselineTurnover - turnoverAfter);
  const costPerAttrition = i.avgSalary * clampFactor(i.replacementCostFactor);
  const retentionValue = avoidedAttritions * costPerAttrition;

  // Training cost & ROI
  const trainingCostTotal = i.employees * i.trainingPerEmployee;
  const annualValue = productivityAnnual + retentionValue;

  const monthlySavings = annualValue / 12;
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
  return Math.max(0, Math.min(1.5, n));
}

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
