'use client';
import { useMemo, useState } from 'react';
import { ChipGroup, NumberRow, PercentRow, StepHeader } from './ui';
import { LiveSummary } from './LiveSummary';
import {
  Persona,
  Pain,
  Maturity,
  maturityPresets,
  GlobalInputs,
  ProgramInputs,
  PainInputs,
  calcAll,
} from '../lib/model';

const CURRENCY = '€';
const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('en', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

export function RoiCalculator() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1 — Persona
  const [persona, setPersona] = useState<Persona>('head_ld');
  const personaOptions: { label: string; value: Persona }[] = [
    { label: 'Head of L&D', value: 'head_ld' },
    { label: 'CHRO', value: 'chro' },
    { label: 'People Ops', value: 'people_ops' },
    { label: 'COO / Transformation', value: 'coo' },
    { label: 'CX Lead', value: 'cx_lead' },
    { label: 'Marketing Lead', value: 'mkt_lead' },
  ];

  // Step 2 — Pain
  const [pain, setPain] = useState<Pain>('productivity');
  const painOptions: { label: string; value: Pain }[] = [
    { label: 'Staff retention', value: 'retention' },
    { label: 'Upskilling velocity', value: 'upskilling' },
    { label: 'Employee engagement', value: 'engagement' },
    { label: 'Productivity / velocity', value: 'productivity' },
    { label: 'Quality & rework', value: 'quality' },
    { label: 'Hiring deferral', value: 'hiring' },
  ];

  // Defaults nudged by persona
  const defaultPainByPersona: Record<Persona, Pain> = {
    head_ld: 'upskilling',
    chro: 'retention',
    people_ops: 'engagement',
    coo: 'productivity',
    cx_lead: 'quality',
    mkt_lead: 'productivity',
  };

  // Step 3 — Inputs (global + maturity + program + pain-specific)
  // Global
  const [employees, setEmployees] = useState(200);
  const [trainPercent, setTrainPercent] = useState(70);
  const [hourlyCost, setHourlyCost] = useState(35);
  const [weeklyHours, setWeeklyHours] = useState(40);
  const [repetitiveTimePct, setRepetitiveTimePct] = useState(30);

  const g: GlobalInputs = { employees, trainPercent, hourlyCost, weeklyHours, repetitiveTimePct };

  // Maturity
  const [maturity, setMaturity] = useState<Maturity>('medium');
  const maturityParams = useMemo(() => maturityPresets(maturity), [maturity]);

  // Program
  const [adoptionRatePct, setAdoptionRatePct] = useState(80);
  const [productivityGainPct, setProductivityGainPct] = useState(25);
  const [trainingCostPerEmployee, setTrainingCostPerEmployee] = useState(850);
  const [platformSpendMonthly, setPlatformSpendMonthly] = useState(0);
  const [durationMonths, setDurationMonths] = useState(3);

  const prog: ProgramInputs = {
    adoptionRatePct,
    productivityGainPct,
    trainingCostPerEmployee,
    platformSpendMonthly,
    durationMonths,
  };

  // Pain-specific
  const [p, setP] = useState<PainInputs>({
    // retention
    baselineAttritionPct: 16,
    attritionImprovementPts: 3,
    replacementCostFactor: 0.6,
    annualSalary: Math.round(hourlyCost * weeklyHours * 52),

    // upskilling
    ttcWeeksNow: 8,
    ttcWeeksTarget: 6,
    hiresOrMovesPerYear: 60,

    // engagement
    eNpsLiftPts: 8,
    attritionPtsPer10Enps: 2,

    // quality
    reworkRatePct: 15,
    reworkReductionPct: 20,
    costPerRework: 50,
    unitsPerPersonMonth: 20,

    // hiring
    hiresAvoided: 5,
    fullyLoadedSalary: 60000,
  });

  // React to persona changes with a default pain
  function onPersonaChange(v: Persona) {
    setPersona(v);
    setPain(defaultPainByPersona[v]);
  }

  // Results (always compute -> right-rail is live)
  const res = useMemo(() => calcAll(g, maturityParams, prog, pain, p), [g, maturityParams, prog, pain, p]);

  const trainedEmployees = Math.round(employees * (trainPercent / 100));
  const trainingCostTotal = trainedEmployees * trainingCostPerEmployee;

  // Pain-specific input blocks
  function PainBlock() {
    switch (pain) {
      case 'retention':
        return (
          <div className="grid md:grid-cols-2 gap-4">
            <PercentRow
              label="Baseline attrition (%)"
              value={p.baselineAttritionPct ?? 16}
              onChange={(v) => setP({ ...p, baselineAttritionPct: v })}
              min={5}
              max={35}
            />
            <NumberRow
              label="Expected change (points)"
              value={p.attritionImprovementPts ?? 2}
              onChange={(v) => setP({ ...p, attritionImprovementPts: v })}
              step={0.5}
              hint="Reduction in attrition percentage points after training."
            />
            <NumberRow
              label="Replacement cost factor (× annual salary)"
              value={p.replacementCostFactor ?? 0.6}
              onChange={(v) => setP({ ...p, replacementCostFactor: v })}
              step={0.1}
            />
            <NumberRow
              label={`Average annual salary (${CURRENCY})`}
              value={p.annualSalary ?? Math.round(hourlyCost * weeklyHours * 52)}
              onChange={(v) => setP({ ...p, annualSalary: v })}
              step={1000}
            />
          </div>
        );
      case 'upskilling':
        return (
          <div className="grid md:grid-cols-3 gap-4">
            <NumberRow
              label="Time to competency now (weeks)"
              value={p.ttcWeeksNow ?? 8}
              onChange={(v) => setP({ ...p, ttcWeeksNow: v })}
              step={0.5}
            />
            <NumberRow
              label="Target after training (weeks)"
              value={p.ttcWeeksTarget ?? 6}
              onChange={(v) => setP({ ...p, ttcWeeksTarget: v })}
              step={0.5}
            />
            <NumberRow
              label="Hires/promotions per year"
              value={p.hiresOrMovesPerYear ?? 60}
              onChange={(v) => setP({ ...p, hiresOrMovesPerYear: v })}
            />
          </div>
        );
      case 'engagement':
        return (
          <div className="grid md:grid-cols-2 gap-4">
            <NumberRow
              label="eNPS lift (points)"
              value={p.eNpsLiftPts ?? 8}
              onChange={(v) => setP({ ...p, eNpsLiftPts: v })}
            />
            <NumberRow
              label="Attrition points per +10 eNPS"
              value={p.attritionPtsPer10Enps ?? 2}
              onChange={(v) => setP({ ...p, attritionPtsPer10Enps: v })}
              step={0.5}
              hint="Correlation used to convert eNPS lift into attrition reduction."
            />
          </div>
        );
      case 'quality':
        return (
          <div className="grid md:grid-cols-2 gap-4">
            <PercentRow
              label="Rework rate (%)"
              value={p.reworkRatePct ?? 15}
              onChange={(v) => setP({ ...p, reworkRatePct: v })}
            />
            <PercentRow
              label="Rework reduction after training (%)"
              value={p.reworkReductionPct ?? 20}
              onChange={(v) => setP({ ...p, reworkReductionPct: v })}
            />
            <NumberRow
              label={`Cost per rework (${CURRENCY})`}
              value={p.costPerRework ?? 50}
              onChange={(v) => setP({ ...p, costPerRework: v })}
              step={5}
            />
            <NumberRow
              label="Units per person per month"
              value={p.unitsPerPersonMonth ?? 20}
              onChange={(v) => setP({ ...p, unitsPerPersonMonth: v })}
            />
          </div>
        );
      case 'hiring':
        return (
          <div className="grid md:grid-cols-2 gap-4">
            <NumberRow
              label="Hires avoided (count)"
              value={p.hiresAvoided ?? 5}
              onChange={(v) => setP({ ...p, hiresAvoided: v })}
            />
            <NumberRow
              label={`Fully-loaded salary per avoided hire (${CURRENCY})`}
              value={p.fullyLoadedSalary ?? 60000}
              onChange={(v) => setP({ ...p, fullyLoadedSalary: v })}
              step={1000}
            />
          </div>
        );
      case 'productivity':
      default:
        return (
          <div className="grid md:grid-cols-2 gap-4">
            <PercentRow
              label="Expected adoption among trained (%)"
              value={adoptionRatePct}
              onChange={setAdoptionRatePct}
              min={50}
              max={100}
              hint="Share of trained employees using AI workflows weekly post-training."
            />
            <PercentRow
              label="Productivity gain among adopters (%)"
              value={productivityGainPct}
              onChange={setProductivityGainPct}
              min={10}
              max={40}
              hint="Conservative range 15–25%. Model caps effective savings for credibility."
            />
          </div>
        );
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      <div className="space-y-5">
        <StepHeader current={step} />

        {/* Step 1 — Persona */}
        {step === 1 && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card p-6 space-y-4">
              <h3 className="text-lg font-semibold">Who are you?</h3>
              <ChipGroup value={persona} onChange={onPersonaChange} options={personaOptions} />
              <div className="grid md:grid-cols-2 gap-4 pt-2">
                <NumberRow label="Employees in scope" value={employees} onChange={setEmployees} min={1} />
                <PercentRow
                  label="Planned training coverage (%)"
                  value={trainPercent}
                  onChange={setTrainPercent}
                  min={10}
                  max={100}
                />
                <NumberRow label={`Avg hourly cost (${CURRENCY})`} value={hourlyCost} onChange={setHourlyCost} min={0} />
                <NumberRow label="Weekly hours" value={weeklyHours} onChange={setWeeklyHours} min={20} step={1} />
                <PercentRow
                  label="Time on repetitive/admin work (%)"
                  value={repetitiveTimePct}
                  onChange={setRepetitiveTimePct}
                  min={10}
                  max={60}
                />
              </div>
              <div className="flex gap-2">
                <button className="btn btn-primary" onClick={() => setStep(2)}>
                  Continue → Pain
                </button>
              </div>
            </div>

            <div className="card p-6 space-y-2">
              <h4 className="font-semibold">Make it your story</h4>
              <p className="text-sm text-neutral-700">
                Select your role and biggest pain. We’ll tailor inputs and show the **AI Dividend** in terms a CFO will
                love — Time, Quality, Retention, Hiring — plus ROI and payback.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="card p-3">
                  <div className="text-xs text-neutral-500">Trained in program</div>
                  <div className="text-lg font-semibold">{Math.round(employees * (trainPercent / 100)).toLocaleString()}</div>
                </div>
                <div className="card p-3">
                  <div className="text-xs text-neutral-500">Training cost (est.)</div>
                  <div className="text-lg font-semibold">
                    {fmtCurrency(Math.round(employees * (trainPercent / 100)) * trainingCostPerEmployee)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Pain */}
        {step === 2 && (
          <div className="card p-6 space-y-4">
            <h3 className="text-lg font-semibold">What’s the primary pain?</h3>
            <ChipGroup value={pain} onChange={setPain} options={painOptions} />
            <div className="flex gap-2">
              <button className="btn btn-ghost" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button className="btn btn-primary" onClick={() => setStep(3)}>
                Continue → Inputs
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Inputs (maturity + tailored block) */}
        {step === 3 && (
          <div className="card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Inputs</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <div className="label mb-2">Current AI usage (maturity)</div>
                <ChipGroup
                  value={maturity}
                  onChange={setMaturity}
                  options={[
                    { label: 'Low', value: 'low' },
                    { label: 'Medium', value: 'medium' },
                    { label: 'High', value: 'high' },
                  ]}
                />
                <p className="help mt-1">
                  We only attribute <em>incremental</em> gains beyond today’s baseline to the training program.
                </p>
              </div>

              {/* Program core (always shown) */}
              <PercentRow
                label="Expected adoption among trained (%)"
                value={adoptionRatePct}
                onChange={setAdoptionRatePct}
                min={50}
                max={100}
              />
              <PercentRow
                label="Productivity gain among adopters (%)"
                value={productivityGainPct}
                onChange={setProductivityGainPct}
                min={10}
                max={40}
              />
              <NumberRow
                label={`Training cost per employee (${CURRENCY})`}
                value={trainingCostPer
