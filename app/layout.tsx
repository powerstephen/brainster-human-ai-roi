import './globals.css';

export const metadata = {
  title: 'AI at Work — Human Productivity ROI',
  description: 'People-first AI ROI calculator',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
