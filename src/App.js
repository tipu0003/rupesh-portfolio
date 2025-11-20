// src/App.js

import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import AboutMe from './components/AboutMe';
import ProfileLinks from './components/ProfileLinks';
import ExperienceOverview from './components/ExperienceOverview';
import Education from './components/Education';
import ProfessionalExperience from './components/ProfessionalExperience';
import ResearchPublications from './components/ResearchPublications';
import PublicationsCarousel from './components/PublicationsCarousel';
import Memberships from './components/Memberships';
import CoursesTaught from './components/CoursesTaught';
import ConferencePresentations from './components/ConferencePresentations';
import WorkshopsConducted from './components/WorkshopsConducted';
import ContactForm from './components/ContactForm';
import FeedbackForm from './components/FeedbackForm';
import { Helmet } from 'react-helmet';
import './App.css';
import 'aos/dist/aos.css';
import Skills from './components/Skills';

// TEMP: example items for the top carousel.
// Replace with your real publications or remove this prop later
// to let PublicationsCarousel fetch /data/scholar.json.
const pubsForHero = [
  {
    title:
      'Calendar–Weather Fusion with Explainable Gradient Boosting for Smart-Home Appliance Energy Prediction',
    year: 2024,
    venue: 'Journal / Conference',
    scholar_url: 'https://scholar.google.com/',
    citations: 12,
    highlight: 'Energy savings with explainable models'
  },
  {
    title:
      'Physics-Guided Monotone Gradient Boosting for Self-Compacting Concrete',
    year: 2024,
    venue: 'Journal / Conference',
    citations: 9
  },
  {
    title:
      'AI-Driven Optimization for Chiller Plant Performance',
    year: 2023,
    venue: 'Journal / Conference'
  }
];

function App() {
  return (
    <Router>
      <div className="App">
        <Helmet>
          <title>Rupesh Kumar Tipu - Assistant Professor Portfolio</title>
          <meta
            name="description"
            content="Portfolio website of Dr. Rupesh Kumar Tipu, Assistant Professor at K. R. Mangalam University, specializing in Structural Engineering."
          />
          <meta
            name="keywords"
            content="Rupesh Kumar Tipu, Assistant Professor, Structural Engineering, Research, Teaching, Civil Engineering"
          />
          <meta name="author" content="Rupesh Kumar Tipu" />
          <meta property="og:title" content="Rupesh Kumar Tipu - Assistant Professor Portfolio" />
          <meta
            property="og:description"
            content="Portfolio website of Dr. Rupesh Kumar Tipu, Assistant Professor at K. R. Mangalam University, specializing in Structural Engineering."
          />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://tipu0003.github.io/rupesh-portfolio/" />
          <meta
            property="og:image"
            content="https://tipu0003.github.io/rupesh-portfolio/assets/images/profile.jpg"
          />
        </Helmet>

        {/* Top banner */}
        <Header />

        {/* NEW: Carousel below header, above About Me */}
        <div
          className="top-carousel-wrap"
          style={{ maxWidth: '1000px', margin: '12px auto 24px', padding: '0 12px' }}
        >
          <PublicationsCarousel publications={pubsForHero} />
        </div>

        <Routes>
          <Route
            path="/"
            element={
              <>
                <AboutMe />
                <ProfileLinks />
                <ExperienceOverview />
                <Education />
                <ProfessionalExperience />
                <ResearchPublications />
                <Skills />
                <Memberships />
                <CoursesTaught />
                <ConferencePresentations />
                <WorkshopsConducted />
                <ContactForm />
                <FeedbackForm />
              </>
            }
          />
          {/* Redirect to home for undefined routes */}
          <Route path="*" element={<AboutMe />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
