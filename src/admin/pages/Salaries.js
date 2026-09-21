import React, { useMemo, useState } from 'react';
import Icon from '../../components/Icon';
import { useAdmin } from '../AdminContext';
import { amt, monthLabel, monthShort, rs } from '../data/calc';
import { salarySummary } from '../data/payroll';

const STATUS_LABEL = {
  paid: 'Paid',
  partial: 'Partial',
  unpaid: 'Unpaid',
  clear: 'Clear',
  inactive: 'Not on payroll',
};

const todayIso = () => new Date().toISOString().slice(0, 10);

/** One printable salary slip (office keeps one, the teacher signs it). */
const SalarySlip = ({ teacher, row, month, settings }) => (
  <div className="challan">
    <header className="challan__head">
      <img src="/images/logo.png" alt="" />
      <div>
        <h2>{settings.schoolName}</h2>
        <p>Salary Slip — {monthShort(month)}</p>
      </div>
      <span className="challan__copy">Salary Slip</span>
    </header>

    <table className="challan__meta">
      <tbody>
        <tr>
          <th>Staff ID</th>
          <td>{teacher.id}</td>
          <th>Month</th>
          <td>{monthLabel(month)}</td>
        </tr>
        <tr>
          <th>Name</th>
          <td>{teacher.name}</td>
          <th>Role</th>
          <td>{teacher.role || '—'}</td>
        </tr>
      </tbody>
    </table>

    <table className="challan__amounts">
      <tbody>
        <tr>
          <td>Salary for the month</td>
          <td>{rs(row.base)}</td>
        </tr>
        {row.allowance > 0 && (
          <tr>
            <td>Allowance / bonus{row.record?.note ? ` (${row.record.note})` : ''}</td>
            <td>{rs(row.allowance)}</td>
          </tr>
        )}
        {row.deduction > 0 && (
          <tr>
            <td>Deduction</td>
            <td>{rs(row.deduction)}</td>
          </tr>
        )}
        {row.paid > 0 ? (
          <>
            <tr>
              <td>Total payable</td>
              <td>{rs(row.payable)}</td>
            </tr>
            <tr className="challan__paid">
              <td>Paid{row.record?.paidDate ? ` (${row.record.paidDate})` : ''}</td>
              <td>{rs(row.paid)}</td>
            </tr>
            <tr className="challan__total">
              <td>{row.remaining > 0 ? 'Remaining payable' : 'Balance'}</td>
              <td>{rs(Math.max(0, row.remaining))}</td>
            </tr>
          </>
        ) : (
          <tr className="challan__total">
            <td>Total payable</td>
            <td>{rs(row.payable)}</td>
          </tr>
        )}
      </tbody>
    </table>

    <footer className="challan__foot">
      <span>Received by: ____________________</span>
      <span>Signature &amp; date: ____________</span>
    </footer>
  </div>
);

/**
 * Monthly payroll: what each staff member is owed this month, what was
 * actually handed over, and printable salary slips.
 */
