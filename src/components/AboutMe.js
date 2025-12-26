import { useEffect, useMemo, useRef, useState } from 'react';
import './AboutMe.css';

function AboutMe() {
  // Scholarly metrics (static targets)
  const targetMetrics = useMemo(
    () => ({
      citations: 674,
      h_index: 17,
      i10_index: 21,
    }),
    []
  );

  // Publications (static targets)
  const targetPubs = useMemo(() => {
    const scie = 15;
    const esci = 4;
    const scopusOnly = 33;
    return {
      scie,
      esci,
      scopusOnly,
      total: scie + esci + scopusOnly,
    };
  }, []);

  // Animated display values
  const [metrics, setMetrics] = useState({ citations: 0, h_index: 0, i10_index: 0 });
  const [pubs, setPubs] = useState({ scie: 0, esci: 0, scopusOnly: 0, total: 0 });

  // Staggered pulse indices
  const [metricsPulseIndex, setMetricsPulseIndex] = useState(-1);
  const [pubPulseIndex, setPubPulseIndex] = useState(-1);

  const glanceRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const prefersReducedMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // If reduced motion, show final numbers and skip pulses
    if (prefersReducedMotion) {
      setMetrics(targetMetrics);
      setPubs(targetPubs);
      return;
    }

    const el = glanceRef.current;
    if (!el) return;

    let rafId = 0;
    const timeouts = [];

    const runStagger = (indices, setIndex, startAfterMs, gapMs, durationMs) => {
      indices.forEach((idx, i) => {
        timeouts.push(
          window.setTimeout(() => {
            setIndex(idx);
            timeouts.push(window.setTimeout(() => setIndex(-1), durationMs));
          }, startAfterMs + i * gapMs)
        );
      });
    };

    const triggerStaggeredPulses = () => {
      const pulseDuration = 520; // must match CSS
      const metricsGap = 140;
      const pubsGap = 120;

      // Metrics: 3 cards
      const metricsIndices = [0, 1, 2];
      runStagger(metricsIndices, setMetricsPulseIndex, 0, metricsGap, pulseDuration);

      // When metrics pulses finish, start pubs pulses
      const lastMetricsStart = (metricsIndices.length - 1) * metricsGap; // 280
      const metricsEnd = lastMetricsStart + pulseDuration + 160; // small gap after metrics

      // Publications: 4 rows
      const pubIndices = [0, 1, 2, 3];
      runStagger(pubIndices, setPubPulseIndex, metricsEnd, pubsGap, pulseDuration);
    };

    const animateAllCounts = (durationMs = 1200) => {
      const start = performance.now();

      const tick = (now) => {
        const t = Math.min((now - start) / durationMs, 1);
        const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic

        setMetrics({
          citations: Math.round(eased * targetMetrics.citations),
          h_index: Math.round(eased * targetMetrics.h_index),
          i10_index: Math.round(eased * targetMetrics.i10_index),
        });

        setPubs({
          scie: Math.round(eased * targetPubs.scie),
          esci: Math.round(eased * targetPubs.esci),
          scopusOnly: Math.round(eased * targetPubs.scopusOnly),
          total: Math.round(eased * targetPubs.total),
        });

        if (t < 1) {
          rafId = requestAnimationFrame(tick);
        } else {
          setMetrics(targetMetrics);
          setPubs(targetPubs);
          triggerStaggeredPulses();
        }
      };

      rafId = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          animateAllCounts(1200);
          observer.disconnect();
        }
      },
      { threshold: 0.28 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
      timeouts.forEach((id) => window.clearTimeout(id));
    };
  }, [targetMetrics, targetPubs]);

  const metricPulseClass = (idx) => (metricsPulseIndex === idx ? 'metric-pulse' : '');
  const pubPulseClass = (idx) => (pubPulseIndex === idx ? 'pub-pulse' : '');

  return (
    <section id="about" className="about-me" data-aos="fade-up">
      <div className="container">
        <h2>About Me</h2>
        <p>
          I am an Assistant Professor at K. R. Mangalam University with over 10 years of teaching
          experience and 5 years of research experience in Structural Engineering. I specialize in
          Structural Engineering and have authored multiple reputed research articles in the field.
          My research interests focus on advanced structural analysis, design of concrete structures,
          developing machine & deep learning predictive models, optimization, and sustainable
          construction materials.
        </p>

        {/* Wrap both glance boxes so animation triggers once */}
        <div ref={glanceRef} className="glance-wrapper">
          {/* Scholarly Metrics At-a-Glance */}
          <div className="scholarly-metrics-box">
            <div className="metrics-header">Scholarly Metrics At-a-Glance</div>

            <div className="metrics-container">
              <div className={`metric ${metricPulseClass(0)}`}>
                <div className="metric-icon" aria-hidden="true">📚</div>
                <span className="metric-label">Total Citations</span>
                <span className="metric-value">{metrics.citations}</span>
                <span className="metric-subtext">Across published work</span>
              </div>

              <div className={`metric ${metricPulseClass(1)}`}>
                <div className="metric-icon" aria-hidden="true">📈</div>
                <span className="metric-label">h-index</span>
                <span className="metric-value">{metrics.h_index}</span>
                <span className="metric-subtext">Impact indicator</span>
              </div>

              <div className={`metric ${metricPulseClass(2)}`}>
                <div className="metric-icon" aria-hidden="true">🏅</div>
                <span className="metric-label">i10-index</span>
                <span className="metric-value">{metrics.i10_index}</span>
                <span className="metric-subtext">10+ citations papers</span>
              </div>
            </div>
          </div>

          {/* Publications at-a-Glance */}
          <div className="publications-glance-box">
            <div className="pub-header">Publications At-a-Glance</div>

            <div className="pub-list">
              <div className={`pub-row ${pubPulseClass(0)}`}>
                <div className="pub-left">
                  <span className="pub-badge">SCIE</span>
                  <span className="pub-text">Journal publications indexed in SCIE</span>
                </div>
                <div className="pub-count">{pubs.scie}</div>
              </div>

              <div className={`pub-row ${pubPulseClass(1)}`}>
                <div className="pub-left">
                  <span className="pub-badge">ESCI</span>
                  <span className="pub-text">Journal publications indexed in ESCI</span>
                </div>
                <div className="pub-count">{pubs.esci}</div>
              </div>

              <div className={`pub-row ${pubPulseClass(2)}`}>
                <div className="pub-left">
                  <span className="pub-badge">Scopus Only</span>
                  <span className="pub-text">Journal publications indexed in Scopus only</span>
                </div>
                <div className="pub-count">{pubs.scopusOnly}</div>
              </div>

              <div className={`pub-row pub-total ${pubPulseClass(3)}`}>
                <div className="pub-left">
                  <span className="pub-badge pub-badge-total">Total</span>
                  <span className="pub-text">SCIE + ESCI + Scopus Only</span>
                </div>
                <div className="pub-count pub-count-total">{pubs.total}</div>
              </div>
            </div>
          </div>
        </div>
        {/* end glance-wrapper */}
      </div>
    </section>
  );
}

export default AboutMe;
