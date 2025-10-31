export default function Hero(){
  return (
    <div className="container">
      <div className="hero-wrap">
        <div className="hero-grid">
          <div className="hero">
            <h1>AI at Work — Human Productivity ROI</h1>
            <p>Turn AI capability into measurable business value. Estimate savings, payback, and retention impact from training managers and teams.</p>
            <div className="pills">
              <span className="pill">Inter Typeface</span>
              <span className="pill">Brainster Blue</span>
              <span className="pill">Manager-first</span>
              <span className="pill">One-panel steps</span>
            </div>
          </div>
          <div className="hero-panel">
            <h4>What you’ll get</h4>
            <div className="stats">
              <div className="stat"><div className="t">Monthly savings (est.)</div><div className="v">Auto-calculated</div></div>
              <div className="stat"><div className="t">Payback period</div><div className="v">Months</div></div>
              <div className="stat"><div className="t">Annual ROI</div><div className="v">× multiple</div></div>
              <div className="stat"><div className="t">Hours saved / year</div><div className="v">Team-level</div></div>
            </div>
            <p style={{margin:'10px 0 0 0',fontSize:12,color:'rgba(255,255,255,.9)'}}>
              Conservative defaults · Counts gains beyond current maturity · People-first (no bot replacement).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
