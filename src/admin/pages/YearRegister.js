import React, { useMemo, useState } from 'react';
import Icon from '../../components/Icon';
import { useAdmin } from '../AdminContext';
import { familyLedger, monthLabel, rs } from '../data/calc';
import { familyHasClass, uniqueClasses } from '../data/classes';

const todayIso = () => new Date().toISOString().slice(0, 10);

/** "2026-09" → "Sep" (the year lives in the tooltip). */
const monthTiny = (key) =>
  ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][
    Number(key.split('-')[1]) - 1
  ];

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

/**
 * The whole session on one screen, exactly like the old Excel register:
 * one row per family, one column per month, each cell = amount received.
 * Cells are editable; colours show paid / partial / unpaid for months
 * that have already arrived.
 */
const YearRegister = () => {
  const { data, months, currentMonth, saveRecord } = useAdmin();
  const { families, records } = data;

  const [query, setQuery] = useState('');
  const [klass, setKlass] = useState('');
  const [sortBy, setSortBy] = useState('id'); // id | id-desc | name | name-desc

  const classes = useMemo(() => uniqueClasses(families), [families]);

  const enriched = useMemo(
    () =>
      families.map((family) => ({
        family,
        ledger: familyLedger(family, records[family.id] || {}, months),
      })),
    [families, records, months]
  );

  const visible = enriched
    .filter(({ family }) => {
      if (!familyHasClass(family, klass)) return false;
      if (!query.trim()) return true;
      const needle = query.trim().toLowerCase();
      return [String(family.id), family.name, ...family.students.map((s) => s.name)]
        .join(' ').toLowerCase().includes(needle);
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.family.name.localeCompare(b.family.name);
      if (sortBy === 'name-desc') return b.family.name.localeCompare(a.family.name);
      if (sortBy === 'id-desc') return b.family.id - a.family.id;
      return a.family.id - b.family.id;
    });

  const patchReceived = (familyId, month, value) => {
    const existing = records[familyId]?.[month] || {};
    const record = { fee: '', misc: 0, fine: 0, received: 0, receivedDate: '', note: '', ...existing };
    record.received = value || 0;
    record.receivedDate = value ? (existing.receivedDate || todayIso()) : '';
    saveRecord(familyId, month, record);
  };

  const monthTotals = months.map((month) =>
    visible.reduce((sum, { ledger }) => {
      const row = ledger.rows.find((r) => r.month === month);
      return sum + (row && !row.inactive ? row.received : 0);
    }, 0)
  );
  const grandTotal = monthTotals.reduce((sum, t) => sum + t, 0);

  return (
    <div className="adm-page adm-page--wide">
      <header className="adm-page__head">
        <div>
          <h1>Yearly Register</h1>
          <p>
            Every family, every month of the session — each cell is the amount
            received for that month. Type in a cell to correct it; colours show
            paid, partial and unpaid for months that have already come.
          </p>
        </div>
      </header>

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
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort">
          <option value="id">Sort: ID first → last</option>
          <option value="id-desc">Sort: ID last → first</option>
          <option value="name">Sort: Name A → Z</option>
          <option value="name-desc">Sort: Name Z → A</option>
        </select>
        <span className="adm-toolbar__count">{visible.length} shown</span>
      </div>

      <div className="adm-tablewrap">
        <table className="adm-table adm-table--year">
          <thead>
            <tr>
              <th className="adm-year__id">ID</th>
              <th className="adm-year__name">Family</th>
              {months.map((m) => (
                <th key={m} className="is-num" title={monthLabel(m)}>
                  {monthTiny(m)}
                </th>
              ))}
              <th className="is-num">Total paid</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(({ family, ledger }) => (
              <tr key={family.id}>
                <td className="adm-year__id adm-table__id">{family.id}</td>
                <td className="adm-year__name">{family.name}</td>
                {ledger.rows.map((row) => {
                  if (row.inactive) {
                    return <td key={row.month} className="is-num adm-year__off">—</td>;
                  }
                  const arrived = row.month <= currentMonth;
                  const tint = arrived ? ` is-cell-${row.status}` : '';
                  return (
                    <td key={row.month} className={`is-num${tint}`}>
                      <NumberCell
                        value={row.received || ''}
                        placeholder="0"
                        ariaLabel={`Received from ${family.name} for ${monthLabel(row.month)}`}
                        onCommit={(v) => patchReceived(family.id, row.month, v)}
                      />
                    </td>
                  );
                })}
                <td className="is-num adm-year__total">{rs(ledger.totalReceived)}</td>
              </tr>
            ))}
            {!visible.length && (
              <tr>
                <td colSpan={months.length + 3} className="adm-table__empty">
                  {families.length ? 'Nothing matches that search.' : 'Add families first.'}
                </td>
              </tr>
            )}
          </tbody>
          {visible.length > 0 && (
            <tfoot>
              <tr>
                <td className="adm-year__id" aria-hidden="true" />
                <td className="adm-year__name">Received</td>
                {monthTotals.map((total, i) => (
                  <td key={months[i]} className="is-num" title={monthLabel(months[i])}>
                    {total ? total.toLocaleString('en-PK') : '—'}
                  </td>
                ))}
                <td className="is-num">{rs(grandTotal)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default YearRegister;
