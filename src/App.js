import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ActionBar from './components/ActionBar';
import BackToTop, { ScrollReset } from './components/ScrollToTop';
import Home from './pages/Home';
import About from './pages/About';
import Academics from './pages/Academics';
import Faculty from './pages/Faculty';
import Admissions from './pages/Admissions';
import Results from './pages/Results';
import Facilities from './pages/Facilities';
import GalleryPage from './pages/GalleryPage';
import News from './pages/News';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import Login from './components/Login';
import './App.css';

/* Keyed on pathname so each route entry gets a short opacity-only fade. */
const RoutedContent = () => {
  const { pathname } = useLocation();

  return (
    <main id="main" className="route-in" key={pathname}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/academics" element={<Academics />} />
        <Route path="/faculty" element={<Faculty />} />
        <Route path="/admissions" element={<Admissions />} />
        <Route path="/results" element={<Results />} />
        <Route path="/facilities" element={<Facilities />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/news" element={<News />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  );
};

const App = () => (
  <Router>
    <ScrollReset />
    <Header />
    <RoutedContent />
    <Footer />
    <BackToTop />
    <ActionBar />
  </Router>
);

export default App;
