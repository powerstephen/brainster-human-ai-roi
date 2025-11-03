export const dynamic = 'force-dynamic';

export async function GET() {
  return new Response(
    JSON.stringify({
      ok: true,
      ts: new Date().toISOString(),
      note: 'If you see this JSON, the deployment is active and server routes work.',
    }),
    { headers: { 'content-type': 'application/json' } }
  );
}
