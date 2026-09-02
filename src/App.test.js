import { render, screen, within } from '@testing-library/react';
import App from './App';

describe('App shell', () => {
  test('renders the school name in the header', () => {
    render(<App />);
    const header = screen.getByRole('banner');
    expect(within(header).getByText(/Azhar Foundation School/i)).toBeInTheDocument();
  });

  test('exposes the primary navigation', () => {
    render(<App />);
    const nav = screen.getByRole('navigation', { name: /primary/i });
    ['Home', 'About', 'Admissions', 'Contact'].forEach((label) => {
      expect(within(nav).getByRole('link', { name: label })).toBeInTheDocument();
    });
  });

  test('renders the home hero heading at the index route', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { level: 1, name: /build confident futures/i })
    ).toBeInTheDocument();
  });
});
