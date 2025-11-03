'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React, { useEffect, useMemo, useRef, useState } from 'react';

/** ─────────────────────────────────────────────────────────────────────────────
 * Types & Constants
 * ────────────────────────────────────────────────────────────────────────────*/
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

const BRAND = {
  blue: '#3366FE',
  blue2: '#6D8BFF',
  bg: '#F5F7FF',
  text: '#0E1320',
  subtle: '#667085',
  border: '#E7ECF7',
  card: '#FFFFFF',
};

/** ─────────────────────────────────────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────────────────────────────────────*/
function symbol(c: Currency) { return c === 'USD' ? '$' : c === 'GBP' ? '£' : '€'; }

function maturityDetail(score: number) {
  const v = Math.max(1, Math.min(10, Math.round(score)));
  if (v <= 2) return 'Early stage: ad-hoc trials; teach prompt basics + quick wins.';
  if (v <= 4) return 'Isolated champions; unify templates, create shared prompt library.';
  if (v <= 6) return 'Growing adoption; standardize stack, add measurement & weekly rituals.';
  if (v <= 8) return 'Operationalized; embed in SOPs, wire to data, track ROI monthly.';
  return 'Best-in-class; role playbooks, scaled champions, quarterly ROI reviews.';
}

/** Suggested hours curve:
 *   Maturity 1 → ~5h/week (early gains)
 *   Maturity 10 → ~1h/week (optimised, fewer low-hanging wins)
 *   Team tweak: support +0.5h, product -0.5h
 */
function suggestedHours(team: Team, score: number) {
  const s = Math.max(1, Math.min(10, score));
  const base = 5 - ((s - 1) * (4 / 9)); // 5..1
  const teamAdj = team === 'support' ? 0.5 : team === 'product' ? -0.5 : 0;
  const hrs = Math.max(0.5, base + teamAdj);
  return Math.round(hrs * 2) / 2;
}

function calcProductivityAnnual(avgSalary:number, hoursPerWeek:number, employees:number) {
  const hourly = avgSalary / (52 * 40);
  const realizable = 0.7; // “utilization” factor to avoid overclaiming
  const totalHours = hoursPerWeek * 52 * employees;
  return hourly * realizable * totalHours;
}

function calcRetentionValue(
  avgSalary:number,
  employees:number,
  baselineTurnoverPct:number,
  improvementPct:number,
  replacementCostFactor:number
) {
  const avoided = employees * (baselineTurnoverPct/100) * (improvementPct/100); // employees retained vs. churned
  const replaceCost = avgSalary * replacementCostFactor; // hiring + ramp + lost productivity
  return avoided * replaceCost;
}

function money(n:number, c:Currency) {
  return new Intl.NumberFormat('en', { style:'currency', currency:c, maximumFractionDigits: 0 }).format(n);
}

/** ─────────────────────────────────────────────────────────────────────────────
 * Styles (inline, single source of truth)
 * ────────────────────────────────────────────────────────────────────────────*/
