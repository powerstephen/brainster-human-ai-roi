'use client';

import { useSearchParams } from 'next/navigation';
import { decodeInputs, calc, symbol } from '../../lib/model';

export default function ReportPage() {
  const sp = useSearchParams();
  const inputs = decodeInputs(sp);
  const res = calc(inputs);
  const money = (n: number) =>
    new Intl.NumberFormat('en', { style: 'currency', currency: inputs.currency, maximumFractionDigits: 0 }).format(n);

  return (
    <main className="section container">
      <div className="card" style={{ maxWidth: 980, margin: '16px auto' }}>
        <h2 style={{ marginTop: 0, fontWeight: 900 }}>AI at Work — Summary</h2>
        <p className="help">Print this page or save as PDF.</p>

        <div style={{display:'grid', gap:12, gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', marginTop:12}}>
          <div style={{border:'1px solid #E8EEFF', borderRadius:14, padding:14}}>
            <div className="help" style={{fontWeight:800}}>Monthly savings</div>
            <div style={{fontWeight:900, fontSize:'1.16rem'}}>{money(res.monthlySavings)}</div>
          </div>
          <div style={{border:'1px solid #E8EEFF', borderRadius:14, padding:14}}>
            <div className="help" style={{fontWeight:800}}>Annual ROI</div>
            <div style={{fontWeight:900, fontSize:'1.16rem'}}>{res.roiMultiple.toFixed(1)}×</div>
          </div>
          <div style={{border:'1px solid #E8EEFF', borderRadius:14, padding:14}}>
            <div className="help" style={{fontWeight:800}}>Payback</div>
            <div style={{fontWeight:900, fontSize:'1.16rem'}}>
              {isFinite(res.paybackMonths) ? `${res.paybackMonths.toFixed(1)} mo` : '—'}
            </div>
          </div>
          <div style={{border:'1px solid #E8EEFF', borderRadius:14, padding:14}}>
            <div className="help" style={{fontWeight:800}}>Hours saved / year</div>
            <div style={{fontWeight:900, fontSize:'1.16rem'}}>{Math.round(res.hoursTotalYear).toLocaleString()}</div>
          </div>
          <div style={{border:'1px solid #E8EEFF', borderRadius:14, padding:14}}>
            <div className="help" style={{fontWeight:800}}>Retention value</div>
            <div style={{fontWeight:900, fontSize:'1.16rem'}}>{money(res.retentionValue)}</div>
          </div>
        </div>

        <div style={{marginTop:16, borderTop:'1px solid #E7ECF7', paddingTop:12}}>
          <div className="help">
            Team: {inputs.team} · Employees: {inputs.employees.toLocaleString()} · Maturity {inputs.maturityScore}/10 · Focus: {inputs.pains.length ? inputs.pains.join(', ') : '— none'}
          </div>
        </div>
      </div>
    </main>
  );
}
