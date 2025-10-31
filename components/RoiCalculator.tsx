'use client';
import { useMemo, useState, useEffect } from 'react';
import { calc, Inputs, Team, Currency, symbol, teamPresets } from '../lib/model';
import { CurrencySelect, MultiPick, NumberField, MaturitySlider } from './controls';

const PAIN_OPTS = [
  { label:'Staff retention', value:'retention' as const },
  { label:'Employee engagement', value:'engagement' as const },
  { label:'Output quality / rework', value:'quality' as const },
  { label:'Throughput / cycle time', value:'throughput' as const },
  { label:'Onboarding speed', value:'onboarding' as const },
  { label:'Cost reduction', value:'cost' as const },
];

const TEAMS: {label:string; value:Team}[] = [
  {label:'HR / People Ops', value:'hr'},
  {label:'Operations', value:'ops'},
  {label:'Marketing', value:'marketing'},
  {label:'Sales', value:'sales'},
  {label:'Customer Support', value:'support'},
  {label:'Product', value:'product'},
];

function Steps({current}:{current:number}){
  const items=['Basics','Maturity','Team & Cost','Productivity','Retention','Focus Areas','Training','Duration','Results'];
  const pct = Math.min((current-1)/(items.length-1),1)*100;
  return (
    <>
      <div className="progress"><span style={{width:`${pct}%`}}/></div>
      <div className="steps">
        {items.map((t,i)=>(
          <div key={t} className={`step ${i+1<=current?'active':''}`}><div className="dot">{i+1}</div><span style={{fontWeight:600,fontSize:13}}>{t}</span></div>
        ))}
      </div>
    </>
  );
}

