export const metadata = {
  title: 'AI at Work — Human Productivity ROI',
  description:
    'Quantify time saved, payback, and retention impact from training managers and teams to work effectively with AI.',
};

// Hard-disable static caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import './globals.css?v=2025-11-02a'; // cache-bust the CSS

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Show commit so you can verify the live build
  const commit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local';

  return (
    <html lang="en">
      <head>
        {/* extra no-cache directives for good measure */}
        <meta httpEquiv="Cache-Control" content="no-store, no-cache, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body>
        {/* Kill any old service workers that might be serving stale HTML/CSS */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations()
                  .then(regs => regs.forEach(r => r.unregister()))
                  .catch(()=>{});
              }
            `,
          }}
        />
        <nav className="nav">
          <div className="container nav-inner">
            <div className="brand">
              <span className="brand-dot" />
              AI at Work — Human Productivity ROI
            </div>
            <div className="badge">Brainster Blue</div>
          </div>
        </nav>
        <main className="container">{children}</main>

        <footer className="container" style={{padding:'14px 0', color:'#667085', fontSize:12}}>
          Build: <strong>{commit}</strong> • No-cache mode
        </footer>
      </body>
    </html>
  );
}
