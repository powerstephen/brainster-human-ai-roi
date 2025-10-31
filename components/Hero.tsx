export default function Hero() {
  return (
    <div className="container">
      {/* Slim blue hero: just title + subheading */}
      <section className="hero hero--slim">
        <div className="hero-inner--slim">
          <h1>AI at Work — Human Productivity ROI</h1>
          <p>
            Quantify time saved, payback, and retention impact from training managers and
            teams to work effectively with AI.
          </p>
        </div>
      </section>

      {/* What you'll get — four stat tiles in one row, outside the blue area */}
      <section className="stats-row">
        <div className="stat-tile">
          <div className="t">Monthly savings</div>
          <div className="v">Auto-calculated</div>
        </div>
        <div className="stat-tile">
          <div className="t">Payback</div>
          <div className="v">in months</div>
        </div>
        <div className="stat-tile">
          <div className="t">Annual ROI</div>
          <div className="v">× multiple</div>
        </div>
        <div className="stat-tile">
          <div className="t">Hours saved / year</div>
          <div className="v">team-level</div>
        </div>
      </section>
    </div>
  );
}