const S = {
  container: { maxWidth: 1120, margin: '0 auto', padding: '0 20px' } as const,
  card: { background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 16, boxShadow: '0 10px 28px rgba(12,20,38,.08)', padding: 18, maxWidth: 980, margin: '16px auto' } as const,
  header: { background: `linear-gradient(135deg, ${BRAND.blue2}, ${BRAND.blue})`, color: '#fff', borderRadius: 16, boxShadow: '0 16px 36px rgba(15,42,120,.28)', padding: 18, maxWidth: 980, margin: '18px auto' } as const,
  h1: { margin: 0, fontSize: '1.28rem', fontWeight: 900, letterSpacing:'-.01em' } as const,
  sub: { marginTop: 6, opacity:.95 } as const,
  row: { display:'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', marginTop: 12 } as const,
  tile: { border:'1px solid rgba(255,255,255,.35)', background:'rgba(255,255,255,.12)', color:'#fff', borderRadius:12, padding:12, fontWeight:800 } as const,
  stepperCard: { background: BRAND.card, border:`1px solid ${BRAND.border}`, borderRadius:16, padding:12, maxWidth:980, margin:'16px auto' } as const,
  stepBar: { height: 10, background: '#E9EDFB', borderRadius: 999, overflow: 'hidden' } as const,
  stepFill: (pct:number) => ({ display:'block', height:'100%', width:`${pct}%`, background: `linear-gradient(90deg, ${BRAND.blue2}, ${BRAND.blue})` } as const),
  stepLabels: { display:'flex', gap:10, flexWrap:'wrap', alignItems:'center', marginTop:10 } as const,
  dot: (active:boolean) => ({
    width: 28, height: 28, borderRadius: 999, display:'flex', alignItems:'center', justifyContent:'center',
    fontWeight:900, fontSize:13,
    background: active ? BRAND.blue : '#fff',
    color: active ? '#fff' : BRAND.text,
    border: active ? 'none' : '2px solid #CFD8FF'
  }) as const,
  labelBold: { fontWeight: 800 } as const,
  help: { fontSize: '.86rem', color: BRAND.subtle } as const,
  input: { width:'100%', border:`1px solid #E2E8F5`, borderRadius:12, padding:'10px 12px' } as const,
  btn: { display:'inline-flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:12, fontWeight:800, border:`1px solid ${BRAND.border}`, cursor:'pointer', background:'#fff' } as const,
  btnPrimary: { display:'inline-flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:12, fontWeight:800, cursor:'pointer', background:`linear-gradient(90deg, ${BRAND.blue2}, ${BRAND.blue})`, color:'#fff', borderColor:'transparent', boxShadow:'0 8px 20px rgba(31,77,255,.25)' } as const,
  gridAuto: { display:'grid', gap: 14, gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', maxWidth:900, margin:'0 auto' } as const,
  twoCol: { display:'grid', gap:16, gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)', alignItems:'start', maxWidth:900, margin:'0 auto' } as const,
  centerRow: { maxWidth:980, margin:'16px auto 0', display:'flex', gap:8, justifyContent:'space-between', flexWrap:'wrap' } as const,
  blueBox: { marginTop: 10, borderRadius: 14, padding: 14, color:'#fff', border:'1px solid rgba(255,255,255,.35)', background:`linear-gradient(135deg, ${BRAND.blue2}, ${BRAND.blue})`, boxShadow:'0 12px 30px rgba(15,42,120,.25)', width:'100%' } as const,
};

/** ─────────────────────────────────────────────────────────────────────────────
 * Page
 * ────────────────────────────────────────────────────────────────────────────*/
export default function Home() {
  // steps
  const [step, setStep] = useState(1);
  const labels = ['Audience','AI Benchmark','Retention','Training & Duration','Results'];
  const pct = Math.min((step - 1) / (labels.length - 1), 1) * 100;

  // Step 1 — Audience
  const [currency, setCurrency] = useState<Currency>('EUR');
  const [team, setTeam] = useState<Team>('all');
  const [employees, setEmployees] = useState<number>(150);
  const [pains, setPains] = useState<Pain[]>([]);

  // Step 2 — Benchmark (AI maturity + suggested hours)
  const [maturityScore, setMaturityScore] = useState<number>(5);
  const [hoursSavedPerWeek, setHoursSavedPerWeek] = useState<number>(3);
  const userTouchedHours = useRef(false);
  useEffect(() => { if (!userTouchedHours.current) setHoursSavedPerWeek(suggestedHours(team, maturityScore)); }, [team, maturityScore]);

  // Step 3 — Retention
  const [baselineTurnoverPct, setBaselineTurnoverPct] = useState<number>(20);
  const [turnoverImprovementPct, setTurnoverImprovementPct] = useState<number>(10);
  const [replacementCostFactor, setReplacementCostFactor] = useState<number>(0.5);

  // Step 4 — Program
  const [trainingPerEmployee, setTrainingPerEmployee] = useState<number>(850);
  const [avgSalary, setAvgSalary] = useState<number>(52000);
  const [durationMonths, setDurationMonths] = useState<number>(3);

  // Calcs
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

  return (
    <main style={{ ...S.container, fontFamily:'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial', color: BRAND.text }}>
      {/* Header (blue) with KPIs row merged under it */}
      <section style={S.header}>
        <h1 style={S.h1}>AI at Work — Human Productivity ROI</h1>
        <p style={S.sub}>Quantify time saved, payback, and retention impact from training managers and teams to work effectively with AI.</p>

        {/* What the report shows (outputs) */}
        <div style={S.row}>
          <div style={S.tile}>Monthly savings</div>
          <div style={S.tile}>Payback (months)</div>
          <div style={S.tile}>Annual ROI (× multiple)</div>
          <div style={S.tile}>Hours saved / year (team)</div>
        </div>
      </section>

      {/* Stepper */}
      <section style={S.stepperCard}>
        <div style={S.stepBar}><span style={S.stepFill(pct)} /></div>
        <div style={S.stepLabels}>
          {labels.map((t, i) => {
            const active = i + 1 <= step;
            return (
              <div key={t} style={{ display:'flex', alignItems:'center', gap:8, color: active ? BRAND.text : '#8892A6' }}>
                <div style={S.dot(active)}>{i+1}</div>
                <span style={{ fontWeight: 800, fontSize: 13 }}>{t}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* STEP 1: Audience */}
      {step === 1 && (
        <section style={S.card}>
          <h3 style={{ margin:'0 0 .7rem', fontSize:'1.06rem', fontWeight:900 }}>Audience</h3>
          <div style={S.gridAuto}>
            <div>
              <label style={S.labelBold}>Team</label>
              <select value={team} onChange={e=>setTeam(e.target.value as Team)} style={S.input}>
                {TEAMS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <p style={S.help}>Choose a function or “Company-wide”.</p>
            </div>

            <div>
              <label style={S.labelBold}>Employees in scope</label>
              <input type="number" min={1} value={employees} onChange={e=>setEmployees(Number(e.target.value||0))} style={S.input}/>
              <p style={S.help}>People who will be trained and measured for ROI.</p>
            </div>

            <div>
              <label style={S.labelBold}>Focus areas (pick up to 3)</label>
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
                        border: `1px solid ${BRAND.border}`,
                        background: active ? BRAND.blue : '#fff',
                        color: active ? '#fff' : BRAND.text,
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
              <label style={S.labelBold}>Currency</label>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {(['EUR','USD','GBP'] as Currency[]).map(c=>{
                  const active = currency === c;
                  return (
                    <button key={c} onClick={()=>setCurrency(c)} type="button"
                      style={{
                        padding:'8px 12px', borderRadius: 999, fontWeight: 800,
                        border: `1px solid ${BRAND.border}`,
                        background: active ? BRAND.blue : '#fff',
                        color: active ? '#fff' : BRAND.text,
                        cursor:'pointer'
                      }}>
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ ...S.centerRow, justifyContent:'flex-end' }}>
            <button style={S.btnPrimary} onClick={()=>setStep(2)}>Continue →</button>
          </div>
        </section>
      )}

      {/* STEP 2: AI Benchmark (Maturity + Hours) */}
      {step === 2 && (
        <section style={S.card}>
          <h3 style={{ margin:'0 0 .7rem', fontSize:'1.06rem', fontWeight:900 }}>AI Benchmark</h3>

          <div style={S.twoCol}>
            {/* Left column - maturity & override */}
            <div style={{ paddingRight: 8 }}>
              <label style={S.labelBold}>AI Maturity (1–10)</label>
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
                        border:`1px solid ${BRAND.border}`,
                        background: active ? `linear-gradient(90deg, ${BRAND.blue2}, ${BRAND.blue})` : '#fff',
                        color: active ? '#fff' : BRAND.text,
                        boxShadow: active ? '0 8px 20px rgba(31,77,255,.20)' : 'none'
                      }}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
              <p style={{...S.help, marginTop:8}}>{maturityDetail(maturityScore)}</p>

              <div style={S.gridAuto as any}>
                <div>
                  <label style={S.labelBold}>Hours saved per person per week (override)</label>
                  <input
                    type="number" min={0} step={0.5}
                    value={hoursSavedPerWeek}
                    onChange={e=>{ userTouchedHours.current = true; setHoursSavedPerWeek(Number(e.target.value||0)); }}
                    style={S.input}
                  />
                  <p style={S.help}>Auto-suggested from maturity + team. You can override.</p>
                </div>
              </div>
            </div>

            {/* Right column — BLUE KPI BOX */}
            <div style={S.blueBox}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                <div style={{ fontWeight: 900, letterSpacing: '-.01em' }}>Estimated Hours Saved</div>
                <div style={{ padding:'6px 10px', borderRadius:999, border:'1px solid rgba(255,255,255,.4)', background:'rgba(255,255,255,.15)', fontWeight:900 }}>Live</div>
              </div>

              <div style={{ display:'grid', gap:10, gridTemplateColumns:'repeat(3,minmax(0,1fr))' }}>
                <Box t="Per employee / year" v={`${Math.round(hoursSavedPerWeek*52).toLocaleString()} hrs`} white />
                <Box t="Employees in scope" v={employees.toLocaleString()} white />
                <Box t="Total hours / year" v={(Math.round(hoursSavedPerWeek*52*employees)).toLocaleString() + ' hrs'} white />
              </div>

              <div style={{ display:'grid', gap:10, gridTemplateColumns:'repeat(3,minmax(0,1fr))', marginTop:10 }}>
                <Box t="Productivity value / month" v={money((calcProductivityAnnual(avgSalary, hoursSavedPerWeek, employees)||0)/12, currency)} white />
                <Box t="Productivity value / year" v={money(calcProductivityAnnual(avgSalary, hoursSavedPerWeek, employees)||0, currency)} white />
                <Box t="Maturity level" v={`${maturityScore}/10`} white />
              </div>
            </div>
          </div>

          <div style={S.centerRow}>
            <button style={S.btn} onClick={()=>setStep(1)}>← Back</button>
            <button style={S.btnPrimary} onClick={()=>setStep(3)}>Continue →</button>
          </div>
        </section>
      )}

      {/* STEP 3: Retention */}
      {step === 3 && (
        <section style={S.card}>
          <h3 style={{ margin:'0 0 .7rem', fontSize:'1.06rem', fontWeight:900 }}>Retention</h3>
          <div style={S.gridAuto}>
            <FieldNumber label="Baseline annual turnover (%)" value={baselineTurnoverPct} onChange={setBaselineTurnoverPct} min={0} step={1} suffix="%" hint="Typical ranges: 15–30% depending on team." />
            <FieldNumber label="Expected improvement (%)" value={turnoverImprovementPct} onChange={setTurnoverImprovementPct} min={0} step={1} suffix="%" hint="Relative reduction. 10% means 20% → 18% turnover." />
            <FieldNumber label="Replacement cost as % of salary" value={Math.round(replacementCostFactor*100)} onChange={(v)=>setReplacementCostFactor((v||0)/100)} min={0} step={5} suffix="%" hint="Rule of thumb ~50%." />
          </div>
          <div style={S.centerRow}>
            <button style={S.btn} onClick={()=>setStep(2)}>← Back</button>
            <button style={S.btnPrimary} onClick={()=>setStep(4)}>Continue →</button>
          </div>
        </section>
      )}

      {/* STEP 4: Training & Duration */}
      {step === 4 && (
        <section style={S.card}>
          <h3 style={{ margin:'0 0 .7rem', fontSize:'1.06rem', fontWeight:900 }}>Training &amp; Duration</h3>
          <div style={S.gridAuto}>
            <FieldNumber label={`Training per employee (${symbol(currency)})`} value={trainingPerEmployee} onChange={setTrainingPerEmployee} step={25} />
            <FieldNumber label={`Average annual salary (${symbol(currency)})`} value={avgSalary} onChange={setAvgSalary} step={1000} />
            <FieldNumber label="Program duration (months)" value={durationMonths} onChange={setDurationMonths} min={1} step={1} />
          </div>
          <div style={S.centerRow}>
            <button style={S.btn} onClick={()=>setStep(3)}>← Back</button>
            <button style={S.btnPrimary} onClick={()=>setStep(5)}>Continue →</button>
          </div>
        </section>
      )}

      {/* STEP 5: Results */}
      {step === 5 && (
        <section style={S.card}>
          <h3 style={{ margin:'0 0 .7rem', fontSize:'1.06rem', fontWeight:900 }}>Results</h3>

          <div style={{ display:'grid', gap:12, gridTemplateColumns:'repeat(2,minmax(0,1fr))' }}>
            <KPI t="Monthly savings" v={money(monthlySavings, currency)} />
            <KPI t="Annual ROI" v={`${(isFinite(roiMultiple)?roiMultiple:0).toFixed(1)}×`} />
            <KPI t="Payback" v={isFinite(paybackMonths) ? `${paybackMonths.toFixed(1)} mo` : '—'} />
            <KPI t="Hours saved / year" v={(Math.round(hoursSavedPerWeek*52*employees)).toLocaleString()} />
            <KPI t="Retention value" v={money(retentionValue, currency)} />
            <KPI t="Program cost (duration-adjusted)" v={money(programCost, currency)} />
          </div>

          <p style={{...S.help, marginTop:10}}>
            Focus areas: {pains.length ? pains.join(', ') : '— none selected'}. Maturity {maturityScore}/10.
          </p>

          <div style={S.centerRow}>
            <button style={S.btn} onClick={()=>setStep(1)}>Start over</button>
          </div>
        </section>
      )}

      <section style={{ textAlign:'center', color:BRAND.subtle, fontSize:12, padding:'8px 0 24px' }}>
        Inline UI • No CSS dependencies • {new Date().toISOString()}
      </section>
    </main>
  );
}

/** ─────────────────────────────────────────────────────────────────────────────
 * Local UI bits
 * ────────────────────────────────────────────────────────────────────────────*/
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
        {suffix ? <span style={{ fontWeight:800, color:BRAND.subtle }}>{suffix}</span> : null}
      </div>
      {hint ? <p style={{ fontSize: '.86rem', color: BRAND.subtle }}>{hint}</p> : null}
    </div>
  );
}

function KPI({ t, v }: { t:string; v:string }) {
  return (
    <div style={{ background:'#fff', border:'1px solid #E8EEFF', borderRadius:14, padding:14, position:'relative' }}>
      <div style={{ position:'absolute', left:0, top:0, right:0, height:4, borderRadius:'14px 14px 0 0', background:`linear-gradient(90deg, ${BRAND.blue2}, ${BRAND.blue})` }} />
      <div style={{ fontSize:'.76rem', color:'#64748B', fontWeight:800, marginTop:2 }}>{t}</div>
      <div style={{ fontWeight:900, fontSize:'1.16rem' }}>{v}</div>
    </div>
  );
}

function Box({ t, v, white = false }: { t:string; v:string; white?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: '.8rem', opacity: white ? .95 : 1, fontWeight: 800 }}>{t}</div>
      <div style={{ fontWeight: 900, fontSize: '1.25rem' }}>{v}</div>
    </div>
  );
}
