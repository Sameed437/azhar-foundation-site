import { jsPDF } from 'jspdf';
import { monthLabel, monthShort, rs } from './calc';
import { challanDate } from './whatsapp';

/* The school's challan paper: 6.5in x 8.5in portrait, one challan per
   sheet, so nothing has to be cut. */
const PAGE_W = 468; // 6.5in
const PAGE_H = 612; // 8.5in
const MARGIN = 28;
const NAVY = [26, 35, 126];
const GREEN = [19, 115, 51];
const INK = [32, 33, 36];
const MUTED = [95, 99, 104];
const LINE = [210, 214, 228];

let logoCache; // dataURL, or null when unavailable
export const loadLogo = () => new Promise((resolve) => {
  if (logoCache !== undefined) { resolve(logoCache); return; }
  if (typeof document === 'undefined') { logoCache = null; resolve(null); return; }
  try {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext('2d').drawImage(img, 0, 0);
        logoCache = canvas.toDataURL('image/png');
      } catch (e) { logoCache = null; }
      resolve(logoCache);
    };
    img.onerror = () => { logoCache = null; resolve(null); };
    img.src = '/images/logo.png';
  } catch (e) { logoCache = null; resolve(null); }
});

/** The amount lines for one family+month — same logic as the printed challan. */
export const amountLines = (row) => {
  const record = row.record || {};
  const monthlyFee = row.charge - (Number(record.misc) || 0) - (Number(record.fine) || 0);
  const lines = [{ label: 'Monthly fee', value: rs(monthlyFee) }];
  if (Number(record.misc) > 0) {
    lines.push({ label: `Other charges${record.note ? ` (${record.note})` : ''}`, value: rs(record.misc) });
  }
  if (row.arrearsIn > 0) lines.push({ label: 'Arrears (previous balance)', value: rs(row.arrearsIn) });
  if (Number(record.fine) > 0) lines.push({ label: 'Fine', value: rs(record.fine) });
  if (Number(record.received) > 0) {
    lines.push({ label: 'Total (fee + arrears)', value: rs(Math.max(0, row.due)) });
    lines.push({
      label: `Paid so far${record.receivedDate ? ` (${record.receivedDate})` : ''}`,
      value: rs(record.received),
      paid: true,
    });
    lines.push({ label: 'Remaining payable', value: rs(Math.max(0, row.balance)), total: true });
  } else {
    lines.push({
      label: row.arrearsIn > 0 ? 'Total payable (fee + arrears)' : 'Total payable',
      value: rs(Math.max(0, row.due)),
      total: true,
    });
  }
  return lines;
};

/**
 * Draw one copy inside a band of the sheet: (top, height). A full-height
 * band is the single-copy challan; a half-height band is one of the two
 * copies that share a printed sheet, so the type and spacing tighten.
 */
