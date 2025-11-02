'use client';

// Force dynamic (avoid stale prerender)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useMemo, useRef, useState, useEffect } from 'react';

// ————————————————————————————————————————————————
// Small helpers (local only so this file is self-contained)
// ————————————————————————————————————————————————
type Team = 'all'|'hr'|'ops'|'marketing'|'sales'|'support'|'product';
type Currency = 'EUR'|'USD'|'GBP';
type Pain = 'retention'|'engagement'|'quality'|'throughput'|'onboarding'|'cost';

const TEAMS: {label:string; value:Team}[] = [
  { label: 'Company-wide', value: 'all' },
  { label: 'HR / People Ops', value: 'hr' },
  { label: 'Operations', value: 'ops' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Sales', value: 'sales' },
  { label: 'Customer Support', value: 'support' },
  { label: 'Product', value: 'product' },
];
const PAIN_OPTS: {label:string; value:Pain}[] = [
  { label: 'Staff retention', value: 'retention' },
  { label: 'Employee engagement', value: 'engagement' },
  { label: 'Output quality / rework', value: 'quality' },
  { label: 'Throughput / cycle time', value: 'throughput' },
  { label: 'Onboarding speed', value: 'onboarding' },
  { label: 'Cost reduction', value: 'cost' },
];
const symbol = (c: Currency) => c === 'EUR' ? '€' : c === 'USD' ? '$' : '£';

// maturity → suggested hours/week (1 ≈ 5h, 10 ≈ 1h) w/ small team tweak
function suggestedHours(team: Team, score: number) {
  const s = Math.max(1, Math.min(10, score));
  const base = 5 - ((s - 1) * (4 / 9)); // 5..1
  const teamAdj = team === 'support' ? 0.5 : team === 'product' ? -0.5 : 0;
  const hrs = Math.max(0.5, base + teamAdj);
  return Math.round(hrs * 2) / 2;
}
function maturityDetail(score: number) {
  const v = Math.round(score);
  if (v <= 2) return 'Early stage: ad-hoc experimentation; big wins from prompt basics and workflow mapping.';
  if (v <= 4) return 'Isolated champions; introduce templates, shared prompt library, and QA gates.';
  if (v <= 6) return 'Growing adoption; standardize tool stack, add measurement, and weekly enablement rituals.';
  if (v <= 8) return 'Operationalized; embed AI in SOPs, connect to data sources, track KPIs monthly.';
  return 'Best-in-class; scale champions network, role-specific playbooks, quarterly ROI reviews.';
}

// very lightweight calc (keeps parity good-enough for UI)
function calcProductivityAnnual(avgSalary:number, hoursPerWeek:number, employees:number) {
  const hourly = avgSalary / (52 * 40);          // rough hourly cost
  const util = 0.7;                              // conservative “realizable” factor
  const totalHours = hoursPerWeek * 52 * employees;
  return hourly * util * totalHours;
}
function calcRetentionValue(avgSalary:number, employees:number, baselineTurnoverPct:number, improvementPct:number, replacementCostFactor:number) {
  const avoided = employees * (baselineTurnoverPct/100) * (improvementPct/100); // heads
  const replaceCost = avgSalary * replacementCostFactor;
  return avoided * replaceCost;
}

// ————————————————————————————————————————————————
// Single-file UI (centering + blue box are inline)
// ————————————————————————————————————————————————
export default function Home() {
  const [step, setStep] = useState(1);

  // Step 1 — Audience
  const [currency, setCurrency] = useState<Currency>('EUR');
  const [team, setTeam] = useState<Team>('all');
  const [employees, setEmployees] = useState<number>(150);
  const [pains, setPains] = useState<Pain[]>([]);

  // Step 2 — Benchmark
  const [maturityScore, setMaturityScore] = useState<number>(5);
  const [hoursSavedPerWeek, setHoursSavedPerWeek] = useState<number>(3);
  const userTouchedHours = useRef(false);

  // Step 3 — Retention
  const [baselineTurnoverPct, setBaselineTurnoverPct] = useState<number>(20);
  const [turnoverImprovementPct, setTurnoverImprovementPct] = useState<number>(10);
  const [replacementCostFactor, setReplacementCostFactor] = useState<number>(0.5);

  // Step 4 — Training & Duration
  const [trainingPerEmployee, setTrainingPerEmployee] = useState<number>(850);
  const [avgSalary, setAvgSalary] = useState<number>(52000);
  const [durationMonths, setDurationMonths] = useState<number>(3);

  useEffect(() => {
    if (!userTouchedHours.current) setHoursSavedPerWeek(suggestedHours(team, maturityScore));
  }, [team, maturityScore]);

  // Results
  const productivityAnnual = useMemo(
    () => calcProductivityAnnual(avgSalary, hoursSavedPerWeek, employees),
    [avgSalary, hoursSavedPerWeek, employees]
  );
  const retentionValue = useMemo(
    () => calcRetentionValue(avgSalary, employees, baselineTurnoverPct, turnoverImprovementPct, replacementCostFactor),
    [avgSalary, employees, baselineTurnoverPct, turnoverImprovementPct, replacementCostFactor]
  );
  const programCost = trainingPerEmployee * employees * (durationMonths / 12);
  const annualValue = productivityAnnual + retentionValue;
  const monthlySavings = annualValue / 12;
  const roiMultiple = programCost > 0 ? annualValue / programCost : Infinity;
  const paybackMonths = monthlySavings > 0 ? programCost / monthlySavings : Infinity;

  const money = (n:number) =>
    new Intl.NumberFormat('en', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);

  // Common inline styles to guarantee centering + look
  const container = { maxWidth: 1120, margin: '0 auto', padding: '0 20px' } as const;
  const card = { background: '#fff', border: '1px solid #E7ECF7', borderRadius: 16, boxShadow: '0 10px 28px rgba(12,20,38,.08)', padding: 18, maxWidth: 980, margin: '16px auto' } as const;
  const h3 = { margin: '0 0 .7rem', fontSize: '1.06rem', fontWeight: 900 } as const;
  const gridAuto = { display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))', maxWidth: 900, margin: '0 auto' } as const;
  const twoCol = { display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', alignItems: 'start', maxWidth: 900, margin: '0 auto' } as const;
  const centerRow = { maxWidth: 980, margin: '16px auto 0', display: 'flex', gap: 8, justifyContent: 'space-between', flexWrap: 'wrap' } as const;

  const input = { width: '100%', border: '1px solid #E2E8F5', borderRadius: 12, padding: '10px 12px' } as const;
  const label = { fontWeight: 800 } as const;
  const help = { fontSize: '.86rem', color: '#667085' } as const;
  const btn = { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, fontWeight: 800, border: '1px solid #E7ECF7', cursor: 'pointer', background: '#fff' } as const;
  const btnPrimary = { ...btn, background: 'linear-gradient(90deg,#5A7BFF,#3366FE)', color: '#fff', borderColor: 'transparent', boxShadow: '0 8px 20px rgba(31,77,255,.25)' } as const;

  // Blue KPI box — always visible on Step 2
  const highlight = {
    marginTop: 4,
    borderRadius: 14,
    padding: 14,
    color: '#fff',
    border: '1px solid rgba(255,255,255,.35)',
    background: 'linear-gradient(135deg, #4B6FFF, #3366FE)',
    boxShadow: '0 12px 30px rgba(15,42,120,.25)',
    width: '100%',
  } as const;

  // Stepper
  const labels = ['Audience','AI Benchmark','Retention','Training & Duration','Results'];
  const pct = Math.min((step - 1) / (labels.length - 1), 1) * 100;

  return (
    <main style={container}>
      {/* Slim hero */}
      <section style={card}>
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>AI at Work — Human Productivity ROI</h1>
        <p style={{ marginTop: 6, color: '#667085' }}>
          Quantify time saved, payback, and retention impact from training managers and teams to work effectively with AI.
        </p>
        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', marginTop: 12 }}>
          {['Monthly savings','Payback','Annual ROI','Hours saved / year'].map((t) => (
            <div key={t} style={{ border: '1px solid #E7ECF7', borderRadius: 12, padding: '10px 12px', fontWeight: 800, background: '#F8FAFF' }}>
              {t}
            </div>
          ))}
        </div>
      </section>

      {/* Stepper */}
      <section style={{ ...card, padding: 12 }}>
        <div style={{ height: 10, background: '#E9EDFB', borderRadius: 999, overflow: 'hidden' }}>
          <span style={{ display: 'block', height: '100%', width: `${pct*100}%`, background: 'linear-gradient(90deg,#6D8BFF,#3366FE)' }} />
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginTop: 10 }}>
          {labels.map((t, i) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, color: i+1<=step ? '#0F172A' : '#8892A6' }}>
              <div style={{
                width: 28, height: 28, borderRadius: 999,
                border: i+1<=step ? 'none' : '2px solid #CFD8FF',
                background: i+1<=step ? '#3366FE' : '#fff',
                color: i+1<=step ? '#fff' : '#0E1320',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13
              }}>{i+1}</div>
              <span style={{ fontWeight: 800, fontSize: 13 }}>{t}</span>
            </div>
          ))}
        </div>
      </section>

      {/* STEP 1: Audience */}
      {step === 1 && (
        <section style={card}>
          <h3 style={h3}>Audience</h3>
          <div style={gridAuto}>
            <div>
              <label style={label}>Team</label>
              <select value={team} onChange={e=>setTeam(e.target.value as Team)} style={input}>
                {TEAMS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <p style={help}>Choose a function or “Company-wide”.</p>
            </div>

            <div>
              <label style={label}>Employees in scope</label>
              <input type="number" min={1} value={employees} onChange={e=>setEmployees(Number(e.target.value||0))} style={input}/>
            </div>

            <div>
              <label style={label}>Focus areas (pick up to 3)</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {PAIN_OPTS.map(p => {
                  const active = pains.includes(p.value);
                  const canPick = active || pains.length < 3;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={()=>{
                        if (active) setPains(pains.filter(x=>x!==p.value));
                        else if (canPick) setPains([...pains, p.value]);
                      }}
                      style={{
                        padding:'8px 12px', borderRadius: 999, fontWeight: 800,
                        border: '1px solid #E7ECF7',
                        background: active ? '#3366FE' : '#fff',
                        color: active ? '#fff' : '#0E1320',
                        cursor:'pointer'
                      }}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={label}>Currency</label>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {(['EUR','USD','GBP'] as Currency[]).map(c=>{
                  const active = currency === c;
                  return (
                    <button key={c} onClick={()=>setCurrency(c)} type="button"
                      style={{
                        padding:'8px 12px', borderRadius: 999, fontWeight: 800,
                        border: '1px solid #E7ECF7',
                        background: active ? '#3366FE' : '#fff',
                        color: active ? '#fff' : '#0E1320',
                        cursor:'pointer'
                      }}>
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ ...centerRow, justifyContent:'flex-end' }}>
            <button style={btnPrimary} onClick={()=>setStep(2)}>Continue →</button>
          </div>
        </section>
      )}

      {/* STEP 2: AI Benchmark */}
      {step === 2 && (
        <section style={card}>
          <h3 style={h3}>AI Benchmark</h3>

          <div style={twoCol}>
            {/* Left column */}
            <div style={{ paddingRight: 8 }}>
              <label style={label}>AI Maturity (1–10)</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:8 }}>
                {Array.from({length:10}).map((_,i)=>{
                  const val = i+1;
                  const active = val === maturityScore;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={()=>{
                        setMaturityScore(val);
                        if (!userTouchedHours.current) setHoursSavedPerWeek(suggestedHours(team, val));
                      }}
                      title={`Maturity ${val}`}
                      style={{
                        width:40, height:40, borderRadius:12, fontWeight:900, cursor:'pointer',
                        border:'1px solid #E7ECF7',
                        background: active ? 'linear-gradient(90deg,#6D8BFF,#3366FE)' : '#fff',
                        color: active ? '#fff' : '#0E1320',
                        boxShadow: active ? '0 8px 20px rgba(31,77,255,.20)' : 'none'
                      }}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
              <p style={{...help, marginTop:8}}>{maturityDetail(maturityScore)}</p>

              <div style={gridAuto as any}>
                <div>
                  <label style={label}>Hours saved per person per week (override)</label>
                  <input type="number" min={0} step={0.5} value={hoursSavedPerWeek}
                    onChange={e=>{ userTouchedHours.current = true; setHoursSavedPerWeek(Number(e.target.value||0));}}
                    style={input}
                  />
                  <p style={help}>Auto-suggested from maturity + team. You can override.</p>
                </div>
              </div>
            </div>

            {/* Right column — BLUE KPI BOX */}
            <div style={highlight}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                <div style={{ fontWeight: 900, letterSpacing: '-.01em' }}>Estimated Hours Saved</div>
                <div style={{ padding:'6px 10px', borderRadius:999, border:'1px solid rgba(255,255,255,.4)', background:'rgba(255,255,255,.15)', fontWeight:900 }}>Live</div>
              </div>

              <div style={{ display:'grid', gap:10, gridTemplateColumns:'repeat(3,minmax(0,1fr))' }}>
                <Box t="Per employee / year" v={`${Math.round(hoursSavedPerWeek*52).toLocaleString()} hrs`} />
                <Box t="Employees in scope" v={employees.toLocaleString()} />
                <Box t="Total hours / year" v={(Math.round(hoursSavedPerWeek*52*employees)).toLocaleString() + ' hrs'} />
              </div>

              <div style={{ display:'grid', gap:10, gridTemplateColumns:'repeat(3,minmax(0,1fr))', marginTop:10 }}>
                <Box t="Productivity value / month" v={money((productivityAnnual||0)/12)} />
                <Box t="Productivity value / year" v={money(productivityAnnual||0)} />
                <Box t="Maturity level" v={`${maturityScore}/10`} />
              </div>
            </div>
          </div>

          <div style={centerRow}>
            <button style={btn} onClick={()=>setStep(1)}>← Back</button>
            <button style={btnPrimary} onClick={()=>setStep(3)}>Continue →</button>
          </div>
        </section>
      )}

      {/* STEP 3: Retention */}
      {step === 3 && (
        <section style={card}>
          <h3 style={h3}>Retention</h3>
          <div style={gridAuto}>
            <FieldNumber label="Baseline annual turnover (%)" value={baselineTurnoverPct} onChange={setBaselineTurnoverPct} min={0} step={1} suffix="%" hint="Typical ranges: 15–30% depending on team." />
            <FieldNumber label="Expected improvement (%)" value={turnoverImprovementPct} onChange={setTurnoverImprovementPct} min={0} step={1} suffix="%" hint="Relative reduction. 10% means 20% → 18% turnover." />
            <FieldNumber label="Replacement cost as % of salary" value={Math.round(replacementCostFactor*100)} onChange={(v)=>setReplacementCostFactor((v||0)/100)} min={0} step={5} suffix="%" hint="Common rule: ~50% of salary." />
          </div>
          <div style={centerRow}>
            <button style={btn} onClick={()=>setStep(2)}>← Back</button>
            <button style={btnPrimary} onClick={()=>setStep(4)}>Continue →</button>
          </div>
        </section>
      )}

      {/* STEP 4: Training & Duration */}
      {step === 4 && (
        <section style={card}>
          <h3 style={h3}>Training & Duration</h3>
          <div style={gridAuto}>
            <FieldNumber label={`Training per employee (${symbol(currency)})`} value={trainingPerEmployee} onChange={setTrainingPerEmployee} step={25} />
            <FieldNumber label={`Average annual salary (${symbol(currency)})`} value={avgSalary} onChange={setAvgSalary} step={1000} />
            <FieldNumber label="Program duration (months)" value={durationMonths} onChange={setDurationMonths} min={1} step={1} />
          </div>
          <div style={centerRow}>
            <button style={btn} onClick={()=>setStep(3)}>← Back</button>
            <button style={btnPrimary} onClick={()=>setStep(5)}>Continue →</button>
          </div>
        </section>
      )}

      {/* STEP 5: Results */}
      {step === 5 && (
        <section style={card}>
          <h3 style={h3}>Results</h3>

          <div style={{ display:'grid', gap:12, gridTemplateColumns:'repeat(2,minmax(0,1fr))' }}>
            <KPI t="Monthly savings" v={money(monthlySavings)} />
            <KPI t="Annual ROI" v={`${(isFinite(roiMultiple)?roiMultiple:0).toFixed(1)}×`} />
            <KPI t="Payback" v={isFinite(paybackMonths) ? `${paybackMonths.toFixed(1)} mo` : '—'} />
            <KPI t="Hours saved / year" v={(Math.round(hoursSavedPerWeek*52*employees)).toLocaleString()} />
            <KPI t="Retention value" v={money(retentionValue)} />
          </div>

          <p style={{...help, marginTop:10}}>
            Focus areas: {pains.length ? pains.join(', ') : '— none selected'}. Maturity {maturityScore}/10.
          </p>

          <div style={centerRow}>
            <button style={btn} onClick={()=>setStep(1)}>Start over</button>
          </div>
        </section>
      )}

      {/* tiny footer so you can confirm the runtime */}
      <section style={{ ...container, textAlign:'center', color:'#667085', fontSize:12, padding:'8px 0 24px' }}>
        Inline UI • No CSS dependencies • {new Date().toISOString()}
      </section>
    </main>
  );
}

// ——— Reusable bits (inline so we’re self-contained) ———
function FieldNumber({
  label, value, onChange, min, step, suffix, hint
}: {
  label: string; value: number; onChange: (v:number)=>void;
  min?: number; step?: number; suffix?: string; hint?: string;
}) {
  return (
    <div>
      <label style={{ fontWeight: 800 }}>{label}</label>
      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
        <input
          type="number"
          value={value}
          min={min}
          step={step}
          onChange={e=>onChange(Number(e.target.value||0))}
          style={{ width: '100%', border: '1px solid #E2E8F5', borderRadius: 12, padding: '10px 12px' }}
        />
        {suffix ? <span style={{ fontWeight:800, color:'#667085' }}>{suffix}</span> : null}
      </div>
      {hint ? <p style={{ fontSize: '.86rem', color: '#667085' }}>{hint}</p> : null}
    </div>
  );
}

function KPI({ t, v }: { t:string; v:string }) {
  return (
    <div style={{ background:'#fff', border:'1px solid #E8EEFF', borderRadius:14, padding:14, position:'relative' }}>
      <div style={{ position:'absolute', left:0, top:0, right:0, height:4, borderRadius:'14px 14px 0 0', background:'linear-gradient(90deg,#6D8BFF,#3366FE)' }} />
      <div style={{ fontSize:'.76rem', color:'#64748B', fontWeight:800, marginTop:2 }}>{t}</div>
      <div style={{ fontWeight:900, fontSize:'1.16rem' }}>{v}</div>
    </div>
  );
}

function Box({ t, v }: { t:string; v:string }) {
  return (
    <div>
      <div style={{ fontSize: '.8rem', opacity: .95, fontWeight: 800 }}>{t}</div>
      <div style={{ fontWeight: 900, fontSize: '1.25rem' }}>{v}</div>
    </div>
  );
}
