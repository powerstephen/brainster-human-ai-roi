export default function Hero() {
  return (
    <div className="container">
      <section className="hero hero--slim">
        <div className="hero-inner--slim">
          <h1>Brainster Presents</h1>
          <p className="tagline">AI at Work — Human Productivity ROI</p>
          <p className="subtext">
            Quantify the business impact of empowering your teams to work smarter with AI.
          </p>

          <div className="hero-stats">
            <h4 className="hero-stats-head">What the report shows</h4>
            <div className="hero-stats-grid">
              <div className="hero-stat-tile">
                <div className="t">Productivity Gain</div>
                <div className="v">Time saved per employee</div>
              </div>
              <div className="hero-stat-tile">
                <div className="t">Retention Impact</div>
                <div className="v">Reduction in turnover</div>
              </div>
              <div className="hero-stat-tile">
                <div className="t">ROI & Payback</div>
                <div className="v">Months to recover investment</div>
              </div>
              <div className="hero-stat-tile">
                <div className="t">Engagement Lift</div>
                <div className="v">Measured improvement in sentiment</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
