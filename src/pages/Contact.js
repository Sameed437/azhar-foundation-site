import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Icon from '../components/Icon';
import Reveal from '../components/Reveal';
import PageHero from '../components/PageHero';
import { school, whatsappLink } from '../data/site';
import './Contact.css';

const EMPTY = {
  name: '',
  phone: '',
  email: '',
  subject: 'Admissions enquiry',
  studentClass: '',
  message: '',
};

const subjects = [
  'Admissions enquiry',
  'Fee structure',
  'Campus visit',
  'Existing student',
  'Something else',
];

/** Subjects that concern a specific class, so the class select appears. */
const classSubjects = ['Admissions enquiry', 'Campus visit'];

const classOptions = [
  'Playgroup',
  'Nursery',
  'Prep',
  ...Array.from({ length: 10 }, (_, i) => `Grade ${i + 1}`),
];

/** Pakistani mobile number, with or without the +92 / 0 prefix. */
const PK_MOBILE = /^(\+?92|0)?3\d{9}$/;

/** Fields in visual order, for focusing the first invalid one. */
const fieldOrder = ['name', 'phone', 'email', 'message'];

const validate = (values) => {
  const errors = {};

  if (!values.name.trim()) errors.name = 'Please tell us your name.';
  else if (values.name.trim().length < 2) errors.name = 'That name looks too short.';

  const phone = values.phone.replace(/[\s-]/g, '');
  if (!phone) errors.phone = 'We need a phone number to reply to.';
  else if (!PK_MOBILE.test(phone))
    errors.phone = 'That number looks incomplete — a mobile like 0300 1234567 works best.';

  if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim()))
    errors.email = 'Please check the email address.';

  if (!values.message.trim()) errors.message = 'Let us know how we can help.';
  else if (values.message.trim().length < 10) errors.message = 'A little more detail, please.';

  return errors;
};

/** The lines handed to WhatsApp or the mail client, exactly as the office reads them. */
const composeMessage = (values, includeClass) =>
  [
    'Assalam o Alaikum, I am writing to Azhar Foundation School.',
    '',
    `Name: ${values.name.trim()}`,
    `Phone: ${values.phone.trim()}`,
    values.email.trim() ? `Email: ${values.email.trim()}` : null,
    `Subject: ${values.subject}`,
    includeClass && values.studentClass ? `Class: ${values.studentClass}` : null,
    '',
    values.message.trim(),
  ]
    .filter((line) => line !== null)
    .join('\n');

