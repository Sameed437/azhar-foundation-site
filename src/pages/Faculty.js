import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import Reveal from '../components/Reveal';
import PageHero from '../components/PageHero';
import { departments, facultyCommitments, leadership, school } from '../data/site';
import './Faculty.css';

const Faculty = () => (
  <div className="faculty">
    <PageHero
      breadcrumb="Faculty"
      eyebrow="Our teachers"
      title="The people who do the teaching"
      lead="Six departments, subject specialists from Grade 6 upward, and a leadership team that is on the corridor rather than behind a door."
      tone="blue"
    />

    {/* ==================== LEADERSHIP ==================== */}
    <section className="section leadership">
      <div className="bg-dots" aria-hidden="true" />

      <div className="container">
        <Reveal className="section-head">
          <p className="eyebrow">Leadership</p>
          <h2>Who runs the school</h2>
          <p>
            Four roles carry responsibility for everything from the timetable to the front gate.
          </p>
        </Reveal>

        <div className="leadership-grid">
          {leadership.map((person, i) => (
            <Reveal key={person.role} delay={Math.min(i, 2) * 90} className="leader">
              <span className="icon-tile icon-tile--navy">
                <Icon name={person.icon} size={24} />
              </span>
              <h3>{person.role}</h3>
              <p>{person.remit}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* ==================== DEPARTMENTS ==================== */}
    <section className="section section--elevated departments" id="departments">
      <div className="container">
        <Reveal className="section-head">
          <p className="eyebrow">Departments</p>
          <h2>Teaching staff by department</h2>
          <p>
            Positions are listed with the qualification held and the grades covered. Names are
            available at the office, and on request at a campus visit.
          </p>
        </Reveal>

        <div className="department-grid">
          {departments.map((dept, i) => (
            <Reveal key={dept.name} delay={(i % 3) * 90} className="department">
              <header className="department__head">
                <span className="icon-tile">
                  <Icon name={dept.icon} size={22} />
                </span>
                <div>
                  <h3>{dept.name}</h3>
                  {/* Skip the subject line when it only repeats the department name */}
                  {dept.subjects !== dept.name && <p>{dept.subjects}</p>}
                </div>
              </header>

              <p className="chip department__stages">
                <Icon name="cap" size={15} />
                {dept.stages}
              </p>

              <ul className="role-list">
                {dept.roles.map((role) => (
                  <li key={role.title}>
                    <span className="role-list__title">{role.title}</span>
                    <span className="role-list__meta">
                      {role.qualification} · {role.scope}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        <Reveal variant="fade" delay={200} className="faculty-note">
          <Icon name="quote" size={18} strokeWidth={0} fill="currentColor" />
          <p>
            Individual staff names and photographs are not published online. If you would like
            to meet the teacher who will take your child&rsquo;s class, ask at the office and we
            will arrange it during your campus visit.
          </p>
        </Reveal>
      </div>
    </section>

    {/* ==================== COMMITMENTS ==================== */}
    <section className="section section--dark commitments">
      <div className="container">
        <Reveal className="section-head section-head--center">
          <p className="eyebrow">Our commitments</p>
          <h2>What we promise about the people in front of your child</h2>
        </Reveal>

        <div className="commitment-grid">
          {facultyCommitments.map((item, i) => (
            <Reveal key={item.title} delay={i * 110} className="commitment-card">
              <span className="icon-tile icon-tile--on-dark">
                <Icon name={item.icon} size={22} />
              </span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* ==================== TEACH WITH US ==================== */}
    <section className="teach-strip">
      <div className="container">
        <Reveal variant="fade" className="teach-strip__inner">
          <p>
            <strong>Teach with us.</strong> Send a CV with the subject and grades you teach —
            shortlisted candidates are asked to give a demonstration lesson.
          </p>
          <a href={school.emailHref} className="btn btn--ghost">
            <Icon name="mail" size={16} />
            Send a CV
          </a>
        </Reveal>
      </div>
    </section>

    {/* ==================== CLOSING CTA ==================== */}
    <section className="cta-section">
      <div className="container">
        <Reveal variant="scale" className="cta-panel">
          <img src="/images/logo.png" alt="" aria-hidden="true" className="crest-mark" />

          <div>
            <p className="eyebrow">Meet them yourself</p>
            <h2>Meet these teachers on a campus visit</h2>
            <p className="cta-panel__text">
              Tour the classrooms, sit in on a lesson, and talk to the people who would
              actually teach your child. The office will arrange it around your time.
            </p>
          </div>

          <div className="cta-panel__actions">
            <Link to="/contact?about=Campus%20visit#enquiry" className="btn btn--gold btn--lg">
              Book a campus visit
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

export default Faculty;
