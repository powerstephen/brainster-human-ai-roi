import { Pain } from '../lib/model';

const recos: Record<Pain,string> = {
  retention:  "Run a 6-week manager-led AI coaching loop; measure eNPS and voluntary attrition delta.",
  engagement: "Launch a weekly ‘AI Wins’ stand-up and shared prompt library; reward submissions.",
  quality:    "Introduce AI QA checklists for docs/tickets; track rework rate and error density.",
  throughput: "Automate status updates and reporting; track cycle time and queue length trend.",
  onboarding: "Build AI onboarding paths (role prompts + tool macros); time-to-proficiency as KPI.",
  cost:       "Consolidate overlapping tools; pilot low-code automations for repetitive tasks.",
};

export default function NextSteps({ pains }:{ pains: Pain[] }) {
  if (!pains.length) return null;
  return (
    <div style={{marginTop:12}}>
      <div style={{fontWeight:800, marginBottom:6}}>Recommended next experiments</div>
      <ul style={{margin:0, paddingLeft:18}}>
        {pains.map(p => <li key={p} style={{margin:'4px 0'}}>{recos[p]}</li>)}
      </ul>
    </div>
  );
}
