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

// 🔗 single source of truth
import { publications } from './data/publications';

function App() {
  const recentFive = useMemo(() => {
    const parseDMY = (s) => {
      if (!s) return 0;
      const m = String(s).match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
      if (!m) return 0;
      const [, dd, mm, yyyy] = m;
      return new Date(Number(yyyy), Number(mm) - 1, Number(dd)).getTime();
    };

    let seq = 0;
    const flat = [];

    (PUBLICATIONS['Journal Articles'] || []).forEach((p) => {
      flat.push({
        title: p.title,
        year: p.year || 0,
        venue: p.journal || '',
        scholar_url: p.doi ? `https://doi.org/${p.doi}` : undefined,
        category: 'Journal Article',
        sortDate: parseDMY(p.date),
        seq: ++seq,
      });
    });

    (PUBLICATIONS['Conference Proceedings'] || []).forEach((p) => {
      flat.push({
        title: p.title,
        year: p.year || 0,
        venue: p.conference || p.publisher || '',
        scholar_url: p.doi ? `https://doi.org/${p.doi}` : undefined,
        category: 'Conference',
        sortDate: parseDMY(p.date),
        seq: ++seq,
      });
    });

    (PUBLICATIONS['Patents'] || []).forEach((p) => {
      flat.push({
        title: p.title,
        year: p.year || 0,
        venue: `Patent • ${p.country || ''}`.trim(),
        scholar_url: p.doi ? `https://doi.org/${p.doi}` : undefined,
        category: 'Patent',
        sortDate: parseDMY(p.date),
        seq: ++seq,
      });
    });

    flat.sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      if (b.sortDate !== a.sortDate) return b.sortDate - a.sortDate;
      return b.seq - a.seq;
    });

    return flat.slice(0, 5).map((p) => ({
      title: p.title,
      year: p.year,
      venue: p.venue,
      scholar_url: p.scholar_url,
      highlight: p.category,
    }));
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

        {/* Header / name banner */}
        <Header />

        {/* NEW: Top-of-page carousel (below header, above About Me) */}
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
