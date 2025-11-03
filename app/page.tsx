export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Page() {
  return (
    <main style={{ maxWidth: 720, margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ margin: 0 }}>It works ✅</h1>
      <p style={{ color: '#667085' }}>
        If you can see this, the App Router & layout are rendering correctly.
      </p>
      <div style={{ marginTop: 16, padding: 16, border: '1px solid #E7ECF7', borderRadius: 12 }}>
        Minimal page — no client components, no hooks, no CSS files.
      </div>
    </main>
  );
}
