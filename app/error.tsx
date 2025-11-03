'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ maxWidth: 860, margin: '40px auto', padding: 20 }}>
      <h2>Page Error</h2>
      <p style={{ color: '#667085' }}>The home page had a runtime error.</p>
      <pre style={{ whiteSpace: 'pre-wrap', background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
        {String(error?.message || error)}
      </pre>
      <button onClick={reset} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', cursor: 'pointer' }}>
        Try again
      </button>
    </div>
  );
}
