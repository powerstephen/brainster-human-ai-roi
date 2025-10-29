export type Persona = 'head_ld' | 'chro' | 'people_ops' | 'coo' | 'cx_lead' | 'mkt_lead';
export type Pain = 'retention' | 'upskilling' | 'engagement' | 'productivity' | 'quality' | 'hiring';
export type Maturity = 'low' | 'medium' | 'high';

export type GlobalInputs = {
  employees: number;
  trainPercent: number;
  hourlyCost: number;
  weeklyHours: number;
  repetitiveTimePct: number;
};

export type MaturityParams = {
  baselineAdoptionPct: number;
  baselineProductivityPct: number;
  ramp: number[];
};

export type ProgramInputs = {
  adoptionRatePct: number;
  productivityGainPct: number;
  trainingCostPerEmployee: number;
  platformSpendMonthly?: number;
  durationMonths: number;
};

export type PainInputs = {
  baselineAttritionPct?: number;
  attritionImprovementPts?: number;
  replacementCostFactor?: number;
  annualSalary?: number;

  ttcWeeksNow?: number;
  ttcWeeksTarget?: number;
  hiresOrMovesPerYear?: number;

  eNpsLiftPts?: number;
  attritionPtsPer10Enps?: number;

  reworkRatePct?: number;
  reworkReductionPct?: number;
  costPerRework?: number;
  unitsPerPersonMonth?: number;

  hiresAvoided?: number;
  fullyLoadedSalary?: number;

  mgrHoursPerWeek?: number;
  mgrAssistPct?: number;
  managersCount?: number;
};

export type Results = {
  monthlySavings: number;
  annualValue: number;
  trainingInvestment: number;
  platformInvestment: number;
  totalInvestment: number;
  paybackMonths: number;
  roiMultiple: number;
  hoursSavedPerPersonWeek: number;
  annualHoursSavedTotal: number;
  timeDividend: number;
  qualityDividend: number;
  retentionDividend: number;
  hiringDividend: number;
  aacLiftPct: number;
  topDriver: { label: string; share: number };
};

export function maturityPresets(m: Maturity): MaturityParams {
  if (m === 'low') return { baselineAdoptionPct: 10, baselineProductivityPct: 5, ramp: [0.5, 0.8, 1.0] };
  if (m === 'medium') return { baselineAdoptionPct: 35, baselineProductivityPct: 12, ramp: [0.6, 1.0] };
  return { baselineAdoptionPct: 60, baselineProductivityPct: 20, ramp: [0.8, 1.0] };
}

function clamp01(x: number) { return Math.max(0, Math.min(1, x)); }

export function calcAll(
  g: GlobalInputs, maturity: MaturityParams, prog: ProgramInputs, pain: Pain, p: PainInputs
): Results {
  const trained = g.employees * (g.trainPercent / 100);
  const baselineEff = clamp01((maturity.baselineAdoptionPct / 100) * (maturity.baselineProductivityPct / 100));
  const postEff = clamp01((prog.adoptionRatePct / 100) * (prog.productivityGainPct / 100));
  const cappedPost = Math.min(postEff, 0.5);
  const incrEff = Math.max(0, cappedPost - baselineEff);

  const hoursRepetitivePerWeek = g.weeklyHours * (g.repetitiveTimePct / 100);
  const hoursSavedPerPersonWeek = hoursRepetitivePerWeek * incrEff;
  const annualHoursSavedTotal = hoursSavedPerPersonWeek * 52 * trained;
  const timeDividend = annualHoursSavedTotal * g.hourlyCost;

  // Quality dividend
  let qualityDividend = 0;
  if (pain === 'quality' || (p.reworkReductionPct && p.costPerRework)) {
    const units = p.unitsPerPersonMonth ?? 20;
    const reworkRate = (p.reworkRatePct ?? 15) / 100;
    const reworkDrop = (p.reworkReductionPct ?? 15) / 100;
    const cost = p.costPerRework ?? 50;
    const annualEvents = units * trained * 12;
    qualityDividend = annualEvents * reworkRate * reworkDrop * cost;
  }

  // Retention dividend
  let retentionDividend = 0;
  {
    const baseAttr = (p.baselineAttritionPct ?? 16) / 100;
    const directDelta = (p.attritionImprovementPts ?? 0) / 100;
    const enpsLift = p.eNpsLiftPts ?? 0;
    const corrPer10 = p.attritionPtsPer10Enps ?? 2;
    const derivedDelta = (enpsLift / 10) * (corrPer10 / 100);
    const delta = Math.max(0, directDelta + derivedDelta);
    const salary = p.annualSalary ?? Math.round(g.hourlyCost * g.weeklyHours * 52);
    const replFactor = p.replacementCostFactor ?? 0.6;
    const savedExits = trained * delta;
    retentionDividend = savedExits * salary * replFactor;
    const maxSaved = trained * baseAttr;
    if (savedExits > maxSaved) retentionDividend = maxSaved * salary * replFactor;
  }

  // Hiring deferral
  const hiringDividend =
    (p.hiresAvoided ?? 0) * (p.fullyLoadedSalary ?? Math.round(g.hourlyCost * g.weeklyHours * 52));

  const annualValue = timeDividend + qualityDividend + retentionDividend + hiringDividend;

  const trainingInvestment = trained * prog.trainingCostPerEmployee;
  const platformInvestment = (prog.platformSpendMonthly ?? 0) * 12;
  const totalInvestment = trainingInvestment + platformInvestment;

  const monthlySavings = annualValue / 12;
  const paybackMonths = monthlySavings > 0 ? totalInvestment / monthlySavings : Infinity;
  const roiMultiple = totalInvestment > 0 ? annualValue / totalInvestment : 0;

  // AAC lift
  const outputIdx = 1 + incrEff * (g.repetitiveTimePct / 100);
  const qualityIdx = 1 + ((p.reworkReductionPct ?? 0) / 100) * (pain === 'quality' ? 1 : 0.5);
  const aacLiftPct = (outputIdx * qualityIdx - 1) * 100;

  const parts = [
    { label: 'Time', v: timeDividend },
    { label: 'Quality', v: qualityDividend },
    { label: 'Retention', v: retentionDividend },
    { label: 'Hiring', v: hiringDividend },
  ];
  const total = Math.max(annualValue, 1e-6);
  parts.sort((a, b) => b.v - a.v);
  const topDriver = { label: parts[0].label, share: parts[0].v / total };

  return {
    monthlySavings, annualValue, trainingInvestment, platformInvestment, totalInvestment,
    paybackMonths, roiMultiple, hoursSavedPerPersonWeek, annualHoursSavedTotal,
    timeDividend, qualityDividend, retentionDividend, hiringDividend, aacLiftPct, topDriver,
  };
}
