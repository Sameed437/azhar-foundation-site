import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon';
import { useAdmin } from '../AdminContext';
import {
  MONTH_NAMES,
  monthConcession,
  monthLabel,
  monthSummary,
  rs,
} from '../data/calc';

/* Palette validated with the dataviz six-checks script (light surface #fff):
   collected #135cbd / outstanding #c5221f, status trio #137333/#d97d00/#c5221f. */
const C = {
  collected: '#135cbd',
  outstanding: '#c5221f',
  paid: '#137333',
  partial: '#d97d00',
  unpaid: '#c5221f',
};

const compact = (value) =>
  value >= 1000 ? `${Math.round(value / 1000)}k` : String(Math.round(value));

/**
 * Stacked bars: one bar per session month; bar height = amount charged,
 * split into collected (blue) and still outstanding (red). Hover for exact
 * figures; a screen-reader table carries the same data.
 */
const CollectionChart = ({ series }) => {
  const [hover, setHover] = useState(null);
  const W = 720;
  const H = 240;
  const PAD = { top: 14, right: 8, bottom: 26, left: 44 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const max = Math.max(1, ...series.map((s) => s.charged));
  const step = plotW / series.length;
  const barW = Math.min(34, step * 0.58);

  const y = (value) => PAD.top + plotH - (value / max) * plotH;

  const ticks = [0, 0.5, 1].map((t) => Math.round((max * t) / 500) * 500 || Math.round(max * t));

  return (
    <div className="adm-chart">
      <div className="adm-chart__legend" aria-hidden="true">
        <span><i style={{ background: C.collected }} /> Collected</span>
        <span><i style={{ background: C.outstanding }} /> Still outstanding</span>
      </div>

      <div className="adm-chart__stage">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Fee collection by month">
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left} x2={W - PAD.right}
                y1={y(tick)} y2={y(tick)}
                stroke="var(--ink-100)" strokeWidth="1"
              />
              <text x={PAD.left - 6} y={y(tick) + 3} textAnchor="end" className="adm-chart__tick">
                {compact(tick)}
              </text>
            </g>
          ))}

          {series.map((s, i) => {
            const x = PAD.left + i * step + (step - barW) / 2;
            const collectedH = ((Math.min(s.received, s.charged)) / max) * plotH;
            const chargedH = (s.charged / max) * plotH;
            const outstandingH = Math.max(0, chargedH - collectedH);
            const top = PAD.top + plotH - chargedH;
            return (
              <g
                key={s.month}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                {/* generous hit target */}
                <rect x={PAD.left + i * step} y={PAD.top} width={step} height={plotH + 20} fill="transparent" />

                {s.charged > 0 && (
                  <>
                    {/* whole stack with rounded data-end */}
                    <rect x={x} y={top} width={barW} height={chargedH} rx="4" fill={C.outstanding} />
                    {/* collected portion anchored to the baseline; 2px surface gap above it */}
                    {collectedH > 0 && (
                      <rect
                        x={x}
                        y={PAD.top + plotH - collectedH}
                        width={barW}
                        height={collectedH}
                        rx={outstandingH > 2 ? 0 : 4}
                        fill={C.collected}
                        stroke="#ffffff"
                        strokeWidth={outstandingH > 2 ? 2 : 0}
                      />
                    )}
                  </>
                )}

                <text
                  x={x + barW / 2}
                  y={H - 8}
                  textAnchor="middle"
                  className={`adm-chart__tick${hover === i ? ' is-hover' : ''}`}
                >
                  {MONTH_NAMES[i].slice(0, 3)}
                </text>
              </g>
            );
          })}
        </svg>

        {hover !== null && (
          <div
            className="adm-tooltip"
            style={{ left: `${((PAD.left + hover * step + step / 2) / W) * 100}%` }}
          >
            <strong>{monthLabel(series[hover].month)}</strong>
            <span><i style={{ background: C.collected }} /> Collected {rs(series[hover].received)}</span>
            <span><i style={{ background: C.outstanding }} /> Outstanding {rs(Math.max(0, series[hover].charged - series[hover].received))}</span>
            <span className="adm-tooltip__sum">Charged {rs(series[hover].charged)}</span>
          </div>
        )}
      </div>

      {/* sr-only must wrap the table, not BE the table — width on a <table>
          acts as a minimum, so a "hidden" table would still stretch the page */}
      <div className="sr-only">
        <table>
          <caption>Fee collection by month</caption>
          <thead>
            <tr><th>Month</th><th>Charged</th><th>Collected</th><th>Outstanding</th></tr>
          </thead>
          <tbody>
            {series.map((s) => (
              <tr key={s.month}>
                <td>{monthLabel(s.month)}</td>
                <td>{rs(s.charged)}</td>
                <td>{rs(s.received)}</td>
                <td>{rs(Math.max(0, s.charged - s.received))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/** One 100% bar: how this month's families stand. Counts are labeled. */
const StatusBar = ({ paid, partial, unpaid }) => {
  const total = Math.max(1, paid + partial + unpaid);
  const segments = [
    { key: 'paid', label: 'Paid', value: paid, color: C.paid },
    { key: 'partial', label: 'Partial', value: partial, color: C.partial },
    { key: 'unpaid', label: 'Unpaid', value: unpaid, color: C.unpaid },
  ].filter((s) => s.value > 0);

  return (
    <div className="adm-statusbar">
      <div className="adm-statusbar__track" role="img"
        aria-label={`${paid} paid, ${partial} partial, ${unpaid} unpaid`}>
        {segments.map((segment) => (
          <span
            key={segment.key}
            style={{ width: `${(segment.value / total) * 100}%`, background: segment.color }}
          >
            {segment.value / total > 0.12 && segment.value}
          </span>
        ))}
      </div>
      <div className="adm-chart__legend">
        <span><i style={{ background: C.paid }} /> Paid ({paid})</span>
        <span><i style={{ background: C.partial }} /> Partial ({partial})</span>
        <span><i style={{ background: C.unpaid }} /> Unpaid ({unpaid})</span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { data, months, currentMonth } = useAdmin();
  const { families, records } = data;
  const [month, setMonth] = useState(currentMonth);

  const summary = useMemo(
    () => monthSummary(families, records, months, month),
    [families, records, months, month]
  );

  /* Chart only the months that have arrived — future months are not
     'outstanding', they just haven't happened yet. */
  const series = useMemo(
    () =>
      months
        .filter((m) => m <= currentMonth)
        .map((m) => {
          const s = monthSummary(families, records, months, m);
          return { month: m, charged: s.charged, received: s.received };
        }),
    [families, records, months, currentMonth]
  );

  const concessionThisMonth = useMemo(
    () =>
      summary.perFamily.reduce((sum, { family, row }) => {
        if (!row || row.inactive) return sum;
        return sum + monthConcession(family, row.record);
      }, 0),
    [summary]
  );

  const defaulters = useMemo(
    () =>
      summary.perFamily
        .filter(({ row }) => row && !row.inactive && row.balance > 0)
        .sort((a, b) => b.row.balance - a.row.balance)
        .slice(0, 8),
    [summary]
  );

  if (!families.length) {
    return (
      <div className="adm-page">
        <header className="adm-page__head">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome. Two minutes of setup and the manual registers are history.</p>
          </div>
        </header>
        <div className="adm-panel adm-onboard">
          <h2>Start here</h2>
          <ol className="adm-steps">
            <li>
              Open <Link to="/admin/families">Students &amp; Families</Link> and add your
              families — or paste rows straight from the Excel register with <em>Import</em>.
            </li>
            <li>Each month, record payments on the <Link to="/admin/fees">Fee Sheet</Link>.</li>
            <li>Print everyone&rsquo;s <Link to="/admin/challans">challans</Link> in one click.</li>
            <li>Download a backup from <Link to="/admin/settings">Settings</Link> after each fee day.</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="adm-page">
      <header className="adm-page__head">
        <div>
          <h1>Dashboard</h1>
          <p>Session at a glance — figures include arrears carried forward.</p>
        </div>
        <select value={month} onChange={(e) => setMonth(e.target.value)} aria-label="Month">
          {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
        </select>
      </header>

      <div className="adm-statrow">
        <div className="adm-stat">
          <span className="adm-stat__label">Expected — {monthLabel(month)}</span>
          <strong>{rs(summary.expected)}</strong>
          <small>{summary.activeCount} active families</small>
        </div>
        <div className="adm-stat adm-stat--good">
          <span className="adm-stat__label">Received</span>
          <strong>{rs(summary.received)}</strong>
          <small>{summary.expected > 0 ? Math.round((summary.received / summary.expected) * 100) : 0}% of expected</small>
        </div>
        <div className="adm-stat adm-stat--bad">
          <span className="adm-stat__label">Outstanding</span>
          <strong>{rs(summary.outstanding)}</strong>
          <small>{summary.partialCount + summary.unpaidCount} families</small>
        </div>
        <div className="adm-stat">
          <span className="adm-stat__label">Concessions given</span>
          <strong>{rs(concessionThisMonth)}</strong>
          <small>vs full fee this month</small>
        </div>
      </div>

      <div className="adm-grid-2">
        <section className="adm-panel">
          <h2>Collection across the session</h2>
          <CollectionChart series={series} />
        </section>

        <section className="adm-panel">
          <h2>{monthLabel(month)} — family status</h2>
          <StatusBar
            paid={summary.paidCount}
            partial={summary.partialCount}
            unpaid={summary.unpaidCount}
          />

          <h2 className="adm-panel__subhead">Largest balances</h2>
          {defaulters.length ? (
            <ul className="adm-defaulters">
              {defaulters.map(({ family, row }) => (
                <li key={family.id}>
                  <Link to={`/admin/challans?month=${month}&family=${family.id}`}>
                    <span className="adm-defaulters__name">
                      #{family.id} · {family.name}
                    </span>
                    <span className="adm-defaulters__amount">{rs(row.balance)}</span>
                    <Icon name="chevronRight" size={15} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="adm-help adm-help--ok">Everyone is clear for this month. 🎉</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
