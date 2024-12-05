// src/components/Header.js

import React from 'react';
import { Link } from 'react-scroll';
import './Header.css';
import profileImage from '../assets/profile.png'; // Adjust the path as necessary

function Header() {
    return (
        <header className="header">
            {/* Navigation Bar */}
            <nav className="navbar">
                <ul>
                    <li><Link to="about" smooth={true} duration={500}>About Me</Link></li>
                    <li><Link to="profile-links" smooth={true} duration={500}>Profiles</Link></li>
                    <li><Link to="experience-overview" smooth={true} duration={500}>Experience</Link></li>
                    <li><Link to="education" smooth={true} duration={500}>Education</Link></li>
                    <li><Link to="publications" smooth={true} duration={500}>Publications</Link></li>
                    <li><Link to="skills" smooth={true} duration={500}>Skills</Link></li>
                    <li><Link to="contact" smooth={true} duration={500}>Contact</Link></li>
                </ul>
            </nav>

            {/* Header Content */}
            <div className="header-content" data-aos="fade-down">
                {/* Profile Image */}
                <div className="profile-image-container">
                    <img src={profileImage} alt="Dr. Rupesh Kumar Tipu" className="profile-image" />
                </div>

                {/* Header Text */}
                <div className="header-text">
                    <h1>Dr. Rupesh Kumar Tipu</h1>
                    <p>Assistant Professor at K. R. Mangalam University</p>
                </div>
            </div>
        </header>
    );
}

export default Header;
