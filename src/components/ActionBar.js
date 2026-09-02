import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';
import { school } from '../data/site';
import './ActionBar.css';

/**
 * Whether the school office is open right now, and the caption to show.
 * Hours: Mon–Fri 8:00–14:00, Sat 8:00–12:00, Sun closed (see school.officeHours).
 */
const officeStatus = (now = new Date()) => {
  const day = now.getDay(); // 0 = Sunday
  const minutes = now.getHours() * 60 + now.getMinutes();
  const openUntil = day === 0 ? null : day === 6 ? 12 * 60 : 14 * 60;
  const open = openUntil !== null && minutes >= 8 * 60 && minutes < openUntil;

  return {
    open,
    caption: open
      ? `Office open until ${openUntil === 12 * 60 ? '12:00' : '2:00'} PM`
      : 'Office closed — WhatsApp us and we reply in the morning',
  };
};

/**
 * Fixed bottom action bar, mobile only. Evening-browsing parents on phones
 * are this site's real audience: a call, a WhatsApp message and a visit
 * booking are always one thumb-tap away. When the office is closed, WhatsApp
 * takes the primary style.
 */
const ActionBar = () => {
  const [status, setStatus] = useState(() => officeStatus());

  useEffect(() => {
    const timer = window.setInterval(() => setStatus(officeStatus()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="action-bar" role="navigation" aria-label="Quick contact">
      <p className="action-bar__status" data-open={status.open}>
        <span className="action-bar__dot" aria-hidden="true" />
        {status.caption}
      </p>

      <div className="action-bar__buttons">
        <a
          href={school.phoneHref}
          className={`action-bar__btn${status.open ? ' action-bar__btn--primary' : ''}`}
        >
          <Icon name="phone" size={19} />
          Call
        </a>
        <a
          href={school.whatsappHref}
          target="_blank"
          rel="noreferrer"
          className={`action-bar__btn${!status.open ? ' action-bar__btn--primary' : ''}`}
        >
          <Icon name="whatsapp" size={19} />
          WhatsApp
        </a>
        <Link to="/contact?about=Campus%20visit#enquiry" className="action-bar__btn">
          <Icon name="pin" size={19} />
          Book a visit
        </Link>
      </div>
    </div>
  );
};

export default ActionBar;
