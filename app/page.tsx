'use client';

import { useSearchParams } from 'next/navigation';

// Self-contained types (to avoid depending on lib/model)
type Team = 'all'|'hr'|'ops'|'marketing'|'sales'|'support'|'product';
type Currency = 'EUR'|'USD'|'GBP';
type Pain = 'retention'|'engagement'|'quality'|'throughput'|'onboarding'|'cost';

function toNumber(v: string | null, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function toTeam(v: string | null): Team {
  const ok: Team[] = ['all','hr','ops','marketing','sales','support','product'];
  return ok.includes(v as Team) ? (v as Team) : 'all';
}
function toCurrency(v: string | null): Currency {
  const ok: Currency[] = ['EUR','USD','GBP'];
  return ok.includes(v as Currency) ? (v as Currency) : 'EUR';
}
function toPains(v: string | null): Pain[] {
  const ok: Pain[] = ['retention','engagement','quality','throughput','onboarding','cost'];
  if (!v) return [];
  return v.split('|').filter(x => ok.includes(x as Pain)) as Pain[];
}
function money(n: number, currency: Currency) {
  return new Intl.NumberFormat('en', { style:'currency', currency, maximumFractionDigits:0 }).format(n);
}

// Lightweight calc (same logic used on main page)
function calcProductivityAnnual(avgSalary:number, hoursPerWeek:number, employees:number) {
  const hourly = avgSalary / (52 * 40);
  const util = 0.7;
  const totalHours = hoursPerWeek * 52 * employees;
  return hourly * util * totalHours;
}
function calcRetentionValue(avgSalary:number, employees:number, baselineTurnoverPct:number, improvementPct:number, replacementCostFactor:number) {
  const avoided = employees * (baselineTurnoverPct/100) * (improvementPct/100);
  const replaceCost = avgSalary * replacementCostFactor;
  return avoided * replaceCost;
}

export default function ReportPage() {
  const sp = useSearchParams();

  // Decode from querystring (fallbacks are sensible defaults)
  const currency = toCurrency(sp.get('currency'));
  const team = toTeam(sp.get('team'));
  const maturityScore = toNumber(sp.get('maturityScore'), 5);
  const employees = toNumber(sp.get('employees'), 150);
  const avgSalary = toNumber(sp.get('avgSalary'), 52000);
  const hoursSavedPerWeek = toNumber(sp.get('hoursSavedPerWeek'), 3);
  const baselineTurnoverPct = toNumber(sp.get('baselineTurnoverPct'), 20);
  const turnoverImprovementPct = toNumber(sp.get('turnoverImprovementPct'), 10);
  const replacementCostFactor = toNumber(sp.get('replacementCostFactor'), 0.5);
  const trainingPerEmployee = toNumber(sp.get('trainingPerEmployee'), 850);
  const durationMonths = toNumber(sp.get('durationMonths'), 3);
  const pains = toPains(sp.get('pains'));

  // Calculations
  const productivityAnnual = calcProductivityAnnual(avgSalary, hoursSavedPerWeek, employees);
  const retentionValue = calcRetentionValue(avgSalary, employees, baselineTurnoverPct, turnoverImprovementPct, replacementCostFactor);
  const programCost = trainingPerEmployee * employees * (durationMonths / 12);
  const annualValue = productivityAnnual + retentionValue;
  const monthlySavings = annualValue / 12;
  const roiMultiple = programCost > 0 ? annualValue / programCost : Infinity;
  const paybackMonths = monthlySavings > 0 ? programCost / monthlySavings : Infinity;
  const hoursTotalYear = Math.round(hoursSavedPerWeek * 52 * employees);

  // Minimal styles so this prints nicely
  const container = { maxWidth: 980, margin: '16px auto', padding: '0 20px' } as const;
  const card = { background: '#fff', border: '1px solid #E7ECF7', borderRadius: 16, boxShadow: '0 10px 28px rgba(12,20,38,.08)', padding: 18 } as const;
  const grid = { display:'grid', gap:12, gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', marginTop:12 } as const;
  const tile = { border:'1px solid #E8EEFF', borderRadius:14, padding:14, position:'relative' } as const;

  return (
    <main style={container}>
      <div style={card}>
        <h2 style={{ marginTop: 0, fontWeight: 900 }}>AI at Work — Summary</h2>
        <p style={{ color:'#667085' }}>Print this page or save as PDF.</p>

        <div style={grid}>
          <div style={tile}>
            <div style={{ position:'absolute', left:0, top:0, right:0, height:4, borderRadius:'14px 14px 0 0', background:'linear-gradient(90deg,#6D8BFF,#3366FE)' }} />
            <div style={{ fontSize:'.8rem', color:'#64748B', fontWeight:800 }}>Monthly savings</div>
            <div style={{ fontWeight:900, fontSize:'1.16rem' }}>{money(monthlySavings, currency)}</div>
          </div>
          <div style={tile}>
            <div style={{ position:'absolute', left:0, top:0, right:0, height:4, borderRadius:'14px 14px 0 0', background:'linear-gradient(90deg,#6D8BFF,#3366FE)' }} />
            <div style={{ fontSize:'.8rem', color:'#64748B', fontWeight:800 }}>Annual ROI</div>
            <div style={{ fontWeight:900, fontSize:'1.16rem' }}>{(isFinite(roiMultiple) ? roiMultiple : 0).toFixed(1)}×</div>
          </div>
          <div style={tile}>
            <div style={{ position:'absolute', left:0, top:0, right:0, height:4, borderRadius:'14px 14px 0 0', background:'linear-gradient(90deg,#6D8BFF,#3366FE)' }} />
            <div style={{ fontSize:'.8rem', color:'#64748B', fontWeight:800 }}>Payback</div>
            <div style={{ fontWeight:900, fontSize:'1.16rem' }}>
              {isFinite(paybackMonths) ? `${paybackMonths.toFixed(1)} mo` : '—'}
            </div>
          </div>
          <div style={tile}>
            <div style={{ position:'absolute', left:0, top:0, right:0, height:4, borderRadius:'14px 14px 0 0', background:'linear-gradient(90deg,#6D8BFF,#3366FE)' }} />
            <div style={{ fontSize:'.8rem', color:'#64748B', fontWeight:800 }}>Hours saved / year</div>
            <div style={{ fontWeight:900, fontSize:'1.16rem' }}>{hoursTotalYear.toLocaleString()}</div>
          </div>
          <div style={tile}>
            <div style={{ position:'absolute', left:0, top:0, right:0, height:4, borderRadius:'14px 14px 0 0', background:'linear-gradient(90deg,#6D8BFF,#3366FE)' }} />
            <div style={{ fontSize:'.8rem', color:'#64748B', fontWeight:800 }}>Retention value</div>
            <div style={{ fontWeight:900, fontSize:'1.16rem' }}>{money(retentionValue, currency)}</div>
          </div>
        </div>

        <div style={{ marginTop:16, borderTop:'1px solid #E7ECF7', paddingTop:12, color:'#667085' }}>
          Team: {team} · Employees: {employees.toLocaleString()} · Maturity {maturityScore}/10 · Focus: {pains.length ? pains.join(', ') : '— none'}
        </div>
      </div>
    </main>
  );
}
