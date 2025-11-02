export const metadata = {
  title: 'AI at Work — Human Productivity ROI',
  description:
    'Quantify time saved, payback, and retention impact from training managers and teams to work effectively with AI.',
};

import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
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
      </body>
    </html>
  );
}
