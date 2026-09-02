import React, { useCallback, useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import './Gallery.css';

const AUTOPLAY_MS = 5200;
const MANUAL_MS = 900;

/**
 * Campus-life slideshow.
 *
 * Hand-rolled rather than using react-responsive-carousel so the controls,
 * captions and progress bar match the rest of the design system. Autoplay
 * pauses on hover, on focus, when the tab is hidden, and for reduced motion.
 * Manual navigation (arrows, keys, swipe) crossfades faster than autoplay so
 * clicks feel immediate. Portrait photos are letterboxed on a blurred fill
 * instead of being cropped to a 16:9 sliver.
 */
const Gallery = ({ slides }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [manual, setManual] = useState(false);
  const [navEpoch, setNavEpoch] = useState(0);
  const touchStartX = useRef(null);
  const manualTimer = useRef(null);
  const count = slides.length;

  const goTo = useCallback((next) => {
    setIndex(((next % count) + count) % count);
    setManual(true);
    setNavEpoch((epoch) => epoch + 1);
    window.clearTimeout(manualTimer.current);
    manualTimer.current = window.setTimeout(() => setManual(false), MANUAL_MS);
  }, [count]);

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => () => window.clearTimeout(manualTimer.current), []);

  useEffect(() => {
    if (paused) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex((current) => (current + 1) % count);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [paused, count, navEpoch]);

  const onKeyDown = (event) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); next(); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); prev(); }
  };

  const onTouchStart = (event) => { touchStartX.current = event.touches[0].clientX; };

  const onTouchEnd = (event) => {
    if (touchStartX.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 45) { if (delta < 0) next(); else prev(); }
    touchStartX.current = null;
  };

  return (
    <div
      className="gallery"
      role="group"
      aria-roledescription="carousel"
      aria-label="Campus life"
      data-manual={manual}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="gallery__stage">
        {slides.map((slide, i) => (
          <figure
            key={slide.src}
            className={`gallery__slide${i === index ? ' is-active' : ''}${
              slide.orientation === 'portrait' ? ' gallery__slide--portrait' : ''
            }${i % 2 ? ' gallery__slide--drift-alt' : ''}`}
            aria-hidden={i !== index}
          >
            {slide.orientation === 'portrait' && (
              <img
                className="gallery__backfill"
                src={slide.src}
                alt=""
                aria-hidden="true"
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
            )}
            <img
              className="gallery__photo"
              src={slide.src}
              alt={slide.title}
              style={slide.pos ? { objectPosition: slide.pos } : undefined}
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
            <figcaption className="gallery__caption">
              <span className="gallery__count">
                {String(i + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
              </span>
              <h3>{slide.title}</h3>
              <p>{slide.caption}</p>
            </figcaption>
          </figure>
        ))}

        <button type="button" className="gallery__nav gallery__nav--prev" onClick={prev}>
          <Icon name="chevronLeft" size={22} strokeWidth={2} />
          <span className="sr-only">Previous slide</span>
        </button>

        <button type="button" className="gallery__nav gallery__nav--next" onClick={next}>
          <Icon name="chevronRight" size={22} strokeWidth={2} />
          <span className="sr-only">Next slide</span>
        </button>
      </div>

      <div className="gallery__dots" role="group" aria-label="Choose slide">
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            aria-current={i === index}
            aria-label={`Show slide: ${slide.title}`}
            className={`gallery__dot${i === index ? ' is-active' : ''}`}
            onClick={() => goTo(i)}
          >
            <span
              className="gallery__dot-fill"
              style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
              data-running={i === index && !paused}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
