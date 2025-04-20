import React, { useEffect } from 'react';
import './ProfessionalExperience.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

function ProfessionalExperience() {
    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    const experiences = [
        {
            organization: 'K. R. Mangalam University, Gurugram, Haryana',
            position: 'Assistant Professor',
            from: '15/02/2023',
            to: 'Till date',
            duration: '2 Years, 1 Month',
            responsibilities: [
                'Responsible for teaching, mentoring, and assisting B.Tech Civil Engineering, CSE, and MCA students with their projects.',
                'Hold the position of NAAC Criteria 1 Head at the School of Engineering & Technology level.',
                'Coordinate programs for B.Sc. (H) Data Science, B.Sc. (H) Cyber Security, and B.Sc. (H) Computer Science.',
                'Manage the School LMS-MOODLE platform.',
                'Teach two subjects in the Ph.D. coursework: Quantitative Techniques and Research and Publication Ethics in the current semester.',
            ],
        },
        {
            organization: 'CHARUSAT University, Changa (Anand), Gujarat',
            position: 'Research Scholar cum Teaching Assistant',
            from: '05/11/2019',
            to: '31/12/2022',
            duration: '3 Years',
            responsibilities: [
                'Conducted full-time research alongside teaching.',
                'Responsible for teaching, mentoring, and assisting B.Tech Civil Engineering students with their projects.',
            ],
        },
        {
            organization: 'BITS EDU CAMPUS, Vadodara, Gujarat',
            position: 'Assistant Professor',
            from: '04/08/2017',
            to: '22/05/2019',
            duration: '1 Year, 9 Months',
            responsibilities: [
                'Involved in teaching, mentoring, and assisting B.Tech Civil Engineering students with their projects.',
            ],
        },
        {
            organization: 'KJIT CAMPUS, Savli (Vadodara), Gujarat',
            position: 'Assistant Professor',
            from: '01/02/2015',
            to: '03/08/2017',
            duration: '2 Year, 6 Months',
            responsibilities: [
                'Duties included teaching, mentoring, and assisting B.Tech Civil Engineering students with their projects.',
            ],
        },
        {
            organization: 'DITMR, Faridabad, Delhi-NCR',
            position: 'Lecturer',
            from: '01/02/2013',
            to: '01/06/2014',
            duration: '1 Year, 4 Months',
            responsibilities: [
                'Responsible for teaching and mentoring Diploma students of Civil Engineering.',
            ],
        },
    ];

    return (
        <section id="professional-experience" className="professional-experience" data-aos="fade-up">
            <div className="container">
                <h2>Professional Experience</h2>
                <table>
                    <thead>
                    <tr>
                        <th>Organization</th>
                        <th>Position Held</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Duration</th>
                    </tr>
                    </thead>
                    <tbody>
                    {experiences.map((exp, index) => (
                        <tr key={index}>
                            <td data-label="Organization">{exp.organization}</td>
                            <td data-label="Position Held">{exp.position}</td>
                            <td data-label="From">{exp.from}</td>
                            <td data-label="To">{exp.to}</td>
                            <td data-label="Duration">{exp.duration}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {/* Detailed Responsibilities */}
                {experiences.map((exp, index) => (
                    <div key={index} className="responsibilities" data-aos="fade-up">
                        <h3>{index + 1}. {exp.organization}</h3>
                        <ul>
                            {exp.responsibilities.map((resp, idx) => (
                                <li key={idx}>{resp}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default ProfessionalExperience;
