import { jsPDF } from 'jspdf';
import { monthLabel, monthShort, rs } from './calc';
import { challanDate } from './whatsapp';

/* Legal paper turned landscape (14in × 8.5in) in points. Each challan form
   is an upright 6.5in × 8.5in slip and two sit side by side, so one straight
   vertical cut separates them. */
const PAGE_W = 1008; // 14in
const PAGE_H = 612;  // 8.5in
const HALF = PAGE_W / 2; // where the cut falls
const PAD_TOP = 34;
const MARGIN = 32;
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
    lines.push({ label: 'Total payable (fee + arrears)', value: rs(Math.max(0, row.due)), total: true });
  }
  return lines;
};

/** Draw one copy (student or office) starting at y; returns the y after it. */
const drawCopy = (doc, colX, copyLabel, family, row, month, settings, logo) => {
  const left = colX + MARGIN;
  const right = colX + HALF - MARGIN;
  let y = PAD_TOP;

  /* header */
  if (logo) doc.addImage(logo, 'PNG', left, y, 34, 34);
  const textX = left + (logo ? 44 : 0);
  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(settings.schoolName, textX, y + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(`Fee Challan — ${monthShort(month)}`, textX, y + 28);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  doc.text(copyLabel.toUpperCase(), right, y + 14, { align: 'right' });
  y += 42;

  /* meta */
  const enrolled = family.students.filter((s) => !s.left);
  const listed = enrolled.length ? enrolled : family.students;
  const names = listed.map((s) => `${s.name}${s.klass ? ` (${s.klass})` : ''}`).join(' + ')
    || family.name;
  doc.setFontSize(9);
  const meta = [
    ['Family ID', String(family.id), 'Issue month', monthLabel(month)],
    ['Due date', challanDate(month, settings.dueDay), 'Valid till', challanDate(month, settings.validityDay)],
  ];
  doc.setDrawColor(...LINE);
  meta.forEach((cells) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...MUTED);
    doc.text(cells[0], left, y);
    doc.text(cells[2], left + 190, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...INK);
    doc.text(cells[1], left + 62, y);
    doc.text(cells[3], left + 190 + 58, y);
    y += 14;
  });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...MUTED);
  doc.text('Student(s)', left, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...INK);
  const nameLines = doc.splitTextToSize(names, right - left - 62);
  doc.text(nameLines, left + 62, y);
  y += nameLines.length * 12 + 8;

  /* amounts */
  const lines = amountLines(row);
  lines.forEach((line) => {
    const rowH = 17;
    if (line.total) {
      doc.setFillColor(238, 240, 250);
      doc.rect(left, y - 12, right - left, rowH, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...NAVY);
    } else if (line.paid) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...GREEN);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...INK);
    }
    doc.setFontSize(line.total ? 10.5 : 9.5);
    doc.text(line.label, left + 6, y);
    doc.text(line.value, right - 6, y, { align: 'right' });
    doc.setDrawColor(...LINE);
    doc.line(left, y + 5, right, y + 5);
    y += rowH;
  });
  y += 6;

  /* notes */
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  const note2 = (settings.challanNote2 || '').replace('Rs. 100', `Rs. ${settings.finePerDay}`);
  [settings.challanNote1, note2].filter(Boolean).forEach((note, i) => {
    const wrapped = doc.splitTextToSize(`${i + 1}. ${note}`, right - left);
    doc.text(wrapped, left, y);
    y += wrapped.length * 9 + 2;
  });
  y += 8;

  /* signature line */
  doc.setFontSize(8.5);
  doc.setTextColor(...INK);
  doc.text('Received by: ____________________', left, y);
  doc.text('Date: ____________', right, y, { align: 'right' });

  return y + 10;
};

/** Dashed cut line running down the middle of the sheet. */
const drawCutLine = (doc) => {
  doc.setDrawColor(...MUTED);
  for (let y = 18; y < PAGE_H - 18; y += 9) {
    doc.line(HALF, y, HALF, y + 4);
  }
};

/**
 * Build one PDF with a Legal page (8.5in × 14in) per family: the Student
 * Copy fills the top 6.5in, the cut line sits exactly at 6.5in, and the
 * Office Copy fills the next 6.5in — so one straight cut yields two
 * 8.5in × 6.5in challan forms, the school's physical slip size.
 * items: [{ family, row }]
 */
export const buildChallanPdf = async (items, month, settings) => {
  const logo = await loadLogo();
  const doc = new jsPDF({ unit: 'pt', format: 'legal', orientation: 'landscape' });

  items.forEach(({ family, row }, index) => {
    if (index > 0) doc.addPage('legal', 'landscape');
    drawCopy(doc, 0, 'Student Copy', family, row, month, settings, logo);
    drawCutLine(doc);
    drawCopy(doc, HALF, 'Office Copy', family, row, month, settings, logo);
  });

  return doc;
};

/** File name like "Challan-Sep-2026-Family-12.pdf". */
export const challanPdfName = (items, month) =>
  items.length === 1
    ? `Challan-${monthShort(month)}-Family-${items[0].family.id}.pdf`
    : `Challans-${monthShort(month)}-${items.length}-families.pdf`;
