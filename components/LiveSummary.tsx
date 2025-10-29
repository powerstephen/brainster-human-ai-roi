'use client';

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('en', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

export function LiveSummary({
  employees,
  trainedEmployees,
  trainingCostTotal,
  monthlySavings,
  paybackMonths,
  roiMultiple,
  topDriverLabel,
  topDriverShare,
}: {
  employees: number;
  trainedEmployees: number;
  trainingCostTotal: number;
  monthlySavings: number;
  paybackMonths: number;
  roiMultiple: number;
  topDriverLabel: string;
  topDriverShare: number;
}) {
  const items = [
    { k: 'Employees in scope', v: employees.toLocaleString() },
    { k: 'Trained in program', v: trainedEmployees.toLocaleString() },
    { k: 'Training cost (est.)', v: fmtCurrency(trainingCostTotal) },
    { k: 'Monthly savings', v: fmtCurrency(monthlySavings) },
    { k: 'Payback', v: isFinite(paybackMonths) ? `${paybackMonths.toFixed(1)} mo` : '—' },
    { k: 'Annual ROI', v: `${roiMultiple.toFixed(1)}×` },
  ];

  return (
    <aside className="card p-4 space-y-3 h-fit sticky top-6">
      <h3 className="text-lg font-semibold">Live Business Case</h3>
      <div className="grid grid-cols-1 gap-2">
        {items.map((it) => (
          <div key={it.k} className="card p-3">
            <div className="text-xs text-neutral-500">{it.k}</div>
            <div className="text-lg font-semibold">{it.v}</div>
          </div>
        ))}
      </div>
      <div className="card p-3">
        <div className="text-xs text-neutral-500">Top driver</div>
        <div className="text-sm">
          <strong>{topDriverLabel}</strong> ({Math.round(topDriverShare * 100)}% of value)
        </div>
      </div>
    </aside>
  );
}
