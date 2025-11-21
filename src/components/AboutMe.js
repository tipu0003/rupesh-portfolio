import { useEffect, useState } from 'react';
import './AboutMe.css';

function AboutMe() {
  const [metrics, setMetrics] = useState({
    citations: 588,
    h_index: 16,
    i10_index: 20,
  });

  useEffect(() => {
    const url = (process.env.PUBLIC_URL || '') + '/data/scholar.json?v=' + Date.now();

    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.metrics) {
          setMetrics({
            citations: json.metrics.citations ?? metrics.citations,
            h_index: json.metrics.h_index ?? metrics.h_index,
            i10_index: json.metrics.i10_index ?? metrics.i10_index,
          });
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section id="about" className="about-me" data-aos="fade-up">
      <div className="container">
        <h2>About Me</h2>
        <p>
          I am an Assistant Professor at K. R. Mangalam University with over 10 years of teaching experience and 5 years of research experience in Structural Engineering. I specialize in Structural Engineering and have authored multiple reputed research articles in the field. My research interests focus on advanced structural analysis, design of concrete structures, developing machine & deep learning predictive models, optimization, and sustainable construction materials.
        </p>

        {/* Scholarly Metrics At-a-Glance */}
        <div className="scholarly-metrics-box">
          <div className="metrics-header">Scholarly Metrics At-a-Glance</div>
          <div className="metrics-container">
            <div className="metric">
              <span className="metric-label">Total Citations:</span><br/>
              <span className="metric-value">618</span>
            </div>
            <div className="metric">
              <span className="metric-label">h-index:</span><br/>
              <span className="metric-value">16</span>
            </div>
            <div className="metric">
              <span className="metric-label">i10-index:</span><br/>
              <span className="metric-value">20</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutMe;
