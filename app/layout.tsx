import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'AI at Work — ROI Calculator',
  description: 'Estimate the impact of AI capability on team performance.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <div className="container">
          <header className="mb-4">
            <h1 style={{fontWeight:800,fontSize:'1.35rem'}}>AI at Work — Human Productivity ROI</h1>
            <p className="help">Branded for Brainster · vivid blue theme</p>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
