export type Team = 'marketing'|'hr'|'ops'|'sales'|'support'|'product';
export type Maturity = 'low'|'medium'|'high';
export type Currency = 'EUR'|'USD'|'GBP';
export type Pain = 'retention'|'engagement'|'quality'|'throughput'|'onboarding'|'cost';

export type Inputs = {
  currency: Currency;
  team: Team;
  maturityScore: number;           // 1–10 slider
  employees: number;
  avgSalary: number;               // annual in selected currency
  hoursSavedPerWeek: number;       // numeric per person
  retentionImprovementPts: number; // attrition points reduced
  trainingPerEmployee: number;     // per head
  durationMonths: number;
  pains: Pain[];                   // selected pains
};

/** basic currency symbol */
export const symbol = (c:Currency)=> c==='USD'?'$' : c==='GBP'?'£' : '€';

export function maturityBaseline(score:number){
  // translate 1–10 into adoption baseline we subtract from modeled gains
  if(score<=3) return { adoption:0.1 };
  if(score<=6) return { adoption:0.3 };
  if(score<=8) return { adoption:0.5 };
  return { adoption:0.7 };
}

export function teamPresets(team: Team){
  // sensible defaults per function (hours saved & retention impact tendencies)
  switch(team){
    case 'support':  return { hours:4.5, retentionPts:2.0 };
    case 'marketing':return { hours:3.5, retentionPts:1.5 };
    case 'sales':    return { hours:2.5, retentionPts:1.0 };
    case 'ops':      return { hours:3.0, retentionPts:1.5 };
    case 'hr':       return { hours:2.0, retentionPts:2.0 };
    case 'product':  return { hours:2.0, retentionPts:1.0 };
  }
}

export type Results = {
  monthlySavings: number;
  annualValue: number;
  retentionValue: number;
  hoursTotalYear: number;
  paybackMonths: number;
  roiMultiple: number;
};

export function calc(i: Inputs): Results {
  const base = maturityBaseline(i.maturityScore);
  const trainedShare = 0.7;         // coverage of the program
  const adopters = i.employees * trainedShare;

  const salaryPerHour = i.avgSalary / (52*40);
  const hoursYear = i.hoursSavedPerWeek * 52 * adopters * (1 - base.adoption*0.4); // shave gains if already mature
  const timeValue = hoursYear * salaryPerHour;

  // retention value (avoid backfill ~60% salary)
  const avoided = Math.min(i.employees * (i.retentionImprovementPts/100), i.employees * 0.25);
  const retentionValue = avoided * (i.avgSalary * 0.6);

  const annualValue = timeValue + retentionValue;
  const totalInvestment = trainedShare * i.employees * i.trainingPerEmployee;

  const monthlySavings = annualValue/12;
  const paybackMonths = monthlySavings>0 ? totalInvestment / monthlySavings : Infinity;
  const roiMultiple = totalInvestment>0 ? annualValue / totalInvestment : 0;

  return { monthlySavings, annualValue, retentionValue, hoursTotalYear: hoursYear, paybackMonths, roiMultiple };
}
