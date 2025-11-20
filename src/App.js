// src/App.js
import React, { useMemo } from 'react';
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
import Skills from './components/Skills';
import { Helmet } from 'react-helmet';
import './App.css';
import 'aos/dist/aos.css';

// 🔗 single source of truth for publications
import { publications } from './data/publications';

function App() {
  // pick “recent 5”: prefer addedAt, fallback to year, then keep stable order
  const recentFive = useMemo(() => {
    return [...publications]
      .sort((a, b) => {
        const ad = a.addedAt ? new Date(a.addedAt).getTime() : 0;
        const bd = b.addedAt ? new Date(b.addedAt).getTime() : 0;
        if (bd !== ad) return bd - ad;
        const ay = a.year || 0;
        const by = b.year || 0;
        if (by !== ay) return by - ay;
        return 0;
      })
      .slice(0, 5);
  }, []);

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

        {/* Carousel below header, auto-fed with latest 5 */}
        <div
          className="top-carousel-wrap"
          style={{ maxWidth: '1000px', margin: '12px auto 24px', padding: '0 12px' }}
        >
          <PublicationsCarousel publications={recentFive} />
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
                {/* Full list pulls from the same source (see note below) */}
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
          <Route path="*" element={<AboutMe />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
