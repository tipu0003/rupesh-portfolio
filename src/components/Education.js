import React, { useEffect } from 'react';
import './Education.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

function Education() {
    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    const educationData = [
        {
            degree: 'Ph.D. (Full Time)',
            university: 'CHARUSAT University, Gujarat',
            year: '2024',
        },
        {
            degree: 'M.Tech (Structural Engineering)',
            university: 'MDU, Rohtak',
            year: '2016',
        },
        {
            degree: 'B.Tech (Civil Engineering)',
            university: 'MDU, Rohtak',
            year: '2013',
        },
        {
            degree: '12th',
            university: 'B.S.E.B., Patna',
            year: '2009',
        },
        {
            degree: '10th',
            university: 'B.S.E.B., Patna',
            year: '2005',
        },
    ];

    return (
        <section id="education" className="education" data-aos="fade-up">
            <div className="container">
                <h2>Education</h2>
                <table>
                    <thead>
                    <tr>
                        <th>Degree</th>
                        <th>University</th>
                        <th>Year</th>
                    </tr>
                    </thead>
                    <tbody>
                    {educationData.map((edu, index) => (
                        <tr key={index}>
                            <td data-label="Degree">{edu.degree}</td>
                            <td data-label="University">{edu.university}</td>
                            <td data-label="Year">{edu.year}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export default Education;
