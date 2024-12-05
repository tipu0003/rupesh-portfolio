import React, { useEffect } from 'react';
import './CoursesTaught.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

function CoursesTaught() {
    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    const courses = [
        'Concrete Technology',
        'Structural Analysis',
        'Design of Concrete Structures',
        'Steel Structures',
        'Construction Materials',
        'Geotechnical Engineering',
        'Engineering Mechanics',
        'Project Management',
        'Surveying',
    ];

    return (
        <section id="courses-taught" className="courses-taught" data-aos="fade-up">
            <div className="container">
                <h2>Courses Taught</h2>
                <ul>
                    {courses.map((course, index) => (
                        <li key={index}>{course}</li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

export default CoursesTaught;
