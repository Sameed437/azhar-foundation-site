import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import CountUp from 'react-countup';
import './Home.css';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";


const Home = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <div className="home-page">

      {/* Hero Section */}
      <section className="hero" style={{ backgroundImage: `url('/images/banner.jpg')` }}>
        <div className="hero-overlay">
          <h1>Azhar Foundation School</h1>
          <p>Providing Excellence in Education Since 2001</p>
          <a href="/contact" className="cta-button">Contact Us</a>
        </div>
      </section>

      {/* About Section */}
      <section className="description" data-aos="fade-up">
        <h2>About Our School</h2>
        <p>
          Azhar Foundation School was established in 2001 with a vision to provide quality education grounded in academic rigor, discipline, and moral values. For over two decades, we have remained committed to nurturing young minds through a balanced approach to academics, character development, and co-curricular activities.

Our campus provides a safe, inclusive, and intellectually stimulating environment where students from Playgroup to Matriculation are empowered to grow into confident, responsible, and successful individuals. With a highly qualified teaching faculty, smart classrooms, and a learner-centered curriculum, we strive to instill lifelong learning habits, leadership qualities, and ethical values in every child.

At Azhar Foundation School, excellence is not just a goal — it is a tradition we proudly uphold.
        </p>
      </section>
{/* Matric Result Highlights */}
<section className="result-section" data-aos="fade-up">
  <h2>🎓 Matriculation Result Highlights</h2>
  <p className="subtitle">Board Exam Performance (Out of 1100 Marks)</p>

  <div className="result-cards">
    <div className="result-card" data-aos="zoom-in">
      <span className="rank">🥇 1st</span>
      <h3>Anzal Azhar Ch.</h3>
      <p className="score">1093 <span className="grade">A+</span></p>
    </div>

    <div className="result-card" data-aos="zoom-in" data-aos-delay="100">
      <span className="rank">🥈 2nd</span>
      <h3>Abdullah Bashir</h3>
      <p className="score">1092 <span className="grade">A+</span></p>
    </div>

    <div className="result-card" data-aos="zoom-in" data-aos-delay="200">
      <span className="rank">🥉 3rd</span>
      <h3>Abdul Rehman</h3>
      <p className="score">1089 <span className="grade">A+</span></p>
    </div>

    <div className="result-card" data-aos="zoom-in" data-aos-delay="300">
      <span className="rank">4th</span>
      <h3>Minahil Azeem</h3>
      <p className="score">1081 <span className="grade">A+</span></p>
    </div>
  </div>
</section>
{/* Principal’s Message Section */}
<section className="founder-section" data-aos="fade-right">
  <div className="founder-content">
    <div className="founder-image">
      <img src="/images/cheif.jpg" alt="Principal" />
    </div>
    <div className="founder-message">
      <h2>Message from the Pattern-In-Cheif</h2>
      <p>
        At Azhar Foundation School, we believe in the power of hard work,
        consistency, and discipline. Every achievement begins with focused effort.
        Our mission is to inspire students to dream big, stay committed,
        and transform those dreams into reality. Remember: success is earned, not gifted.
      </p>
      <button>Read More</button>
    </div>
  </div>
</section>
{/* Slideshow Section */}
<section className="slideshow-section" data-aos="zoom-in-up">
  <Carousel
    autoPlay
    infiniteLoop
    showThumbs={false}
    showStatus={false}
    interval={3000}
    transitionTime={800}
    stopOnHover={true}
  >
    <div>
      <img src="/images/slide1.jpg" alt="Annual Function" />
    </div>
    <div>
      <img src="/images/slide2.jpg" alt="Students Activity" />
    </div>
    <div>
      <img src="/images/slide3.jpg" alt="Science Fair" />
    </div>
    <div>
      <img src="/images/slide4.jpg" alt="Classroom Learning" />
    </div>
  </Carousel>
</section>


      {/* Classes Offered */}
      <section className="classes-offered" data-aos="fade-up">
        <h2>Classes We Offer</h2>
        <div className="class-cards">
          <div className="class-card">Playgroup</div>
          <div className="class-card">Nursery</div>
          <div className="class-card">Prep</div>
          <div className="class-card">Grade 1–8</div>
          <div className="class-card">Matriculation</div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats" data-aos="zoom-in">
        <div className="stat">
          <h3><CountUp end={200} duration={3} /></h3>
          <p>Students Enrolled</p>
        </div>
        <div className="stat">
          <h3><CountUp end={95} duration={3} suffix="%" /></h3>
          <p>Board Exam Success Rate</p>
        </div>
        <div className="stat">
          <h3><CountUp end={2001} duration={2} /></h3>
          <p>Founded Year</p>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="features" data-aos="fade-up" data-aos-delay="100">
        <h2>Why Choose Us?</h2>
        <div className="feature-grid">
          <div className="feature-card">Smart Classrooms</div>
          <div className="feature-card">Qualified Teachers</div>
          <div className="feature-card">Moral Development</div>
          <div className="feature-card">Affordable Fees</div>
          <div className="feature-card">Academic Excellence</div>
          <div className="feature-card">Playgroup to Matric</div>
        </div>
      </section>

    </div>
  );
};

export default Home;
