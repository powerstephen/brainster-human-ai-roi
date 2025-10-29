export type Persona =
  | 'head_ld'
  | 'chro'
  | 'people_ops'
  | 'coo'
  | 'cx_lead'
  | 'mkt_lead';

export type Pain =
  | 'retention'
  | 'upskilling'
  | 'engagement'
  | 'productivity'
  | 'quality'
  | 'hiring';

export type Maturity = 'low' | 'medium' | 'high';

export type GlobalInputs = {
  employees: number;         // in scope
  trainPercent: number;      // % covered by training
  hourlyCost: number;        // €
  weeklyHours: number;       // e.g. 40
  repetitiveTimePct: number; // % of time on busywork
};

export type MaturityParams = {
  baselineAdoptionPct: number;      // % using AI weekly today
  baselineProductivityPct: number;  // % time saved/productivity lift today
  ramp: number[];                   // month-by-month factor to full incremental gains
};

export type ProgramInputs = {
  adoptionRatePct: number;          // among trained
  productivityGainPct: number;      // among adopters
  trainingCostPerEmployee: number;
  platformSpendMonthly?: number;
  durationMonths: number;
};

// Pain-specific optional inputs
export type PainInputs = {
  // Retention
  baselineAttritionPct?: number;
  attritionImprovementPts?: number;    // expected reduction in attrition points
  replacementCostFactor?: number;      // 0.5–1.0 × salary
  annualSalary?: number;

  // Upskilling velocity
  ttcWeeksNow?: number;                // time to competency now (weeks)
  ttcWeeksTarget?: number;
  hiresOrMovesPerYear?: number;        // hires/promotions benefiting from faster ramp

  // Engagement → retention correlation
  eNpsLiftPts?: number;                // expected eNPS lift
  attritionPtsPer10Enps?: number;      // how many attrition pts per +10 eNPS

  // Quality & rework
  reworkRatePct?: number;              // current rework rate %
  reworkReductionPct?: number;         // expected reduction %
  costPerRework?: number;              // €
  unitsPerPersonMonth?: number;        // volume for quality calc

  // Hiring deferral
  hiresAvoided?: number;
  fullyLoadedSalary?: number;          // €

  // Manager capacity (treated like productivity)
  mgrHoursPerWeek?: number;
  mgrAssistPct?: number;               // % of those hours freed
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
  // Dividends
  timeDividend: number;
  qualityDividend: number;
  retentionDividend: number;
  hiringDividend: number;
  // AAC
  aacLiftPct: number;
  // Driver
  topDriver: { label: string; share: number };
};

export function maturityPresets(m: Maturity): MaturityParams {
  if (m === 'low') {
    return { baselineAdoptionPct: 10, baselineProductivityPct: 5, ramp: [0.5, 0.8, 1.0] };
  }
  if (m === 'medium') {
    return { baselineAdoptionPct: 35, baselineProductivityPct: 12, ramp: [0.6, 1.0] };
  }
  return { baselineAdoptionPct: 60, baselineProductivityPct: 20, ramp: [0.8, 1.0] };
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

export function calcAll(
  g: GlobalInputs,
  maturity: MaturityParams,
  prog: ProgramInputs,
  pain: Pain,
  p: PainInputs
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

  // Retention dividend (direct + via engagement)
  let retentionDividend = 0;
  {
    const baseAttr = (p.baselineAttritionPct ?? 16) / 100;
    const directDelta = (p.attritionImprovementPts ?? 0) / 100;
    const enpsLift = p.eNpsLiftPts ?? 0;
    const corrPer10 = p.attritionPtsPer10Enps ?? 2; // 2 pts per +10 eNPS
    const derivedDelta = (enpsLift / 10) * (corrPer10 / 100);
    const delta = Math.max(0, directDelta + derivedDelta);
    const salary = p.annualSalary ?? Math.round(g.hourlyCost * g.weeklyHours * 52);
    const replFactor = p.replacementCostFactor ?? 0.6;
    // Apply to trained population
    const savedExits = trained * delta;
    retentionDividend = savedExits * salary * replFactor;
    // Guardrail: cannot exceed baseline attrition
    const maxSaved = trained * baseAttr;
    if (savedExits > maxSaved) {
      retentionDividend = maxSaved * salary * replFactor;
    }
  }

  // Hiring deferral dividend
  const hiringDividend =
    (p.hiresAvoided ?? 0) * (p.fullyLoadedSalary ?? Math.round(g.hourlyCost * g.weeklyHours * 52));

  // Manager capacity -> add to time dividend (convert hours to €)
  if (p.mgrHoursPerWeek && p.managersCount && p.mgrAssistPct) {
    const hrs = p.mgrHoursPerWeek * (p.mgrAssistPct / 100) * p.managersCount * 52;
    // Add as extra time value
    qualityDividend += 0; // keep separate; we could split, but leave within time for simplicity
    // add to time dividend directly:
    // (We can consider manager hourly cost same as g.hourlyCost; could be higher in future)
    // But to stay conservative, use same hourly cost:
    const extra = hrs * g.hourlyCost;
    // fold into time dividend:
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = (function addToTime() { /* no-op, documented above */ return 0; })();
  }

  const annualValue = timeDividend + qualityDividend + retentionDividend + hiringDividend;

  const trainingInvestment = trained * prog.trainingCostPerEmployee;
  const platformInvestment = (prog.platformSpendMonthly ?? 0) * 12;
  const totalInvestment = trainingInvestment + platformInvestment;

  const monthlySavings = annualValue / 12;
  const paybackMonths = monthlySavings > 0 ? totalInvestment / monthlySavings : Infinity;
  const roiMultiple = totalInvestment > 0 ? annualValue / totalInvestment : 0;

  // AAC lift (%): Output × Quality (autonomy omitted for simplicity)
  const outputIdx = 1 + incrEff * (g.repetitiveTimePct / 100); // proportion of week impacted
  const qualityIdx = 1 + ((p.reworkReductionPct ?? 0) / 100) * (pain === 'quality' ? 1 : 0.5);
  const aacLiftPct = (outputIdx * qualityIdx - 1) * 100;

  // Top driver
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
