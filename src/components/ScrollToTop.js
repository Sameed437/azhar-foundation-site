import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from './Icon';
import './ScrollToTop.css';

/** Resets scroll position on route change, honouring in-page #hash targets. */
export const ScrollReset = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    /* The behavior option beats the CSS scroll-behavior reset, so honour
       reduced motion explicitly. */
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);

  return null;
};

/** Floating back-to-top button, revealed after a screenful of scrolling. */
const BackToTop = () => {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      className={`back-to-top${shown ? ' is-shown' : ''}`}
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'auto'
            : 'smooth',
        })
      }
      tabIndex={shown ? 0 : -1}
      aria-hidden={!shown}
    >
      <Icon name="arrowUp" size={20} strokeWidth={2} />
      <span className="sr-only">Back to top</span>
    </button>
  );
};

export default BackToTop;
