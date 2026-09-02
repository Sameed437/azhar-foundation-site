import React from 'react';
import { Link } from 'react-router-dom';
import CountUp from 'react-countup';
import Icon from '../components/Icon';
import Reveal from '../components/Reveal';
import PageHero from '../components/PageHero';
import { milestones, programmes, school, stats, values } from '../data/site';
import './About.css';

const About = () => (
  <div className="about">
    <PageHero
      breadcrumb="About"
      tone="sky"
      eyebrow={`Established ${school.foundedYear}`}
      title="A school built on foundations, not shortcuts"
      lead={`For more than two decades ${school.name} has taught Lahore's children to work hard, think clearly and carry themselves well. This is how we do it.`}
    />

    {/* ==================== MISSION ==================== */}
    <section className="section about-intro">
      <div className="bg-dots" aria-hidden="true" />

      <div className="container about-intro__grid">
        <Reveal variant="left" className="about-intro__story">
          <p className="eyebrow">Our story</p>
          <h2>From a single primary section to a full Matriculation school</h2>

          <p>
            {school.name} opened its doors in {school.foundedYear} in Allama Iqbal Town with a
            handful of classrooms and one conviction — that a child&rsquo;s early years decide
            everything that follows. We started with primary grades only, and grew deliberately,
            adding a stage at a time and never faster than we could staff it properly.
          </p>
          <p>
            Today we teach from Playgroup through Grade 10, with subject specialists at the
            middle and matric level, smart classrooms across every section, and a curriculum
            built around understanding rather than memorisation.
          </p>
          <p>
            What has not changed is the standard. Small sections, close attention, honest
            reporting to parents, and the expectation that every child can do better than they
            think they can.
          </p>

          <div className="about-intro__actions">
            <Link to="/admissions" className="btn btn--primary">
              Admissions process
              <Icon name="arrowRight" size={17} className="btn__arrow" />
            </Link>
            <Link to="/contact" className="btn btn--ghost">
              Visit the campus
            </Link>
          </div>
        </Reveal>

        <Reveal variant="right" delay={140} className="about-intro__aside">
          <div className="about-figure media-graded">
            <img src="/images/slide4.jpg" alt="Students and staff of Azhar Foundation School" />
            <div className="about-figure__badge">
              <span className="about-figure__years">
                <CountUp end={new Date().getFullYear() - school.foundedYear} duration={2} enableScrollSpy scrollSpyOnce />
              </span>
              <span className="about-figure__label">years of teaching</span>
            </div>
          </div>

          <dl className="about-facts">
            {stats.slice(0, 3).map((stat) => (
              <div key={stat.label}>
                <dt>{stat.label}</dt>
                <dd>{`${stat.value}${stat.suffix}`}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>

    {/* ==================== MISSION / VISION ==================== */}
    <section className="section section--tight mission section--elevated">
      <div className="container mission__grid">
        <Reveal className="mission__card mission__card--mission">
          <span className="icon-tile icon-tile--navy">
            <Icon name="compass" size={24} />
          </span>
          <h2>Our mission</h2>
          <p>
            To give every student a rigorous academic grounding and a strong moral compass — so
            they leave us able to reason for themselves, work without supervision, and treat
            people well.
          </p>
        </Reveal>

        <Reveal delay={120} className="mission__card mission__card--vision">
          <span className="icon-tile icon-tile--gold">
            <Icon name="sparkle" size={24} />
          </span>
          <h2>Our vision</h2>
          <p>
            To be the school Lahore families recommend without hesitation: known for results
            that hold up, teachers who stay, and graduates who go on to lead in whatever they
            choose.
          </p>
        </Reveal>
      </div>
    </section>

    {/* ==================== VALUES ==================== */}
    <section className="section values section--sunken">
      <div className="container">
        <Reveal className="section-head section-head--center">
          <p className="eyebrow">What we stand for</p>
          <h2>Four values we actually grade against</h2>
          <p>
            These are not posters in the corridor. They show up in how lessons are planned,
            how students are assessed and how the school day runs.
          </p>
        </Reveal>

        <div className="value-grid">
          {values.map((value, i) => (
            <Reveal key={value.title} delay={i * 90} className="value">
              <span className="value__index">{String(i + 1).padStart(2, '0')}</span>
              <span className="icon-tile">
                <Icon name={value.icon} size={22} />
              </span>
              <h3>{value.title}</h3>
              <p>{value.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* ==================== PROGRAMMES ==================== */}
    <section className="section programmes-table section--elevated" id="programmes">
      <div className="container">
        <Reveal className="section-head">
          <p className="eyebrow">Academic structure</p>
          <h2>What is taught, and when</h2>
          <p>
            Four stages, each with its own focus, staffing model and assessment rhythm.
          </p>
        </Reveal>

        <div className="stage-list">
          {programmes.map((programme, i) => (
            <Reveal key={programme.stage} delay={Math.min(i, 2) * 80} className="stage">
              <div className="stage__marker" aria-hidden="true">
                <span className="icon-tile">
                  <Icon name={programme.icon} size={22} />
                </span>
              </div>

              <div className="stage__head">
                <h3>{programme.stage}</h3>
                <p className="stage__grades">{programme.grades}</p>
              </div>

              <p className="stage__ages">
                <span className="chip">{programme.ages}</span>
              </p>

              <p className="stage__text">{programme.description}</p>

              <ul className="stage__highlights">
                {programme.highlights.map((highlight) => (
                  <li key={highlight}>
                    <Icon name="check" size={14} strokeWidth={2.4} />
                    {highlight}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* ==================== TIMELINE ==================== */}
    <section className="section timeline-section section--dark">
      <div className="container container--narrow">
        <Reveal className="section-head section-head--center">
          <p className="eyebrow">Milestones</p>
          <h2>How the school grew</h2>
        </Reveal>

        <ol className="timeline">
          {milestones.map((milestone, i) => (
            <Reveal as="li" key={milestone.year} delay={Math.min(i, 2) * 90} className="timeline__item">
              <span className="timeline__year">{milestone.year}</span>
              <span className="timeline__node" aria-hidden="true" />
              <div className="timeline__body">
                <h3>{milestone.title}</h3>
                <p>{milestone.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>

    {/* ==================== CTA ==================== */}
    <section className="cta-section">
      <div className="container">
        <Reveal variant="scale" className="cta-panel">
          <img src="/images/logo.png" alt="" aria-hidden="true" className="crest-mark" />

          <div>
            <p className="eyebrow">Visit us</p>
            <h2>Still deciding? Come and look around.</h2>
            <p className="cta-panel__text">
              A twenty-minute campus visit answers more questions than any brochure. Call the
              office and we will find a time that suits you.
            </p>
          </div>

          <div className="cta-panel__actions">
            <Link to="/admissions" className="btn btn--gold btn--lg">
              Apply now
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

export default About;
