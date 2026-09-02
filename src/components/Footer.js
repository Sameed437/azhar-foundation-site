import React from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';
import { school } from '../data/site';
import './Footer.css';

const socials = [
  { name: 'facebook', label: 'Facebook', href: 'https://facebook.com' },
  { name: 'instagram', label: 'Instagram', href: 'https://instagram.com' },
  { name: 'whatsapp', label: 'WhatsApp', href: 'https://wa.me/923004296150' },
  { name: 'youtube', label: 'YouTube', href: 'https://youtube.com' },
];

/** Footer link columns, grouped the way visitors think about the site. */
const columns = [
  {
    title: 'School',
    links: [
      { label: 'Home', to: '/' },
      { label: 'About us', to: '/about' },
      { label: 'Faculty', to: '/faculty' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'Academics',
    links: [
      { label: 'Curriculum', to: '/academics' },
      { label: 'Admissions', to: '/admissions' },
      { label: 'Board results', to: '/results' },
      { label: 'Portal login', to: '/login' },
    ],
  },
  {
    title: 'Campus',
    links: [
      { label: 'Facilities', to: '/facilities' },
      { label: 'Gallery', to: '/gallery' },
      { label: 'News & events', to: '/news' },
    ],
  },
];

const Footer = () => (
  <footer className="site-footer">
    <div className="site-footer__glow" aria-hidden="true" />

    <div className="container site-footer__inner">
      <div className="footer-brand">
        <Link to="/" className="footer-brand__lockup">
          <img src="/images/logo.png" alt="" width="56" height="56" />
          <span>
            <strong>{school.name}</strong>
            <em>{school.motto}</em>
          </span>
        </Link>

        <p className="footer-brand__blurb">
          A Lahore school building confident, capable and grounded students since{' '}
          {school.foundedYear} — from Playgroup right through to Matriculation.
        </p>

        <ul className="footer-social">
          {socials.map((social) => (
            <li key={social.name}>
              <a
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
              >
                <Icon name={social.name} size={18} />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <nav className="footer-cols" aria-label="Footer">
        {columns.map((column) => (
          <div className="footer-col" key={column.title}>
            <h3 className="footer-col__title">{column.title}</h3>
            <ul className="footer-links">
              {column.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="footer-col footer-col--contact">
        <h3 className="footer-col__title">Get in touch</h3>
        <ul className="footer-contact">
          <li>
            <Icon name="pin" size={17} />
            <a href={school.mapLink} target="_blank" rel="noreferrer">
              {school.address}
            </a>
          </li>
          <li>
            <Icon name="phone" size={17} />
            <a href={school.phoneHref}>{school.phone}</a>
          </li>
          <li>
            <Icon name="mail" size={17} />
            <a href={school.emailHref}>{school.email}</a>
          </li>
          <li>
            <Icon name="clock" size={17} />
            <span>Mon – Fri, 8:00 AM – 2:00 PM</span>
          </li>
        </ul>
      </div>
    </div>

    <div className="container site-footer__bottom">
      <p>
        © {new Date().getFullYear()} {school.name}. All rights reserved.
      </p>
      <p className="site-footer__meta">
        {school.address} · Registered with {school.board}
      </p>
    </div>
  </footer>
);

export default Footer;
