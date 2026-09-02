import React, { useMemo, useState } from 'react';
import Icon from '../../components/Icon';
import { useAdmin } from '../AdminContext';
import { familyLedger, rs } from '../data/calc';
import { familyHasClass, uniqueClasses } from '../data/classes';

const emptyFamily = (nextId) => ({
  id: nextId,
  name: '',
  guardian: '',
  phone: '',
  students: [{ name: '', klass: '' }],
  listFee: '',
  monthlyFee: '',
  openingArrears: 0,
  notes: '',
  activeFrom: '',
  activeTo: '',
});

/** "M. Bilal (7) + Sara Azhar (2)" → [{name, klass}] */
const parseStudentsCell = (cell) =>
  cell
    .split(/[+\n]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const match = part.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
      return match
        ? { name: match[1].trim(), klass: match[2].trim() }
        : { name: part, klass: '' };
    });

const Families = () => {
  const { data, months, saveFamily, deleteFamily } = useAdmin();
  const { families, records } = data;

  const [query, setQuery] = useState('');
  const [klass, setKlass] = useState('');
  const [balanceFilter, setBalanceFilter] = useState('all'); // all | due | clear
  const [sortBy, setSortBy] = useState('id'); // id | name | fee | balance
  const [editing, setEditing] = useState(null); // a draft family object
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importReport, setImportReport] = useState('');

  const nextId = families.reduce((max, f) => Math.max(max, f.id), 0) + 1;

  const enriched = useMemo(
    () =>
      families.map((family) => ({
        family,
        ledger: familyLedger(family, records[family.id] || {}, months),
      })),
    [families, records, months]
  );

  const classes = useMemo(() => uniqueClasses(families), [families]);

  const visible = enriched
    .filter(({ family, ledger }) => {
      if (!familyHasClass(family, klass)) return false;
      if (balanceFilter === 'due' && ledger.closingBalance <= 0) return false;
      if (balanceFilter === 'clear' && ledger.closingBalance > 0) return false;
      if (!query.trim()) return true;
      const needle = query.trim().toLowerCase();
      const haystack = [
        String(family.id),
        family.name,
        family.guardian,
        family.phone,
        ...family.students.map((s) => `${s.name} ${s.klass}`),
      ].join(' ').toLowerCase();
      return haystack.includes(needle);
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.family.name.localeCompare(b.family.name);
      if (sortBy === 'name-desc') return b.family.name.localeCompare(a.family.name);
      if (sortBy === 'fee') return b.family.monthlyFee - a.family.monthlyFee;
      if (sortBy === 'balance') return b.ledger.closingBalance - a.ledger.closingBalance;
      if (sortBy === 'id-desc') return b.family.id - a.family.id;
      return a.family.id - b.family.id;
    });

  const totalStudents = families.reduce((sum, f) => sum + f.students.length, 0);

  /* ---- editor helpers ---- */
  const startEdit = (family) =>
    setEditing(JSON.parse(JSON.stringify(family)));

  const updateDraft = (patch) => setEditing((d) => ({ ...d, ...patch }));

  const updateStudent = (index, patch) =>
    setEditing((d) => ({
      ...d,
      students: d.students.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }));

  const submitEditor = (event) => {
    event.preventDefault();
    const clean = {
      ...editing,
      id: Number(editing.id),
      name: editing.name.trim() || editing.students[0]?.name.trim() || `Family ${editing.id}`,
      students: editing.students.filter((s) => s.name.trim()),
      monthlyFee: Number(editing.monthlyFee) || 0,
      listFee: editing.listFee === '' ? '' : Number(editing.listFee),
      openingArrears: Number(editing.openingArrears) || 0,
    };
    saveFamily(clean);
    setEditing(null);
  };

  const removeFamily = () => {
    const label = editing.name || `#${editing.id}`;
    // eslint-disable-next-line no-alert
    if (window.confirm(`Delete ${label} and ALL of their fee records? This cannot be undone.`)) {
      deleteFamily(editing.id);
      setEditing(null);
    }
  };

  /* ---- import ---- */
  const runImport = () => {
    const lines = importText.split('\n').map((l) => l.trim()).filter(Boolean);
    let added = 0;
    let skipped = 0;
    let id = nextId;

    for (const line of lines) {
      const cells = line.split('\t').map((c) => c.trim());
      if (cells.length < 2) { skipped += 1; continue; }
      const [idCell, namesCell, feeCell, listCell, phoneCell] = cells;
      const students = parseStudentsCell(namesCell || '');
      if (!students.length) { skipped += 1; continue; }
      const familyId = Number(idCell) || id;
      if (families.some((f) => f.id === familyId)) { skipped += 1; continue; }
      id = Math.max(id, familyId) + 1;
      saveFamily({
        ...emptyFamily(familyId),
        name: students.map((s) => s.name).join(' + '),
        students,
        monthlyFee: Number(feeCell) || 0,
        listFee: listCell ? Number(listCell) || '' : '',
        phone: phoneCell || '',
      });
      added += 1;
    }
    setImportReport(`${added} added, ${skipped} skipped.`);
    if (added) setImportText('');
  };

  return (
    <div className="adm-page">
      <header className="adm-page__head">
        <div>
          <h1>Students &amp; Families</h1>
          <p>
            {families.length} family accounts · {totalStudents} students. Siblings share one
            account and one challan, exactly like the fee register.
          </p>
        </div>
        <div className="adm-page__actions">
          <button type="button" className="btn btn--ghost" onClick={() => { setImportOpen(true); setImportReport(''); }}>
            <Icon name="upload" size={16} />
            Import
          </button>
          <button type="button" className="btn btn--primary" onClick={() => startEdit(emptyFamily(nextId))}>
            <Icon name="plus" size={16} />
            Add family
          </button>
        </div>
      </header>

      <div className="adm-toolbar">
        <div className="adm-search">
          <Icon name="search" size={17} />
          <input
            type="search"
            placeholder="Search name, class, phone or ID…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search families"
          />
        </div>

        <select value={klass} onChange={(e) => setKlass(e.target.value)} aria-label="Filter by class">
          <option value="">All classes</option>
          {classes.map((c) => <option key={c} value={c}>Class {c}</option>)}
        </select>

        <select
          value={balanceFilter}
          onChange={(e) => setBalanceFilter(e.target.value)}
          aria-label="Filter by balance"
        >
          <option value="all">Any balance</option>
          <option value="due">With balance due</option>
          <option value="clear">Clear</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort">
          <option value="id">Sort: ID 1 → {families.length ? Math.max(...families.map((f) => f.id)) : 'last'}</option>
          <option value="id-desc">Sort: ID last → 1</option>
          <option value="name">Sort: Name A → Z</option>
          <option value="name-desc">Sort: Name Z → A</option>
          <option value="fee">Sort: Highest fee</option>
          <option value="balance">Sort: Highest balance</option>
        </select>

        <span className="adm-toolbar__count">{visible.length} shown</span>
      </div>

      <div className="adm-tablewrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Students</th>
              <th>Guardian / phone</th>
              <th className="is-num">Monthly fee</th>
              <th className="is-num">Concession</th>
              <th className="is-num">Balance</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {visible.map(({ family, ledger }) => {
              const concession = family.listFee !== '' && family.listFee != null
                ? Math.max(0, Number(family.listFee) - Number(family.monthlyFee))
                : 0;
              return (
                <tr key={family.id}>
                  <td className="adm-table__id">{family.id}</td>
                  <td>
                    <div className="adm-students">
                      {family.students.map((s, i) => (
                        <span key={i} className="adm-student">
                          {s.name}
                          {s.klass && <em>({s.klass})</em>}
                        </span>
                      ))}
                    </div>
                    {family.notes && <span className="adm-table__note">{family.notes}</span>}
                  </td>
                  <td>
                    <div className="adm-guardian">
                      {family.guardian && <span>{family.guardian}</span>}
                      {family.phone && <a href={`tel:${family.phone}`}>{family.phone}</a>}
                    </div>
                  </td>
                  <td className="is-num">{rs(family.monthlyFee)}</td>
                  <td className="is-num">{concession ? rs(concession) : '—'}</td>
                  <td className={`is-num ${ledger.closingBalance > 0 ? 'is-due' : 'is-clear'}`}>
                    {rs(ledger.closingBalance)}
                  </td>
                  <td className="adm-table__actions">
                    <button type="button" onClick={() => startEdit(family)} aria-label={`Edit ${family.name}`}>
                      <Icon name="pencil" size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {!visible.length && (
              <tr>
                <td colSpan={7} className="adm-table__empty">
                  {families.length
                    ? 'Nothing matches that search.'
                    : 'No families yet — add the first one, or import your Excel rows.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---------- editor drawer ---------- */}
      {editing && (
        <div className="adm-modal" role="dialog" aria-modal="true" aria-label="Edit family">
          <form className="adm-modal__card" onSubmit={submitEditor}>
            <header className="adm-modal__head">
              <h2>{families.some((f) => f.id === editing.id) ? `Edit family #${editing.id}` : 'New family'}</h2>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close">
                <Icon name="close" size={18} />
              </button>
            </header>

            <div className="adm-form-grid">
              <label className="adm-field adm-field--sm">
                ID
                <input
                  type="number"
                  value={editing.id}
                  onChange={(e) => updateDraft({ id: e.target.value })}
                  required
                />
              </label>
              <label className="adm-field">
                Guardian (father / contact person)
                <input
                  type="text"
                  value={editing.guardian}
                  onChange={(e) => updateDraft({ guardian: e.target.value })}
                />
              </label>
              <label className="adm-field">
                Phone
                <input
                  type="tel"
                  value={editing.phone}
                  onChange={(e) => updateDraft({ phone: e.target.value })}
                />
              </label>
            </div>

            <fieldset className="adm-fieldset">
              <legend>Students in this family</legend>
              {editing.students.map((student, index) => (
                <div key={index} className="adm-student-row">
                  <input
                    type="text"
                    placeholder="Student name"
                    value={student.name}
                    onChange={(e) => updateStudent(index, { name: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Class"
                    value={student.klass}
                    onChange={(e) => updateStudent(index, { klass: e.target.value })}
                  />
                  <button
                    type="button"
                    aria-label="Remove student"
                    onClick={() =>
                      updateDraft({ students: editing.students.filter((_, i) => i !== index) })
                    }
                    disabled={editing.students.length === 1}
                  >
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="adm-add-row"
                onClick={() => updateDraft({ students: [...editing.students, { name: '', klass: '' }] })}
              >
                <Icon name="plus" size={14} />
                Add sibling
              </button>
            </fieldset>

            <div className="adm-form-grid">
              <label className="adm-field adm-field--sm">
                Full fee (before concession)
                <input
                  type="number"
                  min="0"
                  value={editing.listFee}
                  onChange={(e) => updateDraft({ listFee: e.target.value })}
                  placeholder="optional"
                />
              </label>
              <label className="adm-field adm-field--sm">
                Monthly fee charged *
                <input
                  type="number"
                  min="0"
                  value={editing.monthlyFee}
                  onChange={(e) => updateDraft({ monthlyFee: e.target.value })}
                  required
                />
              </label>
              <label className="adm-field adm-field--sm">
                Opening arrears
                <input
                  type="number"
                  value={editing.openingArrears}
                  onChange={(e) => updateDraft({ openingArrears: e.target.value })}
                />
              </label>
            </div>

            <div className="adm-form-grid">
              <label className="adm-field adm-field--sm">
                Joined (month)
                <select
                  value={editing.activeFrom}
                  onChange={(e) => updateDraft({ activeFrom: e.target.value })}
                >
                  <option value="">Whole session</option>
                  {months.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </label>
              <label className="adm-field adm-field--sm">
                Left (month)
                <select
                  value={editing.activeTo}
                  onChange={(e) => updateDraft({ activeTo: e.target.value })}
                >
                  <option value="">Still enrolled</option>
                  {months.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </label>
              <label className="adm-field">
                Notes
                <input
                  type="text"
                  value={editing.notes}
                  onChange={(e) => updateDraft({ notes: e.target.value })}
                  placeholder="e.g. sibling concession, special arrangement"
                />
              </label>
            </div>

            <footer className="adm-modal__foot">
              {families.some((f) => f.id === editing.id) && (
                <button type="button" className="adm-danger" onClick={removeFamily}>
                  <Icon name="trash" size={15} />
                  Delete family
                </button>
              )}
              <div className="adm-modal__spacer" />
              <button type="button" className="btn btn--ghost" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn--primary">
                Save
              </button>
            </footer>
          </form>
        </div>
      )}

      {/* ---------- import modal ---------- */}
      {importOpen && (
        <div className="adm-modal" role="dialog" aria-modal="true" aria-label="Import families">
          <div className="adm-modal__card">
            <header className="adm-modal__head">
              <h2>Import from Excel</h2>
              <button type="button" onClick={() => setImportOpen(false)} aria-label="Close">
                <Icon name="close" size={18} />
              </button>
            </header>

            <p className="adm-help">
              In your Excel sheet, select the rows and copy them, then paste below. Expected
              columns (tab-separated, as Excel pastes them):{' '}
              <code>ID · Student names · Monthly fee · Full fee (optional) · Phone (optional)</code>.
              Names like <code>M. Bilal (7) + Sara Azhar (2)</code> are split into siblings
              automatically. Rows whose ID already exists are skipped.
            </p>

            <textarea
              rows={10}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={'1\tHamna Kashif (10)\t1000\t4500\n2\tHasnain Zahid (7)\t3000'}
            />

            {importReport && <p className="adm-help adm-help--ok">{importReport}</p>}

            <footer className="adm-modal__foot">
              <div className="adm-modal__spacer" />
              <button type="button" className="btn btn--ghost" onClick={() => setImportOpen(false)}>
                Done
              </button>
              <button type="button" className="btn btn--primary" onClick={runImport} disabled={!importText.trim()}>
                <Icon name="upload" size={15} />
                Import rows
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Families;