const Contact = () => {
  const [searchParams] = useSearchParams();
  const preset = searchParams.get('about');

  /* The route stays mounted when only the query string changes (e.g. the
     mobile action bar's "Book a visit" while already on /contact), so the
     preset has to be re-applied, not just read at mount. */
  useEffect(() => {
    if (subjects.includes(preset)) {
      setValues((current) => ({ ...current, subject: preset }));
    }
  }, [preset]);

  const [values, setValues] = useState(() => ({
    ...EMPTY,
    subject: subjects.includes(preset) ? preset : EMPTY.subject,
  }));
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [sentVia, setSentVia] = useState(null); // null | 'whatsapp' | 'email'
  const [composed, setComposed] = useState('');
  const [copyState, setCopyState] = useState('idle'); // idle | copied | manual
  const copyResetRef = useRef(null);

  useEffect(() => () => window.clearTimeout(copyResetRef.current), []);

  const showClassField = classSubjects.includes(values.subject);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));

    // Once a field has been flagged, re-validate as the user types.
    if (touched[name]) {
      setErrors(validate({ ...values, [name]: value }));
    }
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((current) => ({ ...current, [name]: true }));
    setErrors(validate(values));
  };

  const triggerSend = (channel) => {
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setTouched({ name: true, phone: true, email: true, message: true });

    const firstInvalid = fieldOrder.find((field) => nextErrors[field]);
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    /* No backend is wired up yet — hand the composed message to WhatsApp or
       the visitor's mail client. The form is deliberately left intact and we
       never claim success: the status panel tells the visitor to press send
       there, with a copy fallback if nothing opened. */
    const body = composeMessage(values, showClassField);

    if (channel === 'whatsapp') {
      window.open(whatsappLink(body), '_blank', 'noopener');
    } else {
      window.location.href =
        `${school.emailHref}?subject=${encodeURIComponent(`${values.subject} — ${values.name.trim()}`)}` +
        `&body=${encodeURIComponent(body)}`;
    }

    setComposed(body);
    setCopyState('idle');
    setSentVia(channel);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    triggerSend('whatsapp');
  };

  const handleCopy = async () => {
    window.clearTimeout(copyResetRef.current);
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(composed);
      setCopyState('copied');
      copyResetRef.current = window.setTimeout(() => setCopyState('idle'), 2400);
    } catch {
      // Clipboard refused (permissions, older browser) — offer a selectable textarea.
      setCopyState('manual');
    }
  };

  const fieldProps = (name) => ({
    name,
    value: values[name],
    onChange: handleChange,
    onBlur: handleBlur,
    'aria-invalid': Boolean(touched[name] && errors[name]),
    'aria-describedby': touched[name] && errors[name] ? `${name}-error` : undefined,
  });

  const showError = (name) =>
    touched[name] && errors[name] ? (
      <span className="field__error" id={`${name}-error`} role="alert">
        {errors[name]}
      </span>
    ) : null;

  return (
    <div className="contact">
      <PageHero
        tone="sky"
        variant="compact"
        breadcrumb="Contact"
        eyebrow="Get in touch"
        title="We are here to answer your questions"
        lead="Call the office during school hours, email us any time, or send the form below and we will get back to you within one working day."
      />

      {/* ==================== CONTACT CARDS ==================== */}
      <section className="section section--tight contact-cards-section">
        <div className="container">
          <div className="contact-cards">
            {/* Stagger capped at two steps so the last cards do not lag once
                the grid stacks into a single column. */}
            <Reveal className="contact-card" delay={0}>
              <span className="icon-tile">
                <Icon name="pin" size={22} />
              </span>
              <h2>Visit the campus</h2>
              <p>{school.address}</p>
              <a
                className="link-arrow"
                href={school.mapLink}
                target="_blank"
                rel="noreferrer"
              >
                Open in Maps
                <Icon name="arrowRight" size={16} />
              </a>
            </Reveal>

            <Reveal className="contact-card" delay={90}>
              <span className="icon-tile">
                <Icon name="phone" size={22} />
              </span>
              <h2>Call the office</h2>
              <p>Reach the front desk during school hours for anything urgent.</p>
              <a className="link-arrow" href={school.phoneHref}>
                {school.phone}
                <Icon name="arrowRight" size={16} />
              </a>
            </Reveal>

            <Reveal className="contact-card" delay={180}>
              <span className="icon-tile">
                <Icon name="mail" size={22} />
              </span>
              <h2>Email us</h2>
              <p>
                Send documents or detailed questions and we will reply in writing.
                <span className="contact-card__address">{school.email}</span>
              </p>
              <a className="link-arrow" href={school.emailHref}>
                Email the office
                <Icon name="arrowRight" size={16} />
              </a>
            </Reveal>

            <Reveal className="contact-card contact-card--hours" delay={180}>
              <span className="icon-tile icon-tile--gold">
                <Icon name="clock" size={22} />
              </span>
              <h2>Office hours</h2>
              <ul className="hours-list">
                {school.officeHours.map((slot) => (
                  <li key={slot.days}>
                    <span>{slot.days}</span>
                    <strong>{slot.time}</strong>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ==================== FORM + MAP ==================== */}
      <section className="section contact-main section--sunken" id="enquiry">
        <div className="container contact-main__grid">
          <Reveal variant="left" className="contact-form-wrap">
            <p className="eyebrow">Send a message</p>
            <h2>Tell us what you need</h2>
            <p className="contact-form-wrap__note">
              Fill this in and we will open WhatsApp with your message ready to send.
              Fields marked with an asterisk are required — we use your details only
              to reply to this enquiry.
            </p>

            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="name">
                    Full name <span aria-hidden="true">*</span>
                  </label>
                  <input id="name" type="text" autoComplete="name" {...fieldProps('name')} />
                  {showError('name')}
                </div>

                <div className="field">
                  <label htmlFor="phone">
                    Phone number <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="0300 1234567"
                    {...fieldProps('phone')}
                  />
                  {showError('phone')}
                </div>
              </div>

              <div className="form-row">
                <div className="field">
                  <label htmlFor="email">
                    Email address <span className="field__optional">(optional)</span>
                  </label>
                  <input id="email" type="email" autoComplete="email" {...fieldProps('email')} />
                  {showError('email')}
                </div>

                <div className="field">
                  <label htmlFor="subject">What is this about?</label>
                  <div className="field__select">
                    <select id="subject" name="subject" value={values.subject} onChange={handleChange}>
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                    <Icon name="chevronDown" size={18} />
                  </div>
                </div>
              </div>

              {showClassField && (
                <div className="field">
                  <label htmlFor="studentClass">Class you are asking about</label>
                  <div className="field__select">
                    <select
                      id="studentClass"
                      name="studentClass"
                      value={values.studentClass}
                      onChange={handleChange}
                    >
                      <option value="">Select a class</option>
                      {classOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <Icon name="chevronDown" size={18} />
                  </div>
                </div>
              )}

              <div className="field">
                <label htmlFor="message">
                  Message <span aria-hidden="true">*</span>
                </label>
                <textarea id="message" rows="5" {...fieldProps('message')} />
                {showError('message')}
              </div>

              <div className="contact-form__actions">
                <button type="submit" className="btn btn--primary btn--lg">
                  Send via WhatsApp
                  <Icon name="whatsapp" size={18} />
                </button>
                <button
                  type="button"
                  className="contact-form__alt"
                  onClick={() => triggerSend('email')}
                >
                  or email us instead
                </button>
              </div>

              {/* The live region is always in the DOM - some screen readers
                  only announce changes inside a pre-existing role=status. */}
              <div
                className={`form-status${sentVia ? '' : ' form-status--empty'}`}
                role="status"
              >
                {sentVia && (
                  <>
                  <div className="form-status__lead">
                    <Icon
                      name={sentVia === 'whatsapp' ? 'whatsapp' : 'mail'}
                      size={20}
                      strokeWidth={2.2}
                    />
                    <p>
                      {sentVia === 'whatsapp'
                        ? 'WhatsApp should have opened with your message — press send there.'
                        : 'Your email app should have opened with your message — press send there.'}{' '}
                      Nothing sent? Copy the message and send it to{' '}
                      {sentVia === 'whatsapp' ? school.phone : school.email}.
                    </p>
                  </div>

                  <button
                    type="button"
                    className={`btn btn--ghost btn--sm form-status__copy${
                      copyState === 'copied' ? ' form-status__copy--done' : ''
                    }`}
                    onClick={handleCopy}
                  >
                    {copyState === 'copied' ? (
                      <>
                        <Icon name="check" size={15} strokeWidth={2.4} />
                        Copied
                      </>
                    ) : (
                      'Copy message'
                    )}
                  </button>

                  {copyState === 'manual' && (
                    <textarea
                      className="form-status__fallback"
                      rows={6}
                      readOnly
                      value={composed}
                      aria-label="Your message, ready to copy manually"
                      onFocus={(event) => event.target.select()}
                    />
                  )}
                  </>
                )}
              </div>
            </form>
          </Reveal>

          <Reveal variant="right" delay={140} className="contact-map">
            <div className="contact-map__frame">
              <iframe
                title={`${school.name} location`}
                src={school.mapEmbed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>

            <div className="contact-map__card">
              <span className="icon-tile icon-tile--navy">
                <Icon name="pin" size={20} />
              </span>
              <div>
                <strong>{school.name}</strong>
                <span>{school.address}</span>
              </div>
              <a
                href={school.mapLink}
                target="_blank"
                rel="noreferrer"
                className="btn btn--ghost btn--sm"
              >
                Directions
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default Contact;
