import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Icon from '../../components/Icon';
import { useAdmin } from '../AdminContext';
import { monthLabel, monthShort, monthSummary, rs } from '../data/calc';

/** "5-Sep-2026" — the date style used on the existing Word challan. */
const challanDate = (month, day) => {
  const [year, monthNum] = month.split('-').map(Number);
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day}-${names[monthNum - 1]}-${year}`;
};

/** One printed copy (the challan is printed twice: student + office). */
const ChallanCopy = ({ copy, family, row, month, settings }) => (
  <div className="challan">
    <header className="challan__head">
      <img src="/images/logo.png" alt="" />
      <div>
        <h2>{settings.schoolName}</h2>
        <p>Fee Challan — {monthShort(month)}</p>
      </div>
      <span className="challan__copy">{copy}</span>
    </header>

    <table className="challan__meta">
      <tbody>
        <tr>
          <th>Family ID</th>
          <td>{family.id}</td>
          <th>Issue month</th>
          <td>{monthLabel(month)}</td>
        </tr>
        <tr>
          <th>Due date</th>
          <td>{challanDate(month, settings.dueDay)}</td>
          <th>Valid till</th>
          <td>{challanDate(month, settings.validityDay)}</td>
        </tr>
        <tr>
          <th>Student(s)</th>
          <td colSpan={3}>
            {family.students.length
              ? family.students.map((s) => `${s.name}${s.klass ? ` (${s.klass})` : ''}`).join(' + ')
              : family.name}
          </td>
        </tr>
      </tbody>
    </table>

    <table className="challan__amounts">
      <tbody>
        <tr>
          <td>Monthly fee — {monthShort(month)}</td>
          <td>{rs(row.charge - (Number(row.record?.misc) || 0) - (Number(row.record?.fine) || 0))}</td>
        </tr>
        {Number(row.record?.misc) > 0 && (
          <tr>
            <td>Other charges{row.record?.note ? ` (${row.record.note})` : ''}</td>
            <td>{rs(row.record.misc)}</td>
          </tr>
        )}
        {row.arrearsIn > 0 && (
          <tr>
            <td>Previous balance (arrears)</td>
            <td>{rs(row.arrearsIn)}</td>
          </tr>
        )}
        {row.arrearsIn < 0 && (
          <tr>
            <td>Credit carried forward</td>
            <td>− {rs(-row.arrearsIn)}</td>
          </tr>
        )}
        {Number(row.record?.fine) > 0 && (
          <tr>
            <td>Fine</td>
            <td>{rs(row.record.fine)}</td>
          </tr>
        )}
        <tr className="challan__total">
          <td>Total payable</td>
          <td>{rs(Math.max(0, row.due))}</td>
        </tr>
      </tbody>
    </table>

    <ol className="challan__notes">
      <li>{settings.challanNote1}</li>
      <li>{settings.challanNote2.replace('Rs. 100', `Rs. ${settings.finePerDay}`)}</li>
    </ol>

    <footer className="challan__foot">
      <span>Received by: ____________________</span>
      <span>Date: ____________</span>
    </footer>
  </div>
);

const Challans = () => {
  const { data, months, currentMonth } = useAdmin();
  const { families, records, settings } = data;
  const [params] = useSearchParams();

  const [month, setMonth] = useState(() =>
    months.includes(params.get('month')) ? params.get('month') : currentMonth
  );
  const [scope, setScope] = useState(() => (params.get('family') ? 'one' : 'due'));
  const [familyId, setFamilyId] = useState(() => Number(params.get('family')) || families[0]?.id || 0);

  const summary = useMemo(
    () => monthSummary(families, records, months, month),
    [families, records, months, month]
  );

  const selected = summary.perFamily.filter(({ family, row }) => {
    if (!row || row.inactive) return false;
    if (scope === 'one') return family.id === Number(familyId);
    if (scope === 'due') return row.balance > 0;
    return true; // all
  });

  return (
    <div className="adm-page">
      <header className="adm-page__head adm-noprint">
        <div>
          <h1>Fee Challans</h1>
          <p>
            Pick the month and who to print for — each family gets one page with a
            student copy and an office copy, like the old Word challans.
          </p>
        </div>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => window.print()}
          disabled={!selected.length}
        >
          <Icon name="printer" size={17} />
          Print {selected.length} challan{selected.length === 1 ? '' : 's'}
        </button>
      </header>

      <div className="adm-toolbar adm-noprint">
        <select value={month} onChange={(e) => setMonth(e.target.value)} aria-label="Month">
          {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
        </select>

        <select value={scope} onChange={(e) => setScope(e.target.value)} aria-label="Which families">
          <option value="due">Families with a balance due</option>
          <option value="all">All active families</option>
          <option value="one">One family</option>
        </select>

        {scope === 'one' && (
          <select
            value={familyId}
            onChange={(e) => setFamilyId(Number(e.target.value))}
            aria-label="Family"
          >
            {families.map((f) => (
              <option key={f.id} value={f.id}>
                #{f.id} — {f.name}
              </option>
            ))}
          </select>
        )}

        <span className="adm-toolbar__count">{selected.length} selected</span>
      </div>

      {!selected.length && (
        <p className="adm-help adm-noprint">
          Nothing to print for this selection — every family is clear for {monthLabel(month)}.
        </p>
      )}

      <div className="challan-sheets">
        {selected.map(({ family, row }) => (
          <section key={family.id} className="challan-page">
            <ChallanCopy copy="Student Copy" family={family} row={row} month={month} settings={settings} />
            <div className="challan-cut" aria-hidden="true">✂ — — — — — — — — — — — — — — — — — — — — — — — — — — — —</div>
            <ChallanCopy copy="Office Copy" family={family} row={row} month={month} settings={settings} />
          </section>
        ))}
      </div>
    </div>
  );
};

export default Challans;
