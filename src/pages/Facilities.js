import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import Reveal from '../components/Reveal';
import PageHero from '../components/PageHero';
import { facilities, gallery, safetyMeasures, school } from '../data/site';
import './Facilities.css';

/* The strip reuses gallery entries so captions always match the photos. */
const campusStrip = ['/images/slide4.jpg', '/images/slide3.jpg', '/images/slide2.jpg']
  .map((src) => gallery.find((shot) => shot.src === src))
  .filter(Boolean);

const Facilities = () => (
  <div className="facilities-page">
    <PageHero
      breadcrumb="Facilities"
      eyebrow="The campus"
      title="Where the school day actually happens"
      lead="Smart classrooms, working laboratories, a library with a timetabled period, and a monitored campus your child stays inside all day."
      tone="sky"
    />

    {/* ==================== FACILITIES ==================== */}
    <section className="section facilities">
      <div className="bg-dots" aria-hidden="true" />

      <div className="container">
        <Reveal className="section-head">
          <p className="eyebrow">Learning spaces</p>
          <h2>What is on site</h2>
          <p>
            One building on Karim Block, arranged so that every section has the room and the
            equipment its syllabus actually requires.
          </p>
        </Reveal>

        <div className="facility-grid">
          {facilities.map((item, i) => (
            <Reveal key={item.title} delay={(i % 3) * 90} className="facility-card">
              <div className="facility-card__top">
                <span className="icon-tile">
                  <Icon name={item.icon} size={24} />
                </span>
                <span className="chip">{item.stat}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* ==================== PHOTO STRIP ==================== */}
    <section className="section section--tight campus-strip">
      <div className="container">
        <Reveal variant="fade" className="campus-strip__grid">
          {campusStrip.map((shot, i) => (
            <figure
              key={shot.src}
              className={`campus-strip__figure media-graded${
                i === 0 ? ' campus-strip__figure--wide' : ''
              }`}
            >
              <img
                src={shot.src}
                alt={shot.caption}
                style={{ objectPosition: shot.pos }}
                loading="lazy"
              />
              <figcaption>{shot.title}</figcaption>
            </figure>
          ))}
        </Reveal>

        <Reveal variant="fade" delay={140} className="campus-strip__cta">
          <Link to="/gallery" className="link-arrow">
            See the full gallery
            <Icon name="arrowRight" size={17} />
          </Link>
        </Reveal>
      </div>
    </section>

    {/* ==================== SAFETY ==================== */}
    <section className="section section--dark safety">
      <div className="container">
        <Reveal className="section-head section-head--center">
          <p className="eyebrow">Safety</p>
          <h2>The part parents ask about first</h2>
          <p>
            Everything below is in place every school day, not just on open days.
          </p>
        </Reveal>

        <ul className="safety-list">
          {safetyMeasures.map((item, i) => (
            <Reveal
              as="li"
              key={item.title}
              delay={Math.min(i, 2) * 90}
              className="safety-item"
            >
              <span className="icon-tile icon-tile--on-dark">
                <Icon name={item.icon} size={22} />
              </span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>

    {/* ==================== LOCATION ==================== */}
    <section className="section section--sunken location">
      <div className="container location__grid">
        <Reveal variant="left" className="location__intro">
          <p className="eyebrow">Find us</p>
          <h2>Allama Iqbal Town, Lahore</h2>
          <p>
            The campus sits on Karim Block, within walking distance of the surrounding
            residential blocks and on a direct route for families coming from further out.
          </p>

          <ul className="location__facts">
            <li>
              <Icon name="pin" size={18} />
              <span>{school.address}</span>
            </li>
            <li>
              <Icon name="clock" size={18} />
              <span>School day 8:00 AM – 2:00 PM, Monday to Friday</span>
            </li>
            <li>
              <Icon name="phone" size={18} />
              <a href={school.phoneHref}>{school.phone}</a>
            </li>
          </ul>

          <div className="location__actions">
            <a
              href={school.mapLink}
              target="_blank"
              rel="noreferrer"
              className="btn btn--primary"
            >
              <Icon name="pin" size={17} />
              Get directions
            </a>
            <Link to="/contact" className="btn btn--ghost">
              Book a visit
            </Link>
          </div>
        </Reveal>

        <Reveal variant="right" delay={120} className="location__map">
          <iframe
            title={`${school.name} location`}
            src={school.mapEmbed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </Reveal>
      </div>
    </section>

    {/* ==================== CLOSING CTA ==================== */}
    <section className="cta-section">
      <div className="container">
        <Reveal variant="scale" className="cta-panel">
          <img src="/images/logo.png" alt="" aria-hidden="true" className="crest-mark" />

          <div>
            <p className="eyebrow">See it in person</p>
            <h2>Walk the campus before you decide</h2>
            <p className="cta-panel__text">
              Photographs only go so far. Book a visit and see the classrooms, labs and
              library for yourself on a working school day.
            </p>
          </div>

          <div className="cta-panel__actions">
            <Link to="/contact?about=Campus%20visit#enquiry" className="btn btn--gold btn--lg">
              Book a campus visit
              <Icon name="arrowRight" size={18} className="btn__arrow" />
            </Link>
            <a
              href={school.whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="btn btn--on-dark btn--lg"
            >
              <Icon name="whatsapp" size={17} />
              WhatsApp us
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  </div>
);

export default Facilities;
