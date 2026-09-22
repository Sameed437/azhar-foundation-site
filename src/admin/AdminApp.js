import React, { useEffect, useState } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import Icon from '../components/Icon';
import { AdminProvider, useAdmin } from './AdminContext';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import Families from './pages/Families';
import FeeSheet from './pages/FeeSheet';
import YearRegister from './pages/YearRegister';
import Challans from './pages/Challans';
import WhatsAppSend from './pages/WhatsAppSend';
import Teachers from './pages/Teachers';
import Salaries from './pages/Salaries';
import AdminSettings from './pages/AdminSettings';
import { sessionLabel } from './data/calc';
import './admin.css';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: 'chart', end: true },
  { to: '/admin/families', label: 'Students & Families', icon: 'users' },
  { to: '/admin/fees', label: 'Fee Sheet', icon: 'grid' },
  { to: '/admin/register', label: 'Yearly Register', icon: 'book' },
  { to: '/admin/challans', label: 'Challans', icon: 'receipt' },
  { to: '/admin/whatsapp', label: 'WhatsApp', icon: 'whatsapp' },
  { to: '/admin/teachers', label: 'Teachers & Staff', icon: 'cap' },
  { to: '/admin/salaries', label: 'Salaries', icon: 'wallet' },
  { to: '/admin/settings', label: 'Settings', icon: 'settings' },
];

/**
 * "Saving… / Saved / Not saved" pill. Quiet when idle; while a write is on
 * its way to the database it says so, and a failed write stays on screen
 * with a Retry button until it lands.
 */
const SaveState = () => {
  const { pendingSaves, failedCount, lastSavedAt, retryFailed } = useAdmin();
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (!lastSavedAt || pendingSaves > 0) return undefined;
    setJustSaved(true);
    const timer = setTimeout(() => setJustSaved(false), 2400);
    return () => clearTimeout(timer);
  }, [lastSavedAt, pendingSaves]);

  if (failedCount > 0) {
    return (
      <div className="adm-savestate is-error adm-noprint" role="status">
        <span className="adm-savestate__dot" />
        {failedCount === 1 ? '1 change not saved' : `${failedCount} changes not saved`}
        <button type="button" onClick={retryFailed}>Retry</button>
      </div>
    );
  }
  if (pendingSaves > 0) {
    return (
      <div className="adm-savestate is-saving adm-noprint" role="status">
        <span className="adm-savestate__dot" />
        Saving…
      </div>
    );
  }
  if (justSaved) {
    return (
      <div className="adm-savestate is-saved adm-noprint" role="status">
        <Icon name="check" size={14} strokeWidth={2.6} />
        Saved
      </div>
    );
  }
  return null;
};

const Shell = () => {
  const { user, booting, data, mode, signOut, saveError, clearSaveError, failedCount, retryFailed } = useAdmin();
  /* Phones get a hamburger: the nav is hidden until it is opened, and
     closes again as soon as a page is chosen. */
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (event) => { if (event.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  if (booting) {
    return (
      <div className="adm-boot" role="status">
        <img src="/images/logo.png" alt="" width="64" height="64" />
        <span>Opening the fee system…</span>
      </div>
    );
  }

  if (!user) return <AdminLogin />;

  return (
    <div className="adm">
      <aside className={`adm-side${menuOpen ? ' is-open' : ''}`}>
        <div className="adm-side__brand">
          <img src="/images/logo.png" alt="" width="40" height="40" />
          <div>
            <strong>A.F.S Fee System</strong>
            <span>Session {sessionLabel(data.settings.sessionStart)}</span>
          </div>
          <button
            type="button"
            className="adm-side__burger"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="adm-nav"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
          </button>
        </div>

        <nav className="adm-side__nav" id="adm-nav" aria-label="Admin">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `adm-side__link${isActive ? ' is-active' : ''}`}
            >
              <Icon name={item.icon} size={19} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="adm-side__foot">
          <span
            className={`adm-mode adm-mode--${mode}`}
            title={mode === 'supabase'
              ? 'Connected to Supabase — data is stored in your database'
              : 'Device mode — data lives in this browser only. Back up from Settings.'}
          >
            <span className="adm-mode__dot" />
            {mode === 'supabase' ? 'Database connected' : 'This device only'}
          </span>

          <div className="adm-side__user">
            <span>{user.email}</span>
            <button type="button" onClick={signOut} className="adm-side__logout">
              <Icon name="logout" size={16} />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <main className="adm-main">
        {saveError && (
          <div className="adm-alert adm-alert--error" role="alert">
            <span>
              Could not save the last change ({saveError}) — check the internet
              connection, then press Retry. The change is still on screen and
              will not be lost while this page stays open.
            </span>
            {failedCount > 0 && (
              <button type="button" className="adm-alert__retry" onClick={retryFailed}>
                Retry
              </button>
            )}
            <button type="button" onClick={clearSaveError}>
              <Icon name="close" size={16} />
              <span className="sr-only">Dismiss</span>
            </button>
          </div>
        )}

        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="families" element={<Families />} />
          <Route path="fees" element={<FeeSheet />} />
          <Route path="register" element={<YearRegister />} />
          <Route path="challans" element={<Challans />} />
          <Route path="whatsapp" element={<WhatsAppSend />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="salaries" element={<Salaries />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
        <SaveState />
      </main>
    </div>
  );
};

const AdminApp = () => (
  <AdminProvider>
    <Shell />
  </AdminProvider>
);

export default AdminApp;
