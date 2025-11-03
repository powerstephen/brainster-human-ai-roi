'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useEffect, useState } from 'react';

export default function Home() {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    // quick runtime check
    console.log('[safe-mode] mounted at', new Date().toISOString());
    setOk(true);
  }, []);

  return (
    <main style={{ maxWidth: 980, margin: '0 auto', padding: '24px 20px', fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' }}>
      <header style={{ background: '#3366FE', color: '#fff', padding: 16, borderRadius: 14, boxShadow: '0 10px 28px rgba(12,20,38,.18)' }}>
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>AI at Work — Human Productivity ROI (Safe Mode)</h1>
        <p style={{ margin: '6px 0 0', opacity: 0.95 }}>If you can see this, the app is rendering and client JS is running.</p>
      </header>

      <section style={{ marginTop: 16, background: '#fff', border: '1px solid #E7ECF7', borderRadius: 14, padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>Health Checks</h3>
        <ul>
          <li>Client mounted: <strong>{ok ? 'yes' : 'no'}</strong></li>
          <li>Intl currency format: <strong>{new Intl.NumberFormat('en', { style: 'currency', currency: 'EUR' }).format(1234)}</strong></li>
          <li>Time: <code>{new Date().toLocaleString()}</code></li>
        </ul>
      </section>

      <section style={{ marginTop: 16, background: '#fff', border: '1px solid #E7ECF7', borderRadius: 14, padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>Next step</h3>
        <p>If this page renders, the previous white screen was caused by a runtime error in the calculator file. After this deploy, we can paste the calculator back in confidently.</p>
      </section>
    </main>
  );
}
