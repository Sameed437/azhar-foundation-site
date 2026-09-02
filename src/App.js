import React, { Suspense, lazy } from 'react';
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

/* The fee-management panel is its own lazy chunk so the public site's
   bundle is unaffected. */
const AdminApp = lazy(() => import('./admin/AdminApp'));

const AdminFallback = () => (
  <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }} role="status">
    Loading the fee system…
  </div>
);

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

const Chrome = () => {
  const { pathname } = useLocation();

  /* The admin panel brings its own layout — no public header/footer/bar.
     It must mount under a /admin/* route so its nested relative routes
     (index, families, fees…) resolve against /admin. */
  if (pathname.startsWith('/admin')) {
    return (
      <Routes>
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<AdminFallback />}>
              <AdminApp />
            </Suspense>
          }
        />
      </Routes>
    );
  }

  return (
    <>
      <ScrollReset />
      <Header />
      <RoutedContent />
      <Footer />
      <BackToTop />
      <ActionBar />
    </>
  );
};

const App = () => (
  <Router>
    <Chrome />
  </Router>
);

export default App;
