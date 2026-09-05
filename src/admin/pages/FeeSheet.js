import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon';
import { useAdmin } from '../AdminContext';
import { monthLabel, monthSummary, rs } from '../data/calc';
import { familyHasClass, uniqueClasses } from '../data/classes';

const STATUS_LABEL = {
  paid: 'Paid',
  partial: 'Partial',
  unpaid: 'Unpaid',
  clear: 'Clear',
  inactive: '—',
};

const todayIso = () => new Date().toISOString().slice(0, 10);

/**
 * The monthly register. Every cell edit saves on blur; arrears and balances
 * recalculate instantly. This is the screen that replaces the Excel sheets.
 */
const FeeSheet = () => {
  const { data, months, currentMonth, saveRecord } = useAdmin();
  const { families, records } = data;
  const [month, setMonth] = useState(currentMonth);
  const [query, setQuery] = useState('');
  const [klass, setKlass] = useState('');
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState('id'); // id | id-desc | name | name-desc | due | balance

  const classes = useMemo(() => uniqueClasses(families), [families]);

  const summary = useMemo(
    () => monthSummary(families, records, months, month),
    [families, records, months, month]
  );

  const visible = summary.perFamily.filter(({ family, row }) => {
    if (row?.inactive) return false;
    if (!familyHasClass(family, klass)) return false;
    if (status === 'due' && row.balance <= 0) return false;
    if (['paid', 'partial', 'unpaid'].includes(status) && row.status !== status) return false;
    if (!query.trim()) return true;
    const needle = query.trim().toLowerCase();
    return [String(family.id), family.name, ...family.students.map((s) => s.name)]
      .join(' ').toLowerCase().includes(needle);
  }).sort((a, b) => {
    if (sortBy === 'name') return a.family.name.localeCompare(b.family.name);
    if (sortBy === 'name-desc') return b.family.name.localeCompare(a.family.name);
    if (sortBy === 'due') return b.row.due - a.row.due;
    if (sortBy === 'balance') return b.row.balance - a.row.balance;
    if (sortBy === 'id-desc') return b.family.id - a.family.id;
    return a.family.id - b.family.id;
  });

  const monthIndex = months.indexOf(month);

  const patchRecord = (familyId, patch) => {
    const existing = records[familyId]?.[month] || {};
    saveRecord(familyId, month, {
      fee: '', misc: 0, fine: 0, received: 0, receivedDate: '', note: '',
      ...existing,
      ...patch,
    });
  };

  const markPaid = (familyId, due) => {
    patchRecord(familyId, { received: Math.max(0, due), receivedDate: todayIso() });
  };

  const NumberCell = ({ value, onCommit, placeholder, ariaLabel }) => {
    const [draft, setDraft] = useState(null);
    return (
      <input
        className="adm-cell"
        type="number"
        min="0"
        inputMode="numeric"
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={draft ?? (value === 0 || value === '' ? '' : value)}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={(e) => e.target.select()}
        onBlur={() => {
          if (draft !== null) onCommit(draft === '' ? '' : Number(draft));
          setDraft(null);
        }}
        onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
      />
    );
  };

  return (
    <div className="adm-page">
      <header className="adm-page__head">
        <div>
          <h1>Fee Sheet</h1>
          <p>Enter what each family paid — arrears carry forward automatically.</p>
        </div>

        <div className="adm-monthpick">
          <button
            type="button"
            onClick={() => setMonth(months[monthIndex - 1])}
            disabled={monthIndex === 0}
            aria-label="Previous month"
          >
            <Icon name="chevronLeft" size={18} />
          </button>
          <select value={month} onChange={(e) => setMonth(e.target.value)} aria-label="Month">
            {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
          </select>
          <button
            type="button"
            onClick={() => setMonth(months[monthIndex + 1])}
            disabled={monthIndex === months.length - 1}
            aria-label="Next month"
          >
            <Icon name="chevronRight" size={18} />
          </button>
        </div>
      </header>

      <div className="adm-statrow">
        <div className="adm-stat">
          <span className="adm-stat__label">Expected (incl. arrears)</span>
          <strong>{rs(summary.expected)}</strong>
        </div>
        <div className="adm-stat adm-stat--good">
          <span className="adm-stat__label">Received</span>
          <strong>{rs(summary.received)}</strong>
        </div>
        <div className="adm-stat adm-stat--bad">
          <span className="adm-stat__label">Outstanding</span>
          <strong>{rs(summary.outstanding)}</strong>
        </div>
        <div className="adm-stat">
          <span className="adm-stat__label">Families</span>
          <strong>
            {summary.paidCount} paid · {summary.partialCount} partial · {summary.unpaidCount} unpaid
          </strong>
        </div>
      </div>

      <div className="adm-toolbar">
        <div className="adm-search">
          <Icon name="search" size={17} />
          <input
            type="search"
            placeholder="Search family…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search families"
          />
        </div>
        <select value={klass} onChange={(e) => setKlass(e.target.value)} aria-label="Filter by class">
          <option value="">All classes</option>
          {classes.map((c) => <option key={c} value={c}>Class {c}</option>)}
        </select>

        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="due">Unpaid + partial</option>
          <option value="unpaid">Unpaid only</option>
          <option value="partial">Partial only</option>
          <option value="paid">Paid only</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort">
          <option value="id">Sort: ID first → last</option>
          <option value="id-desc">Sort: ID last → first</option>
          <option value="name">Sort: Name A → Z</option>
          <option value="name-desc">Sort: Name Z → A</option>
          <option value="due">Sort: Highest total due</option>
          <option value="balance">Sort: Highest remaining</option>
        </select>
        <span className="adm-toolbar__count">{visible.length} shown</span>
      </div>

      <div className="adm-tablewrap">
        <table className="adm-table adm-table--sheet">
          <thead>
            <tr>
              <th>ID</th>
              <th>Family</th>
              <th className="is-num">Arrears</th>
              <th className="is-num">Fee</th>
              <th className="is-num">Misc</th>
              <th className="is-num">Fine</th>
              <th className="is-num">Total due</th>
              <th className="is-num">Received</th>
              <th>Date</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {visible.map(({ family, row }) => {
              const record = row.record || {};
              return (
                <tr key={family.id} className={`is-${row.status}`}>
                  <td className="adm-table__id">{family.id}</td>
                  <td>
                    <div className="adm-students adm-students--tight">
                      {family.students.map((s, i) => (
                        <span key={i} className={`adm-student${s.left ? ' is-left' : ''}`}>
                          {s.name}{s.klass && <em>({s.klass})</em>}
                          {s.left && <i className="adm-left-tag">left</i>}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className={`is-num ${row.arrearsIn > 0 ? 'is-due' : ''}`}>
                    {row.arrearsIn ? rs(row.arrearsIn) : '—'}
                  </td>
                  <td className="is-num">
                    <NumberCell
                      value={record.fee ?? ''}
                      placeholder={String(family.monthlyFee)}
                      ariaLabel={`Fee for ${family.name}`}
                      onCommit={(v) => patchRecord(family.id, { fee: v })}
                    />
                  </td>
                  <td className="is-num">
                    <NumberCell
                      value={record.misc || ''}
                      placeholder="0"
                      ariaLabel={`Misc for ${family.name}`}
                      onCommit={(v) => patchRecord(family.id, { misc: v || 0 })}
                    />
                  </td>
                  <td className="is-num">
                    <NumberCell
                      value={record.fine || ''}
                      placeholder="0"
                      ariaLabel={`Fine for ${family.name}`}
                      onCommit={(v) => patchRecord(family.id, { fine: v || 0 })}
                    />
                  </td>
                  <td className="is-num adm-table__due">{rs(row.due)}</td>
                  <td className="is-num">
                    <NumberCell
                      value={record.received || ''}
                      placeholder="0"
                      ariaLabel={`Received from ${family.name}`}
                      onCommit={(v) =>
                        patchRecord(family.id, {
                          received: v || 0,
                          receivedDate: v ? (record.receivedDate || todayIso()) : '',
                        })
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="adm-cell adm-cell--date"
                      type="date"
                      value={record.receivedDate || ''}
                      aria-label={`Payment date for ${family.name}`}
                      onChange={(e) => patchRecord(family.id, { receivedDate: e.target.value })}
                    />
                  </td>
                  <td>
                    <span className={`adm-status adm-status--${row.status}`}>
                      {STATUS_LABEL[row.status]}
                    </span>
                  </td>
                  <td className="adm-table__actions">
                    {row.balance > 0 && (
                      <button
                        type="button"
                        className="adm-mini"
                        onClick={() => markPaid(family.id, row.due)}
                        title="Mark fully paid today"
                      >
                        <Icon name="check" size={14} strokeWidth={2.4} />
                        Full
                      </button>
                    )}
                    {Number(record.received) > 0 && (
                      <button
                        type="button"
                        className="adm-mini adm-mini--undo"
                        onClick={() => patchRecord(family.id, { received: 0, receivedDate: '' })}
                        title="Undo this payment (clears received amount and date)"
                      >
                        <Icon name="close" size={13} strokeWidth={2.4} />
                        Undo
                      </button>
                    )}
                    <Link
                      className="adm-mini"
                      to={`/admin/challans?month=${month}&family=${family.id}`}
                      title="Open challan"
                    >
                      <Icon name="receipt" size={14} />
                    </Link>
                  </td>
                </tr>
              );
            })}
            {!visible.length && (
              <tr>
                <td colSpan={11} className="adm-table__empty">
                  {families.length ? 'Nothing to show for this filter.' : 'Add families first — then run the month here.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeeSheet;
