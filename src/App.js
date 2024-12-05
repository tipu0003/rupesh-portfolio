import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import AboutMe from './components/AboutMe';
import ProfileLinks from './components/ProfileLinks';
import ExperienceOverview from './components/ExperienceOverview';
import Education from './components/Education';
import ProfessionalExperience from './components/ProfessionalExperience';
import ResearchPublications from './components/ResearchPublications';
import Skills from './components/Skills';
import Memberships from './components/Memberships';
import CoursesTaught from './components/CoursesTaught';
import ConferencePresentations from './components/ConferencePresentations';
import WorkshopsConducted from './components/WorkshopsConducted';
import ContactForm from './components/ContactForm';
import FeedbackForm from './components/FeedbackForm';
import { Helmet } from 'react-helmet';
import './App.css';
import 'aos/dist/aos.css';

function App() {
  return (
      <Router>
        <div className="App">
          <Helmet>
            <title>Rupesh Kumar Tipu - Assistant Professor Portfolio</title>
            <meta name="description" content="Portfolio website of Dr. Rupesh Kumar Tipu, Assistant Professor at K. R. Mangalam University, specializing in Structural Engineering." />
            <meta name="keywords" content="Rupesh Kumar Tipu, Assistant Professor, Structural Engineering, Research, Teaching, Civil Engineering" />
            <meta name="author" content="Rupesh Kumar Tipu" />
            <meta property="og:title" content="Rupesh Kumar Tipu - Assistant Professor Portfolio" />
            <meta property="og:description" content="Portfolio website of Dr. Rupesh Kumar Tipu, Assistant Professor at K. R. Mangalam University, specializing in Structural Engineering." />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://yourusername.github.io/rupesh-portfolio/" />
            <meta property="og:image" content="https://yourusername.github.io/rupesh-portfolio/assets/images/profile.jpg" />
          </Helmet>
          <Header />
          <Routes>
            <Route exact path="/">
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
            </Route>
            <Route path="*">
              <AboutMe /> {/* Redirect to home for undefined routes */}
            </Route>
          </Routes>
        </div>
      </Router>
  );
}

export default App;
