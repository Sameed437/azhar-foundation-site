import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import Reveal from '../components/Reveal';
import PageHero from '../components/PageHero';
import {
  academicCalendar,
  assessmentCycle,
  curriculum,
  school,
  teachingApproach,
} from '../data/site';
import './Academics.css';

const Academics = () => (
  <div className="academics">
    <PageHero
      breadcrumb="Academics"
      tone="sky"
      eyebrow="Curriculum"
      title="What we teach, and how we teach it"
      lead={`A single curriculum thread runs from Playgroup to Grade 10 — broad early on, specialised by the time it matters, and examined against ${school.board} standards.`}
    />

    {/* ==================== APPROACH ==================== */}
    <section className="section approach">
      <div className="bg-dots" aria-hidden="true" />

      <div className="container">
        <Reveal className="section-head">
          <p className="eyebrow">Teaching approach</p>
          <h2>Four things we insist on in every classroom</h2>
          <p>
            The syllabus is set by the board. How it is taught is up to us — and that is where
            the difference between a pass and an A+ is actually made.
          </p>
        </Reveal>

        <div className="approach-grid">
          {teachingApproach.map((item, i) => (
            <Reveal key={item.title} delay={Math.min(i, 2) * 90} className="approach-item">
              <span className="approach-item__num" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* ==================== CURRICULUM ==================== */}
    <section className="section section--elevated curriculum" id="curriculum">
      <div className="container">
        <Reveal className="section-head">
          <p className="eyebrow">Subjects by stage</p>
          <h2>The curriculum, stage by stage</h2>
          <p>
            Core subjects are compulsory at every level. The supporting list widens as students
            move up, then narrows again into a board group at matric.
          </p>
        </Reveal>

        <div className="curriculum-grid">
          {curriculum.map((stage, i) => (
            <Reveal key={stage.stage} delay={i * 80} className="curriculum-card">
              <header className="curriculum-card__head">
                <span className="icon-tile icon-tile--navy">
                  <Icon name={stage.icon} size={22} />
                </span>
                <div>
                  <h3>{stage.stage}</h3>
                  <p>{stage.grades}</p>
                </div>
              </header>

              <div className="curriculum-card__body">
                <div className="subject-block">
                  <h4>Core subjects</h4>
                  <ul className="subject-list">
                    {stage.core.map((subject) => (
                      <li key={subject}>
                        <Icon name="check" size={14} strokeWidth={2.4} />
                        {subject}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="subject-block">
                  <h4>Alongside</h4>
                  <ul className="subject-list subject-list--muted">
                    {stage.plus.map((subject) => (
                      <li key={subject}>
                        <Icon name="check" size={14} strokeWidth={2.4} />
                        {subject}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="curriculum-card__note">
                <Icon name="quote" size={15} strokeWidth={0} fill="currentColor" />
                {stage.note}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* ==================== ASSESSMENT ==================== */}
    <section className="section section--dark assessment">
      <div className="container">
        <Reveal className="section-head section-head--center">
          <p className="eyebrow">Assessment</p>
          <h2>Tested often, so nothing is a surprise in March</h2>
          <p>
            Four levels of checking, each one shorter and more frequent than the last stage of
            schooling most students are used to.
          </p>
        </Reveal>

        <ol className="assessment-steps">
          {assessmentCycle.map((item, i) => (
            <Reveal as="li" key={item.step} delay={i * 100} className="assessment-step">
              <span className="assessment-step__num">{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>

    {/* ==================== CALENDAR ==================== */}
    <section className="section section--sunken calendar">
      <div className="container calendar__grid">
        <Reveal variant="left" className="calendar__intro">
          <p className="eyebrow">Academic year</p>
          <h2>How the year is structured</h2>
          <p>
            The session runs August to May, split across two terms. Exact dates are circulated
            to parents at the start of each year and posted on the news page.
          </p>
          <div className="calendar__actions">
            <Link to="/news" className="btn btn--primary">
              See the events calendar
              <Icon name="arrowRight" size={17} className="btn__arrow" />
            </Link>
            <Link to="/results" className="btn btn--ghost">
              Board results
            </Link>
          </div>
        </Reveal>

        <Reveal variant="right" delay={120} className="calendar__list">
          {academicCalendar.map((item) => (
            <div key={item.term} className="calendar-row">
              <div className="calendar-row__head">
                <h3>{item.term}</h3>
                <span className="chip">{item.span}</span>
              </div>
              <p>{item.detail}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>

    {/* ==================== CTA ==================== */}
    <section className="cta-section">
      <div className="container">
        <Reveal variant="scale" className="cta-panel">
          <img src="/images/logo.png" alt="" aria-hidden="true" className="crest-mark" />

          <div>
            <p className="eyebrow">Visit a classroom</p>
            <h2>Want to see a lesson in progress?</h2>
            <p className="cta-panel__text">
              Campus visits run during teaching hours on purpose — you should see the classrooms
              working, not empty.
            </p>
          </div>

          <div className="cta-panel__actions">
            <Link to="/admissions" className="btn btn--gold btn--lg">
              Apply for admission
              <Icon name="arrowRight" size={18} className="btn__arrow" />
            </Link>
            <Link to="/faculty" className="btn btn--on-dark btn--lg">
              Meet the departments
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  </div>
);

export default Academics;
