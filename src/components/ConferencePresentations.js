import React, { useEffect } from 'react';
import './ConferencePresentations.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

function ConferencePresentations() {
    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    const presentations = [
        {
            title: 'Prediction of concrete properties using machine learning algorithm',
            conference: 'International Conference on Advances in Civil Engineering',
            year: '2022',
        },
        {
            title: 'Multi-objective optimization of the concrete mixture blended with mineral admixture',
            conference: 'Advanced Engineering Optimization Conference',
            year: '2023',
        },
        {
            title: 'Parametric investigation of coconut shells as partial replacement of coarse aggregates in sustainable concrete',
            conference: 'International Conference on Sustainable Construction Materials',
            year: '2023',
        },
    ];

    return (
        <section id="conference-presentations" className="conference-presentations" data-aos="fade-up">
            <div className="container">
                <h2>Conference Presentations</h2>
                <ol>
                    {presentations.map((presentation, index) => (
                        <li key={index}>
                            <strong>{presentation.title}</strong> - Presented at the <em>{presentation.conference}</em>, {presentation.year}.
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}

export default ConferencePresentations;
