// app/report/page.tsx
import { symbol, teamPresets } from '../../lib/model';

export const metadata = {
  title: 'AI at Work — Print Report',
  description: 'Printable summary of ROI and retention impacts.',
};

type Search = { [key: string]: string | string[] | undefined };

// safe number parser
function n(v: string | string[] | undefined, d: number): number {
  if (v === undefined) return d;
  const s = Array.isArray(v) ? v[0] : v;
  const x = Number(s);
  return Number.isFinite(x) ? x : d;
}

// safe string parser
function s(v: string | string[] | undefined, d: string): string {
  if (v === undefined) return d;
  return Array.isArray(v) ? v[0] : v;
}

export default function ReportPage({ searchParams }: { searchParams: Search }) {
  // ---- Inputs (with sensible defaults) ----
  const team = s(searchParams.team, 'hr') as
    | 'hr'
    | 'ops'
    | 'marketing'
    | 'sales'
    | 'support'
    | 'product';

  const defaults = teamPresets(team);

  const currency = (s(searchParams.currency, 'EUR') as 'EUR' | 'USD' | 'GBP') || 'EUR';
  const maturityScore = n(searchParams.maturityScore, 5);
  const employees = n(searchParams.employees, 150);
  const avgSalary = n(searchParams.avgSalary, 52000);
  const hoursSavedPerWeek = n(searchParams.hoursSavedPerWeek, 3);

  const baselineTurnoverPct = n(searchParams.baselineTurnoverPct, defaults.baselineTurnoverPct);
  const turnoverImprovementPct = n(searchParams.turnoverImprovementPct, 10);
  const replacementCostFactor = n(searchParams.replacementCostFactor, 0.5);

  const trainingPerEmployee = n(searchParams.trainingPerEmployee, 850);
  const durationMonths = n(searchParams.durationMonths, 3);

  const painsRaw = s(searchParams.pains, '');
  const pains = painsRaw ? painsRaw.split(',').filter(Boolean) : [];

  // ---- Calculations (mirror lib/model.ts, with extra details for the report) ----
  const HOURS_PER_YEAR = 1800; // conservative
  const hourlyCost = avgSalary / HOURS_PER_YEAR;

  const hoursTotalYear = hoursSavedPerWeek * employees * 52;
  const productivityAnnual = hoursTotalYear * hourlyCost;

  const baselineTurnover = clampPct(baselineTurnoverPct) / 100; // 0..1
  const improvementRel = clampPct(turnoverImprovementPct) / 100; // 0..1
  const turnoverAfter = baselineTurnover * (1 - improvementRel);

  const avoidedAttritions = employees * (baselineTurnover - turnoverAfter);
  const costPerAttrition = avgSalary * clampFactor(replacementCostFactor);
  const retentionValue = avoidedAttritions * costPerAttrition;

  const trainingCostTotal = employees * trainingPerEmployee;
  const annualValue = productivityAnnual + retentionValue;
  const monthlySavings = annualValue / 12;

  const paybackMonths = annualValue > 0 ? trainingCostTotal / (annualValue / 12) : Infinity;
  const roiMultiple = trainingCostTotal > 0 ? annualValue / trainingCostTotal : 0;

  const S = symbol(currency);

  // ---- helpers ----
  const money0 = (n: number) =>
    new Intl.NumberFormat('en', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
  const num1 = (n: number) => (Number.isFinite(n) ? n.toFixed(1) : '—');
  const pct1 = (n: number) => `${num1(n)}%`;

  // ---- Render ----
  return (
    <html lang="en">
      <body>
        <div className="container" style={{ marginTop: 24, marginBottom: 32 }}>
          {/* Header */}
          <div className="card" style={{ borderColor: '#D9E4FF' }}>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>AI at Work — Human Productivity ROI</h2>
            <p style={{ margin: '6px 0 0', color: '#44506B' }}>
              Printable summary of value drivers and assumptions. <strong>Team:</strong> {labelTeam(team)} ·{' '}
              <strong>Currency:</strong> {currency} · <strong>Maturity:</strong> {maturityScore}/10
            </p>
          </div>

          {/* KPIs */}
          <div className="section">
            <div className="kpi-grid">
              <div className="kpi">
                <div className="title">Monthly savings</div>
                <div className="value">{money0(monthlySavings)}</div>
              </div>
              <div className="kpi">
                <div className="title">Annual ROI</div>
                <div className="value">{num1(roiMultiple)}×</div>
              </div>
              <div className="kpi">
                <div className="title">Payback</div>
                <div className="value">{Number.isFinite(paybackMonths) ? `${num1(paybackMonths)} mo` : '—'}</div>
              </div>
              <div className="kpi">
                <div className="title">Hours saved / year</div>
                <div className="value">{Math.round(hoursTotalYear).toLocaleString()}</div>
              </div>
              <div className="kpi">
                <div className="title">Retention value</div>
                <div className="value">{money0(retentionValue)}</div>
              </div>
            </div>
          </div>

          {/* Assumptions Summary */}
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Assumptions</h3>
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))' }}>
              <Field label="Employees in scope" value={employees.toLocaleString()} />
              <Field label={`Average salary (${S})`} value={money0(avgSalary)} />
              <Field label="Hours saved per person per week" value={`${num1(hoursSavedPerWeek)} hrs`} />
              <Field label="Program duration" value={`${durationMonths} months`} />
              <Field label="Training per employee" value={money0(trainingPerEmployee)} />
              <Field
                label="Primary focus areas"
                value={pains.length ? pains.join(', ') : '— none selected'}
              />
            </div>
          </div>

          {/* Retention Math (clear & explicit) */}
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Retention impact (detailed)</h3>
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))' }}>
              <Field label="Baseline annual turnover" value={pct1(baselineTurnoverPct)} />
              <Field label="Expected improvement (relative)" value={pct1(turnoverImprovementPct)} />
              <Field
                label="Replacement cost"
                value={`${num1(replacementCostFactor * 100)}% of salary (${money0(costPerAttrition)} / attrition)`}
              />
              <Field label="Avoided attritions (annual)" value={num1(avoidedAttritions)} />
              <Field label="Retention value (annual)" value={money0(retentionValue)} />
            </div>

            <div style={{ marginTop: 10, color: '#4B5565', fontSize: 14, lineHeight: 1.45 }}>
              <strong>Formula.</strong> Avoided attritions = <em>employees</em> × (<em>baseline turnover</em> × (1 −{' '}
              <em>improvement</em>) − <em>baseline turnover</em>) × (−1). Retention value = <em>avoided attritions</em>{' '}
              × (<em>avg salary</em> × <em>replacement cost factor</em>).
            </div>
          </div>

          {/* Productivity Math */}
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Productivity value (detailed)</h3>
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))' }}>
              <Field label="Hours saved per person per week" value={`${num1(hoursSavedPerWeek)} hrs`} />
              <Field label="Total hours saved per year" value={Math.round(hoursTotalYear).toLocaleString()} />
              <Field label="Hourly cost (derived)" value={money0(hourlyCost)} />
              <Field label="Productivity value (annual)" value={money0(productivityAnnual)} />
            </div>

            <div style={{ marginTop: 10, color: '#4B5565', fontSize: 14 }}>
              <strong>Assumption.</strong> Working hours/year set to <code>1800</code> (conservative). Adjust in app if
              needed.
            </div>
          </div>

          {/* ROI Summary */}
          <div className="card">
            <h3 style={{ marginTop: 0 }}>ROI summary</h3>
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))' }}>
              <Field label="Training cost (total)" value={money0(trainingCostTotal)} />
              <Field label="Annual value (productivity + retention)" value={money0(annualValue)} />
              <Field label="Monthly savings (value side)" value={money0(monthlySavings)} />
              <Field
                label="Payback period"
                value={Number.isFinite(paybackMonths) ? `${num1(paybackMonths)} months` : '—'}
              />
              <Field label="ROI multiple (annual / cost)" value={`${num1(roiMultiple)}×`} />
            </div>
          </div>

          {/* Notes */}
          <div className="card" style={{ background: '#F8FAFF' }}>
            <h3 style={{ marginTop: 0 }}>Notes & caveats</h3>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', color: '#4B5565' }}>
              <li>
                Estimates assume a <strong>people-first enablement program</strong> (no headcount reduction).
              </li>
              <li>
                Turnover baselines vary by function; defaults are set per team and can be edited in the app.
              </li>
              <li>
                Replacement cost factor commonly ranges from <strong>30%–100%</strong> of salary (recruiting,
                onboarding, ramp, lost productivity).
              </li>
              <li>
                To validate assumptions, run a <strong>6–8 week pilot</strong> with clear KPIs and compare pre/post.
              </li>
            </ul>
          </div>

          <p className="help" style={{ textAlign: 'center', marginTop: 12 }}>
            Tip: Use your browser’s <strong>Print</strong> (⌘/Ctrl + P) to save as PDF.
          </p>
        </div>
      </body>
    </html>
  );
}

// small presentational helper
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: '1px solid #E7ECF7', borderRadius: 12, padding: 12, background: '#fff' }}>
      <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.04em' }}>
        {label}
      </div>
      <div style={{ fontWeight: 900, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function labelTeam(t: string) {
  switch (t) {
    case 'hr': return 'HR / People Ops';
    case 'ops': return 'Operations';
    case 'marketing': return 'Marketing';
    case 'sales': return 'Sales';
    case 'support': return 'Customer Support';
    case 'product': return 'Product';
    default: return t;
  }
}

function clampPct(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}
function clampFactor(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1.5, n));
}
