// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// CRA pins an older jsdom that predates TextEncoder/TextDecoder; react-router v7
// expects both at module load. Provide them from Node before anything imports it.
import { TextDecoder, TextEncoder } from 'util';

if (typeof global.TextEncoder === 'undefined') global.TextEncoder = TextEncoder;
if (typeof global.TextDecoder === 'undefined') global.TextDecoder = TextDecoder;

// --- Browser APIs jsdom does not implement, used by the UI components ---

// <Reveal> and <Gallery> check for a reduced-motion preference on mount.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

// <ScrollReset> and <BackToTop> scroll the window.
window.scrollTo = () => {};

// <Reveal> observes its own element to trigger the entry animation.
if (!window.IntersectionObserver) {
  window.IntersectionObserver = class {
    observe() {}

    unobserve() {}

    disconnect() {}
  };
  global.IntersectionObserver = window.IntersectionObserver;
}
