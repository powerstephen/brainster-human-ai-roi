'use client';
import { useMemo, useState } from 'react';
import { NumberRow, PercentRow, Segmented, StepHeader } from './ui';
import { GlobalInputs, ProgramInputs, Maturity, maturityPresets, calcHumanRoi } from '../lib/model';

const CURRENCY = '€';
const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('en', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

export function RoiCalculator() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1 — Workforce
  const [employees, setEmployees] = useState(200);
  const [trainPercent, setTrainPercent] = useState(70);
  const [hourlyCost, setHourlyCost] = useState(35);
  const [weeklyHours, setWeeklyHours] = useState(40);
  const [repetitiveTimePct, setRepetitiveTimePct] = useState(30);

  const g: GlobalInputs = { employees, trainPercent, hourlyCost, weeklyHours, repetitiveTimePct };

  // Step 2 — Maturity
  const [maturity, setMaturity] = useState<Maturity>('medium');
  const maturityParams = useMemo(() => maturityPresets(maturity), [maturity]);

  // Step 3 — Program (Investment + expected uplift)
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
    durationMonths
  };

  const res = useMemo(() => calcHumanRoi(g, maturityParams, prog), [g, maturityParams, prog]);

  return (
    <div className="space-y-4">
      <StepHeader current={step} />

      {step === 1 && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card p-4 space-y-3">
            <h3 className="text-lg font-semibold">Workforce overview</h3>
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
              hint="Busywork eligible for AI assistance (email, documentation, formatting, lookups, reporting, etc.)"
            />
            <div className="flex gap-2 pt-2">
              <button className="btn btn-primary" onClick={() => setStep(2)}>Continue → Maturity</button>
            </div>
          </div>

          <div className="card p-4 space-y-2">
            <h4 className="font-semibold">People-first ROI</h4>
            <p className="text-sm text-neutral-700">
              This model estimates the <strong>AI Dividend</strong> from upskilling employees — time freed for higher-value work,
              not bot replacement.
            </p>
            <p className="disclaimer">
              We only count incremental gains vs. your current AI usage. Assumptions are conservative and fully editable.
            </p>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card p-4 space-y-3">
          <h3 className="text-lg font-semibold">Current AI usage (maturity)</h3>
          <Segmented
            value={maturity}
            onChange={setMaturity}
            options={[
              { label: 'Low', value: 'low' },
              { label: 'Medium', value: 'medium' },
              { label: 'High', value: 'high' }
            ]}
          />
          <div className="grid md:grid-cols-3 gap-3 mt-3">
            <div className="card p-3">
              <div className="text-xs text-neutral-500">Baseline adoption</div>
              <div className="text-lg font-semibold">{maturityParams.baselineAdoptionPct}%</div>
            </div>
            <div className="card p-3">
              <div className="text-xs text-neutral-500">Baseline productivity lift</div>
              <div className="text-lg font-semibold">{maturityParams.baselineProductivityPct}%</div>
            </div>
            <div className="card p-3">
              <div className="text-xs text-neutral-500">Ramp to steady state</div>
              <div className="text-lg font-semibold">
                {maturityParams.ramp.length <= 2 ? '1–2 months' : `${maturityParams.ramp.length} months`}
              </div>
            </div>
          </div>
          <p className="help">
            We’ll only attribute <em>incremental</em> value beyond this baseline to the training program.
          </p>
          <div className="flex gap-2 pt-2">
            <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-primary" onClick={() => setStep(3)}>Continue → Investment</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card p-4 space-y-3">
          <h3 className="text-lg font-semibold">Program & investment</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <PercentRow
              label="Expected adoption among trained (%)"
              value={adoptionRatePct}
              onChange={setAdoptionRatePct}
              min={50}
              max={100}
              hint="Share of trained employees who regularly use AI workflows post-training."
            />
            <PercentRow
              label="Productivity gain among adopters (%)"
              value={productivityGainPct}
              onChange={setProductivityGainPct}
              min={10}
              max={40}
              hint="Conservative: 15–25%. Upper bound capped by model for credibility."
            />
            <NumberRow
              label={`Training cost per employee (${CURRENCY})`}
              value={trainingCostPerEmployee}
              onChange={setTrainingCostPerEmployee}
              min={0}
              step={25}
            />
            <NumberRow
              label={`Additional platform spend / month (${CURRENCY})`}
              value={platformSpendMonthly}
              onChange={setPlatformSpendMonthly}
              min={0}
              step={50}
            />
            <NumberRow
              label="Program duration (months)"
              value={durationMonths}
              onChange={setDurationMonths}
              min={1}
              step={1}
              hint="For context and planning; ROI is shown on an annualized basis."
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
            <button className="btn btn-primary" onClick={() => setStep(4)}>Calculate Results →</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="card p-4">
              <div className="text-xs text-neutral-500">Monthly savings</div>
              <div className="text-lg font-semibold">{fmtCurrency(res.monthlySavings)}</div>
            </div>
            <div className="card p-4">
              <div className="text-xs text-neutral-500">Payback</div>
              <div className="text-lg font-semibold">
                {isFinite(res.paybackMonths) ? `${res.paybackMonths.toFixed(1)} mo` : '—'}
              </div>
            </div>
            <div className="card p-4">
              <div className="text-xs text-neutral-500">Annual ROI</div>
              <div className="text-lg font-semibold">{res.roiMultiple.toFixed(1)}×</div>
            </div>
            <div className="card p-4">
              <div className="text-xs text-neutral-500">Hours saved / person / week</div>
              <div className="text-lg font-semibold">{res.hoursSavedPerPersonWeek.toFixed(1)} hrs</div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="card p-4 space-y-2">
            <h3 className="text-lg font-semibold">Annual AI Dividend</h3>
            <p className="text-sm text-neutral-700">
              Your teams reclaim <strong>{Math.round(res.annualHoursSavedTotal).toLocaleString()}</strong> hours annually —
              equivalent to <strong>{fmtCurrency(res.annualValue)}</strong> in reinvested value.
            </p>
            <div className="grid md:grid-cols-3 gap-3 mt-2">
              <div className="card p-3">
                <div className="text-xs text-neutral-500">Training investment</div>
                <div className="text-lg font-semibold">{fmtCurrency(res.trainingInvestment)}</div>
              </div>
              <div className="card p-3">
                <div className="text-xs text-neutral-500">Platform spend (annual)</div>
                <div className="text-lg font-semibold">{fmtCurrency(res.platformInvestment)}</div>
              </div>
              <div className="card p-3">
                <div className="text-xs text-neutral-500">Total investment</div>
                <div className="text-lg font-semibold">{fmtCurrency(res.totalInvestment)}</div>
              </div>
            </div>
            <p className="disclaimer">
              We cap post-training effective savings at 50% of repetitive time to keep estimates credible.
              High-maturity orgs typically gain via standardization, QA, and governance rather than raw time cuts.
            </p>
          </div>

          {/* Actions */}
          <div className="card p-4 space-y-3">
            <h3 className="text-lg font-semibold">What we recommend</h3>
            <p className="text-sm text-neutral-700">
              Start with a focused cohort (pilot) → document workflows and wins → scale. We’ll package these inputs and
              assumptions into a one-pager for your CFO/COO.
            </p>
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-primary">Generate Proposal (PDF)</button>
              <button className="btn btn-ghost">Book a 20-min ROI Review</button>
              <button className="btn btn-ghost">Email me this model</button>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="btn btn-ghost" onClick={() => setStep(3)}>← Back</button>
            <button className="btn btn-primary" onClick={() => setStep(1)}>Start over</button>
          </div>
        </div>
      )}
    </div>
  );
}