const Salaries = () => {
  const { data, months, currentMonth, saveSalary } = useAdmin();
  const { teachers, salaries, settings } = data;

  const [month, setMonth] = useState(currentMonth);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  const summary = useMemo(
    () => salarySummary(teachers, salaries, month),
    [teachers, salaries, month]
  );

  const visible = summary.perTeacher.filter(({ teacher, row }) => {
    if (row.inactive && row.paid <= 0) return false;
    if (status === 'due' && row.remaining <= 0) return false;
    if (['paid', 'partial', 'unpaid'].includes(status) && row.status !== status) return false;
    if (!query.trim()) return true;
    const needle = query.trim().toLowerCase();
    return [String(teacher.id), teacher.name, teacher.role]
      .join(' ').toLowerCase().includes(needle);
  });

  const monthIndex = months.indexOf(month);

  const patchSalary = (teacherId, patch) => {
    const existing = salaries[teacherId]?.[month] || {};
    saveSalary(teacherId, month, {
      salary: '', allowance: 0, deduction: 0, paid: 0, paidDate: '', note: '',
      ...existing,
      ...patch,
    });
  };

  const payFull = (teacherId, row) =>
    patchSalary(teacherId, { paid: Math.max(0, row.payable), paidDate: todayIso() });

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

  if (!teachers.length) {
    return (
      <div className="adm-page">
        <header className="adm-page__head">
          <div>
            <h1>Salaries</h1>
            <p>Add your staff first on the Teachers page — then pay them here each month.</p>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="adm-page">
      <header className="adm-page__head adm-noprint">
        <div>
          <h1>Salaries</h1>
          <p>
            What each person is owed for {monthLabel(month)} and what was actually
            paid. Type the amount handed over — the slip updates with it.
          </p>
        </div>

        <div className="adm-page__actions">
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
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => window.print()}
            disabled={!visible.length}
          >
            <Icon name="printer" size={17} />
            Print {visible.length} slip{visible.length === 1 ? '' : 's'}
          </button>
        </div>
      </header>

      <div className="adm-statrow adm-noprint">
        <div className="adm-stat">
          <span className="adm-stat__label">Wage bill</span>
          <strong>{rs(summary.payable)}</strong>
        </div>
        <div className="adm-stat adm-stat--good">
          <span className="adm-stat__label">Paid</span>
          <strong>{rs(summary.paid)}</strong>
        </div>
        <div className="adm-stat adm-stat--bad">
          <span className="adm-stat__label">Still to pay</span>
          <strong>{rs(summary.outstanding)}</strong>
        </div>
        <div className="adm-stat">
          <span className="adm-stat__label">Staff</span>
          <strong>
            {summary.paidCount} paid · {summary.partialCount} partial · {summary.unpaidCount} unpaid
          </strong>
        </div>
      </div>

      <div className="adm-toolbar adm-noprint">
        <div className="adm-search">
          <Icon name="search" size={17} />
          <input
            type="search"
            placeholder="Search staff…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search staff"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="due">Unpaid + partial</option>
          <option value="unpaid">Unpaid only</option>
          <option value="partial">Partial only</option>
          <option value="paid">Paid only</option>
        </select>
        <span className="adm-toolbar__count">{visible.length} shown</span>
      </div>

      <div className="adm-tablewrap adm-noprint">
        <table className="adm-table adm-table--sheet">
          <thead>
            <tr>
              <th className="adm-year__id">ID</th>
              <th className="adm-year__name">Name</th>
              <th>Role</th>
              <th className="is-num adm-grp-fee">Salary</th>
              <th className="is-num adm-grp-fee" title="Bonus, extra duty, academy allowance">
                Allowance
              </th>
              <th className="is-num adm-grp-fee" title="Absences, advance recovery">
                Deduction
              </th>
              <th className="is-num adm-grp-arr" title="Salary + allowance − deduction">
                Payable
              </th>
              <th className="is-num adm-grp-arr">Paid</th>
              <th className="is-num adm-grp-arr">Remaining</th>
              <th>Date</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {visible.map(({ teacher, row }) => {
              const record = row.record || {};
              return (
                <tr key={teacher.id} className={`is-${row.status}`}>
                  <td className="adm-year__id adm-table__id">{teacher.id}</td>
                  <td className="adm-year__name">{teacher.name}</td>
                  <td className="adm-split">{teacher.role || '—'}</td>
                  <td className="is-num adm-grp-fee">
                    <NumberCell
                      value={record.salary ?? ''}
                      placeholder={String(teacher.monthlySalary)}
                      ariaLabel={`Salary for ${teacher.name}`}
                      onCommit={(v) => patchSalary(teacher.id, { salary: v })}
                    />
                  </td>
                  <td className="is-num adm-grp-fee">
                    <NumberCell
                      value={record.allowance || ''}
                      placeholder="0"
                      ariaLabel={`Allowance for ${teacher.name}`}
                      onCommit={(v) => patchSalary(teacher.id, { allowance: v || 0 })}
                    />
                  </td>
                  <td className="is-num adm-grp-fee">
                    <NumberCell
                      value={record.deduction || ''}
                      placeholder="0"
                      ariaLabel={`Deduction for ${teacher.name}`}
                      onCommit={(v) => patchSalary(teacher.id, { deduction: v || 0 })}
                    />
                  </td>
                  <td className="is-num adm-grp-arr adm-table__due">{amt(row.payable)}</td>
                  <td className="is-num adm-grp-arr">
                    <NumberCell
                      value={record.paid || ''}
                      placeholder="0"
                      ariaLabel={`Paid to ${teacher.name}`}
                      onCommit={(v) =>
                        patchSalary(teacher.id, {
                          paid: v || 0,
                          paidDate: v ? (record.paidDate || todayIso()) : '',
                        })
                      }
                    />
                  </td>
                  <td className={`is-num adm-grp-arr ${row.remaining > 0 ? 'is-due' : 'is-clear'}`}>
                    {row.remaining > 0 ? amt(row.remaining) : 'Clear'}
                  </td>
                  <td>
                    {row.paid > 0 || record.paidDate ? (
                      <input
                        className="adm-cell adm-cell--date"
                        type="date"
                        value={record.paidDate || ''}
                        aria-label={`Payment date for ${teacher.name}`}
                        onChange={(e) => patchSalary(teacher.id, { paidDate: e.target.value })}
                      />
                    ) : (
                      <span className="adm-split">—</span>
                    )}
                  </td>
                  <td>
                    <span className={`adm-status adm-status--${row.status}`}>
                      {STATUS_LABEL[row.status]}
                    </span>
                  </td>
                  <td className="adm-table__actions">
                    {row.remaining > 0 && (
                      <button
                        type="button"
                        className="adm-mini"
                        onClick={() => payFull(teacher.id, row)}
                        title="Mark the full salary paid today"
                      >
                        <Icon name="check" size={14} strokeWidth={2.4} />
                        Full
                      </button>
                    )}
                    {row.paid > 0 && (
                      <button
                        type="button"
                        className="adm-mini adm-mini--undo"
                        onClick={() => patchSalary(teacher.id, { paid: 0, paidDate: '' })}
                        title="Undo this payment"
                      >
                        <Icon name="close" size={13} strokeWidth={2.4} />
                        Undo
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {!visible.length && (
              <tr>
                <td colSpan={12} className="adm-table__empty">
                  Nothing to show for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* printable slips — hidden on screen, one per page when printing */}
      <div className="challan-sheets slip-sheets">
        {visible.map(({ teacher, row }) => (
          <section key={teacher.id} className="challan-page">
            <SalarySlip teacher={teacher} row={row} month={month} settings={settings} />
            <div className="challan-cut" aria-hidden="true">cut here</div>
            <SalarySlip teacher={teacher} row={row} month={month} settings={settings} />
          </section>
        ))}
      </div>
    </div>
  );
};

export default Salaries;
