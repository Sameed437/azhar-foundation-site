import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import Reveal from '../components/Reveal';
import PageHero from '../components/PageHero';
import {
  admissionRequirements,
  admissionSteps,
  admissionsSession,
  faqs,
  programmes,
  school,
} from '../data/site';
import './Admissions.css';

const Admissions = () => {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="admissions">
      <PageHero
        breadcrumb="Admissions"
        tone="blue"
        eyebrow={`${admissionsSession()} session`}
        title="Admissions are open"
        lead="Four straightforward steps from first enquiry to first day. Here is exactly what to expect, what to bring, and who to ask."
      >
        <div className="page-hero__actions">
          <a href={school.phoneHref} className="btn btn--gold btn--lg">
            <Icon name="phone" size={17} />
            Call the office
          </a>
          <a
            href={school.whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="btn btn--on-dark btn--lg"
          >
            <Icon name="whatsapp" size={17} />
            WhatsApp us
          </a>
          <Link to="/contact" className="btn btn--on-dark btn--lg">
            Send an enquiry
            <Icon name="arrowRight" size={17} className="btn__arrow" />
          </Link>
        </div>
      </PageHero>

      {/* ==================== PROCESS ==================== */}
      <section className="section process">
        <div className="bg-dots" aria-hidden="true" />

        <div className="container">
          <Reveal className="section-head">
            <p className="eyebrow">How it works</p>
            <h2>The admissions process, start to finish</h2>
            <p>
              Most families complete all four steps within a week. No online portal, no waiting
              list games — just a conversation, a visit and a short assessment.
            </p>
          </Reveal>

          <ol className="steps">
            {admissionSteps.map((item, i) => (
              <Reveal as="li" key={item.step} delay={Math.min(i, 2) * 90} className="step">
                <span className="step__num">{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ==================== SEATS + DOCUMENTS ==================== */}
      <section className="section section--elevated intake">
        <div className="container intake__grid">
          <Reveal variant="left" className="intake__seats">
            <p className="eyebrow">Where we have seats</p>
            <h2>Entry points by stage</h2>
            <p className="intake__note">
              Early Years entry is interview-only. From Grade 1 upward, placement follows a short
              written assessment in English, Urdu and Mathematics.
            </p>

            <ul className="seat-list">
              {programmes.map((programme) => (
                <li key={programme.stage}>
                  <span className="icon-tile icon-tile--navy">
                    <Icon name={programme.icon} size={20} />
                  </span>
                  <span className="seat-list__text">
                    <strong>{programme.stage}</strong>
                    <span>{programme.grades}</span>
                  </span>
                  <span className="seat-list__entry">{programme.entry}</span>
                  <span className="chip">{programme.ages}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal variant="right" delay={140} className="intake__docs">
            <div className="docs-card">
              <span className="icon-tile icon-tile--gold">
                <Icon name="book" size={22} />
              </span>
              <h3>What to bring</h3>
              <p>Have these ready at the time of enrolment to avoid a second trip.</p>

              <ul className="docs-list">
                {admissionRequirements.map((requirement) => (
                  <li key={requirement}>
                    <Icon name="check" size={15} strokeWidth={2.4} />
                    {requirement}
                  </li>
                ))}
              </ul>

              <div className="docs-card__footer">
                <Icon name="clock" size={17} />
                <span>Office hours: Monday to Friday, 8:00 AM – 2:00 PM</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==================== FEES ==================== */}
      <section className="section section--dark fees">
        <div className="container">
          <Reveal className="section-head section-head--center">
            <p className="eyebrow">Fees &amp; support</p>
            <h2>Transparent, and stated up front</h2>
            <p>
              One clear monthly fee per stage, told to you before you enrol — and never changed
              mid-year.
            </p>
          </Reveal>

          <div className="fee-grid">
            <Reveal className="fee-card">
              <span className="icon-tile icon-tile--on-dark">
                <Icon name="wallet" size={22} />
              </span>
              <h3>Affordable structure</h3>
              <p>
                Monthly tuition set to stay within reach for working families, billed on a clear
                schedule with no hidden add-ons.
              </p>
            </Reveal>

            <Reveal delay={110} className="fee-card">
              <span className="icon-tile icon-tile--on-dark">
                <Icon name="users" size={22} />
              </span>
              <h3>Sibling concession</h3>
              <p>
                Families enrolling more than one child receive a standing discount on tuition for
                each additional sibling.
              </p>
            </Reveal>

            <Reveal delay={220} className="fee-card">
              <span className="icon-tile icon-tile--on-dark">
                <Icon name="trophy" size={22} />
              </span>
              <h3>Merit scholarships</h3>
              <p>
                Top performers in the board and annual examinations qualify for fee relief in the
                following academic year.
              </p>
            </Reveal>
          </div>

          <Reveal variant="fade" delay={160} className="fees__ask">
            <a
              href={school.whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="btn btn--gold"
            >
              <Icon name="whatsapp" size={17} />
              Ask for the fee schedule
            </a>
          </Reveal>
        </div>
      </section>

      {/* ==================== FAQ ==================== */}
      <section className="section faq section--sunken">
        <div className="container faq__grid">
          <Reveal variant="left" className="faq__intro">
            <p className="eyebrow">Questions</p>
            <h2>Answers to what parents ask most</h2>
            <p>
              Something not covered here? Call us — someone who actually knows the answer will
              pick up.
            </p>
            <div className="faq__intro-actions">
              <a href={school.phoneHref} className="btn btn--primary">
                <Icon name="phone" size={17} />
                {school.phone}
              </a>
              <a
                href={school.whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="btn btn--ghost"
              >
                <Icon name="whatsapp" size={17} />
                WhatsApp us
              </a>
            </div>
          </Reveal>

          <Reveal variant="right" delay={120} className="faq__list">
            {faqs.map((faq, i) => {
              const open = openFaq === i;
              return (
                <div key={faq.q} className={`faq-item${open ? ' is-open' : ''}`}>
                  <h3>
                    <button
                      type="button"
                      className="faq-item__trigger"
                      aria-expanded={open}
                      aria-controls={`faq-panel-${i}`}
                      id={`faq-trigger-${i}`}
                      onClick={() => setOpenFaq(open ? -1 : i)}
                    >
                      <span>{faq.q}</span>
                      <Icon name="chevronDown" size={20} className="faq-item__chevron" />
                    </button>
                  </h3>

                  <div
                    className="faq-item__panel"
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-trigger-${i}`}
                  >
                    <div className="faq-item__panel-inner">
                      <p>{faq.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </Reveal>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="cta-section">
        <div className="container">
          <Reveal variant="scale" className="cta-panel">
            <img src="/images/logo.png" alt="" aria-hidden="true" className="crest-mark" />

            <div>
              <p className="eyebrow">Next step</p>
              <h2>Book a campus visit this week</h2>
              <p className="cta-panel__text">
                Twenty minutes on site tells you more than any prospectus. Bring your child —
                they should see it too.
              </p>
            </div>

            <div className="cta-panel__actions">
              <Link to="/contact?about=Campus%20visit#enquiry" className="btn btn--gold btn--lg">
                Arrange a visit
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
};

export default Admissions;
