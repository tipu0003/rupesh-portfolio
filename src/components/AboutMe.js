import { useEffect, useMemo, useRef, useState } from 'react';
import './AboutMe.css';

function AboutMe() {
  // Static target values (your real metrics)
  const targetMetrics = useMemo(
    () => ({
      citations: 674,
      h_index: 17,
      i10_index: 21,
    }),
    []
  );

  // Displayed values (start from 0 for animation)
  const [metrics, setMetrics] = useState({
    citations: 0,
    h_index: 0,
    i10_index: 0,
  });

  const boxRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    // Respect user's OS reduced-motion preference
    const prefersReducedMotion =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // If reduced motion, show final numbers immediately
    if (prefersReducedMotion) {
      setMetrics(targetMetrics);
      return;
    }

    const el = boxRef.current;
    if (!el) return;

    let rafId = 0;

    const animateCounts = (durationMs = 1200) => {
      const start = performance.now();

      const tick = (now) => {
        const t = Math.min((now - start) / durationMs, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - t, 3);

        setMetrics({
          citations: Math.round(eased * targetMetrics.citations),
          h_index: Math.round(eased * targetMetrics.h_index),
          i10_index: Math.round(eased * targetMetrics.i10_index),
        });

        if (t < 1) rafId = requestAnimationFrame(tick);
      };

      rafId = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          animateCounts(1200);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [targetMetrics]);

  return (
    <section id="about" className="about-me" data-aos="fade-up">
      <div className="container">
        <h2>About Me</h2>
        <p>
          I am an Assistant Professor at K. R. Mangalam University with over 10 years
          of teaching experience and 5 years of research experience in Structural
          Engineering. I specialize in Structural Engineering and have authored
          multiple reputed research articles in the field. My research interests focus
          on advanced structural analysis, design of concrete structures, developing
          machine & deep learning predictive models, optimization, and sustainable
          construction materials.
        </p>

        {/* Scholarly Metrics At-a-Glance */}
        <div ref={boxRef} className="scholarly-metrics-box">
          <div className="metrics-header">Scholarly Metrics At-a-Glance</div>

          <div className="metrics-container">
            <div className="metric">
              <div className="metric-icon" aria-hidden="true">📚</div>
              <span className="metric-label">Total Citations</span>
              <span className="metric-value">{metrics.citations}</span>
              <span className="metric-subtext">Across published work</span>
            </div>

            <div className="metric">
              <div className="metric-icon" aria-hidden="true">📈</div>
              <span className="metric-label">h-index</span>
              <span className="metric-value">{metrics.h_index}</span>
              <span className="metric-subtext">Impact indicator</span>
            </div>

            <div className="metric">
              <div className="metric-icon" aria-hidden="true">🏅</div>
              <span className="metric-label">i10-index</span>
              <span className="metric-value">{metrics.i10_index}</span>
              <span className="metric-subtext">10+ citations papers</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutMe;
