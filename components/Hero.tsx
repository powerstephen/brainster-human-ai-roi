export default function Hero() {
  return (
    <div className="container">
      <section className="hero hero--slim hero--with-stats">
        <div className="hero-inner--slim">
          <h1>AI at Work — Human Productivity ROI</h1>
          <p>
            Quantify time saved, payback, and retention impact from training managers and
            teams to work effectively with AI.
          </p>

          {/* What the report shows — now INSIDE the blue hero */}
          <div className="hero-stats">
            <div className="hero-stats-head">What the report shows</div>
            <div className="hero-stats-grid">
              <div className="hero-stat-tile">
                <div className="t">Monthly savings</div>
                <div className="v">Auto-calculated</div>
              </div>
              <div className="hero-stat-tile">
                <div className="t">Payback</div>
                <div className="v">in months</div>
              </div>
              <div className="hero-stat-tile">
                <div className="t">Annual ROI</div>
                <div className="v">× multiple</div>
              </div>
              <div className="hero-stat-tile">
                <div className="t">Hours saved / year</div>
                <div className="v">team-level</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
