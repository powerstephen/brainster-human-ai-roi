import { Currency } from '../lib/model';
import { useId } from 'react';

export function CurrencySelect({
  value,
  onChange,
}: {
  value: Currency;
  onChange: (c: Currency) => void;
}) {
  return (
    <div>
      <label className="label">Currency</label>
      <select
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value as Currency)}
      >
        <option value="EUR">EUR €</option>
        <option value="USD">USD $</option>
        <option value="GBP">GBP £</option>
      </select>
    </div>
  );
}

/** New: pill buttons instead of dropdown */
export function CurrencyPills({
  value,
  onChange,
}: {
  value: Currency;
  onChange: (c: Currency) => void;
}) {
  const opts: { v: Currency; t: string }[] = [
    { v: 'EUR', t: 'EUR €' },
    { v: 'USD', t: 'USD $' },
    { v: 'GBP', t: 'GBP £' },
  ];
  return (
    <div>
      <label className="label">Currency</label>
      <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
        {opts.map(o => (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(o.v)}
            className={`chip ${value === o.v ? 'active' : ''}`}
            aria-pressed={value === o.v}
          >
            {o.t}
          </button>
        ))}
      </div>
    </div>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
  hint,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  hint?: string;
}) {
  const id = useId();
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <input
          id={id}
          className="input"
          type="number"
          inputMode="decimal"
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step ?? 1}
          style={{flex:1}}
        />
        {suffix ? <span className="help" style={{minWidth:40,textAlign:'right'}}>{suffix}</span> : null}
      </div>
      {hint ? <p className="help" style={{marginTop:6}}>{hint}</p> : null}
    </div>
  );
}

export function MultiPick<T extends string>({
  values,
  onChange,
  options,
  max = 3,
}: {
  values: T[];
  onChange: (v: T[]) => void;
  options: { label: string; value: T }[];
  max?: number;
}) {
  const toggle = (v: T) => {
    const has = values.includes(v);
    if (has) onChange(values.filter((x) => x !== v));
    else if (values.length < max) onChange([...values, v]);
  };
  return (
    <div className="chips">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`chip ${values.includes(o.value) ? 'active' : ''}`}
          onClick={() => toggle(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
