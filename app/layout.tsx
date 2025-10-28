import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI at Work — Human Productivity ROI',
  description: 'Estimate your AI Dividend by upskilling employees — people-first ROI.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="bg-gradient-to-r from-brainster-purple to-brainster-coral text-white">
          <div className="container-lg py-6">
            <h1 className="text-2xl font-semibold">AI at Work — Human Productivity ROI</h1>
            <p className="opacity-90">Quantify the AI Dividend from employee upskilling.</p>
          </div>
        </header>
        <main className="container-lg py-8">{children}</main>
      </body>
    </html>
  );
}
