import React, { useEffect } from 'react';
import './Memberships.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

function Memberships() {
    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    const memberships = [
        'Member of The Institution of Engineers (India)',
        'Member of Indian Concrete Institute (ICI)',
    ];

    return (
        <section id="memberships" className="memberships" data-aos="fade-up">
            <div className="container">
                <h2>Professional Memberships</h2>
                <ul>
                    {memberships.map((membership, index) => (
                        <li key={index}>{membership}</li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

export default Memberships;
