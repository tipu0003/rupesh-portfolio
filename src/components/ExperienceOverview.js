import React, { useEffect } from 'react';
import './ExperienceOverview.css';
import AOS from 'aos';

function ExperienceOverview() {
    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    return (
        <section id="experience-overview" className="experience-overview" data-aos="fade-up">
            <div className="container">
                <h2>Experience Overview</h2>
                <div className="overview">
                    <div className="experience">
                        <h3>Total Teaching Experience</h3>
                        <p>10+ Years</p>
                    </div>
                    <div className="experience">
                        <h3>Total Research Experience</h3>
                        <p>5+ Years</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ExperienceOverview;
