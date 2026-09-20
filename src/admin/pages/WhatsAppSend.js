import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Icon from '../../components/Icon';
import { useAdmin } from '../AdminContext';
import { monthLabel, monthSummary, rs } from '../data/calc';
import { familyHasClass, uniqueClasses } from '../data/classes';
import { waChallanLink, waPhone } from '../data/whatsapp';
import { buildChallanPdf, challanPdfName } from '../data/challanPdf';

/* "Sent" ticks are remembered per month on this device (browser storage),
   so a sending session survives a refresh. They are a checklist aid, not
   fee data — the fee records themselves live in the database. */
const sentKey = (month) => `afs-wa-sent-${month}`;
const loadSent = (month) => {
  try { return new Set(JSON.parse(localStorage.getItem(sentKey(month))) || []); }
  catch { return new Set(); }
};
const saveSent = (month, set) => {
  try { localStorage.setItem(sentKey(month), JSON.stringify(Array.from(set))); }
  catch { /* private mode etc. — ticks just won't survive a refresh */ }
};

/** Blur-commit input, same behaviour as the Fee Sheet cells. */
const EditCell = ({ value, onCommit, placeholder, ariaLabel, type = 'number', className = 'adm-cell' }) => {
  const [draft, setDraft] = useState(null);
  return (
    <input
      className={className}
      type={type}
      min={type === 'number' ? '0' : undefined}
      inputMode={type === 'number' ? 'numeric' : 'tel'}
      aria-label={ariaLabel}
      placeholder={placeholder}
      value={draft ?? (value === 0 || value === '' || value == null ? '' : value)}
      onChange={(e) => setDraft(e.target.value)}
      onFocus={(e) => e.target.select()}
      onBlur={() => {
        if (draft !== null) onCommit(draft);
        setDraft(null);
      }}
      onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
    />
  );
};

/**
 * The WhatsApp desk: pick the month, adjust fees and phone numbers in
 * place, tick who to send to (or select all), then work through the
 * queue — each Send opens WhatsApp with that family's challan message
 * ready, and the row is ticked off.
 */
