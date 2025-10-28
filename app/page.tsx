'use client';
import { RoiCalculator } from '../components/RoiCalculator';

export default function Page() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      <RoiCalculator />
      <aside className="card p-4 space-y-3 h-fit sticky top-6">
        <h3 className="text-lg font-semibold">Your Summary</h3>
        <p className="text-sm text-neutral-600">
          Live ROI updates as you adjust inputs. Results show incremental impact vs. today.
        </p>
        <ul className="text-xs text-neutral-600 list-disc pl-4">
          <li>People-first ROI (no bot replacement)</li>
          <li>Includes AI maturity baseline</li>
          <li>Shows payback and annual ROI</li>
        </ul>
      </aside>
    </div>
  );
}
