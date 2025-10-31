import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'AI at Work — Human Productivity ROI',
  description: 'Estimate the impact of AI capability on team performance.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <div className="nav">
          <div className="container nav-inner">
            <div className="brand">
              <span className="brand-dot" />
              <span>Brainster · AI at Work</span>
              <span className="badge">Vivid Blue</span>
            </div>
            <div style={{display:'flex',gap:8}}>
              <a className="btn btn-ghost" href="#" aria-disabled>About</a>
              <a className="btn btn-primary" href="/report" title="Open print view">Print / PDF</a>
            </div>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
