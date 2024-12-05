import React, { useEffect } from 'react';
import { Link } from 'react-scroll';
import './Header.css';
import AOS from 'aos';

function Header() {
    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    return (
        <header className="header">
            <div className="header-content" data-aos="fade-down">
                <h1>Rupesh Kumar Tipu</h1>
                <p>Assistant Professor at K. R. Mangalam University</p>
                <nav>
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
            </div>
        </header>
    );
}

export default Header;
