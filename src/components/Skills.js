// src/components/Skills.js

import React from 'react';
import './Skills.css';
import {
    FaTools,
    FaProjectDiagram,
    FaPython,
    FaDatabase,
    FaCogs,
    FaDraftingCompass,
    FaBuilding,
    FaCalculator,
    FaHammer,
    FaCube
} from 'react-icons/fa';

function Skills() {
    const skills = [
        { name: 'Structural Analysis', icon: <FaTools /> },
        { name: 'AutoCAD', icon: <FaDraftingCompass /> },
        { name: 'Revit', icon: <FaBuilding /> },
        { name: 'MATLAB', icon: <FaCalculator /> },
        { name: 'Python', icon: <FaPython /> },
        { name: 'Concrete Design', icon: <FaHammer /> },
        { name: 'Steel Design', icon: <FaCogs /> },
        { name: '3ds Max', icon: <FaCube /> },
        { name: 'Engineering Codes and Standards', icon: <FaDatabase /> },
        { name: 'Project Management', icon: <FaProjectDiagram /> },
        { name: 'Construction Materials Testing', icon: <FaTools /> },
    ];

    return (
        <section id="skills" className="skills" data-aos="fade-up">
            <div className="container">
                <h2>Skills</h2>
                <div className="skills-grid">
                    {skills.map((skill, index) => (
                        <div className="skill-item" key={index}>
                            <div className="skill-icon">
                                {skill.icon}
                            </div>
                            <div className="skill-name">{skill.name}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Skills;
