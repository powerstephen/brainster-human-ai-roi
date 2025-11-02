import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'AI at Work — Human Productivity ROI',
  description: 'Estimate the impact of AI capability on team performance.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="nav">
          <div className="container nav-inner">
            <div className="brand">
              <span className="brand-dot" />
              <span>Brainster · AI at Work</span>
              <span className="badge">Vivid Blue</span>
            </div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <a className="btn btn-primary" href="/report">Print / PDF</a>
            </div>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
