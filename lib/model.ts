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

  eNPSLiftPts?: number;            // renamed key for clarity (keep both)
  eNpsLiftPts?: number;
  attritionPtsPer10Enps?: number;

  reworkRatePct?: number;
  reworkReductionPct?: number;
  costPerRework?: number;
  unitsPerPersonMonth?: number;

  hiresAvoided?: number;
  fullyLoadedSalary?: number;
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

/** Multi-pain calculator with guardrails (retention double-count, etc.) */
export function calcAllMulti(
  g: GlobalInputs,
  maturity: MaturityParams,
  prog: ProgramInputs,
  pains: Pain[],
  painInputs: Record<Pain, PainInputs>
): Results {
  const trained = g.employees * (g.trainPercent / 100);

  // Baseline vs post for productivity (only if 'productivity' is selected)
  const baselineEff = clamp01((maturity.baselineAdoptionPct / 100) * (maturity.baselineProductivityPct / 100));
  const postEff = clamp01((prog.adoptionRatePct / 100) * (prog.productivityGainPct / 100));
  const cappedPost = Math.min(postEff, 0.5);
  const incrEff = Math.max(0, cappedPost - baselineEff);

  let timeDividend = 0;
  let qualityDividend = 0;
  let hiringDividend = 0;
  let retentionViaDirect = 0;
  let retentionViaEng = 0;

  // Hours saved (for productivity) & AAC base
  let hoursSavedPerPersonWeek = 0;

  for (const pain of pains) {
    const p = painInputs[pain] || {};

    if (pain === 'productivity') {
      const hoursRepetitivePerWeek = g.weeklyHours * (g.repetitiveTimePct / 100);
      const hppw = hoursRepetitivePerWeek * incrEff;
      hoursSavedPerPersonWeek = Math.max(hoursSavedPerPersonWeek, hppw); // take max if multiple sources
      const annualHoursSavedTotal = hppw * 52 * trained;
      timeDividend += annualHoursSavedTotal * g.hourlyCost;
    }

    if (pain === 'upskilling') {
      const now = p.ttcWeeksNow ?? 8;
      const target = p.ttcWeeksTarget ?? 6;
      const deltaWeeks = Math.max(0, now - target);
      const cohort = p.hiresOrMovesPerYear ?? 0;
      const hours = deltaWeeks * g.weeklyHours * cohort;
      timeDividend += hours * g.hourlyCost; // treat as time dividend
    }

    if (pain === 'quality') {
      const units = p.unitsPerPersonMonth ?? 20;
      const reworkRate = (p.reworkRatePct ?? 15) / 100;
      const reworkDrop = (p.reworkReductionPct ?? 20) / 100;
      const cost = p.costPerRework ?? 50;
      const annualEvents = units * trained * 12;
      qualityDividend += annualEvents * reworkRate * reworkDrop * cost;
    }

    if (pain === 'hiring') {
      const avoided = p.hiresAvoided ?? 0;
      const salary = p.fullyLoadedSalary ?? Math.round(g.hourlyCost * g.weeklyHours * 52);
      hiringDividend += avoided * salary;
    }

    if (pain === 'retention') {
      const baseAttr = (p.baselineAttritionPct ?? 16) / 100;
      const delta = Math.max(0, (p.attritionImprovementPts ?? 0) / 100);
      const salary = p.annualSalary ?? Math.round(g.hourlyCost * g.weeklyHours * 52);
      const replFactor = p.replacementCostFactor ?? 0.6;
      const savedExits = Math.min(trained * delta, trained * baseAttr);
      retentionViaDirect = Math.max(retentionViaDirect, savedExits * salary * replFactor);
    }

    if (pain === 'engagement') {
      const baseAttr = (p.baselineAttritionPct ?? 16) / 100;
      const lift = (p.eNPSLiftPts ?? p.eNpsLiftPts ?? 8);
      const corrPer10 = p.attritionPtsPer10Enps ?? 2; // pts per +10 eNPS
      const delta = Math.max(0, (lift / 10) * (corrPer10 / 100));
      const salary = p.annualSalary ?? Math.round(g.hourlyCost * g.weeklyHours * 52);
      const replFactor = p.replacementCostFactor ?? 0.6;
      const savedExits = Math.min(trained * delta, trained * baseAttr);
      retentionViaEng = Math.max(retentionViaEng, savedExits * salary * replFactor);
    }
  }

  // Guardrail: retention counted once (take max of the two paths)
  const retentionDividend = Math.max(retentionViaDirect, retentionViaEng);

  const annualValue = timeDividend + qualityDividend + retentionDividend + hiringDividend;
  const trainingInvestment = trained * prog.trainingCostPerEmployee;
  const platformInvestment = (prog.platformSpendMonthly ?? 0) * 12;
  const totalInvestment = trainingInvestment + platformInvestment;
  const monthlySavings = annualValue / 12;
  const paybackMonths = monthlySavings > 0 ? totalInvestment / monthlySavings : Infinity;
  const roiMultiple = totalInvestment > 0 ? annualValue / totalInvestment : 0;

  const annualHoursSavedTotal = hoursSavedPerPersonWeek * 52 * trained;

  // AAC: Output × Quality (quality from rework reduction if selected)
  const outputIdx = 1 + incrEff * (g.repetitiveTimePct / 100);
  const qualityIdx = pains.includes('quality')
    ? 1 + ((painInputs.quality?.reworkReductionPct ?? 0) / 100) * 1
    : 1;
  const aacLiftPct = (outputIdx * qualityIdx - 1) * 100;

  const parts = [
    { label: 'Time', v: timeDividend },
    { label: 'Quality', v: qualityDividend },
    { label: 'Retention', v: retentionDividend },
    { label: 'Hiring', v: hiringDividend },
  ].sort((a, b) => b.v - a.v);
  const total = Math.max(annualValue, 1e-6);
  const topDriver = { label: parts[0].label, share: parts[0].v / total };

  return {
    monthlySavings,
    annualValue,
    trainingInvestment,
    platformInvestment,
    totalInvestment,
    paybackMonths,
    roiMultiple,
    hoursSavedPerPersonWeek,
    annualHoursSavedTotal,
    timeDividend,
    qualityDividend,
    retentionDividend,
    hiringDividend,
    aacLiftPct,
    topDriver,
  };
}
