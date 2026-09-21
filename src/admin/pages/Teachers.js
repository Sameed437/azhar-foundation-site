import React, { useMemo, useState } from 'react';
import Icon from '../../components/Icon';
import { useAdmin } from '../AdminContext';
import { amt, monthLabel } from '../data/calc';
import { ROLES, employedIn, teacherYear } from '../data/payroll';

const emptyTeacher = (nextId) => ({
  id: nextId,
  name: '',
  role: 'Teacher',
  phone: '',
  cnic: '',
  monthlySalary: '',
  joinedOn: '',
  leftOn: '',
  notes: '',
});

/**
 * The staff register: who works here, their role, and what they are paid
 * each month. Month-by-month payments live on the Salaries page.
 */
const Teachers = () => {
  const { data, months, currentMonth, saveTeacher, deleteTeacher } = useAdmin();
  const { teachers, salaries } = data;

  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');
  const [show, setShow] = useState('working'); // working | left | all
  const [sortBy, setSortBy] = useState('id'); // id | id-desc | name | name-desc | salary
  const [editing, setEditing] = useState(null);

  const nextId = teachers.reduce((max, t) => Math.max(max, t.id), 0) + 1;

  const roles = useMemo(() => {
    const found = new Set(teachers.map((t) => t.role).filter(Boolean));
    return Array.from(found).sort();
  }, [teachers]);

  const enriched = useMemo(
    () =>
      teachers.map((teacher) => ({
        teacher,
        year: teacherYear(teacher, salaries[teacher.id] || {}, months),
        working: employedIn(teacher, currentMonth),
      })),
    [teachers, salaries, months, currentMonth]
  );

  const visible = enriched
    .filter(({ teacher, working }) => {
      if (show === 'working' && !working) return false;
      if (show === 'left' && working) return false;
      if (role && teacher.role !== role) return false;
      if (!query.trim()) return true;
      const needle = query.trim().toLowerCase();
      return [String(teacher.id), teacher.name, teacher.role, teacher.phone, teacher.cnic]
        .join(' ').toLowerCase().includes(needle);
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.teacher.name.localeCompare(b.teacher.name);
      if (sortBy === 'name-desc') return b.teacher.name.localeCompare(a.teacher.name);
      if (sortBy === 'salary') return b.teacher.monthlySalary - a.teacher.monthlySalary;
      if (sortBy === 'id-desc') return b.teacher.id - a.teacher.id;
      return a.teacher.id - b.teacher.id;
    });

  const workingCount = enriched.filter(({ working }) => working).length;
  const monthlyWage = enriched
    .filter(({ working }) => working)
    .reduce((sum, { teacher }) => sum + (Number(teacher.monthlySalary) || 0), 0);

  const startEdit = (teacher) => setEditing(JSON.parse(JSON.stringify(teacher)));
  const updateDraft = (patch) => setEditing((d) => ({ ...d, ...patch }));

  const submitEditor = (event) => {
    event.preventDefault();
    saveTeacher({
      ...editing,
      id: Number(editing.id),
      name: editing.name.trim() || `Staff ${editing.id}`,
      monthlySalary: Number(editing.monthlySalary) || 0,
    });
    setEditing(null);
  };

  const removeTeacher = () => {
    const label = editing.name || `#${editing.id}`;
    // eslint-disable-next-line no-alert
    if (window.confirm(`Delete ${label} and ALL their salary records? This cannot be undone.\n\nIf they simply left the school, set "Left (month)" instead — that keeps the record.`)) {
      deleteTeacher(editing.id);
      setEditing(null);
    }
  };

  return (
    <div className="adm-page">
      <header className="adm-page__head">
        <div>
          <h1>Teachers &amp; Staff</h1>
          <p>
            {workingCount} working · monthly wage bill {amt(monthlyWage)}. Record each
            person once here; pay them month by month on the Salaries page.
          </p>
        </div>
        <div className="adm-page__actions">
          <button type="button" className="btn btn--primary" onClick={() => startEdit(emptyTeacher(nextId))}>
            <Icon name="plus" size={16} />
            Add teacher
          </button>
        </div>
      </header>

      {data.staffTablesMissing && (
        <div className="adm-alert adm-alert--error" role="alert">
          <span>
            The staff tables don&rsquo;t exist in your database yet, so nothing here can be
            saved. Open Supabase → SQL Editor and run the staff section of{' '}
            <code>supabase/schema.sql</code> (the <code>teachers</code> and{' '}
            <code>salary_records</code> tables), then refresh this page.
          </span>
        </div>
      )}

      <div className="adm-toolbar">
        <div className="adm-search">
          <Icon name="search" size={17} />
          <input
            type="search"
            placeholder="Search name, role, phone or ID…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search staff"
          />
        </div>

        <select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Filter by role">
          <option value="">All roles</option>
          {roles.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>

        <select value={show} onChange={(e) => setShow(e.target.value)} aria-label="Working or left">
          <option value="working">Currently working</option>
          <option value="left">Left the school</option>
          <option value="all">Everyone</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort">
          <option value="id">Sort: ID first → last</option>
          <option value="id-desc">Sort: ID last → first</option>
          <option value="name">Sort: Name A → Z</option>
          <option value="name-desc">Sort: Name Z → A</option>
          <option value="salary">Sort: Highest salary</option>
        </select>

        <span className="adm-toolbar__count">{visible.length} shown</span>
      </div>

      <div className="adm-tablewrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Phone</th>
              <th className="is-num">Monthly salary</th>
              <th className="is-num" title="Paid to this person so far this session">
                Paid this session
              </th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {visible.map(({ teacher, year, working }) => (
              <tr
                key={teacher.id}
                className="adm-row--open"
                title="Click to open this staff member"
                onClick={(e) => {
                  if (e.target.closest('a, button, input, select')) return;
                  startEdit(teacher);
                }}
              >
                <td className="adm-table__id">{teacher.id}</td>
                <td>
                  <span className={working ? '' : 'adm-student is-left'}>{teacher.name}</span>
                  {!working && <i className="adm-left-tag">left</i>}
                  {teacher.notes && <span className="adm-table__note">{teacher.notes}</span>}
                </td>
                <td>{teacher.role || '—'}</td>
                <td>
                  {teacher.phone
                    ? <a href={`tel:${teacher.phone}`}>{teacher.phone}</a>
                    : <span className="adm-split">—</span>}
                </td>
                <td className="is-num">{amt(teacher.monthlySalary)}</td>
                <td className="is-num">{amt(year.totalPaid)}</td>
                <td className="adm-table__actions">
                  <button type="button" onClick={() => startEdit(teacher)} aria-label={`Edit ${teacher.name}`}>
                    <Icon name="pencil" size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {!visible.length && (
              <tr>
                <td colSpan={7} className="adm-table__empty">
                  {teachers.length
                    ? 'Nothing matches this filter.'
                    : 'No staff yet — add the principal, teachers and helpers with “Add teacher”.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---------- editor ---------- */}
      {editing && (
        <div className="adm-modal" role="dialog" aria-modal="true" aria-label="Edit staff member">
          <form className="adm-modal__card" onSubmit={submitEditor}>
            <header className="adm-modal__head">
              <h2>{teachers.some((t) => t.id === editing.id) ? `Edit #${editing.id}` : 'New staff member'}</h2>
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
                Full name *
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) => updateDraft({ name: e.target.value })}
                  required
                />
              </label>
              <label className="adm-field">
                Role
                <input
                  type="text"
                  list="afs-roles"
                  value={editing.role}
                  onChange={(e) => updateDraft({ role: e.target.value })}
                  placeholder="Teacher"
                />
                <datalist id="afs-roles">
                  {ROLES.map((r) => <option key={r} value={r} />)}
                </datalist>
              </label>
            </div>

            <div className="adm-form-grid">
              <label className="adm-field">
                Phone
                <input
                  type="tel"
                  value={editing.phone}
                  onChange={(e) => updateDraft({ phone: e.target.value })}
                  placeholder="03xx-xxxxxxx"
                />
              </label>
              <label className="adm-field">
                CNIC
                <input
                  type="text"
                  value={editing.cnic}
                  onChange={(e) => updateDraft({ cnic: e.target.value })}
                  placeholder="35202-xxxxxxx-x"
                />
              </label>
              <label className="adm-field adm-field--sm">
                Monthly salary *
                <input
                  type="number"
                  min="0"
                  value={editing.monthlySalary}
                  onChange={(e) => updateDraft({ monthlySalary: e.target.value })}
                  required
                />
              </label>
            </div>

            <div className="adm-form-grid">
              <label className="adm-field adm-field--sm">
                Joined (month)
                <select
                  value={editing.joinedOn}
                  onChange={(e) => updateDraft({ joinedOn: e.target.value })}
                >
                  <option value="">Whole session</option>
                  {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
                </select>
              </label>
              <label className="adm-field adm-field--sm">
                Left (month)
                <select
                  value={editing.leftOn}
                  onChange={(e) => updateDraft({ leftOn: e.target.value })}
                >
                  <option value="">Still working</option>
                  {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
                </select>
              </label>
              <label className="adm-field">
                Notes
                <input
                  type="text"
                  value={editing.notes}
                  onChange={(e) => updateDraft({ notes: e.target.value })}
                  placeholder="e.g. teaches Class 5 and 6, evening academy too"
                />
              </label>
            </div>

            <footer className="adm-modal__foot">
              {teachers.some((t) => t.id === editing.id) && (
                <button type="button" className="adm-danger" onClick={removeTeacher}>
                  <Icon name="trash" size={15} />
                  Delete staff member
                </button>
              )}
              <div className="adm-modal__spacer" />
              <button type="button" className="btn btn--ghost" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn--primary">Save</button>
            </footer>
          </form>
        </div>
      )}
    </div>
  );
};

export default Teachers;
