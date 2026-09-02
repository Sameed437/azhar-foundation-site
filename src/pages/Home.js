import React from 'react';
import { Link } from 'react-router-dom';
import CountUp from 'react-countup';
import Icon from '../components/Icon';
import Reveal from '../components/Reveal';
import Gallery from '../components/Gallery';
import TopperGrid from '../components/TopperGrid';
import {
  admissionsSession,
  features,
  gallery,
  programmes,
  school,
  stats,
  toppers,
} from '../data/site';
import './Home.css';

/* The hero photo reappearing as a slide is a dead payoff — leave it out. */
const homeSlides = gallery.filter((slide) => slide.src !== '/images/banner.jpg');

const Home = () => (
  <div className="home">
    {/* ==================== HERO ==================== */}
    <section className="hero">
      <div className="hero__media">
        <picture>
          <source
            type="image/webp"
            srcSet="/images/banner-900.webp 900w, /images/banner-1600.webp 1600w"
            sizes="100vw"
          />
          <img src="/images/banner.jpg" alt="" aria-hidden="true" />
        </picture>
      </div>
      <div className="hero__tint" aria-hidden="true" />
      <div className="hero__scrim" aria-hidden="true" />
      <div className="hero__grid" aria-hidden="true" />

      <div className="container hero__inner">
        <div className="hero__copy">
          <p className="hero__eyebrow">
            <span className="hero__pulse" aria-hidden="true" />
            Admissions open for the {admissionsSession()} session
          </p>

          <h1 className="hero__title">
            Where strong foundations
            <span className="hero__title-accent"> build confident futures</span>
          </h1>

          <p className="hero__lead">
            {school.name} has taught Lahore&rsquo;s children since {school.foundedYear} —
            pairing academic rigour with character, from Playgroup through Matriculation.
          </p>

          <div className="hero__actions">
            <Link to="/contact?about=Campus%20visit#enquiry" className="btn btn--primary btn--lg">
              Book a campus visit
              <Icon name="arrowRight" size={18} className="btn__arrow" />
            </Link>
            <Link to="/admissions" className="btn btn--on-dark btn--lg">
              How admissions work
            </Link>
          </div>

          <ul className="hero__proof">
            <li>
              <Icon name="shield" size={18} />
              <span>Registered with {school.board}</span>
            </li>
            <li>
              <Icon name="clock" size={18} />
              <span>Established {school.foundedYear}</span>
            </li>
            <li>
              <Icon name="users" size={18} />
              <span>Secure, monitored campus</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Stats bar that straddles the hero and the next section */}
      <div className="container">
        <div className="stat-bar">
          {stats.map((stat, i) => (
            <Reveal className="stat-bar__item" key={stat.label} delay={i * 90}>
              <span className="stat-bar__value">
                <CountUp end={stat.value} duration={1.4} enableScrollSpy scrollSpyOnce />
                <span className="stat-suffix">{stat.suffix}</span>
              </span>
              <span className="stat-bar__label">{stat.label}</span>
              <span className="stat-bar__caption">{stat.caption}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* ==================== INTRODUCTION ==================== */}
    <section className="section intro">
      <div className="bg-dots" aria-hidden="true" />
      <div className="container intro__inner">
        <Reveal variant="left" className="intro__lead">
          <p className="eyebrow">About the school</p>
          <h2>
            Two decades of teaching that treats every child as an individual.
          </h2>
        </Reveal>

        <Reveal variant="right" delay={120} className="intro__body">
          <p>
            {school.name} was established in {school.foundedYear} with a simple conviction:
            quality education is built on academic rigour, steady discipline and clear moral
            grounding. We have held to it ever since.
          </p>
          <p>
            Our campus is a safe, inclusive and intellectually demanding place. Students from
            Playgroup to Matriculation learn in small sections led by subject specialists, in
            smart classrooms built around a learner-centred curriculum.
          </p>
          <p>
            Excellence here is not an ambition we advertise. It is a standard we keep, one
            cohort at a time.
          </p>

          <Link to="/about" className="link-arrow">
            Read our full story
            <Icon name="arrowRight" size={17} />
          </Link>
        </Reveal>
      </div>
    </section>

    {/* ==================== PROGRAMMES ==================== */}
    <section className="section programmes" id="programmes">
      <div className="container">
        <Reveal className="section-head">
          <p className="eyebrow">Academic programmes</p>
          <h2>One school, four stages, a single standard</h2>
          <p>
            Children join us at three and leave at sixteen. Each stage is designed to hand the
            next one a student who is ready.
          </p>
        </Reveal>

        <div className="programme-grid">
          {programmes.map((programme, i) => (
            <Reveal
              key={programme.stage}
              delay={i * 90}
              className="programme card card--interactive"
            >
              <span className="icon-tile">
                <Icon name={programme.icon} size={24} />
              </span>

              <div className="programme__head">
                <h3>{programme.stage}</h3>
                <span className="chip">{programme.ages}</span>
              </div>

              <p className="programme__grades">{programme.grades}</p>
              <p className="programme__text">{programme.description}</p>

              <ul className="programme__list">
                {programme.highlights.map((highlight) => (
                  <li key={highlight}>
                    <Icon name="check" size={15} strokeWidth={2.4} />
                    {highlight}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* ==================== RESULTS ==================== */}
    <section className="section results section--dark">
      <img src="/images/logo.png" alt="" aria-hidden="true" className="crest-mark" />

      <div className="container">
        <Reveal className="section-head section-head--center">
          <p className="eyebrow">Matriculation 2024</p>
          <h2>A result sheet we are proud to publish</h2>
          <p>
            Board examination performance out of 1100 marks. Four students crossed 1080 —
            every one of them an A+ grade.
          </p>
        </Reveal>

        <TopperGrid toppers={toppers} />

        <Reveal variant="fade" delay={200} className="results__more">
          <Link to="/results" className="link-arrow">
            See the five-year record
            <Icon name="arrowRight" size={17} />
          </Link>
        </Reveal>
      </div>
    </section>

    {/* ==================== PRINCIPAL'S MESSAGE ==================== */}
    <section className="section message">
      <div className="container">
        <Reveal variant="scale" className="message__card">
          <div className="message__portrait media-graded">
            <img src="/images/cheif.jpg" alt="Patron-in-Chief of Azhar Foundation School" />
          </div>

          <div className="message__body">
            <span className="message__quote-mark" aria-hidden="true">
              <Icon name="quote" size={40} strokeWidth={0} />
            </span>

            <p className="eyebrow">Message from the Patron-in-Chief</p>

            <blockquote className="message__quote">
              &ldquo;At {school.name} we believe in the power of hard work, consistency and
              discipline. Every achievement begins with focused effort. Our mission is to
              inspire students to dream big, stay committed, and turn those dreams into
              reality — because success is earned, never gifted.&rdquo;
            </blockquote>

            <div className="message__signature">
              <span className="message__name">Ch. Azhar Mehmood</span>
              <span className="message__role">Patron-in-Chief &amp; Founder</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>

    {/* ==================== CAMPUS LIFE ==================== */}
    <section className="section campus section--sunken">
      <div className="container">
        <Reveal className="section-head section-head--center">
          <p className="eyebrow">Campus life</p>
          <h2>School is more than the syllabus</h2>
          <p>
            Annual functions, science fairs, debates and sports — the moments where confidence
            is actually built.
          </p>
        </Reveal>

        <Reveal variant="fade" delay={100}>
          <Gallery slides={homeSlides} />
        </Reveal>
      </div>
    </section>

    {/* ==================== WHY CHOOSE US ==================== */}
    <section className="section features">
      <div className="container">
        <Reveal className="section-head section-head--center">
          <p className="eyebrow">Why choose us</p>
          <h2>Six reasons parents keep sending us their children</h2>
        </Reveal>

        <div className="feature-grid">
          {features.map((feature, i) => (
            <Reveal
              key={feature.title}
              delay={(i % 3) * 90}
              className="feature card card--interactive"
            >
              <span className="icon-tile">
                <Icon name={feature.icon} size={24} />
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* ==================== CTA ==================== */}
    <section className="cta-section">
      <div className="container">
        <Reveal variant="scale" className="cta-panel">
          <img src="/images/logo.png" alt="" aria-hidden="true" className="crest-mark" />

          <div>
            <p className="eyebrow">Admissions</p>
            <h2>Come and see the school for yourself</h2>
            <p className="cta-panel__text">
              Book a campus visit, meet the section head, and ask us anything. Seats for the
              coming session are filling now.
            </p>
          </div>

          <div className="cta-panel__actions">
            <Link to="/admissions" className="btn btn--gold btn--lg">
              Apply for admission
              <Icon name="arrowRight" size={18} className="btn__arrow" />
            </Link>
            <a href={school.phoneHref} className="btn btn--on-dark btn--lg">
              <Icon name="phone" size={17} />
              {school.phone}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  </div>
);

export default Home;
