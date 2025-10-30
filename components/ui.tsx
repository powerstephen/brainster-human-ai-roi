import React from 'react';
import clsx from 'clsx';

export function ChipGroup<T extends string>({
  value,onChange,options
}:{value:T;onChange:(v:T)=>void;options:{label:string;value:T}[]}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o=>(
        <button key={o.value}
          onClick={()=>onChange(o.value)}
          className={clsx(
            'px-3 py-1.5 rounded-full border text-sm',
            value===o.value
              ? 'bg-[var(--brand)] text-white border-transparent'
              : 'bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-50'
          )}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function MultiChipGroup<T extends string>({
  values,onChange,options,max=3
}:{values:T[];onChange:(v:T[])=>void;options:{label:string;value:T}[];max?:number}) {
  const toggle=(val:T)=>{
    const on=values.includes(val);
    if(on) onChange(values.filter(v=>v!==val));
    else if(values.length<max) onChange([...values,val]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o=>{
        const active=values.includes(o.value);
        const disabled=!active && values.length>=max;
        return (
          <button key={o.value} onClick={()=>toggle(o.value)} disabled={disabled}
            className={clsx(
              'px-3 py-1.5 rounded-full border text-sm',
              active ? 'bg-[var(--brand)] text-white border-transparent'
                     : 'bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-50',
              disabled && 'opacity-40 cursor-not-allowed'
            )}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function NumberRow({label,value,onChange,min=0,step=1,hint,suffix}:{label:string;value:number;onChange:(n:number)=>void;min?:number;step?:number;hint?:string;suffix?:string}) {
  return (
    <div className="space-y-1">
      <label className="label">{label}</label>
      <div className="flex items-center gap-2">
        <input className="input" type="number" value={Number.isFinite(value)?value:0} min={min} step={step}
          onChange={(e)=>onChange(parseFloat(e.target.value))}/>
        {suffix && <span className="text-sm text-neutral-600">{suffix}</span>}
      </div>
      {hint && <p className="help">{hint}</p>}
    </div>
  );
}

export function PercentRow({label,value,onChange,min=0,max=100,step=1,hint}:{label:string;value:number;onChange:(n:number)=>void;min?:number;max?:number;step?:number;hint?:string}) {
  return (
    <div className="space-y-1">
      <label className="label flex items-center justify-between">
        <span>{label}</span><span className="text-xs text-neutral-500">{value}%</span>
      </label>
      <input type="range" className="w-full" min={min} max={max} step={step} value={value}
        onChange={(e)=>onChange(parseFloat(e.target.value))}/>
      {hint && <p className="help">{hint}</p>}
    </div>
  );
}

export function StepHeader({ current }:{ current:1|2|3|4|5|6|7|8 }) {
  const items=['Team','Maturity','Size & Cost','Time Saved','Retention','Training','Duration','Results'];
  return (
    <div className="flex items-center gap-4 text-sm mb-4 flex-wrap">
      {items.map((t,i)=>(
        <div key={t} className={`step ${i+1<=current?'step-active':''}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${i+1<=current?'bg-[var(--brand)] text-white border-transparent':'border-neutral-300'}`}>{i+1}</div>
          <span>{t}</span>
        </div>
      ))}
    </div>
  );
}
