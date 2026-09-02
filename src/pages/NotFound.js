import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import { allPages } from '../data/site';
import './NotFound.css';

const NotFound = () => (
  <section className="notfound">
    <div className="container notfound__inner">
      <div className="notfound__mark" aria-hidden="true" />
      <span className="notfound__code" aria-hidden="true">404</span>
      <h1>This page is not on our timetable</h1>
      <p>
        The link you followed may be out of date, or the page may have moved.
        Try one of these instead.
      </p>

      <ul className="notfound__links">
        {allPages.map((link) => (
          <li key={link.to}>
            <Link to={link.to} className="btn btn--ghost btn--sm">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <Link to="/" className="btn btn--primary btn--lg notfound__home">
        Back to the homepage
        <Icon name="arrowRight" size={18} className="btn__arrow" />
      </Link>
    </div>
  </section>
);

export default NotFound;
