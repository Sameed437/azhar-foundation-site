import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';
import { school } from '../data/site';
import './Login.css';

const Login = () => {
  const [values, setValues] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (submitted) setSubmitted(false);
  };

  /* The portal backend is not live yet — no credential check runs in the
     browser. Submitting always shows the honest next step. */
  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="login">
      <div className="login__aside">
        <div className="login__aside-glow" aria-hidden="true" />
        <img src="/images/logo.png" alt="" aria-hidden="true" className="crest-mark" />

        <div className="login__aside-inner">
          <Link to="/" className="login__brand">
            <img src="/images/logo.png" alt="" width="52" height="52" />
            <span>
              <strong>{school.name}</strong>
              <em>{school.motto}</em>
            </span>
          </Link>

          <div className="login__pitch">
            <h2>The parent &amp; staff portal</h2>
            <p>
              Attendance, assessment records, fee status and school notices — all in one place,
              updated by the office as things happen.
            </p>

            <ul className="login__list">
              <li>
                <Icon name="chart" size={17} />
                Term-by-term result history
              </li>
              <li>
                <Icon name="clock" size={17} />
                Daily attendance and timetable
              </li>
              <li>
                <Icon name="wallet" size={17} />
                Fee vouchers and payment status
              </li>
            </ul>
          </div>

          <p className="login__aside-foot">
            No account yet? Ask the school office to enable portal access for your family.
          </p>
        </div>
      </div>

      <div className="login__panel">
        <div className="login__card">
          <p className="eyebrow">Portal access</p>
          <h1>Sign in to your account</h1>
          <p className="login__sub">
            Use the credentials issued by the school office.
          </p>

          {/* Always mounted so the announcement is reliably picked up */}
          <div
            className={`login__alert login__alert--info${submitted ? '' : ' login__alert--empty'}`}
            role="status"
          >
            {submitted && (
              <>
                <Icon name="phone" size={17} strokeWidth={2.4} />
                <span>
                  Portal accounts are issued by the school office. Call{' '}
                  <a href={school.phoneHref}>{school.phone}</a> and we will activate access for
                  your family.
                </span>
              </>
            )}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="you@example.com"
                value={values.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <div className="field__label-row">
                <label htmlFor="login-password">Password</label>
                <button type="button" className="field__toggle" onClick={() => setShowPassword((s) => !s)}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={values.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn--primary btn--block btn--lg">
              Sign in
              <Icon name="arrowRight" size={18} className="btn__arrow" />
            </button>
          </form>

          <p className="login__help">
            Forgotten your password? Call the office on{' '}
            <a href={school.phoneHref}>{school.phone}</a> and we will reset it for you.
          </p>

          <Link to="/" className="login__back">
            <Icon name="chevronLeft" size={16} />
            Back to the website
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
