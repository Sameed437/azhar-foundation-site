import React, { useEffect, useState } from 'react';
import Icon from '../../components/Icon';
import { useAdmin } from '../AdminContext';

/**
 * Sign-in gate.
 *
 * Supabase mode: email + password (accounts created in the Supabase
 * dashboard). Device mode: a passcode for this browser — created on first
 * run, honest about its limits.
 */
const AdminLogin = () => {
  const { mode, driver, signIn } = useAdmin();
  const [hasAccount, setHasAccount] = useState(true);
  const [email, setEmail] = useState('');
  const [secret, setSecret] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    driver.hasAccount().then(setHasAccount);
  }, [driver]);

  const isLocalSetup = mode === 'local' && !hasAccount;

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (isLocalSetup) {
      if (secret.length < 4) return setError('Use at least 4 characters.');
      if (secret !== confirm) return setError('The two passcodes do not match.');
      setBusy(true);
      await driver.createPasscode(secret);
      const result = await signIn('', secret);
      setBusy(false);
      if (!result.ok) setError(result.error);
      return;
    }

    setBusy(true);
    const result = await signIn(email, secret);
    setBusy(false);
    if (!result.ok) setError(result.error || 'Sign in failed.');
  };

  return (
    <div className="adm-login">
      <form className="adm-login__card" onSubmit={submit}>
        <img src="/images/logo.png" alt="" width="64" height="64" />
        <h1>Fee Management System</h1>
        <p className="adm-login__sub">
          {mode === 'supabase'
            ? 'Sign in with your staff account.'
            : isLocalSetup
              ? 'First run on this device — set a passcode to protect the records.'
              : 'Enter this device’s passcode.'}
        </p>

        {mode === 'supabase' && (
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
        )}

        <label>
          {mode === 'supabase' ? 'Password' : 'Passcode'}
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            autoComplete={mode === 'supabase' ? 'current-password' : 'off'}
            required
          />
        </label>

        {isLocalSetup && (
          <label>
            Repeat passcode
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="off"
              required
            />
          </label>
        )}

        {error && <p className="adm-login__error" role="alert">{error}</p>}

        <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
          {busy ? 'Please wait…' : isLocalSetup ? 'Set passcode & open' : 'Sign in'}
          <Icon name="arrowRight" size={17} />
        </button>

        {mode === 'local' && (
          <p className="adm-login__note">
            Device mode: records are stored in this browser only. Connect Supabase
            (see Settings after signing in) for real accounts, multi-device access
            and safe cloud storage.
          </p>
        )}
      </form>
    </div>
  );
};

export default AdminLogin;
