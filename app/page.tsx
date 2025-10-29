'use client';
import { RoiCalculator } from '../components/RoiCalculator';

export default function Page() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontFamily: 'system-ui, sans-serif', marginBottom: 12 }}>
        AI at Work — Human Productivity ROI <strong>(v2 — {process.env.NEXT_PUBLIC_BUILD_ID ?? 'no-id'})</strong>
      </h1>
      <RoiCalculator />
    </div>
  );
}