const WhatsAppSend = () => {
  const { data, months, currentMonth, saveRecord, saveFamily } = useAdmin();
  const { families, records, settings } = data;
  const [params] = useSearchParams();

  const [month, setMonth] = useState(() =>
    months.includes(params.get('month')) ? params.get('month') : currentMonth
  );
  const [query, setQuery] = useState('');
  const [klass, setKlass] = useState('');
  const [who, setWho] = useState('due'); // due | all
  const [selected, setSelected] = useState(() => new Set());
  const [sent, setSent] = useState(() => loadSent(month));

  useEffect(() => {
    setSent(loadSent(month));
    setSelected(new Set());
  }, [month]);

  const classes = useMemo(() => uniqueClasses(families), [families]);
  const summary = useMemo(
    () => monthSummary(families, records, months, month),
    [families, records, months, month]
  );

  const visible = summary.perFamily.filter(({ family, row }) => {
    if (!row || row.inactive) return false;
    if (!familyHasClass(family, klass)) return false;
    if (who === 'due' && row.balance <= 0) return false;
    if (!query.trim()) return true;
    const needle = query.trim().toLowerCase();
    return [String(family.id), family.name, family.phone, ...family.students.map((s) => s.name)]
      .join(' ').toLowerCase().includes(needle);
  });

  const monthIndex = months.indexOf(month);

  /* ---- edits (same records the Fee Sheet and challans use) ---- */
  const patchFee = (familyId, value) => {
    const existing = records[familyId]?.[month] || {};
    const record = { fee: '', misc: 0, fine: 0, received: 0, receivedDate: '', note: '', ...existing };
    record.fee = value === '' ? '' : Number(value);
    saveRecord(familyId, month, record);
  };

  const patchPhone = (family, value) => saveFamily({ ...family, phone: String(value).trim() });

  /* ---- selection & sent ticks ---- */
  const allVisibleSelected = visible.length > 0
    && visible.every(({ family }) => selected.has(family.id));

  const toggleAll = () => {
    setSelected(allVisibleSelected
      ? new Set()
      : new Set(visible.map(({ family }) => family.id)));
  };

  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const markSent = (id) => {
    setSent((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveSent(month, next);
      return next;
    });
  };

  const unmarkSent = (id) => {
    setSent((prev) => {
      const next = new Set(prev);
      next.delete(id);
      saveSent(month, next);
      return next;
    });
  };

  /* ---- the queue ---- */
  const queue = visible.filter(({ family }) =>
    selected.has(family.id) && !sent.has(family.id) && waPhone(family.phone));
  const selectedNoPhone = visible.filter(({ family }) =>
    selected.has(family.id) && !waPhone(family.phone)).length;
  const sentCount = visible.filter(({ family }) => sent.has(family.id)).length;

  const sendNext = () => {
    const next = queue[0];
    if (!next) return;
    window.open(waChallanLink(next.family, next.row, month, settings), '_blank', 'noopener');
    markSent(next.family.id);
  };

  /**
   * Challan PDF: on phones the share sheet opens (pick WhatsApp → contact →
   * the PDF attaches itself); on computers it downloads, ready to drag into
   * WhatsApp Web. WhatsApp does not allow a link to attach files directly.
   */
  const sharePdf = async (items) => {
    if (!items.length) return;
    const doc = await buildChallanPdf(items, month, settings);
    const name = challanPdfName(items, month);
    const blob = doc.output('blob');
    try {
      const file = new File([blob], name, { type: 'application/pdf' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: name });
        items.forEach(({ family }) => markSent(family.id));
        return;
      }
    } catch (error) {
      if (error && error.name === 'AbortError') return; // user closed the share sheet
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="adm-page">
      <header className="adm-page__head">
        <div>
          <h1>WhatsApp</h1>
          <p>
            Send each family their {monthLabel(month)} challan on WhatsApp. Adjust the fee or
            phone number right here, tick who to send to, then press the green button — WhatsApp
            opens with the full message ready. <strong>PDF</strong> makes the printable challan
            form as a file: on a phone the share sheet opens (choose WhatsApp → the contact) and
            the PDF attaches; on a computer it downloads, ready to drag into WhatsApp Web.
          </p>
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

      <div className="adm-wa__bar">
        <button
          type="button"
          className="adm-wa__go"
          onClick={sendNext}
          disabled={!queue.length}
        >
          <Icon name="whatsapp" size={18} />
          {queue.length
            ? `Send next on WhatsApp — ${queue.length} remaining`
            : selected.size
              ? 'All selected are sent'
              : 'Tick families below to start'}
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          disabled={!selected.size}
          onClick={() => sharePdf(visible.filter(({ family }) => selected.has(family.id)))}
          title="One PDF with a challan page per selected family — share on a phone, download on a computer"
        >
          <Icon name="download" size={16} />
          PDF of selected
        </button>
        <span className="adm-wa__stats">
          {selected.size} selected · {sentCount} sent this month
          {selectedNoPhone > 0 && (
            <strong className="adm-wa__warn"> · {selectedNoPhone} selected without a phone number</strong>
          )}
        </span>
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
        <select value={who} onChange={(e) => setWho(e.target.value)} aria-label="Which families">
          <option value="due">Families with a balance due</option>
          <option value="all">All active families</option>
        </select>
        <span className="adm-toolbar__count">{visible.length} shown</span>
      </div>

      <div className="adm-tablewrap">
        <table className="adm-table adm-table--wa">
          <thead>
            <tr>
              <th className="adm-wa__check">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleAll}
                  aria-label="Select all shown"
                />
              </th>
              <th>ID</th>
              <th>Family</th>
              <th>Phone</th>
              <th className="is-num">Fee ({monthLabel(month).split(' ')[0]})</th>
              <th className="is-num">Arrears</th>
              <th className="is-num">Total payable</th>
              <th>Send</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(({ family, row }) => {
              const record = row.record || {};
              const link = waChallanLink(family, row, month, settings);
              const isSent = sent.has(family.id);
              return (
                <tr key={family.id} className={isSent ? 'is-wasent' : ''}>
                  <td className="adm-wa__check">
                    <input
                      type="checkbox"
                      checked={selected.has(family.id)}
                      onChange={() => toggleOne(family.id)}
                      aria-label={`Select ${family.name}`}
                    />
                  </td>
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
                  <td>
                    <EditCell
                      type="tel"
                      className="adm-cell adm-cell--phone"
                      value={family.phone || ''}
                      placeholder="03xx-xxxxxxx"
                      ariaLabel={`Phone for ${family.name}`}
                      onCommit={(v) => patchPhone(family, v)}
                    />
                  </td>
                  <td className="is-num">
                    <EditCell
                      value={record.fee ?? ''}
                      placeholder={String(family.monthlyFee)}
                      ariaLabel={`Fee for ${family.name}`}
                      onCommit={(v) => patchFee(family.id, v)}
                    />
                  </td>
                  <td className={`is-num ${row.arrearsIn > 0 ? 'is-due' : ''}`}>
                    {row.arrearsIn ? rs(row.arrearsIn) : '—'}
                  </td>
                  <td className="is-num adm-table__due">{rs(Math.max(0, row.balance))}</td>
                  <td className="adm-wa__send">
                    {link ? (
                      <a
                        className="adm-wasend__btn"
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => markSent(family.id)}
                      >
                        <Icon name="whatsapp" size={15} />
                        {isSent ? 'Again' : 'Send'}
                      </a>
                    ) : (
                      <span className="adm-wasend__nophone">no phone</span>
                    )}
                    <button
                      type="button"
                      className="adm-wa__pdf"
                      onClick={() => sharePdf([{ family, row }])}
                      title="Challan PDF — on a phone the share sheet opens (choose WhatsApp); on a computer it downloads"
                    >
                      PDF
                    </button>
                    {isSent && (
                      <button
                        type="button"
                        className="adm-wa__unsent"
                        onClick={() => unmarkSent(family.id)}
                        title="Remove the sent tick"
                      >
                        ✓ sent
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {!visible.length && (
              <tr>
                <td colSpan={8} className="adm-table__empty">
                  {families.length
                    ? `Everyone is clear for ${monthLabel(month)} — switch to “All active families” to message anyone.`
                    : 'Add families first.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WhatsAppSend;
