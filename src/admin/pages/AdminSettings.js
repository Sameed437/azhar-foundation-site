import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon';
import { useAdmin } from '../AdminContext';
import { MONTH_NAMES, sessionLabel } from '../data/calc';

/** ID far above the real register (1-83), so the practice entry is unmistakable. */
const TEST_FAMILY_ID = 999;

const AdminSettings = () => {
  const { data, mode, saveSettings, replaceAll, saveFamily } = useAdmin();
  const [draft, setDraft] = useState(data.settings);
  const [status, setStatus] = useState('');
  const fileRef = useRef(null);

  const patch = (changes) => setDraft((d) => ({ ...d, ...changes }));

  const submit = (event) => {
    event.preventDefault();
    saveSettings({
      ...draft,
      sessionStart: Number(draft.sessionStart) || 2026,
      startMonth: Number(draft.startMonth) || 3,
      dueDay: Number(draft.dueDay) || 5,
      validityDay: Number(draft.validityDay) || 10,
      finePerDay: Number(draft.finePerDay) || 0,
    });
    setStatus('Settings saved.');
    window.setTimeout(() => setStatus(''), 2500);
  };

  const downloadBackup = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `afs-fee-backup-${stamp}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const restoreBackup = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const snapshot = JSON.parse(await file.text());
      if (!Array.isArray(snapshot.families)) throw new Error('Not a fee-system backup file.');
      // eslint-disable-next-line no-alert
      if (!window.confirm(`Replace ALL current data with this backup (${snapshot.families.length} families)?`)) return;
      await replaceAll(snapshot);
      setStatus('Backup restored.');
    } catch (error) {
      setStatus(`Restore failed: ${error.message}`);
    }
  };

  return (
    <div className="adm-page">
      <header className="adm-page__head">
        <div>
          <h1>Settings</h1>
          <p>Session, challan dates and wording, backups, and the database connection.</p>
        </div>
      </header>

      <form className="adm-panel" onSubmit={submit}>
        <h2>Session &amp; challan</h2>

        <div className="adm-form-grid">
          <label className="adm-field adm-field--sm">
            Session starts (year)
            <input
              type="number"
              value={draft.sessionStart}
              onChange={(e) => patch({ sessionStart: e.target.value })}
            />
            <small>Session {sessionLabel(Number(draft.sessionStart) || 2026)} — March to February</small>
          </label>
          <label className="adm-field adm-field--sm">
            Records begin from
            <select
              value={draft.startMonth || 3}
              onChange={(e) => patch({ startMonth: e.target.value })}
            >
              {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2].map((m) => (
                <option key={m} value={m}>
                  {MONTH_NAMES[(m + 9) % 12]}{m === 3 ? ' (whole session)' : ''}
                </option>
              ))}
            </select>
            <small>Months before this are not charged, shown or counted anywhere.</small>
          </label>
          <label className="adm-field adm-field--sm">
            Due day of month
            <input
              type="number" min="1" max="28"
              value={draft.dueDay}
              onChange={(e) => patch({ dueDay: e.target.value })}
            />
          </label>
          <label className="adm-field adm-field--sm">
            Valid till day
            <input
              type="number" min="1" max="28"
              value={draft.validityDay}
              onChange={(e) => patch({ validityDay: e.target.value })}
            />
          </label>
          <label className="adm-field adm-field--sm">
            Fine per day (Rs.)
            <input
              type="number" min="0"
              value={draft.finePerDay}
              onChange={(e) => patch({ finePerDay: e.target.value })}
            />
          </label>
        </div>

        <div className="adm-form-grid">
          <label className="adm-field">
            School name on challan
            <input
              type="text"
              value={draft.schoolName}
              onChange={(e) => patch({ schoolName: e.target.value })}
            />
          </label>
        </div>

        <div className="adm-form-grid">
          <label className="adm-field">
            Challan note 1
            <input
              type="text"
              value={draft.challanNote1}
              onChange={(e) => patch({ challanNote1: e.target.value })}
            />
          </label>
          <label className="adm-field">
            Challan note 2
            <input
              type="text"
              value={draft.challanNote2}
              onChange={(e) => patch({ challanNote2: e.target.value })}
            />
          </label>
        </div>

        <div className="adm-panel__foot">
          {status && <span className="adm-help adm-help--ok">{status}</span>}
          <button type="submit" className="btn btn--primary">Save settings</button>
        </div>
      </form>

      <section className="adm-panel">
        <h2>Backup &amp; restore</h2>
        <p className="adm-help">
          The backup file contains every family, every month&rsquo;s records and these
          settings. {mode === 'local'
            ? 'In device mode this is your ONLY safety net — download one after every fee day and keep it somewhere safe (Google Drive, USB).'
            : 'With Supabase connected this is a convenience export; your database is the primary store.'}
        </p>
        <div className="adm-page__actions">
          <button type="button" className="btn btn--primary" onClick={downloadBackup}>
            <Icon name="download" size={16} />
            Download backup
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => fileRef.current?.click()}>
            <Icon name="upload" size={16} />
            Restore from backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={restoreBackup}
          />
        </div>
      </section>

      <section className="adm-panel">
        <h2>Testing</h2>
        <p className="adm-help">
          Creates a practice family, <strong>#{TEST_FAMILY_ID} &ldquo;TEST FAMILY&rdquo;</strong>,
          with two students, a Rs. 1,000 fee, a Rs. 500 concession and Rs. 500 opening arrears —
          so you can safely try everything: record a payment, Undo, print its challan, tick a
          student as left, adjust its fee. Put <em>your own</em> phone number on it to test
          WhatsApp sending on yourself. It behaves like any family, so its amounts appear in
          totals while it exists — delete it from{' '}
          <Link to="/admin/families">Students &amp; Families</Link> (open it → Delete family)
          when you&rsquo;re done, and every trace of it goes with it.
        </p>
        <button
          type="button"
          className="btn btn--primary"
          disabled={data.families.some((f) => f.id === TEST_FAMILY_ID)}
          onClick={() => {
            saveFamily({
              id: TEST_FAMILY_ID,
              name: 'TEST FAMILY (practice entry)',
              guardian: 'Test Guardian',
              phone: '',
              students: [
                { name: 'Test Student One', klass: '5' },
                { name: 'Test Student Two', klass: '2' },
              ],
              listFee: 1500,
              monthlyFee: 1000,
              openingArrears: 500,
              notes: 'Practice entry — safe to edit and delete. Not a real family.',
              activeFrom: '',
              activeTo: '',
            });
            setStatus(`Test family #${TEST_FAMILY_ID} created — find it on Students & Families.`);
          }}
        >
          <Icon name="sparkle" size={16} />
          {data.families.some((f) => f.id === TEST_FAMILY_ID)
            ? `Test family #${TEST_FAMILY_ID} already exists`
            : `Create test family #${TEST_FAMILY_ID}`}
        </button>
      </section>

      <section className="adm-panel">
        <h2>Database connection</h2>
        {mode === 'supabase' ? (
          <p className="adm-help adm-help--ok">
            Connected to Supabase — records are stored in your database, protected by
            your staff logins, and available from any device.
          </p>
        ) : (
          <>
            <p className="adm-help">
              Right now the system runs in <strong>device mode</strong>: everything is saved in
              this browser on this computer. It works fully, but clearing browser data would
              erase it, and other devices can&rsquo;t see it. Connecting Supabase (free tier is
              enough) gives real logins and safe cloud storage:
            </p>
            <ol className="adm-steps">
              <li>Create a project at <strong>supabase.com</strong> (free).</li>
              <li>Open <em>SQL Editor</em>, paste the contents of <code>supabase/schema.sql</code> from this project, and run it.</li>
              <li>Under <em>Authentication → Users</em>, add accounts for the principal/admin (email + password).</li>
              <li>
                Add two environment variables where the site is deployed (Vercel →
                Settings → Environment Variables), from Supabase&rsquo;s <em>Settings → API</em>:
                <code>REACT_APP_SUPABASE_URL</code> and <code>REACT_APP_SUPABASE_ANON_KEY</code>.
              </li>
              <li>Redeploy. This screen will then show &ldquo;Connected&rdquo;.</li>
              <li>Download a backup here first, then restore it after connecting to move your data across.</li>
            </ol>
          </>
        )}
      </section>
    </div>
  );
};

export default AdminSettings;
