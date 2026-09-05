import React, { useEffect, useState } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import Icon from '../components/Icon';
import { AdminProvider, useAdmin } from './AdminContext';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import Families from './pages/Families';
import FeeSheet from './pages/FeeSheet';
import Challans from './pages/Challans';
import AdminSettings from './pages/AdminSettings';
import { sessionLabel } from './data/calc';
import './admin.css';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: 'chart', end: true },
  { to: '/admin/families', label: 'Students & Families', icon: 'users' },
  { to: '/admin/fees', label: 'Fee Sheet', icon: 'grid' },
  { to: '/admin/challans', label: 'Challans', icon: 'receipt' },
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
      <aside className="adm-side">
        <div className="adm-side__brand">
          <img src="/images/logo.png" alt="" width="40" height="40" />
          <div>
            <strong>A.F.S Fee System</strong>
            <span>Session {sessionLabel(data.settings.sessionStart)}</span>
          </div>
        </div>

        <nav className="adm-side__nav" aria-label="Admin">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
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
          <Route path="challans" element={<Challans />} />
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
