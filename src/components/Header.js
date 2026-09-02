import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Icon from './Icon';
import { navLinks, school } from '../data/site';
import './Header.css';

/** True when the current path is this item or one of its children. */
const isBranchActive = (item, pathname) =>
  item.to === pathname || (item.children || []).some((child) => child.to === pathname);

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null); // desktop dropdown
  const [openGroup, setOpenGroup] = useState(null); // mobile accordion
  const { pathname } = useLocation();
  const toggleRef = useRef(null);
  const panelRef = useRef(null);
  const navRef = useRef(null);

  /* Condense the header once the page leaves the top. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Route change closes everything. */
  useEffect(() => {
    setMenuOpen(false);
    setOpenMenu(null);
    setOpenGroup(null);
  }, [pathname]);

  /* Click-away and Escape close the desktop dropdown. */
  useEffect(() => {
    if (openMenu === null) return undefined;

    const onPointerDown = (event) => {
      if (!navRef.current?.contains(event.target)) setOpenMenu(null);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        navRef.current
          ?.querySelector(`[aria-controls="nav-menu-${openMenu}"]`)
          ?.focus();
        setOpenMenu(null);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openMenu]);

  /* While the drawer is open: lock the page, trap Escape, return focus. */
  useEffect(() => {
    if (!menuOpen) return undefined;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = 'hidden';
    const panel = panelRef.current;
    const toggle = toggleRef.current;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        return;
      }

      if (event.key === 'Tab') {
        const focusables = panelRef.current?.querySelectorAll(
          'a, button, [tabindex="0"]'
        );
        if (!focusables?.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    panelRef.current?.querySelector('a, button')?.focus();

    return () => {
      body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      /* Whatever closed the drawer (Escape, scrim, link), focus must not be
         stranded inside a hidden panel. */
      if (panel?.contains(document.activeElement)) {
        toggle?.focus();
      }
    };
  }, [menuOpen]);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>

      {/* Utility strip — contact details, hidden on small screens */}
      <div className="topbar">
        <div className="container topbar__inner">
          <a className="topbar__item" href={school.phoneHref}>
            <Icon name="phone" size={15} />
            <span>{school.phone}</span>
          </a>
          <a className="topbar__item" href={school.emailHref}>
            <Icon name="mail" size={15} />
            <span>{school.email}</span>
          </a>
          <span className="topbar__item topbar__item--muted">
            <Icon name="pin" size={15} />
            <span>{school.address}</span>
          </span>
        </div>
      </div>

      <header className={`site-header${scrolled ? ' site-header--scrolled' : ''}`}>
        <div className="container site-header__inner">
          <Link to="/" className="brand" aria-label={`${school.name} — home`}>
            <span className="brand__mark">
              <img src="/images/logo.png" alt="" width="48" height="48" />
            </span>
            <span className="brand__text">
              <span className="brand__name">{school.name}</span>
              <span className="brand__motto">{school.motto}</span>
            </span>
          </Link>

          <nav className="primary-nav" aria-label="Primary" ref={navRef}>
            <ul className="primary-nav__list">
              {navLinks.map((item, index) =>
                item.children ? (
                  <li
                    key={item.label}
                    className="has-menu"
                    onMouseEnter={() => setOpenMenu(index)}
                    onMouseLeave={() => setOpenMenu((open) => (open === index ? null : open))}
                  >
                    {/* The label navigates; the chevron only discloses. */}
                    <span className="primary-nav__split">
                      <NavLink
                        to={item.to}
                        className={`primary-nav__link primary-nav__link--split${
                          isBranchActive(item, pathname) ? ' is-active' : ''
                        }`}
                      >
                        {item.label}
                      </NavLink>
                      <button
                        type="button"
                        className="primary-nav__disclose"
                        aria-expanded={openMenu === index}
                        aria-controls={`nav-menu-${index}`}
                        aria-label={`Open ${item.label} menu`}
                        onClick={() => setOpenMenu((open) => (open === index ? null : index))}
                      >
                        <Icon name="chevronDown" size={15} className="primary-nav__chevron" />
                      </button>
                    </span>

                    <div
                      id={`nav-menu-${index}`}
                      className={`dropdown${openMenu === index ? ' is-open' : ''}`}
                    >
                      <ul>
                        {item.children.map((child) => (
                          <li key={child.to}>
                            <NavLink
                              to={child.to}
                              className={({ isActive }) =>
                                `dropdown__link${isActive ? ' is-active' : ''}`
                              }
                              onClick={() => setOpenMenu(null)}
                            >
                              <span className="dropdown__label">{child.label}</span>
                              <span className="dropdown__desc">{child.description}</span>
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                ) : (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        `primary-nav__link${isActive ? ' is-active' : ''}`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                )
              )}
            </ul>
          </nav>

          <div className="site-header__actions">
            <NavLink
              to="/login"
              className={({ isActive }) => `header-login${isActive ? ' is-active' : ''}`}
            >
              Portal login
            </NavLink>
            <Link to="/admissions" className="btn btn--primary btn--sm header-cta">
              Apply now
              <Icon name="arrowRight" size={16} className="btn__arrow" />
            </Link>

            {/* Where the CTA is hidden, a call is one tap away */}
            <a className="header-phone" href={school.phoneHref} aria-label="Call the school office">
              <Icon name="phone" size={19} />
            </a>

            <button
              ref={toggleRef}
              type="button"
              className="nav-toggle"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <Icon name={menuOpen ? 'close' : 'menu'} size={24} strokeWidth={2} />
              <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={`nav-scrim${menuOpen ? ' is-open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      <div
        id="mobile-nav"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`mobile-nav${menuOpen ? ' is-open' : ''}`}
      >
        <nav aria-label="Mobile">
          <ul className="mobile-nav__list">
            {navLinks.map((item, index) => (
              <li key={item.label} style={{ '--i': index }}>
                {item.children ? (
                  <>
                    <button
                      type="button"
                      className={`mobile-nav__link mobile-nav__group${
                        openGroup === index ? ' is-open' : ''
                      }${isBranchActive(item, pathname) ? ' is-active' : ''}`}
                      aria-expanded={openGroup === index}
                      onClick={() =>
                        setOpenGroup((open) => (open === index ? null : index))
                      }
                    >
                      <span>{item.label}</span>
                      <Icon name="chevronDown" size={18} />
                    </button>

                    <div
                      className={`mobile-nav__subwrap${
                        openGroup === index ? ' is-open' : ''
                      }`}
                    >
                      <ul className="mobile-nav__sublist">
                        {item.children.map((child) => (
                          <li key={child.to}>
                            <NavLink
                              to={child.to}
                              className={({ isActive }) =>
                                `mobile-nav__sublink${isActive ? ' is-active' : ''}`
                              }
                              tabIndex={openGroup === index ? 0 : -1}
                              onClick={() => setMenuOpen(false)}
                            >
                              {child.label}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `mobile-nav__link${isActive ? ' is-active' : ''}`
                    }
                    onClick={() => setMenuOpen(false)}
                  >
                    <span>{item.label}</span>
                    <Icon name="arrowRight" size={18} />
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="mobile-nav__footer">
          <Link to="/admissions" className="btn btn--primary btn--block">
            Apply now
            <Icon name="arrowRight" size={16} className="btn__arrow" />
          </Link>
          <a className="mobile-nav__contact" href={school.phoneHref}>
            <Icon name="phone" size={16} />
            {school.phone}
          </a>
        </div>
      </div>
    </>
  );
};

export default Header;
