'use client';

import { useSearchParams } from 'next/navigation';

export default function ReportPage() {
  const sp = useSearchParams();
  const currency = sp.get('currency') || 'EUR';
  const employees = Number(sp.get('employees') || 100);
  const hours = Number(sp.get('hoursSavedPerWeek') || 3);
  const salary = Number(sp.get('avgSalary') || 52000);
  const annual = salary / (52 * 40) * hours * 52 * employees * 0.7;
  const monthly = annual / 12;

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h1>AI at Work — Summary Report</h1>
      <p>
        Currency: <strong>{currency}</strong> | Employees:{' '}
        <strong>{employees}</strong>
      </p>
      <div
        style={{
          marginTop: 20,
          display: 'grid',
          gap: 12,
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))',
        }}
      >
        <div style={tile}>
          <span style={label}>Monthly savings</span>
          <strong>{fmt(monthly, currency)}</strong>
        </div>
        <div style={tile}>
          <span style={label}>Annual value</span>
          <strong>{fmt(annual, currency)}</strong>
        </div>
        <div style={tile}>
          <span style={label}>Hours saved / year</span>
          <strong>{(hours * 52 * employees).toLocaleString()}</strong>
        </div>
      </div>
    </main>
  );
}

const tile = {
  border: '1px solid #E8EEFF',
  borderRadius: 14,
  padding: 14,
  background: '#fff',
  boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
};

const label = { display: 'block', fontSize: '.85rem', color: '#667085' };

function fmt(n: number, currency: string) {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}
