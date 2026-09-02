import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import Reveal from '../components/Reveal';
import PageHero from '../components/PageHero';
import { gallery, galleryFilters } from '../data/site';
import './GalleryPage.css';

const GalleryPage = () => {
  const [filter, setFilter] = useState('All');
  const [lightbox, setLightbox] = useState(null); // index into `visible`
  const dialogRef = useRef(null);
  const triggerRef = useRef(null); // the photo button that opened the dialog

  /* With a handful of photos the filter bar is noise — it returns (with this
     code path intact) once the collection grows past eight. */
  const showFilters = gallery.length > 8;
  const activeFilter = showFilters ? filter : 'All';

  const visible = useMemo(
    () =>
      activeFilter === 'All'
        ? gallery
        : gallery.filter((item) => item.category === activeFilter),
    [activeFilter]
  );

  const close = useCallback(() => {
    setLightbox(null);
    triggerRef.current?.focus();
  }, []);
  const step = useCallback(
    (delta) =>
      setLightbox((current) => {
        if (current === null) return current;
        const next = current + delta;
        return ((next % visible.length) + visible.length) % visible.length;
      }),
    [visible.length]
  );

  /* Lightbox: lock the page, move focus in, trap Tab, wire the keyboard. */
  useEffect(() => {
    if (lightbox === null) return undefined;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = 'hidden';
    dialogRef.current?.querySelector('.lightbox__close')?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);

      if (event.key === 'Tab') {
        const focusables = dialogRef.current?.querySelectorAll('button');
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
    return () => {
      body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [lightbox, close, step]);

  const active = lightbox === null ? null : visible[lightbox];

  return (
    <div className="gallery-page">
      <PageHero
        tone="sky"
        variant="compact"
        breadcrumb="Gallery"
        eyebrow="Campus life"
        title="The school, as it actually looks"
        lead="Assemblies, science fairs, activity periods and the annual function — photographs from around the campus and through the school year."
      />

      <section className="section gallery-section">
        <div className="container container--wide">
          {/* Filters */}
          {showFilters && (
            <Reveal variant="fade" className="gallery-filters" role="group" aria-label="Filter photos">
              {galleryFilters.map((name) => {
                const count =
                  name === 'All'
                    ? gallery.length
                    : gallery.filter((item) => item.category === name).length;

                return (
                  <button
                    key={name}
                    type="button"
                    className={`gallery-filter${activeFilter === name ? ' is-active' : ''}`}
                    aria-pressed={activeFilter === name}
                    onClick={() => {
                      setFilter(name);
                      setLightbox(null);
                    }}
                  >
                    {name}
                    <span className="gallery-filter__count">{count}</span>
                  </button>
                );
              })}
            </Reveal>
          )}

          {/* Grid — editorial mosaic: the lead photo anchors a 2×2 block and
              portrait shots take a double row, packed densely around them. */}
          {visible.length > 0 ? (
            <ul className="photo-grid">
              {visible.map((item, i) => (
                <Reveal
                  as="li"
                  key={item.src}
                  delay={(i % 3) * 80}
                  className={`photo-card${
                    i === 0
                      ? ' photo-card--feature'
                      : item.orientation === 'portrait'
                        ? ' photo-card--portrait'
                        : ''
                  }`}
                >
                  <button
                    type="button"
                    className="media-graded"
                    onClick={(event) => {
                      triggerRef.current = event.currentTarget;
                      setLightbox(i);
                    }}
                  >
                    {/* The grid IS the page, so every photo loads eagerly
                        rather than waiting on the observer. */}
                    <img
                      src={item.src}
                      alt={item.title}
                      loading="eager"
                      decoding="async"
                      style={{ objectPosition: item.pos }}
                    />
                    <span className="photo-card__overlay">
                      <span className="photo-card__zoom">
                        <Icon name="sparkle" size={18} />
                      </span>
                      <span className="photo-card__text">
                        <span className="photo-card__category">{item.category}</span>
                        <span className="photo-card__title">{item.title}</span>
                      </span>
                    </span>
                  </button>
                </Reveal>
              ))}
            </ul>
          ) : (
            <p className="gallery-empty">No photographs in this category yet.</p>
          )}

          <Reveal variant="fade" className="gallery-note">
            <Icon name="quote" size={18} strokeWidth={0} fill="currentColor" />
            <p>
              We add to this gallery through the year. For photographs of a specific event, or
              of your child&rsquo;s class, ask at the school office.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="cta-section">
        <div className="container">
          <Reveal variant="scale" className="cta-panel">
            <img src="/images/logo.png" alt="" aria-hidden="true" className="crest-mark" />

            <div>
              <p className="eyebrow">Visit us</p>
              <h2>Photographs only tell you so much</h2>
              <p className="cta-panel__text">
                Come and see the campus during a working school day.
              </p>
            </div>

            <div className="cta-panel__actions">
              <Link to="/contact?about=Campus%20visit#enquiry" className="btn btn--primary btn--lg">
                Arrange a visit
                <Icon name="arrowRight" size={18} className="btn__arrow" />
              </Link>
              <Link to="/facilities" className="btn btn--on-dark btn--lg">
                See the facilities
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==================== LIGHTBOX ==================== */}
      {active && (
        <div
          ref={dialogRef}
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          onClick={close}
        >
          <button type="button" className="lightbox__close" onClick={close}>
            <Icon name="close" size={22} strokeWidth={2} />
            <span className="sr-only">Close</span>
          </button>

          <button
            type="button"
            className="lightbox__nav lightbox__nav--prev"
            onClick={(event) => {
              event.stopPropagation();
              step(-1);
            }}
          >
            <Icon name="chevronLeft" size={24} strokeWidth={2} />
            <span className="sr-only">Previous photo</span>
          </button>

          <figure className="lightbox__figure" onClick={(event) => event.stopPropagation()}>
            <img src={active.src} alt={active.title} style={{ objectPosition: active.pos }} />
            <figcaption>
              <span className="lightbox__count">
                {lightbox + 1} / {visible.length}
              </span>
              <h2>{active.title}</h2>
              <p>{active.caption}</p>
            </figcaption>
          </figure>

          <button
            type="button"
            className="lightbox__nav lightbox__nav--next"
            onClick={(event) => {
              event.stopPropagation();
              step(1);
            }}
          >
            <Icon name="chevronRight" size={24} strokeWidth={2} />
            <span className="sr-only">Next photo</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
