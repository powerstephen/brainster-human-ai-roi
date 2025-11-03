export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Home() {
  return (
    <main style={{ maxWidth: 820, margin: '40px auto', padding: '0 20px' }}>
      <div style={{ background: '#3366FE', color: '#fff', padding: 16, borderRadius: 12 }}>
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Hello from SSR</h1>
        <p style={{ margin: '6px 0 0' }}>If you can see this, SSR is working and there’s no client runtime involved.</p>
      </div>

      <div style={{ marginTop: 16, background: '#fff', border: '1px solid #E7ECF7', borderRadius: 12, padding: 16 }}>
        <p style={{ margin: 0 }}>Deployed at: <code>{new Date().toISOString()}</code></p>
        <p style={{ margin: 0 }}>Next.js App Router minimal test.</p>
        <p style={{ margin: 0 }}>Visit <code>/health</code> to confirm the server route.</p>
      </div>
    </main>
  );
}
