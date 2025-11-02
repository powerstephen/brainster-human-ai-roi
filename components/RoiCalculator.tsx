'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import {
  calc,
  Inputs,
  Team,
  Currency,
  Pain,
  symbol,
  teamPresets,
  encodeInputs,
} from '../lib/model';
import { CurrencyPills, MultiPick, NumberField } from './controls';
import NextSteps from './NextSteps';
import { IconTeam, IconGauge, IconMoney, IconClock, IconPeople } from './icons';

const PAIN_OPTS: { label: string; value: Pain }[] = [
  { label: 'Staff retention', value: 'retention' },
  { label: 'Employee engagement', value: 'engagement' },
  { label: 'Output quality / rework', value: 'quality' },
  { label: 'Throughput / cycle time', value: 'throughput' },
  { label: 'Onboarding speed', value: 'onboarding' },
  { label: 'Cost reduction', value: 'cost' },
];

const TEAMS: { label: string; value: Team }[] = [
  { label: 'Company-wide', value: 'all' },
  { label: 'HR / People Ops', value: 'hr' },
  { label: 'Operations', value: 'ops' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Sales', value: 'sales' },
  { label: 'Customer Support', value: 'support' },
  { label: 'Product', value: 'product' },
];

function suggestedHoursFromMaturity(team: Team, score: number): number {
  const clamped = Math.max(1, Math.min(10, score));
  const base = 5 - ((clamped - 1) * (4 / 9)); // 5..1
  const teamAdj = team === 'support' ? 0.5 : team === 'product' ? -0.5 : 0;
  const hrs = Math.max(0.5, base + teamAdj);
  return Math.round(hrs * 2) / 2;
}
function maturityDetail(score: number): string {
  const v = Math.round(score);
  if (v <= 2) return 'Early stage: ad-hoc experimentation; big wins from prompt basics and workflow mapping.';
  if (v <= 4) return 'Isolated champions; introduce templates, shared prompt library, and QA gates.';
  if (v <= 6) return 'Growing adoption; standardize tool stack, add measurement, and weekly enablement rituals.';
  if (v <= 8) return 'Operationalized; embed AI in SOPs, connect to data sources, track KPIs monthly.';
  return 'Best-in-class; scale champions network, role-specific playbooks, quarterly ROI reviews.';
}

export function RoiCalculator() {
  const [step, setStep] = useState(1);

  // audience
  const [currency, setCurrency] = useState<Currency>('EUR');
  const [team, setTeam] = useState<Team>('all');
  const [employees, setEmployees] = useState<number>(150);
  const [pains, setPains] = useState<Pain[]>([]);

  // benchmark
  const [maturityScore, setMaturityScore] = useState<number>(5);
  const [hoursSavedPerWeek, setHoursSavedPerWeek] = useState<number>(3);
  const userTouchedHours = useRef(false);

  // ROI params
  const [avgSalary, setAvgSalary] = useState<number>(52000);
  const [baselineTurnoverPct, setBaselineTurnoverPct] = useState<number>(
    teamPresets('all').baselineTurnoverPct
  );
  const [turnoverImprovementPct, setTurnoverImprovementPct] = useState<number>(10);
  const [replacementCostFactor, setReplacementCostFactor] = useState<number>(0.5);
  const [trainingPerEmployee, setTrainingPerEmployee] = useState<number>(850);
  const [durationMonths, setDurationMonths] = useState<number>(3);

  // defaults on team/maturity change
  useEffect(() => {
    if (!userTouchedHours.current) {
      setHoursSavedPerWeek(suggestedHoursFromMaturity(team, maturityScore));
    }
    setBaselineTurnoverPct(teamPresets(team).baselineTurnoverPct);
  }, [team]);
  useEffect(() => {
    if (!userTouchedHours.current) {
      setHoursSavedPerWeek(suggestedHoursFromMaturity(team, maturityScore));
    }
  }, [maturityScore, team]);

  const inputs: Inputs = {
    currency,
    team,
    maturityScore,
    employees,
    avgSalary,
    hoursSavedPerWeek,
    baselineTurnoverPct,
    turnoverImprovementPct,
    replacementCostFactor,
    trainingPerEmployee,
    durationMonths,
    pains,
  };

  const S = symbol(currency);
  const res = useMemo(() => calc(inputs), [inputs]);
  const money = (n: number) =>
    new Intl.NumberFormat('en', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(n);

  // 5 steps with Results
  const Stepper = () => {
    const labels = ['Audience', 'AI Benchmark', 'Retention', 'Training & Duration', 'Results'];
    const pct = Math.min((step - 1) / (labels.length - 1), 1) * 100;
    return (
      <>
        <div className="progress">
          <span style={{ width: `${pct}%` }} />
        </div>
        <div className="steps">
          {labels.map((t, i) => (
            <div key={t} className={`step ${i + 1 <= step ? 'active' : ''}`}>
              <div className="dot">{i + 1}</div>
              <span style={{ fontWeight: 800, fontSize: 13 }}>{t}</span>
            </div>
          ))}
        </div>
      </>
    );
  };

  // helpers
  const openPrintView = () => {
    const qs = encodeInputs(inputs);
    if (typeof window !== 'undefined') window.open(`/report?${qs}`, '_blank');
  };
  const downloadCSV = () => {
    const rows = [
      ['currency', inputs.currency],
      ['team', inputs.team],
      ['maturityScore', inputs.maturityScore],
      ['employees', inputs.employees],
      ['avgSalary', inputs.avgSalary],
      ['hoursSavedPerWeek', inputs.hoursSavedPerWeek],
      ['baselineTurnoverPct', inputs.baselineTurnoverPct],
      ['turnoverImprovementPct', inputs.turnoverImprovementPct],
      ['replacementCostFactor', inputs.replacementCostFactor],
      ['trainingPerEmployee', inputs.trainingPerEmployee],
      ['durationMonths', inputs.durationMonths],
      ['pains', inputs.pains.join('|')],
      [],
      ['monthlySavings', res.monthlySavings],
      ['annualValue', res.annualValue],
      ['retentionValue', res.retentionValue],
      ['hoursTotalYear', res.hoursTotalYear],
      ['paybackMonths', res.paybackMonths],
      ['roiMultiple', res.roiMultiple],
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'brainster-ai-roi.csv';
    a.click();
  };
  const copyShareLink = () => {
    const qs = encodeInputs(inputs);
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}${window.location.pathname}?${qs}`;
      navigator.clipboard.writeText(url);
      alert('Shareable link copied.');
    }
  };

  // inline layout fallbacks to guarantee centering even if CSS fails
  const grid1 = { display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))', maxWidth: 900, margin: '0 auto' } as const;
  const grid2 = { display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', alignItems: 'start', maxWidth: 900, margin: '0 auto' } as const;
  const centerRow = { maxWidth: 980, margin: '16px auto 0', display: 'flex', gap: 8, justifyContent: 'space-between' } as const;

  // blue box inline fallback styles (so you see it even if .highlight CSS misses)
  const highlightStyle = {
    marginTop: 4,
    borderRadius: 14,
    padding: 14,
    color: '#fff',
    border: '1px solid rgba(255,255,255,.35)',
    background: 'linear-gradient(135deg, #4B6FFF, #3366FE)',
    boxShadow: '0 12px 30px rgba(15,42,120,.25)',
  } as const;

  const hoursPerEmployeeYear = hoursSavedPerWeek * 52;
  const hoursTotalYear = res.hoursTotalYear || 0;
  const monthlyProd = (res.productivityAnnual || 0) / 12;
  const annualProd = res.productivityAnnual || 0;

  return (
    <div className="section container">
      <Stepper />

      {/* STEP 1: Audience */}
      {step === 1 && (
        <div className="card">
          <h3>
            <IconTeam /> Audience
          </h3>

          <div style={grid1}>
            <div>
              <label className="label">Team</label>
              <select
                className="input"
                value={team}
                onChange={(e) => setTeam(e.target.value as Team)}
              >
                {TEAMS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <p className="help">Choose a function or “Company-wide”.</p>
            </div>

            <NumberField
              label="Employees in scope"
              value={employees}
              onChange={setEmployees}
              min={1}
            />

            <div>
              <label className="label">Focus areas (up to 3)</label>
              <MultiPick<Pain> values={pains} onChange={setPains} options={PAIN_OPTS} max={3} />
            </div>

            <CurrencyPills value={currency} onChange={setCurrency} />
          </div>

          <div style={{ ...centerRow, justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={() => setStep(2)}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: AI Benchmark */}
      {step === 2 && (
        <div className="card">
          <h3>
            <IconGauge /> AI Benchmark
          </h3>

          <div style={grid2}>
            {/* Left */}
            <div style={{ paddingRight: 8 }}>
              <div>
                <label className="label">AI Maturity (1–10)</label>
                <div className="maturity-scale" role="group" aria-label="AI maturity scale" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {Array.from({ length: 10 }).map((_, i) => {
                    const val = i + 1;
                    const active = val === maturityScore;
                    return (
                      <button
                        key={val}
                        type="button"
                        className={`n ${active ? 'active' : ''}`}
                        onClick={() => setMaturityScore(val)}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          border: '1px solid #E7ECF7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          cursor: 'pointer',
                          background: active
                            ? 'linear-gradient(90deg,#6D8BFF,#3366FE)'
                            : '#fff',
                          color: active ? '#fff' : '#0E1320',
                          boxShadow: active ? '0 8px 20px rgba(31,77,255,.20)' : 'none',
                        }}
                        aria-label={`Maturity ${val}`}
                        title={`Maturity ${val}`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
                <p className="help" style={{ marginTop: 8 }}>{maturityDetail(maturityScore)}</p>
              </div>

              <div style={grid1 as any}>
                <NumberField
                  label="Hours saved per person per week (override)"
                  value={hoursSavedPerWeek}
                  onChange={(n) => {
                    userTouchedHours.current = true;
                    setHoursSavedPerWeek(n);
                  }}
                  min={0}
                  step={0.5}
                  suffix="hrs/week"
                  hint="Auto-suggested from maturity + team. You can override."
                />
              </div>
            </div>

            {/* Right — Blue KPI box */}
            <div className="highlight" style={highlightStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontWeight: 900, letterSpacing: '-.01em' }}>Estimated Hours Saved</div>
                <div className="badge" style={{ borderColor: 'rgba(255,255,255,.4)', background: 'rgba(255,255,255,.15)', color: '#fff' }}>
                  Live
                </div>
              </div>

              <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(3, minmax(0,1fr))' }}>
                <div>
                  <div style={{ fontSize: '.8rem', opacity: .95, fontWeight: 800 }}>Per employee / year</div>
                  <div style={{ fontWeight: 900, fontSize: '1.25rem' }}>
                    {Math.round(hoursPerEmployeeYear).toLocaleString()} hrs
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '.8rem', opacity: .95, fontWeight: 800 }}>Employees in scope</div>
                  <div style={{ fontWeight: 900, fontSize: '1.25rem' }}>{employees.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: '.8rem', opacity: .95, fontWeight: 800 }}>Total hours / year</div>
                  <div style={{ fontWeight: 900, fontSize: '1.25rem' }}>
                    {Math.round(hoursTotalYear).toLocaleString()} hrs
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(3, minmax(0,1fr))', marginTop: 10 }}>
                <div>
                  <div style={{ fontSize: '.8rem', opacity: .95, fontWeight: 800 }}>Productivity value / month</div>
                  <div style={{ fontWeight: 900, fontSize: '1.25rem' }}>{money(monthlyProd)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '.8rem', opacity: .95, fontWeight: 800 }}>Productivity value / year</div>
                  <div style={{ fontWeight: 900, fontSize: '1.25rem' }}>{money(annualProd)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '.8rem', opacity: .95, fontWeight: 800 }}>Maturity level</div>
                  <div style={{ fontWeight: 900, fontSize: '1.25rem' }}>{maturityScore}/10</div>
                </div>
              </div>
            </div>
          </div>

          <div style={centerRow}>
            <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-primary" onClick={() => setStep(3)}>Continue →</button>
          </div>
        </div>
      )}

      {/* STEP 3: Retention */}
      {step === 3 && (
        <div className="card">
          <h3>
            <IconPeople /> Retention
          </h3>
          <div style={grid1}>
            <NumberField
              label="Baseline annual turnover (%)"
              value={baselineTurnoverPct}
              onChange={setBaselineTurnoverPct}
              min={0}
              step={1}
              suffix="%"
              hint="Typical ranges: 15–30% depending on team."
            />
            <NumberField
              label="Expected improvement (%)"
              value={turnoverImprovementPct}
              onChange={setTurnoverImprovementPct}
              min={0}
              step={1}
              suffix="%"
              hint="Relative reduction. 10% means 20% → 18% turnover."
            />
            <NumberField
              label="Replacement cost as % of salary"
              value={Math.round(replacementCostFactor * 100)}
              onChange={(v) => setReplacementCostFactor((v || 0) / 100)}
              min={0}
              step={5}
              suffix="%"
              hint="Common rule: ~50% of salary."
            />
          </div>
          <div style={centerRow}>
            <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
            <button className="btn btn-primary" onClick={() => setStep(4)}>Continue →</button>
          </div>
        </div>
      )}

      {/* STEP 4: Training & Duration */}
      {step === 4 && (
        <div className="card">
          <h3>
            <IconMoney /> Training & Duration
          </h3>
          <div style={grid1}>
            <NumberField
              label={`Training per employee (${S})`}
              value={trainingPerEmployee}
              onChange={setTrainingPerEmployee}
              step={25}
            />
            <NumberField
              label={`Average annual salary (${S})`}
              value={avgSalary}
              onChange={setAvgSalary}
              step={1000}
            />
            <NumberField
              label="Program duration (months)"
              value={durationMonths}
              onChange={setDurationMonths}
              min={1}
              step={1}
            />
          </div>
          <div style={centerRow}>
            <button className="btn btn-ghost" onClick={() => setStep(3)}>← Back</button>
            <button className="btn btn-primary" onClick={() => setStep(5)}>Continue →</button>
          </div>
        </div>
      )}

      {/* STEP 5: Results */}
      {step === 5 && (
        <div className="card">
          <h3>Results</h3>
          <div className="kpi-grid">
            <div className="kpi">
              <div className="title">Monthly savings</div>
              <div className="value">{money(res.monthlySavings)}</div>
            </div>
            <div className="kpi">
              <div className="title">Annual ROI</div>
              <div className="value">{res.roiMultiple.toFixed(1)}×</div>
            </div>
            <div className="kpi">
              <div className="title">Payback</div>
              <div className="value">
                {isFinite(res.paybackMonths) ? `${res.paybackMonths.toFixed(1)} mo` : '—'}
              </div>
            </div>
            <div className="kpi">
              <div className="title">Hours saved / year</div>
              <div className="value">{Math.round(res.hoursTotalYear).toLocaleString()}</div>
            </div>
            <div className="kpi">
              <div className="title">Retention value</div>
              <div className="value">{money(res.retentionValue)}</div>
            </div>
          </div>

          <p className="help" style={{ marginTop: 10 }}>
            Focus areas: {pains.length ? pains.join(', ') : '— none selected'}. Maturity {maturityScore}/10.
          </p>

          <NextSteps pains={pains} />

          <div style={{ ...centerRow, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={openPrintView}>Open Print View / PDF</button>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-light" onClick={downloadCSV}>Download CSV</button>
              <button className="btn btn-ghost" onClick={copyShareLink}>Copy Share Link</button>
              <button className="btn btn-ghost" onClick={() => setStep(1)}>Start over</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
