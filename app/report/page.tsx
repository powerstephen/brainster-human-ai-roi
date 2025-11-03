'use client';

import { useSearchParams } from 'next/navigation';

export default function ReportPage() {
  const sp = useSearchParams();
  const currency = (sp.get('currency') || 'EUR') as 'EUR'|'USD'|'GBP';
  const employees = toNum(sp.get('employees'), 100);
  const hours = toNum(sp.get('hoursSavedPerWeek'), 3);
  const salary = toNum(sp.get('avgSalary'), 52000);

  // Same calc as main page
  const annual = salary / (52 * 40) * hours * 52 * employees * 0.7;
  const monthly = annual / 12;

  return (
    <main style={{ maxWidth: 980, margin: '16px auto', padding: '0 20px' }}>
      <div style={{ background:'#fff', border:'1px solid #E7ECF7', borderRadius:16, boxShadow:'0 10px 28px rgba(12,20,38,.08)', padding:18 }}>
        <h2 style={{ marginTop: 0, fontWeight: 900 }}>AI at Work — Summary</h2>
        <p style={{ color:'#667085' }}>Print this page or save as PDF.</p>

        <div style={{ display:'grid', gap:12, gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', marginTop:12 }}>
          <Tile label="Monthly savings" value={fmt(monthly, currency)} />
          <Tile label="Annual value" value={fmt(annual, currency)} />
          <Tile label="Hours saved / year" value={(hours * 52 * employees).toLocaleString()} />
        </div>
      </div>
    </main>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border:'1px solid #E8EEFF', borderRadius:14, padding:14, background:'#fff', boxShadow:'0 4px 12px rgba(0,0,0,.04)', position:'relative' }}>
      <div style={{ position:'absolute', left:0, top:0, right:0, height:4, borderRadius:'14px 14px 0 0', background:'linear-gradient(90deg,#6D8BFF,#3366FE)' }} />
      <div style={{ fontSize:'.82rem', color:'#667085', fontWeight:800 }}>{label}</div>
      <div style={{ fontWeight:900, fontSize:'1.16rem' }}>{value}</div>
    </div>
  );
}

function toNum(v: string | null, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function fmt(n: number, currency: 'EUR'|'USD'|'GBP') {
  return new Intl.NumberFormat('en', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
}

