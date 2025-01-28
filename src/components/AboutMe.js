// src/components/AboutMe.js

import './AboutMe.css';

function AboutMe() {

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
                            <span className="metric-value">267</span>
                        </div>
                        <div className="metric">
                            <span className="metric-label">h-index:</span><br/>
                            <span className="metric-value">10</span>
                        </div>
                        <div className="metric">
                            <span className="metric-label">i10-index:</span><br/>
                            <span className="metric-value">10</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AboutMe;
