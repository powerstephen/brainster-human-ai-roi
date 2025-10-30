'use client';
import { useMemo, useState } from 'react';
import { ChipGroup, NumberRow, PercentRow, StepHeader } from './ui';
import { calc, Inputs, Team, Maturity } from '../lib/model';

const CURRENCY = '€';
const fmt = (n:number)=>new Intl.NumberFormat('en', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(n);

export function RoiCalculator(){
  const [step,setStep]=useState<1|2|3|4|5|6|7|8>(1);

  // 1) Team
  const [team,setTeam]=useState<Team>('hr');
  const teamOps=[{label:'HR / People Ops',value:'hr' as const},{label:'Operations',value:'ops' as const},{label:'Marketing',value:'marketing' as const},{label:'Sales',value:'sales' as const},{label:'Customer Support',value:'support' as const},{label:'Product',value:'product' as const}];

  // 2) Maturity
  const [maturity,setMaturity]=useState<Maturity>('medium');

  // 3) Size & Cost
  const [employees,setEmployees]=useState(200);
  const [avgSalary,setAvgSalary]=useState(52000);

  // 4) Time Saved
  const [hoursSavedPerWeek,setHoursSavedPerWeek]=useState(3);

  // 5) Retention
  const [retentionImprovementPts,setRetentionImprovementPts]=useState(2);

  // 6) Training
  const [trainingPerEmployee,setTrainingPerEmployee]=useState(850);

  // 7) Duration
  const [durationMonths,setDurationMonths]=useState(3);

  const inputs: Inputs = { team, maturity, employees, avgSalary, hoursSavedPerWeek, retentionImprovementPts, trainingPerEmployee, durationMonths };
  const res = useMemo(()=>calc(inputs),[inputs]);

  return (
    <div className="space-y-5">
      <StepHeader current={step}/>
      
      {step===1 && (
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-semibold">Which team is this for?</h3>
          <ChipGroup value={team} onChange={setTeam} options={teamOps}/>
          <div className="flex gap-2 pt-2">
            <button className="btn btn-primary" onClick={()=>setStep(2)}>Continue →</button>
          </div>
        </div>
      )}

      {step===2 && (
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-semibold">Current AI maturity</h3>
          <ChipGroup value={maturity} onChange={setMaturity}
            options={[{label:'Low',value:'low' as const},{label:'Medium',value:'medium' as const},{label:'High',value:'high' as const}]}/>
          <p className="help">We’ll count only improvements beyond today’s baseline.</p>
          <div className="flex gap-2">
            <button className="btn btn-ghost" onClick={()=>setStep(1)}>← Back</button>
            <button className="btn btn-primary" onClick={()=>setStep(3)}>Continue →</button>
          </div>
        </div>
      )}

      {step===3 && (
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-semibold">Team size & average salary</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <NumberRow label="Employees in scope" value={employees} onChange={setEmployees} min={1}/>
            <NumberRow label={`Average annual salary (${CURRENCY})`} value={avgSalary} onChange={setAvgSalary} step={1000}/>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-ghost" onClick={()=>setStep(2)}>← Back</button>
            <button className="btn btn-primary" onClick={()=>setStep(4)}>Continue →</button>
          </div>
        </div>
      )}

      {step===4 && (
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-semibold">Weekly time saved (per person)</h3>
          <PercentRow label="Hours saved per week" value={hoursSavedPerWeek} onChange={setHoursSavedPerWeek} min={0} max={10} step={0.5}/>
          <p className="help">Keep it conservative: most teams report 2–5 hrs/week after structured training.</p>
          <div className="flex gap-2">
            <button className="btn btn-ghost" onClick={()=>setStep(3)}>← Back</button>
            <button className="btn btn-primary" onClick={()=>setStep(5)}>Continue →</button>
          </div>
        </div>
      )}

      {step===5 && (
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-semibold">Expected retention improvement</h3>
          <PercentRow label="Attrition reduction (points)" value={retentionImprovementPts} onChange={setRetentionImprovementPts} min={0} max={8} step={0.5}/>
          <p className="help">Training + engagement typically yields 1–4 pts improvement.</p>
          <div className="flex gap-2">
            <button className="btn btn-ghost" onClick={()=>setStep(4)}>← Back</button>
            <button className="btn btn-primary" onClick={()=>setStep(6)}>Continue →</button>
          </div>
        </div>
      )}

      {step===6 && (
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-semibold">Training investment</h3>
          <NumberRow label={`Per employee (${CURRENCY})`} value={trainingPerEmployee} onChange={setTrainingPerEmployee} step={25}/>
          <div className="flex gap-2">
            <button className="btn btn-ghost" onClick={()=>setStep(5)}>← Back</button>
            <button className="btn btn-primary" onClick={()=>setStep(7)}>Continue →</button>
          </div>
        </div>
      )}

      {step===7 && (
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-semibold">Program duration</h3>
          <NumberRow label="Months" value={durationMonths} onChange={setDurationMonths} min={1} step={1}/>
          <div className="flex gap-2">
            <button className="btn btn-ghost" onClick={()=>setStep(6)}>← Back</button>
            <button className="btn btn-primary" onClick={()=>setStep(8)}>Calculate →</button>
          </div>
        </div>
      )}

      {step===8 && (
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-semibold">Results</h3>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="kpi"><div className="title">Monthly savings</div><div className="value">{fmt(res.monthlySavings)}</div></div>
            <div className="kpi"><div className="title">Annual ROI</div><div className="value">{res.roiMultiple.toFixed(1)}×</div></div>
            <div className="kpi"><div className="title">Payback</div><div className="value">{isFinite(res.paybackMonths)?`${res.paybackMonths.toFixed(1)} mo`:'—'}</div></div>
            <div className="kpi"><div className="title">Hours saved / year</div><div className="value">{Math.round(res.hoursTotalYear).toLocaleString()}</div></div>
            <div className="kpi"><div className="title">Retention value</div><div className="value">{fmt(res.retentionValue)}</div></div>
          </div>

          <hr className="div"/>
          <div className="flex gap-2">
            <button className="btn btn-ghost" onClick={()=>setStep(7)}>← Back</button>
            <button className="btn btn-primary" onClick={()=>setStep(1)}>Start over</button>
          </div>
        </div>
      )}
    </div>
  );
}
