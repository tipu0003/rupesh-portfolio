import React, { useEffect } from 'react';
import './ProfileLinks.css';
import AOS from 'aos';
import orcidIcon from '../assets/icons/orcid.png';
import scholarIcon from '../assets/icons/scholar.png';
import linkedinIcon from '../assets/icons/linkedin.png';
import scopusIcon from '../assets/icons/scopus.png';
import wosIcon from '../assets/icons/wos.png';
import vidwanIcon from '../assets/icons/vidwan.png';

function ProfileLinks() {
    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    const profiles = [
        {
            icon: orcidIcon,
            label: 'ORCID ID',
            link: 'https://orcid.org/0000-0001-8476-8364',
        },
        {
            icon: scholarIcon,
            label: 'Google Scholar',
            link: 'https://scholar.google.com/citations?user=uZzLU8IAAAAJ',
        },
        {
            icon: linkedinIcon,
            label: 'LinkedIn',
            link: 'https://www.linkedin.com/in/dr-rupesh-kumar-a60096270/',
        },
        {
            icon: scopusIcon,
            label: 'Scopus',
            link: 'https://www.scopus.com/authid/detail.uri?authorId=57761722500',
        },
        {
            icon: wosIcon,
            label: 'Web of Science',
            link: 'https://www.webofscience.com/wos/author/record/AFC-1290-2022',
        },
        {
            icon: vidwanIcon,
            label: 'Vidwan Profile',
            link: 'https://vidwan.inflibnet.ac.in/profile/344917',
        },
    ];

    return (
        <section id="profile-links" className="profile-links" data-aos="fade-up">
            <div className="container">
                <h2>Profile Links</h2>
                <div className="profiles">
                    {profiles.map((profile, index) => (
                        <a href={profile.link} key={index} target="_blank" rel="noopener noreferrer">
                            <img src={profile.icon} alt={`${profile.label} Icon`} />
                            <span>{profile.label}</span>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default ProfileLinks;
