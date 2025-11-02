import { Pain } from '../lib/model';

export default function NextSteps({ pains }: { pains: Pain[] }) {
  const items = pains.length ? pains : ['engagement', 'retention'] as Pain[];
  return (
    <div style={{marginTop:12}}>
      <h4 style={{margin:'8px 0', fontWeight:900}}>Suggested next steps</h4>
      <ul style={{margin:0, paddingLeft:'1.1rem'}}>
        {items.map((p) => (
          <li key={p} style={{margin:'4px 0'}}>
            Align a 6–8 week pilot focused on <strong>{p}</strong>, with clear KPIs and a weekly enablement cadence.
          </li>
        ))}
      </ul>
    </div>
  );
}
