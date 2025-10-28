export type Maturity = 'low' | 'medium' | 'high';

export type GlobalInputs = {
  employees: number;            // total employees in the target group
  trainPercent: number;         // % of employees to be trained
  hourlyCost: number;           // € fully loaded
  weeklyHours: number;          // typical weekly hours, default 40
  repetitiveTimePct: number;    // % of time currently on repetitive tasks (admin/busywork)
};

export type MaturityParams = {
  baselineAdoptionPct: number;      // % employees already using AI weekly
  baselineProductivityPct: number;  // % productivity/time saved from current AI usage
  ramp: number[];                   // month-by-month factor to full incremental gains
};

export type ProgramInputs = {
  adoptionRatePct: number;      // adoption among trained employees
  productivityGainPct: number;  // productivity/time saved among adopters (post-training)
  trainingCostPerEmployee: number;
  platformSpendMonthly?: number; // optional additional spend
  durationMonths: number;        // for context only, ROI is annualized
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
  rampTimeline: { month: number; cumulativePayback: number; monthlySavings: number }[];
};

export function maturityPresets(m: Maturity): MaturityParams {
  if (m === 'low') {
    return { baselineAdoptionPct: 10, baselineProductivityPct: 5, ramp: [0.5, 0.8, 1.0, 1.0, 1.0, 1.0] };
  }
  if (m === 'medium') {
    return { baselineAdoptionPct: 35, baselineProductivityPct: 12, ramp: [0.6, 1.0, 1.0, 1.0] };
  }
  return { baselineAdoptionPct: 60, baselineProductivityPct: 20, ramp: [0.8, 1.0, 1.0, 1.0] };
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

export function calcHumanRoi(
  g: GlobalInputs,
  maturity: MaturityParams,
  prog: ProgramInputs
): Results {
  const employeesTrained = g.employees * (g.trainPercent / 100);

  // Convert percentages to decimals
  const baselineEffective = clamp01((maturity.baselineAdoptionPct / 100) * (maturity.baselineProductivityPct / 100));
  const postTrainingEffective = clamp01((prog.adoptionRatePct / 100) * (prog.productivityGainPct / 100));

  // Incremental uplift only (vs today)
  const incrementalEffective = Math.max(0, postTrainingEffective - baselineEffective);

  // Guardrail: cap post-training effective at 0.50 (50% of repetitive time)
  const cappedPostTraining = Math.min(postTrainingEffective, 0.5);
  const incrementalEffectiveCapped = Math.max(0, cappedPostTraining - baselineEffective);

  const hoursRepetitivePerWeek = g.weeklyHours * (g.repetitiveTimePct / 100);
  const hoursSavedPerPersonWeek = hoursRepetitivePerWeek * incrementalEffectiveCapped;

  const annualHoursSavedTotal = hoursSavedPerPersonWeek * 52 * employeesTrained;
  const annualValue = annualHoursSavedTotal * g.hourlyCost;

  const trainingInvestment = employeesTrained * prog.trainingCostPerEmployee;
  const platformInvestment = (prog.platformSpendMonthly || 0) * 12;
  const totalInvestment = trainingInvestment + platformInvestment;

  const monthlySavings = annualValue / 12;
  const paybackMonths = monthlySavings > 0 ? totalInvestment / monthlySavings : Infinity;
  const roiMultiple = totalInvestment > 0 ? annualValue / totalInvestment : 0;

  // Ramp timeline (applies to incremental monthly savings)
  const rampTimeline = maturity.ramp.map((f, idx) => {
    const mSavings = monthlySavings * f;
    const cumulative = mSavings * (idx + 1);
    return { month: idx + 1, cumulativePayback: cumulative, monthlySavings: mSavings };
  });

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
    rampTimeline
  };
}
