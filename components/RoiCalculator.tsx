'use client';
import { useMemo, useState } from 'react';
import { ChipGroup, MultiChipGroup, NumberRow, PercentRow, StepHeader } from './ui';
import {
  Persona, Pain, Maturity, maturityPresets,
  GlobalInputs, ProgramInputs, PainInputs, calcAllMulti
} from '../lib/model';

const CURRENCY = '€';
const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('en', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

export function RoiCalculator() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Persona
  const [persona, setPersona] = useState<Persona>('head_ld');
  const personaOptions = [
    { label: 'Head of L&D', value: 'head_ld' as const },
    { label: 'CHRO', value: 'chro' as const },
    { label: 'People Ops', value: 'people_ops' as const },
    { label: 'COO / Transformation', value: 'coo' as const },
    { label: 'CX Lead', value: 'cx_lead' as const },
    { label: 'Marketing Lead', value: 'mkt_lead' as const },
  ];
  const personaDefault: Record<Persona, Pain[]> = {
    head_ld: ['upskilling'],
    chro: ['retention'],
    people_ops: ['engagement'],
    coo: ['productivity'],
    cx_lead: ['quality'],
    mkt_lead: ['productivity'],
  };

  // Areas to improve (multi, max 3)
  const painOptions = [
    { label: 'Staff retention', value: 'retention' as const },
    { label: 'Upskilling velocity', value: 'upskilling' as const },
    { label: 'Employee engagement', value: 'engagement' as const },
    { label: 'Productivity / velocity', value: 'productivity' as const },
    { label: 'Quality & rework', value: 'quality' as const },
    { label: 'Hiring deferral', value: 'hiring' as const },
  ];
  const [pains, setPains] = useState<Pain[]>(personaDefault[persona]);

  function onPersonaChange(v: Persona) {
    setPersona(v);
    setPains(personaDefault[v]);
  }

  // Global inputs
  const [employees, setEmployees] = useState(200);
  const [trainPercent, setTrainPercent] = useState(70);
  const [hourlyCost, setHourlyCost] = useState(35);
  const [weeklyHours, setWeeklyHours] = useState(40);
  const [repetitiveTimePct, setRepetitiveTimePct] = useState(30);
  const g: GlobalInputs = { employees, trainPercent, hourlyCost, weeklyHours, repetitiveTimePct };

  // Maturity
  const [maturity, setMaturity] = useState<Maturity>('medium');
  const maturityParams = useMemo(() => maturityPresets(maturity), [maturity]);

  // Program inputs
  const [adoptionRatePct, setAdoptionRatePct] = useState(80);
  const [productivityGainPct, setProductivityGainPct] = useState(25);
  const [trainingCostPerEmployee, setTrainingCostPerEmployee] = useState(850);
  const [platformSpendMonthly, setPlatformSpendMonthly] = useState(0);
  const [durationMonths, setDurationMonths] = useState(3);
  const prog: ProgramInputs = {
    adoptionRatePct, productivityGainPct, trainingCostPerEmployee, platformSpendMonthly, durationMonths
  };

  // Pain-specific inputs (stored per pain)
  const [painInputs, setPainInputs] = useState<Record<Pain, PainInputs>>({
    retention: {
      baselineAttritionPct: 16, attritionImprovementPts: 3, replacementCostFactor: 0.6,
      annualSalary: Math.round(hourlyCost * weeklyHours * 52),
    },
    upskilling: { ttcWeeksNow: 8, ttcWeeksTarget: 6, hiresOrMovesPerYear: 60 },
    engagement: { eNPSLiftPts: 8, attritionPtsPer10Enps: 2, baselineAttritionPct: 16, replacementCostFactor: 0.6 },
    quality: { reworkRatePct: 15, reworkReductionPct: 20, costPerRework: 50, unitsPerPersonMonth: 20 },
    hiring: { hiresAvoided: 5, fullyLoadedSalary: 60000 },
    productivity: {}, // uses global+program fields
  });

  const updatePain = (k: Pain, delta: Partial<PainInputs>) =>
    setPainInputs((prev) => ({ ...prev, [k]: { ...prev[k], ...delta } }));

  // Results (sum over selected pains)
  const res = useMemo(
    () => calcAllMulti(g, maturityParams, prog, pains, painInputs),
    [g, maturityParams, prog, pains, painInputs]
  );

  // UI blocks for per-pain inputs
  function PainBlock(pain: Pain) {
    const p = painInputs[pain] ?? {};
    switch (pain) {
      case 'retention':
        return (
          <div className="grid md:grid-cols-2 gap-4">
            <PercentRow label="Baseline attrition (%)" value={p.baselineAttritionPct ?? 16}
              onChange={(v) => updatePain('retention', { baselineAttritionPct: v })} min={5} max={35} />
            <NumberRow label="Expected change (points)" value={p.attritionImprovementPts ?? 2}
              onChange={(v) => updatePain('retention', { attritionImprovementPts: v })} step={0.5} />
            <NumberRow label="Replacement cost factor (× salary)" value={p.replacementCostFactor ?? 0.6}
              onChange={(v) => updatePain('retention', { replacementCostFactor: v })} step={0.1} />
            <NumberRow label={`Average annual salary (${CURRENCY})`} value={p.annualSalary ?? Math.round(hourlyCost * weeklyHours * 52)}
              onChange={(v) => updatePain('retention', { annualSalary: v })} step={1000} />
          </div>
        );
      case 'upskilling':
        return (
          <div className="grid md:grid-cols-3 gap-4">
            <NumberRow label="Time to competency now (weeks)" value={p.ttcWeeksNow ?? 8}
              onChange={(v) => updatePain('upskilling', { ttcWeeksNow: v })} step={0.5} />
            <NumberRow label="Target after training (weeks)" value={p.ttcWeeksTarget ?? 6}
              onChange={(v) => updatePain('upskilling', { ttcWeeksTarget: v })} step={0.5} />
            <NumberRow label="Hires/promotions per year" value={p.hiresOrMovesPerYear ?? 60}
              onChange={(v) => updatePain('upskilling', { hiresOrMovesPerYear: v })} />
          </div>
        );
      case 'engagement':
        return (
          <div className="grid md:grid-cols-2 gap-4">
            <NumberRow label="eNPS lift (points)" value={p.eNPSLiftPts ?? 8}
              onChange={(v) => updatePain('engagement', { eNPSLiftPts: v })} />
            <NumberRow label="Attrition points per +10 eNPS" value={p.attritionPtsPer10Enps ?? 2}
              onChange={(v) => updatePain('engagement', { attritionPtsPer10Enps: v })} step={0.5} />
          </div>
        );
      case 'quality':
        return (
          <div className="grid md:grid-cols-2 gap-4">
            <PercentRow label="Rework rate (%)" value={p.reworkRatePct ?? 15}
              onChange={(v) => updatePain('quality', { reworkRatePct: v })} />
            <PercentRow label="Rework reduction after training (%)" value={p.reworkReductionPct ?? 20}
              onChange={(v) => updatePain('quality', { reworkReductionPct: v })} />
            <NumberRow label={`Cost per rework (${CURRENCY})`} value={p.costPerRework ?? 50}
              onChange={(v) => updatePain('quality', { costPerRework: v })} step={5} />
            <NumberRow label="Units per person per month" value={p.unitsPerPersonMonth ?? 20}
              onChange={(v) => updatePain('quality', { unitsPerPersonMonth: v })} />
          </div>
        );
      case 'hiring':
        return (
          <div className="grid md:grid-cols-2 gap-4">
            <NumberRow label="Hires avoided (count)" value={p.hiresAvoided ?? 5}
              onChange={(v) => updatePain('hiring', { hiresAvoided: v })} />
            <NumberRow label={`Fully-loaded salary per avoided hire (${CURRENCY})`} value={p.fullyLoadedSalary ?? 60000}
              onChange={(v) => updatePain('hiring', { fullyLoadedSalary: v })} step={1000} />
          </div>
        );
      case 'productivity':
      default:
        return (
          <div className="grid md:grid-cols-2 gap-4">
            <PercentRow label="Expected adoption among trained (%)" value={adoptionRatePct}
              onChange={setAdoptionRatePct} min={50} max={100} />
            <PercentRow label="Productivity gain among adopters (%)" value={productivityGainPct}
              onChange={setProductivityGainPct} min={10} max={40} />
          </div>
        );
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <StepHeader current={step} />

      {/* Step 1 — Persona & global */}
      {step === 1 && (
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-semibold">Who are you?</h3>
          <ChipGroup value={persona} onChange={onPersonaChange} options={personaOptions} />
          <div className="grid md:grid-cols-2 gap-4 pt-2">
            <NumberRow label="Employees in scope" value={employees} onChange={setEmployees} min={1} />
            <PercentRow label="Planned training coverage (%)" value={trainPercent} onChange={setTrainPercent} min={10} max={100} />
            <NumberRow label={`Avg hourly cost (${CURRENCY})`} value={hourlyCost} onChange={setHourlyCost} min={0} />
            <NumberRow label="Weekly hours" value={weeklyHours} onChange={setWeeklyHours} min={20} step={1} />
            <PercentRow label="Time on repetitive/admin work (%)" value={repetitiveTimePct} onChange={setRepetitiveTimePct} min={10} max={60} />
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={() => setStep(2)}>Continue → Areas</button>
          </div>
        </div>
      )}

      {/* Step 2 — Areas to improve (multi) */}
      {step === 2 && (
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-semibold">Areas to improve (pick up to 3)</h3>
          <MultiChipGroup values={pains} onChange={setPains} options={painOptions} max={3} />
          <p className="help">Tip: Focus on the top 1–2 priorities for a credible pilot; you can add more later.</p>
          <div className="flex gap-2">
            <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-primary" onClick={() => setStep(3)} disabled={pains.length === 0}>
              Continue → Inputs
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Inputs (maturity + per-selected area) */}
      {step === 3 && (
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-semibold">Inputs</h3>
          <div>
            <div className="label mb-2">Current AI usage (maturity)</div>
            <div className="mb-2">
              <ChipGroup
                value={maturity}
                onChange={setMaturity}
                options={[
                  { label: 'Low', value: 'low' as const },
                  { label: 'Medium', value: 'medium' as const },
                  { label: 'High', value: 'high' as const },
                ]}
              />
            </div>
            <p className="help">We only count incremental gains beyond today’s baseline.</p>
          </div>

          {/* Core program inputs (shown once) */}
          <div className="grid md:grid-cols-3 gap-4">
            <PercentRow label="Expected adoption among trained (%)" value={adoptionRatePct} onChange={setAdoptionRatePct} min={50} max={100} />
            <PercentRow label="Productivity gain among adopters (%)" value={productivityGainPct} onChange={setProductivityGainPct} min={10} max={40} />
            <NumberRow label={`Training cost per employee (${CURRENCY})`} value={trainingCostPerEmployee} onChange={setTrainingCostPerEmployee} min={0} step={25} />
            <NumberRow label={`Additional platform spend / month (${CURRENCY})`} value={platformSpendMonthly} onChange={setPlatformSpendMonthly} min={0} step={50} />
            <NumberRow label="Program duration (months)" value={durationMonths} onChange={setDurationMonths} min={1} step={1} />
          </div>

          {/* Per-selected area inputs */}
          <div className="space-y-6 pt-2">
            {pains.map((pain) => (
              <div key={pain} className="space-y-2">
                <h4 className="font-semibold capitalize">{pain.replace('_', ' ')}</h4>
                {PainBlock(pain)}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
            <button className="btn btn-primary" onClick={() => setStep(4)}>Calculate Results →</button>
          </div>
        </div>
      )}

      {/* Step 4 — Results (stacked by driver) */}
      {step === 4 && (
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-semibold">Results</h3>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="card p-4"><div className="text-xs text-neutral-500">Monthly savings</div><div className="text-lg font-semibold">{fmtCurrency(res.monthlySavings)}</div></div>
            <div className="card p-4"><div className="text-xs text-neutral-500">Payback</div><div className="text-lg font-semibold">{isFinite(res.paybackMonths) ? `${res.paybackMonths.toFixed(1)} mo` : '—'}</div></div>
            <div className="card p-4"><div className="text-xs text-neutral-500">Annual ROI</div><div className="text-lg font-semibold">{res.roiMultiple.toFixed(1)}×</div></div>
            <div className="card p-4"><div className="text-xs text-neutral-500">Hours saved / person / week</div><div className="text-lg font-semibold">{res.hoursSavedPerPersonWeek.toFixed(1)} hrs</div></div>
            <div className="card p-4"><div className="text-xs text-neutral-500">AAC (AI-adjusted contribution)</div><div className="text-lg font-semibold">+{res.aacLiftPct.toFixed(0)}%</div></div>
          </div>

          <div className="grid md:grid-cols-4 gap-3">
            <div className="card p-3"><div className="text-xs text-neutral-500">Time</div><div className="text-lg font-semibold">{fmtCurrency(res.timeDividend)}</div></div>
            <div className="card p-3"><div className="text-xs text-neutral-500">Quality</div><div className="text-lg font-semibold">{fmtCurrency(res.qualityDividend)}</div></div>
            <div className="card p-3"><div className="text-xs text-neutral-500">Retention</div><div className="text-lg font-semibold">{fmtCurrency(res.retentionDividend)}</div></div>
            <div className="card p-3"><div className="text-xs text-neutral-500">Hiring deferral</div><div className="text-lg font-semibold">{fmtCurrency(res.hiringDividend)}</div></div>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div className="card p-3"><div className="text-xs text-neutral-500">Training investment</div><div className="text-lg font-semibold">{fmtCurrency(res.trainingInvestment)}</div></div>
            <div className="card p-3"><div className="text-xs text-neutral-500">Platform spend (annual)</div><div className="text-lg font-semibold">{fmtCurrency(res.platformInvestment)}</div></div>
            <div className="card p-3"><div className="text-xs text-neutral-500">Total investment</div><div className="text-lg font-semibold">{fmtCurrency(res.totalInvestment)}</div></div>
          </div>

          <div className="text-xs text-neutral-500">
            Top driver: <strong>{res.topDriver.label}</strong> ({Math.round(res.topDriver.share * 100)}% of value)
          </div>

          <div className="flex gap-2 pt-2">
            <button className="btn btn-ghost" onClick={() => setStep(3)}>← Back</button>
            <button className="btn btn-primary" onClick={() => setStep(1)}>Start over</button>
          </div>
        </div>
      )}
    </div>
  );
}
