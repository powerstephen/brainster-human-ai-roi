export type Team = 'marketing'|'hr'|'ops'|'sales'|'support'|'product';
export type Maturity = 'low'|'medium'|'high';

export type Inputs = {
  team: Team;
  maturity: Maturity;
  employees: number;
  avgSalary: number;      // annual, €
  hoursSavedPerWeek: number; // per person
  retentionImprovementPts: number; // attrition points reduced
  trainingPerEmployee: number; // €
  durationMonths: number;
};

export type Results = {
  monthlySavings: number;
  annualValue: number;
  retentionValue: number;
  hoursTotalYear: number;
  paybackMonths: number;
  roiMultiple: number;
};

export function maturityBaseline(m: Maturity){
  if(m==='low') return { adoption: 0.1, cap: 0.2 };
  if(m==='medium') return { adoption: 0.35, cap: 0.35 };
  return { adoption: 0.6, cap: 0.5 };
}

export function calc(inputs: Inputs): Results {
  const { maturity, employees, avgSalary, hoursSavedPerWeek, retentionImprovementPts, trainingPerEmployee, durationMonths } = inputs;
  const base = maturityBaseline(maturity);

  // We count only incremental adoption beyond baseline
  const trainedShare = 0.7; // default training coverage assumption
  const adopters = employees * trainedShare; // those we expect to use AI after the program

  const salaryPerHour = avgSalary / (52*40);
  const hoursYear = hoursSavedPerWeek * 52 * adopters;
  const timeValue = hoursYear * salaryPerHour;

  // Retention value (avoid replacement). Replacement ~0.6× salary
  const avoided = Math.min(employees * (retentionImprovementPts/100), employees * 0.25);
  const retentionValue = avoided * (avgSalary * 0.6);

  const annualValue = timeValue + retentionValue;

  const trainingInvestment = employees * trainedShare * trainingPerEmployee;
  const platformSpend = 0; // keep simple; wire in later if needed
  const totalInvestment = trainingInvestment + platformSpend;

  const monthlySavings = annualValue/12;
  const paybackMonths = monthlySavings>0 ? totalInvestment / monthlySavings : Infinity;
  const roiMultiple = totalInvestment>0 ? annualValue / totalInvestment : 0;

  return {
    monthlySavings,
    annualValue,
    retentionValue,
    hoursTotalYear: hoursYear,
    paybackMonths,
    roiMultiple,
  };
}