export function RoiCalculator(){
  const [step,setStep]=useState(1);

  // currency & team
  const [currency,setCurrency]=useState<Currency>('EUR');
  const [team,setTeam]=useState<Team>('hr');

  // maturity
  const [maturityScore,setMaturityScore]=useState(5);

  // size & cost
  const [employees,setEmployees]=useState(150);
  const [avgSalary,setAvgSalary]=useState(52000);

  // productivity + retention
  const [hoursSavedPerWeek,setHoursSavedPerWeek]=useState(3);
  const [retentionImprovementPts,setRetentionImprovementPts]=useState(2);

  // pain points
  const [pains,setPains]=useState<(typeof PAIN_OPTS[number]['value'])[]>([]);

  // training
  const [trainingPerEmployee,setTrainingPerEmployee]=useState(850);
  const [durationMonths,setDurationMonths]=useState(3);

  // presets when team changes
  useEffect(()=>{
    const p = teamPresets(team);
    setHoursSavedPerWeek(p.hours);
    setRetentionImprovementPts(p.retentionPts);
  },[team]);

  const inputs: Inputs = {
    currency, team, maturityScore, employees, avgSalary,
    hoursSavedPerWeek, retentionImprovementPts, trainingPerEmployee, durationMonths, pains
  };
  const S = symbol(currency);
  const res = useMemo(()=>calc(inputs),[inputs]);

  const money=(n:number)=>new Intl.NumberFormat('en', { style:'currency', currency, maximumFractionDigits:0 }).format(n);

  return (
    <div className="section">
      <div className="hero">
        <h1>AI at Work — Human Productivity ROI</h1>
        <p>Estimate business impact from training your managers and teams to use AI confidently. Brand: vivid blue. Font: Inter.</p>
      </div>

      <div className="section"><Steps current={step}/></div>

      {/* 1 BASICS */}
      {step===1 && (
        <div className="card">
          <h3>Basics</h3>
          <div style={{display:'grid',gap:12,gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))'}}>
            <div>
              <label className="label">Team</label>
              <select className="input" value={team} onChange={(e)=>setTeam(e.target.value as Team)}>
                {TEAMS.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <p className="help">We’ll load sensible defaults for each team (hours saved & retention effect).</p>
            </div>
            <CurrencySelect value={currency} onChange={setCurrency}/>
          </div>
          <div style={{display:'flex',gap:8,marginTop:12}}>
            <button className="btn btn-primary" onClick={()=>setStep(2)}>Continue →</button>
          </div>
        </div>
      )}

      {/* 2 MATURITY */}
      {step===2 && (
        <div className="card">
          <h3>AI Maturity</h3>
          <MaturitySlider value={maturityScore} onChange={setMaturityScore}/>
          <div className="tooltip" style={{marginTop:8}}>
            <span className="subtle">What does this change?</span>
            <span className="tip">We discount gains when maturity is already high (less headroom). Scores 1–4 = most upside.</span>
          </div>
          <div style={{display:'flex',gap:8,marginTop:12}}>
            <button className="btn btn-ghost" onClick={()=>setStep(1)}>← Back</button>
            <button className="btn btn-primary" onClick={()=>setStep(3)}>Continue →</button>
          </div>
        </div>
      )}

      {/* 3 TEAM & COST */}
      {step===3 && (
        <div className="card">
          <h3>Team size & cost</h3>
          <div style={{display:'grid',gap:12,gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))'}}>
            <NumberField label="Employees in scope" value={employees} onChange={setEmployees} min={1}/>
            <NumberField label={`Average annual salary (${S})`} value={avgSalary} onChange={setAvgSalary} step={1000}/>
          </div>
          <div className="help" style={{marginTop:8}}>If this covers multiple teams, use weighted averages.</div>
          <div style={{display:'flex',gap:8,marginTop:12}}>
            <button className="btn btn-ghost" onClick={()=>setStep(2)}>← Back</button>
            <button className="btn btn-primary" onClick={()=>setStep(4)}>Continue →</button>
          </div>
        </div>
      )}

      {/* 4 PRODUCTIVITY */}
      {step===4 && (
        <div className="card">
          <h3>Productivity (time saved)</h3>
          <NumberField label="Hours saved per person per week" value={hoursSavedPerWeek} onChange={setHoursSavedPerWeek} min={0} step={0.5} suffix="hrs/week"
                       hint="Typical post-training range: 2–5 hrs/week depending on role."/>
          <div style={{display:'flex',gap:8,marginTop:12}}>
            <button className="btn btn-ghost" onClick={()=>setStep(3)}>← Back</button>
            <button className="btn btn-primary" onClick={()=>setStep(5)}>Continue →</button>
          </div>
        </div>
      )}

      {/* 5 RETENTION */}
      {step===5 && (
        <div className="card">
          <h3>Retention impact</h3>
          <NumberField label="Attrition reduction (percentage points)" value={retentionImprovementPts} onChange={setRetentionImprovementPts} min={0} step={0.5} suffix="pts"
                       hint="Training + engagement often yields 1–4 pts improvement."/>
          <div style={{display:'flex',gap:8,marginTop:12}}>
            <button className="btn btn-ghost" onClick={()=>setStep(4)}>← Back</button>
            <button className="btn btn-primary" onClick={()=>setStep(6)}>Continue →</button>
          </div>
        </div>
      )}

      {/* 6 FOCUS AREAS */}
      {step===6 && (
        <div className="card">
          <h3>Primary focus areas (choose up to 3)</h3>
          <MultiPick values={pains} onChange={setPains} options={PAIN_OPTS} max={3}/>
          <p className="help" style={{marginTop:6}}>We’ll use these to tailor the summary language and recommended next steps.</p>
          <div style={{display:'flex',gap:8,marginTop:12}}>
            <button className="btn btn-ghost" onClick={()=>setStep(5)}>← Back</button>
            <button className="btn btn-primary" onClick={()=>setStep(7)}>Continue →</button>
          </div>
        </div>
      )}

      {/* 7 TRAINING & DURATION */}
      {step===7 && (
        <div className="card">
          <h3>Training plan & duration</h3>
          <div style={{display:'grid',gap:12,gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))'}}>
            <NumberField label={`Training per employee (${S})`} value={trainingPerEmployee} onChange={setTrainingPerEmployee} step={25}/>
            <NumberField label="Program duration (months)" value={durationMonths} onChange={setDurationMonths} min={1} step={1}/>
          </div>
          <div style={{display:'flex',gap:8,marginTop:12}}>
            <button className="btn btn-ghost" onClick={()=>setStep(6)}>← Back</button>
            <button className="btn btn-primary" onClick={()=>setStep(8)}>Calculate →</button>
          </div>
        </div>
      )}

      {/* 8 RESULTS */}
      {step===8 && (
        <div className="card">
          <h3>Results</h3>
          <div className="kpi-grid">
            <div className="kpi"><div className="title">Monthly savings</div><div className="value">{money(res.monthlySavings)}</div></div>
            <div className="kpi"><div className="title">Annual ROI</div><div className="value">{res.roiMultiple.toFixed(1)}×</div></div>
            <div className="kpi"><div className="title">Payback</div><div className="value">{isFinite(res.paybackMonths)?`${res.paybackMonths.toFixed(1)} mo`:'—'}</div></div>
            <div className="kpi"><div className="title">Hours saved / year</div><div className="value">{Math.round(res.hoursTotalYear).toLocaleString()}</div></div>
            <div className="kpi"><div className="title">Retention value</div><div className="value">{money(res.retentionValue)}</div></div>
          </div>

          {/* tailored text */}
          <div style={{marginTop:10}} className="help">
            Focus areas selected: {pains.length? pains.join(', ') : '— none selected'}. Your maturity score of {maturityScore}/10 suggests {maturityScore<=4?'high headroom for gains':'moderate additional upside'}.
          </div>

          <div style={{display:'flex',gap:8,marginTop:12}}>
            <button className="btn btn-ghost" onClick={()=>setStep(7)}>← Back</button>
            <button className="btn btn-primary" onClick={()=>setStep(1)}>Start over</button>
          </div>
        </div>
      )}
    </div>
  );
}
