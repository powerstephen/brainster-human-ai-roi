'use client';
import { useMemo, useState, useEffect } from 'react';
import { calc, decodeInputs, Inputs, symbol } from '../../lib/model';

export default function ReportPage(){
  const [inputs,setInputs]=useState<Inputs|null>(null);

  useEffect(()=>{
    const fallback: Inputs = {
      currency:'EUR', team:'hr', maturityScore:5, employees:150, avgSalary:52000,
      hoursSavedPerWeek:3, retentionImprovementPts:2, trainingPerEmployee:850, durationMonths:3, pains:[]
    };
    setInputs(decodeInputs(window.location.search, fallback));
  },[]);

  const res = useMemo(()=> inputs? calc(inputs) : null, [inputs]);

  if(!inputs || !res) return <div className="container" style={{padding:'24px'}}>Loading…</div>;

  const S = symbol(inputs.currency);
  const money=(n:number)=>new Intl.NumberFormat('en', { style:'currency', currency:inputs.currency, maximumFractionDigits:0 }).format(n);

  return (
    <main className="container" style={{padding:'24px'}}>
      <h1 style={{fontWeight:900, fontSize:28, margin:'0 0 6px'}}>AI at Work — ROI Summary</h1>
      <div style={{color:'#667085', marginBottom:18}}>Printable summary · Brainster vivid blue</div>

      <section className="card" style={{marginBottom:14}}>
        <h3 style={{marginTop:0}}>Inputs</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:10}}>
          <div><b>Team</b><div>{inputs.team}</div></div>
          <div><b>Currency</b><div>{inputs.currency}</div></div>
          <div><b>AI Maturity</b><div>{inputs.maturityScore}/10</div></div>
          <div><b>Employees</b><div>{inputs.employees}</div></div>
          <div><b>Avg salary</b><div>{S}{inputs.avgSalary.toLocaleString()}</div></div>
          <div><b>Hours saved / wk</b><div>{inputs.hoursSavedPerWeek}</div></div>
          <div><b>Attrition reduction</b><div>{inputs.retentionImprovementPts} pts</div></div>
          <div><b>Training / head</b><div>{S}{inputs.trainingPerEmployee.toLocaleString()}</div></div>
          <div><b>Duration</b><div>{inputs.durationMonths} mo</div></div>
          <div><b>Focus areas</b><div>{inputs.pains.length? inputs.pains.join(', ') : '—'}</div></div>
        </div>
      </section>

      <section className="card" style={{marginBottom:14}}>
        <h3 style={{marginTop:0}}>Results</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,minmax(0,1fr))',gap:10}}>
          <div><div className="help">Monthly savings</div><div style={{fontWeight:900}}>{money(res.monthlySavings)}</div></div>
          <div><div className="help">Annual ROI</div><div style={{fontWeight:900}}>{res.roiMultiple.toFixed(1)}×</div></div>
          <div><div className="help">Payback</div><div style={{fontWeight:900}}>{isFinite(res.paybackMonths)?`${res.paybackMonths.toFixed(1)} mo`:'—'}</div></div>
          <div><div className="help">Hours saved / yr</div><div style={{fontWeight:900}}>{Math.round(res.hoursTotalYear).toLocaleString()}</div></div>
          <div><div className="help">Retention value</div><div style={{fontWeight:900}}>{money(res.retentionValue)}</div></div>
        </div>
      </section>

      <section className="card">
        <h3 style={{marginTop:0}}>Notes</h3>
        <ul style={{margin:'0 0 8px 18px'}}>
          <li>Conservative model; counts gains beyond current maturity baseline.</li>
          <li>Assumes ~70% training coverage for the in-scope team.</li>
          <li>Retention value uses a 60% salary replacement proxy.</li>
        </ul>
        <div style={{display:'flex',gap:8, marginTop:10}}>
          <button className="btn btn-primary" onClick={()=>window.print()}>Print / Save as PDF</button>
          <a className="btn btn-ghost" href="/" title="Back to calculator">Back</a>
        </div>
      </section>
    </main>
  );
}
