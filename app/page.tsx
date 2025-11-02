'use client';

// Disable static optimization/caching on this route too
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { RoiCalculator } from '../components/RoiCalculator';

export default function Home() {
  return (
    <>
      <section className="section">
        <div className="card" style={{ maxWidth: 980, margin: '16px auto' }}>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>AI at Work — Human Productivity ROI</h1>
          <p style={{ marginTop: 6, color: '#667085' }}>
            Quantify time saved, payback, and retention impact from training managers and teams to work effectively with AI.
          </p>
          <div
            style={{
              display: 'grid',
              gap: 10,
              gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
              marginTop: 12,
            }}
          >
            {['Live ROI', 'Hours saved', 'Payback', 'Retention value'].map((t) => (
              <div
                key={t}
                style={{
                  border: '1px solid #E7ECF7',
                  borderRadius: 12,
                  padding: '10px 12px',
                  fontWeight: 800,
                  background: '#F8FAFF',
                }}
              >
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      <RoiCalculator />
    </>
  );
}
