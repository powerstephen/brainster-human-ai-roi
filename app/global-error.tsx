'use client';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html>
      <body style={{ fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' }}>
        <div style={{ maxWidth: 860, margin: '40px auto', padding: 20 }}>
          <h1 style={{ margin: 0 }}>Something went wrong</h1>
          <p style={{ color: '#667085' }}>This is a dev-friendly error screen so we don’t get a white page.</p>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
            {String(error?.message || error)}
          </pre>
        </div>
      </body>
    </html>
  );
}
