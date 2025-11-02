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
import {
  CurrencySelect,
  MultiPick,
  NumberField,
} from './controls';
import NextSteps from './NextSteps';
import {
  IconTeam,
  IconGauge,
  IconMoney,
  IconClock,
  IconPeople,
  IconSpark,
} from './icons';

const PAIN_OPTS: { label: string; value: Pain }[] = [
  { label: 'Staff retention', value: 'retention' },
  { label: 'Employee engagement', value: 'engagement' },
  { label: 'Output quality / rework', value: 'quality' },
  { label: 'Throughput / cycle time', value: 'throughput' },
  { label: 'Onboarding speed', value: 'onboarding' },
  { label: 'Cost reduction', value: 'cost' },
];

const TEAMS: { label: string; value: Team }[] = [
  { label: 'HR / People Ops', value: 'hr' },
  { label: 'Operations', value: 'ops' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Sales', value: 'sales' },
  { label: 'Customer Support', value: 'support' },
  { label: 'Product', value: 'product' },
];

function suggestHours(team: Team, maturityScore: number): number {
  const base = teamPresets(team).hours;
  let m = 1.0;
  if (maturityScore <= 3) m = 1.25;
  else if (maturityScore <= 6) m = 1.0;
  else if (maturityScore <= 8) m = 0.75;
  else m = 0.55;
  return Math.max(0, Math.round((base * m) * 2) / 2);
}

function maturitySummary(score: number): string {
  const v = Math.round(score);
  if (v <= 2) return 'Little or no employees using AI for tasks; no guidance or policy.';
  if (v <= 4) return 'A few individuals experiment; ad-hoc wins; no shared prompts.';
  if (v <= 6) return 'Some teams using AI weekly; early playbooks; limited measurement.';
  if (v <= 8) return 'AI embedded in key workflows; prompt libraries; KPIs tracked monthly.';
  return 'AI fully embedded across workflows; champions network; ROI reviewed quarterly.';
}

export function RoiCalculator() {
  const [step, setStep] = useState(1);

  // currency & team
  const [currency, setCurrency] = useState<Currency>('EUR');
  const [team, setTeam] = useState<Team>('hr');

  // maturity + productivity (merged)
  const [maturityScore, setMaturityScore] = useState<number>(5);
  const [hoursSavedPerWeek, setHoursSavedPerWeek] = useState<number>(3);
  const userTouchedHours = useRef(false);

  // size & cost
  const [employees, setEmployees] = useState<number>(150);
  const [avgSalary, setAvgSalary] = useState<number>(52000);

  // retention (clear inputs)
  const [baselineTurnoverPct, setBaselineTurnoverPct] = useState<number>(teamPresets('hr').baselineTurnoverPct);
  const [turnoverImprovementPct, setTurnoverImprovementPct] = useState<number>(10);
  const [replacementCostFactor, setReplacementCostFactor] = useState<number>(0.5);

  // pain points
  const [pains, setPains] = useState<Pain[]>([]);

  // training
  const [trainingPerEmployee, setTrainingPerEmployee] = useState<number>(850);
  const [durationMonths, setDurationMonths] = useState<number>(3);

  useEffect(() => {
    if (!userTouchedHours.current) setHoursSavedPerWeek(suggestHours(team, maturityScore));
    setBaselineTurnoverPct(teamPresets(team).baselineTurnoverPct);
  }, [team]);

  useEffect(() => {
    if (!userTouchedHours.current) {
      setHoursSavedPerWeek(suggestHours(team, maturityScore));
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

  const Stepper = () => {
    const labels = [
      'Basics',
      'Maturity + Productivity',
      'Team & Cost',
      'Retention',
      'Focus',
      'Training',
      'Duration',
      'Results',
    ];
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

  const MaturityScale = () => (
    <div>
      <label className="label">AI Maturity (1–10)</label>
      <div className="maturity-scale">
        {Array.from({ length: 10 }).map((_, i) => {
          const val = i + 1;
          const active = val === maturityScore;
          return (
            <button
              key={val}
              type="button"
              className={`n ${active ? 'active' : ''}`}
              onClick={() => setMaturityScore(val)}
              aria-label={`Maturity ${val}`}
            >
              {val}
            </button>
          );
        })}
      </div>
      <p className="help" style={{ marginTop: 6 }}>{maturitySummary(maturityScore)}</p>
    </div>
  );

  return (
    <div className="section container">
      <Stepper />

      {/* 1 BASICS */}
      {step === 1 && (
        <div className="card">
          <h3>
            <IconTeam /> Basics
          </h3>
          <div
            style={{
              display: 'grid',
              gap: 12,
              gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
            }}
          >
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
              <p className="help">
                We load sensible defaults per team (time-saved & turnover baseline).
              </p>
            </div>
            <CurrencySelect value={currency} onChange={setCurrency} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn btn-primary" onClick={() => setStep(2)}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* 2 MATURITY + PRODUCTIVITY (merged) */}
      {step === 2 && (
        <div className="card">
          <h3>
            <IconGauge /> AI maturity &nbsp; <IconClock /> Productivity
          </h3>
          <div style={{display:'grid', gap:14, gridTemplateColumns:'1.2fr 1fr'}}>
            <div>
              <MaturityScale />
            </div>
            <div>
              <NumberField
                label="Hours saved per person per week"
                value={hoursSavedPerWeek}
                onChange={(n) => { userTouchedHours.current = true; setHoursSavedPerWeek(n); }}
                min={0}
                step={0.5}
                suffix="hrs/week"
                hint="Auto-suggested from maturity + team. You can override."
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn btn-ghost" onClick={() => setStep(1)}>
              ← Back
            </button>
            <button className="btn btn-primary" onClick={() => setStep(3)}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* 3 TEAM & COST */}
      {step === 3 && (
        <div className="card">
          <h3>
            <IconMoney /> Team size & cost
          </h3>
          <div
            style={{
              display: 'grid',
              gap: 12,
              gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
            }}
          >
            <NumberField
              label="Employees in scope"
              value={employees}
              onChange={setEmployees}
              min={1}
            />
            <NumberField
              label={`Average annual salary (${S})`}
              value={avgSalary}
              onChange={setAvgSalary}
              step={1000}
            />
          </div>
          <p className="help" style={{ marginTop: 8 }}>
            If multiple teams, use weighted averages.
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn btn-ghost" onClick={() => setStep(2)}>
              ← Back
            </button>
            <button className="btn btn-primary" onClick={() => setStep(4)}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* 4 RETENTION */}
      {step === 4 && (
        <div className="card">
          <h3>
            <IconPeople /> Retention impact
          </h3>
          <div style={{display:'grid', gap:12, gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))'}}>
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
              hint="Common rule: ~50% of salary (recruiting, onboarding, lost productivity)."
            />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn btn-ghost" onClick={() => setStep(3)}>
              ← Back
            </button>
            <button className="btn btn-primary" onClick={() => setStep(5)}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* 5 FOCUS AREAS */}
      {step === 5 && (
        <div className="card">
          <h3>
            <IconSpark /> Primary focus areas (up to 3)
          </h3>
          <MultiPick<Pain>
            values={pains}
            onChange={setPains}
            options={PAIN_OPTS}
            max={3}
          />
          <p className="help" style={{ marginTop: 6 }}>
            We’ll tailor the summary and next steps to these priorities.
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn btn-ghost" onClick={() => setStep(4)}>
              ← Back
            </button>
            <button className="btn btn-primary" onClick={() => setStep(6)}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* 6 TRAINING */}
      {step === 6 && (
        <div className="card">
          <h3>
            <IconMoney /> Training plan
          </h3>
          <div
            style={{
              display: 'grid',
              gap: 12,
              gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
            }}
          >
            <NumberField
              label={`Training per employee (${S})`}
              value={trainingPerEmployee}
              onChange={setTrainingPerEmployee}
              step={25}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn btn-ghost" onClick={() => setStep(5)}>
              ← Back
            </button>
            <button className="btn btn-primary" onClick={() => setStep(7)}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* 7 DURATION */}
      {step === 7 && (
        <div className="card">
          <h3>
            <IconClock /> Duration
          </h3>
          <NumberField
            label="Program duration (months)"
            value={durationMonths}
            onChange={setDurationMonths}
            min={1}
            step={1}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn btn-ghost" onClick={() => setStep(6)}>
              ← Back
            </button>
            <button className="btn btn-primary" onClick={() => setStep(8)}>
              Calculate →
            </button>
          </div>
        </div>
      )}

      {/* 8 RESULTS */}
      {step === 8 && (
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
                {isFinite(res.paybackMonths)
                  ? `${res.paybackMonths.toFixed(1)} mo`
                  : '—'}
              </div>
            </div>
            <div className="kpi">
              <div className="title">Hours saved / year</div>
              <div className="value">
                {Math.round(res.hoursTotalYear).toLocaleString()}
              </div>
            </div>
            <div className="kpi">
              <div className="title">Retention value</div>
              <div className="value">{money(res.retentionValue)}</div>
            </div>
          </div>

          <p className="help" style={{ marginTop: 10 }}>
            Focus areas: {pains.length ? pains.join(', ') : '— none selected'}.
            Maturity {maturityScore}/10 →{' '}
            {maturityScore <= 4 ? 'high headroom' : 'moderate gains'}.
          </p>

          <NextSteps pains={pains} />

          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={openPrintView}>
              Open Print View / PDF
            </button>
            <button className="btn btn-light" onClick={downloadCSV}>
              Download CSV
            </button>
            <button className="btn btn-ghost" onClick={copyShareLink}>
              Copy Share Link
            </button>
            <button className="btn btn-ghost" onClick={() => setStep(1)}>
              Start over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
