import React, { useEffect } from 'react';
import './WorkshopsConducted.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

function WorkshopsConducted() {
    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    const workshops = [
        {
            title: 'Advanced Structural Analysis using STAAD.Pro',
            location: 'K. R. Mangalam University',
            year: '2023',
        },
        {
            title: 'Sustainable Materials in Construction',
            location: 'CHARUSAT University',
            year: '2022',
        },
        {
            title: 'Structural Optimization Techniques for Civil Engineering',
            location: 'Various Institutions',
            year: '2024',
        },
    ];

    return (
        <section id="workshops-conducted" className="workshops-conducted" data-aos="fade-up">
            <div className="container">
                <h2>Workshops Conducted</h2>
                <ul>
                    {workshops.map((workshop, index) => (
                        <li key={index}>
                            <strong>{workshop.title}</strong> - Conducted at {workshop.location}, {workshop.year}.
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

export default WorkshopsConducted;
