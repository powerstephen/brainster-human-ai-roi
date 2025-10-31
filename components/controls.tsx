'use client';
import { useMemo } from 'react';
import clsx from 'clsx';

export type Currency = 'EUR'|'USD'|'GBP';
export const CURRENCY_SIGNS: Record<Currency,string> = { EUR:'€', USD:'$', GBP:'£' };

export function CurrencySelect({
  value,onChange
}:{value:Currency; onChange:(c:Currency)=>void}) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:8}}>
      <label className="label" style={{minWidth:120}}>Currency</label>
      <select className="input" value={value} onChange={(e)=>onChange(e.target.value as Currency)}>
        <option value="EUR">EUR (€)</option>
        <option value="USD">USD ($)</option>
        <option value="GBP">GBP (£)</option>
      </select>
    </div>
  );
}

export function MultiPick<T extends string>({
  values, onChange, options, max=3
}:{values:T[]; onChange:(v:T[])=>void; options:{label:string; value:T}[]; max?:number}) {
  const toggle=(v:T)=>{
    const on=values.includes(v);
    if(on) onChange(values.filter(x=>x!==v));
    else if(values.length<max) onChange([...values,v]);
  };
  return (
    <div className="chips">
      {options.map(o=>{
        const active = values.includes(o.value);
        const disabled = !active && values.length>=max;
        return (
          <button key={o.value}
                  className={clsx('chip', active && 'active', disabled && 'opacity-40 cursor-not-allowed')}
                  onClick={()=>toggle(o.value)} disabled={disabled}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function NumberField(props:{label:string;value:number;onChange:(n:number)=>void;min?:number;step?:number;hint?:string;suffix?:string}) {
  const {label,value,onChange,min=0,step=1,hint,suffix} = props;
  return (
    <div className="space-y-1">
      <label className="label">{label}</label>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <input className="input" type="number" value={Number.isFinite(value)?value:0} min={min} step={step}
               onChange={(e)=>onChange(parseFloat(e.target.value))}/>
        {suffix && <span className="subtle">{suffix}</span>}
      </div>
      {hint && <p className="help">{hint}</p>}
    </div>
  );
}

/** 1–10 slider with live description under the rail */
export function MaturitySlider({
  value,onChange
}:{value:number; onChange:(n:number)=>void}) {
  const desc = useMemo(()=>{
    const v=Math.round(value);
    if(v<=2) return 'Little or no employees using AI for tasks; no guidance or policy.';
    if(v<=4) return 'A few individuals experiment; ad-hoc wins; no shared prompts.';
    if(v<=6) return 'Some teams using AI weekly; early playbooks; limited measurement.';
    if(v<=8) return 'AI embedded in key workflows; prompt libraries; KPIs tracked monthly.';
    return 'AI fully embedded across workflows; champions network; ROI reviewed quarterly.';
  },[value]);

  return (
    <div>
      <label className="label">AI Maturity (1–10)</label>
      <input type="range" min={1} max={10} step={1} value={value}
             onChange={(e)=>onChange(parseInt(e.target.value))}
             className="w-full"/>
      <div className="ticks">
        {Array.from({length:10}).map((_,i)=>(
          <span key={i} className={clsx('tick', (i%2===0) && 'big')}/>
        ))}
      </div>
      <p className="help" style={{marginTop:6}}>{desc}</p>
    </div>
  );
}
