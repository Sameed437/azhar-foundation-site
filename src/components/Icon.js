import React from 'react';

/**
 * Inline icon set. Every glyph is drawn on a 24x24 grid with a 1.7 stroke so
 * icons stay optically consistent at any size and inherit `currentColor`.
 */
const paths = {
  arrowRight: <><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></>,
  arrowUp: <><path d="M12 19V5" /><path d="m6 11 6-6 6 6" /></>,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronLeft: <path d="m14 6-6 6 6 6" />,
  chevronRight: <path d="m10 6 6 6-6 6" />,
  close: <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>,
  menu: <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>,
  check: <path d="m4.5 12.5 5 5 10-11" />,
  phone: (
    <path d="M15.6 21A13.6 13.6 0 0 1 3 8.4 2.4 2.4 0 0 1 5.4 6h2a1.6 1.6 0 0 1 1.6 1.4c.1.9.3 1.7.6 2.5a1.6 1.6 0 0 1-.4 1.7l-1 1a12 12 0 0 0 4.2 4.2l1-1a1.6 1.6 0 0 1 1.7-.4c.8.3 1.6.5 2.5.6A1.6 1.6 0 0 1 18 17.6v2A2.4 2.4 0 0 1 15.6 21Z" />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.8 7 7.1 5.2a2 2 0 0 0 2.2 0L20.2 7" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-5.6 7-11a7 7 0 0 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3 2" /></>,
  cap: (
    <>
      <path d="M12 4 2.5 8.6 12 13.2l9.5-4.6L12 4Z" />
      <path d="M6.5 11v4.6c0 1.6 2.5 2.9 5.5 2.9s5.5-1.3 5.5-2.9V11" />
      <path d="M21.5 8.6V14" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v14.5H6.5A2.5 2.5 0 0 0 4 20V5.5Z" />
      <path d="M19 17.5v3.5H6.5" />
    </>
  ),
  compass: <><circle cx="12" cy="12" r="9" /><path d="m15.6 8.4-2.1 5.1-5.1 2.1 2.1-5.1 5.1-2.1Z" /></>,
  sparkle: (
    <>
      <path d="M12 3.2 13.9 9l5.8 1.9-5.8 1.9L12 18.6 10.1 12.8 4.3 10.9 10.1 9 12 3.2Z" />
      <path d="M18.8 16.2l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" />
    </>
  ),
  users: (
    <>
      <circle cx="9.5" cy="8.5" r="3.3" />
      <path d="M3.5 20a6 6 0 0 1 12 0" />
      <path d="M16.3 5.6a3.3 3.3 0 0 1 0 5.9" />
      <path d="M17.8 14.5a6 6 0 0 1 3.2 4.4" />
    </>
  ),
  heart: (
    <path d="M12 20s-7.4-4.6-7.4-9.6A4.4 4.4 0 0 1 12 7.7a4.4 4.4 0 0 1 7.4 2.7C19.4 15.4 12 20 12 20Z" />
  ),
  wallet: (
    <>
      <path d="M3.5 8.2A2.2 2.2 0 0 1 5.7 6h11.6A2.2 2.2 0 0 1 19.5 8.2V18a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2V8.2Z" />
      <path d="M19.5 10.5h1.4a1 1 0 0 1 1 1v2.4a1 1 0 0 1-1 1h-1.4" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <path d="M8.5 20v-6" />
      <path d="M13 20V8.5" />
      <path d="M17.5 20v-9" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 5.8v5.4c0 4 3 7.6 7 9.8 4-2.2 7-5.8 7-9.8V5.8L12 3Z" />
      <path d="m9.2 12 2 2 3.6-4" />
    </>
  ),
  screen: (
    <>
      <rect x="2.8" y="4.5" width="18.4" height="12" rx="2" />
      <path d="M9 20h6" />
      <path d="M12 16.5V20" />
    </>
  ),
  trophy: (
    <>
      <path d="M7.5 4h9v5a4.5 4.5 0 0 1-9 0V4Z" />
      <path d="M7.5 5.5H5A2 2 0 0 0 5 9.5h2.5" />
      <path d="M16.5 5.5H19a2 2 0 0 1 0 4h-2.5" />
      <path d="M12 13.5V17" />
      <path d="M8.5 20h7" />
      <path d="M9.5 20a2.5 2.5 0 0 1 5 0" />
    </>
  ),
  quote: (
    <path fill="currentColor" stroke="none" d="M9.4 6C6.4 7.3 4.8 9.6 4.8 12.8c0 2.8 1.6 4.7 3.9 4.7 2 0 3.5-1.4 3.5-3.4 0-1.9-1.3-3.2-3.1-3.2-.3 0-.6 0-.8.1.3-1.5 1.5-2.9 3.1-3.7L9.4 6Zm8.5 0c-3 1.3-4.6 3.6-4.6 6.8 0 2.8 1.6 4.7 3.9 4.7 2 0 3.5-1.4 3.5-3.4 0-1.9-1.3-3.2-3.1-3.2-.3 0-.6 0-.8.1.3-1.5 1.5-2.9 3.1-3.7L17.9 6Z" />
  ),
  facebook: (
    <path fill="currentColor" stroke="none" d="M14.5 21v-7.4h2.5l.4-2.9h-2.9V8.9c0-.8.2-1.4 1.4-1.4h1.6V4.9c-.3 0-1.3-.1-2.4-.1-2.3 0-3.9 1.4-3.9 4v2.2H8.7v2.9h2.5V21h3.3Z" />
  ),
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17.1" cy="6.9" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  whatsapp: (
    <path d="M20 11.8a8 8 0 0 1-11.9 7L4 20l1.3-3.9a8 8 0 1 1 14.7-4.3Z" />
  ),
  youtube: (
    <>
      <rect x="2.8" y="5.5" width="18.4" height="13" rx="4" />
      <path d="m10.4 9.6 4.8 2.9-4.8 2.9V9.6Z" />
    </>
  ),
};

const Icon = ({ name, size = 22, strokeWidth = 1.7, className = '', ...rest }) => {
  const glyph = paths[name];
  if (!glyph) return null;

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {glyph}
    </svg>
  );
};

export default Icon;