const drawCopy = (doc, top, height, copyLabel, family, row, month, settings, logo) => {
  const left = MARGIN;
  const right = PAGE_W - MARGIN;
  const width = right - left;
  const tight = height < 400;

  /* scale: the roomy single-copy sheet, or the tight half-sheet */
  const m = tight
    ? { head: 20, logo: 26, name: 11, sub: 7.5, rule: 38, metaTop: 54, metaStep: 13,
        metaLabel: 7.5, metaValue: 8.5, rowMin: 15, rowMax: 19, amount: 8.5, total: 9.5,
        noteSize: 6.2, noteUp: 38, signUp: 14, signSize: 7.5, payUp: 0 }
    : { head: 34, logo: 40, name: 15, sub: 10, rule: 58, metaTop: 82, metaStep: 20,
        metaLabel: 9, metaValue: 10.5, rowMin: 26, rowMax: 34, amount: 11, total: 12.5,
        noteSize: 8, noteUp: 92, signUp: 34, signSize: 9.5, payUp: 28 };

  /* frame */
  doc.setDrawColor(...LINE);
  doc.setLineWidth(1);
  doc.rect(left - 8, top + 8, width + 16, height - 16);

  /* ---- header ---- */
  let y = top + m.head;
  if (logo) doc.addImage(logo, 'PNG', left, y - m.logo * 0.45, m.logo, m.logo);
  const textX = left + (logo ? m.logo + 10 : 0);

  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(m.name);
  doc.text(settings.schoolName, textX, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(m.sub);
  doc.setTextColor(...MUTED);
  doc.text(`Fee Challan — ${monthLabel(month)}`, textX, y + m.sub + 4);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(tight ? 6.5 : 8);
  const badge = copyLabel.toUpperCase();
  const badgeW = doc.getTextWidth(badge) + (tight ? 10 : 16);
  const badgeH = tight ? 12 : 16;
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.8);
  doc.roundedRect(right - badgeW, y - badgeH * 0.7, badgeW, badgeH, badgeH / 2, badgeH / 2);
  doc.setTextColor(...NAVY);
  doc.text(badge, right - badgeW / 2, y, { align: 'center' });

  doc.setDrawColor(...NAVY);
  doc.setLineWidth(tight ? 1.2 : 1.8);
  doc.line(left, top + m.rule, right, top + m.rule);

  /* ---- who and when ---- */
  y = top + m.metaTop;
  const col2 = left + width * 0.52;
  const metaRow = (label1, value1, label2, value2) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(m.metaLabel);
    doc.setTextColor(...MUTED);
    doc.text(label1, left, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(m.metaValue);
    doc.setTextColor(...INK);
    doc.text(value1, left + (tight ? 56 : 72), y);
    if (label2) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(m.metaLabel);
      doc.setTextColor(...MUTED);
      doc.text(label2, col2, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(m.metaValue);
      doc.setTextColor(...INK);
      doc.text(value2, col2 + (tight ? 48 : 62), y);
    }
    y += m.metaStep;
  };

  metaRow('Family ID', String(family.id), 'Issue month', monthLabel(month));
  metaRow('Due date', challanDate(month, settings.dueDay),
    'Valid till', challanDate(month, settings.validityDay));

  const enrolled = family.students.filter((s) => !s.left);
  const listed = enrolled.length ? enrolled : family.students;
  const names = listed.map((s) => `${s.name}${s.klass ? ` (${s.klass})` : ''}`).join(' + ')
    || family.name;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(m.metaLabel);
  doc.setTextColor(...MUTED);
  doc.text('Student(s)', left, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(m.metaValue);
  doc.setTextColor(...INK);
  const nameX = left + (tight ? 56 : 72);
  const nameLines = doc.splitTextToSize(names, right - nameX);
  doc.text(nameLines, nameX, y);
  y += nameLines.length * (tight ? 10 : 14) + (tight ? 6 : 10);

  /* ---- amounts ---- */
  const notesTop = top + height - m.noteUp;
  const boxTop = y;
  const lines = amountLines(row);
  const ways = (settings.paymentDetails || '')
    .split(String.fromCharCode(10))
    .map((line) => line.trim())
    .filter(Boolean);
  const waysHeight = (ways.length && !tight) ? 30 + 16 + ways.length * 15 : 0;
  const room = notesTop - 12 - waysHeight - boxTop;
  const rowHeight = Math.max(m.rowMin, Math.min(m.rowMax, (room - 10) / lines.length));
  const boxHeight = lines.length * rowHeight + (tight ? 8 : 14);

  doc.setDrawColor(...LINE);
  doc.setLineWidth(1);
  doc.rect(left, boxTop, width, boxHeight);

  let ay = boxTop + (tight ? 4 : 7) + rowHeight / 2 + 3;
  lines.forEach((line, index) => {
    if (line.total) {
      doc.setFillColor(238, 240, 250);
      doc.rect(left + 1, ay - rowHeight / 2 - 3, width - 2, rowHeight, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...NAVY);
      doc.setFontSize(m.total);
    } else if (line.paid) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...GREEN);
      doc.setFontSize(m.amount);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...INK);
      doc.setFontSize(m.amount);
    }
    doc.text(line.label, left + 8, ay);
    doc.text(line.value, right - 8, ay, { align: 'right' });
    if (index < lines.length - 1) {
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.6);
      doc.line(left + 1, ay + rowHeight / 2 - 3, right - 1, ay + rowHeight / 2 - 3);
    }
    ay += rowHeight;
  });

  /* ---- ways to pay (and, with room to spare, a stamp box) ---- */
  let afterY = boxTop + boxHeight + (tight ? 12 : 20);
  if (ways.length) {
    let py = afterY + (tight ? 0 : 8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(tight ? 6.5 : 9);
    doc.setTextColor(...MUTED);
    doc.text('WAYS TO PAY', left, py);
    py += tight ? 10 : 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(tight ? 7.5 : 10);
    doc.setTextColor(...INK);
    ways.forEach((line) => {
      if (py > notesTop - 8) return;
      doc.text(line, left, py);
      py += tight ? 10 : 15;
    });
    afterY = py + (tight ? 2 : 6);
  }

  if (!tight && notesTop - 16 - afterY > 46) {
    doc.setDrawColor(...LINE);
    doc.setLineWidth(1);
    doc.rect(left, afterY, width, notesTop - 16 - afterY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text('SCHOOL / BANK STAMP', left + 10, afterY + 16);
  }

  /* ---- notes and signature at the foot of the band ---- */
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(m.noteSize);
  doc.setTextColor(...MUTED);
  let ny = notesTop;
  const note2 = (settings.challanNote2 || '').replace('Rs. 100', `Rs. ${settings.finePerDay}`);
  [settings.challanNote1, note2].filter(Boolean).forEach((note, i) => {
    const wrapped = doc.splitTextToSize(`${i + 1}. ${note}`, width);
    doc.text(wrapped, left, ny);
    ny += wrapped.length * (tight ? 8 : 10) + 2;
  });

  const sy = top + height - m.signUp;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(m.signSize);
  doc.setTextColor(...INK);
  doc.text('Received by', left, sy);
  doc.text('Date', right - (tight ? 86 : 108), sy);
  doc.setDrawColor(...MUTED);
  doc.setLineWidth(0.8);
  doc.line(left + (tight ? 48 : 62), sy + 2, left + (tight ? 160 : 210), sy + 2);
  doc.line(right - (tight ? 60 : 78), sy + 2, right, sy + 2);
};

/** Dashed cut line between the two copies sharing a sheet. */
const drawCutLine = (doc, y) => {
  doc.setDrawColor(...MUTED);
  doc.setLineWidth(0.7);
  for (let x = 12; x < PAGE_W - 12; x += 9) doc.line(x, y, x + 4, y);
};

export const buildChallanPdf = async (items, month, settings, options = {}) => {
  /* A parent receiving the challan on WhatsApp gets one copy filling the
     page; printing puts the student and office copies on the same sheet. */
  const single = options.copies === 1;
  const logo = await loadLogo();
  const size = [PAGE_W, PAGE_H];
  const doc = new jsPDF({ unit: 'pt', format: size, orientation: 'portrait' });

  items.forEach(({ family, row }, index) => {
    if (index > 0) doc.addPage(size, 'portrait');
    if (single) {
      drawCopy(doc, 0, PAGE_H, 'Fee Challan', family, row, month, settings, logo);
      return;
    }
    const half = PAGE_H / 2;
    drawCopy(doc, 0, half, 'Student Copy', family, row, month, settings, logo);
    drawCutLine(doc, half);
    drawCopy(doc, half, half, 'Office Copy', family, row, month, settings, logo);
  });

  return doc;
};

/** File name like "Challan-Sep-2026-Family-12.pdf". */
export const challanPdfName = (items, month) =>
  items.length === 1
    ? `Challan-${monthShort(month)}-Family-${items[0].family.id}.pdf`
    : `Challans-${monthShort(month)}-${items.length}-families.pdf`;
