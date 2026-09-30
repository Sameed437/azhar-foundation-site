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
 * Draw one copy (student or office) filling a whole 6.5in x 8.5in sheet:
 * header band at the top, details and amounts through the middle, and the
 * notes and signature line pinned to the bottom edge.
 */
const drawCopy = (doc, copyLabel, family, row, month, settings, logo) => {
  const left = MARGIN;
  const right = PAGE_W - MARGIN;
  const width = right - left;

  /* outer frame — the slip reads as a form, not text floating on paper */
  doc.setDrawColor(...LINE);
  doc.setLineWidth(1);
  doc.rect(left - 10, 22, width + 20, PAGE_H - 44);

  /* ---- header ---- */
  let y = 50;
  if (logo) doc.addImage(logo, 'PNG', left, y - 18, 40, 40);
  const textX = left + (logo ? 50 : 0);

  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(settings.schoolName, textX, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(`Fee Challan — ${monthLabel(month)}`, textX, y + 15);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  const badge = copyLabel.toUpperCase();
  const badgeW = doc.getTextWidth(badge) + 16;
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.8);
  doc.roundedRect(right - badgeW, y - 11, badgeW, 16, 8, 8);
  doc.setTextColor(...NAVY);
  doc.text(badge, right - badgeW / 2, y, { align: 'center' });

  y += 32;
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(1.8);
  doc.line(left, y, right, y);

  /* ---- who and when ---- */
  y += 26;
  const metaRow = (label1, value1, label2, value2) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(label1, left, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(...INK);
    doc.text(value1, left + 72, y);
    if (label2) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...MUTED);
      doc.text(label2, left + 232, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(...INK);
      doc.text(value2, left + 296, y);
    }
    y += 20;
  };

  metaRow('Family ID', String(family.id), 'Issue month', monthLabel(month));
  metaRow('Due date', challanDate(month, settings.dueDay),
    'Valid till', challanDate(month, settings.validityDay));

  const enrolled = family.students.filter((s) => !s.left);
  const listed = enrolled.length ? enrolled : family.students;
  const names = listed.map((s) => `${s.name}${s.klass ? ` (${s.klass})` : ''}`).join(' + ')
    || family.name;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text('Student(s)', left, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(...INK);
  const nameLines = doc.splitTextToSize(names, width - 72);
  doc.text(nameLines, left + 72, y);
  y += nameLines.length * 14 + 10;

  /* ---- amounts ----
     The rows stretch to use whatever height is left between the details and
     the notes, so a simple challan fills the sheet instead of leaving a
     blank half page. */
  const notesTop = PAGE_H - 104;
  const boxTop = y;
  const lines = amountLines(row);
  const ways = (settings.paymentDetails || '')
    .split(String.fromCharCode(10))
    .map((line) => line.trim())
    .filter(Boolean);
  const waysHeight = ways.length ? 30 + 16 + ways.length * 15 : 0;
  const room = notesTop - 18 - waysHeight - boxTop;
  const rowHeight = Math.max(26, Math.min(34, (room - 14) / lines.length));
  const boxHeight = lines.length * rowHeight + 14;

  doc.setDrawColor(...LINE);
  doc.setLineWidth(1);
  doc.rect(left, boxTop, width, boxHeight);

  let ay = boxTop + 7 + rowHeight / 2 + 4;
  lines.forEach((line, index) => {
    if (line.total) {
      doc.setFillColor(238, 240, 250);
      doc.rect(left + 1, ay - rowHeight / 2 - 4, width - 2, rowHeight, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...NAVY);
      doc.setFontSize(12.5);
    } else if (line.paid) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...GREEN);
      doc.setFontSize(11);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...INK);
      doc.setFontSize(11);
    }
    doc.text(line.label, left + 10, ay);
    doc.text(line.value, right - 10, ay, { align: 'right' });
    if (index < lines.length - 1) {
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.6);
      doc.line(left + 1, ay + rowHeight / 2 - 4, right - 1, ay + rowHeight / 2 - 4);
    }
    ay += rowHeight;
  });

  /* ---- ways to pay, just under the amounts ---- */
  let afterY = boxTop + boxHeight + 20;
  if (ways.length) {
    let py = afterY + 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text('WAYS TO PAY', left, py);
    py += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    ways.forEach((line) => {
      if (py > notesTop - 12) return;
      doc.text(line, left, py);
      py += 15;
    });
    afterY = py + 6;
  }

  /* ---- whatever height is left becomes the stamp box, the way a printed
     challan carries the school's or bank's acknowledgement ---- */
  const stampTop = afterY;
  const stampBottom = notesTop - 16;
  if (stampBottom - stampTop > 46) {
    doc.setDrawColor(...LINE);
    doc.setLineWidth(1);
    doc.rect(left, stampTop, width, stampBottom - stampTop);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text('SCHOOL / BANK STAMP', left + 10, stampTop + 16);
  }

  /* ---- notes, pinned above the signature ---- */
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  let ny = notesTop;
  const note2 = (settings.challanNote2 || '').replace('Rs. 100', `Rs. ${settings.finePerDay}`);
  [settings.challanNote1, note2].filter(Boolean).forEach((note, i) => {
    const wrapped = doc.splitTextToSize(`${i + 1}. ${note}`, width);
    doc.text(wrapped, left, ny);
    ny += wrapped.length * 10 + 3;
  });

  /* ---- signature line at the foot ---- */
  const sy = PAGE_H - 46;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  doc.text('Received by', left, sy);
  doc.text('Date', right - 108, sy);
  doc.setDrawColor(...MUTED);
  doc.setLineWidth(0.8);
  doc.line(left + 62, sy + 2, left + 210, sy + 2);
  doc.line(right - 78, sy + 2, right, sy + 2);
};

/**
 * Build one PDF with a Legal page (8.5in × 14in) per family: the Student
 * Copy fills the top 6.5in, the cut line sits exactly at 6.5in, and the
 * Office Copy fills the next 6.5in — so one straight cut yields two
 * 8.5in × 6.5in challan forms, the school's physical slip size.
 * items: [{ family, row }]
 */
export const buildChallanPdf = async (items, month, settings, options = {}) => {
  /* Printing needs both copies (the office keeps one); a parent receiving the
     challan on WhatsApp should get a single page, so pass copies: 1. */
  const copies = options.copies === 1
    ? ['Fee Challan']
    : ['Student Copy', 'Office Copy'];

  const logo = await loadLogo();
  const size = [PAGE_W, PAGE_H];
  const doc = new jsPDF({ unit: 'pt', format: size, orientation: 'portrait' });

  let first = true;
  items.forEach(({ family, row }) => {
    copies.forEach((label) => {
      if (!first) doc.addPage(size, 'portrait');
      first = false;
      drawCopy(doc, label, family, row, month, settings, logo);
    });
  });

  return doc;
};

/** File name like "Challan-Sep-2026-Family-12.pdf". */
export const challanPdfName = (items, month) =>
  items.length === 1
    ? `Challan-${monthShort(month)}-Family-${items[0].family.id}.pdf`
    : `Challans-${monthShort(month)}-${items.length}-families.pdf`;
