import React, { useEffect } from 'react';
import './Skills.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

function Skills() {
    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    const skills = [
        'Structural Analysis',
        'AutoCAD',
        'Revit',
        'MATLAB',
        'Python',
        'Concrete Design',
        'Steel Design',
        '3dsMax',
        'Engineering Codes and Standards',
        'Project Management',
        'Construction Materials Testing',
    ];

    return (
        <section id="skills" className="skills" data-aos="fade-up">
            <div className="container">
                <h2>Skills</h2>
                <div className="skills-grid">
                    {skills.map((skill, index) => (
                        <div className="skill-item" key={index}>
                            <div className="skill-icon">
                                {/* You can replace this with actual icons if available */}
                                <span role="img" aria-label={skill}>{getSkillIcon(skill)}</span>
                            </div>
                            <div className="skill-name">{skill}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Helper function to get an emoji or icon for each skill
function getSkillIcon(skill) {
    const icons = {
        'Structural Analysis': '🧱',
        'AutoCAD': '✏️',
        'Revit': '🏗️',
        'MATLAB': '📊',
        'Python': '🐍',
        'Concrete Design': '🏢',
        'Steel Design': '⚙️',
        '3dsMax': '🎨',
        'Engineering Codes and Standards': '📚',
        'Project Management': '📈',
        'Construction Materials Testing': '🔬',
    };
    return icons[skill] || '🔧';
}

export default Skills;
