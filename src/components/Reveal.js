import React, { useEffect, useRef, useState } from 'react';

/**
 * Reveals its children once they scroll into view.
 *
 * Replaces the AOS dependency with an IntersectionObserver so the animation
 * runs off the compositor, fires once, and is skipped entirely for anyone who
 * has asked for reduced motion.
 */
const Reveal = ({
  as: Tag = 'div',
  variant = 'up',
  delay = 0,
  className = '',
  children,
  ...rest
}) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const variantClass = variant === 'up' ? '' : ` reveal--${variant}`;

  return (
    <Tag
      ref={ref}
      className={`reveal${variantClass}${className ? ` ${className}` : ''}`}
      data-visible={visible}
      style={delay ? { '--reveal-delay': `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
