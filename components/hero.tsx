export default function Hero(){
  return (
    <div className="container">
      <section className="hero">
        <div className="hero-inner">
          <div>
            <h1>AI at Work — Human Productivity ROI</h1>
            <p>Quantify time saved, payback, and retention impact from training managers and teams to work effectively with AI.</p>
            <div className="pills">
              <span className="pill">Inter Typeface</span>
              <span className="pill">Brainster Blue</span>
              <span className="pill">Manager-first</span>
              <span className="pill">Print-ready</span>
            </div>
          </div>
          <div className="hero-panel">
            <h4>What you’ll get</h4>
            <div className="stats">
              <div className="stat"><div className="t">Monthly savings</div><div className="v">Auto-calculated</div></div>
              <div className="stat"><div className="t">Payback</div><div className="v">in months</div></div>
              <div className="stat"><div className="t">Annual ROI</div><div className="v">× multiple</div></div>
              <div className="stat"><div className="t">Hours saved / year</div><div className="v">team-level</div></div>
            </div>
            <p style={{margin:'10px 0 0',fontSize:12,color:'rgba(255,255,255,.92)'}}>
              Conservative defaults · Counts gains beyond current maturity · People-first (no bot replacement).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
