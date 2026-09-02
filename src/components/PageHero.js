import React from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';
import './PageHero.css';

/**
 * Masthead shared by every interior page.
 *
 * Deliberately CSS-only: the one campus photo cannot carry nine mastheads, so
 * interior heroes are built from the brand itself — gradient ground, blueprint
 * grid, crest watermark, and a per-page accent glow set by `tone`.
 *
 * variant: 'default' | 'compact' (short pages) | 'deep' (leaves room for a
 * stat strip straddling the bottom seam, like the home hero).
 */
const PageHero = ({
  eyebrow,
  title,
  lead,
  breadcrumb,
  tone = 'sky',
  variant = 'default',
  children,
}) => (
  <section
    className={`page-hero page-hero--${tone}${
      variant !== 'default' ? ` page-hero--${variant}` : ''
    }`}
  >
    <div className="page-hero__grid" aria-hidden="true" />
    <img src="/images/logo.png" alt="" aria-hidden="true" className="crest-mark" />

    <div className="container page-hero__inner">
      {breadcrumb && (
        <nav className="crumbs" aria-label="Breadcrumb">
          <ol>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li aria-hidden="true">
              <Icon name="chevronRight" size={14} />
            </li>
            <li aria-current="page">{breadcrumb}</li>
          </ol>
        </nav>
      )}

      {eyebrow && <p className="eyebrow page-hero__eyebrow">{eyebrow}</p>}
      <h1 className="page-hero__title">{title}</h1>
      {lead && <p className="page-hero__lead">{lead}</p>}
      {children}
    </div>
  </section>
);

export default PageHero;
