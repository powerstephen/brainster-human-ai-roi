export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' }}>
        {children}
      </body>
    </html>
  );
}
