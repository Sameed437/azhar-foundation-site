import { jsPDF } from 'jspdf';
import { monthLabel, monthShort, rs } from './calc';
import { challanDate } from './whatsapp';

/* Legal paper (8.5in × 14in) in points. Each challan form is exactly
   8.5in × 6.5in — two per sheet with the cut at the 6.5in mark, matching
   the school's half-inserted legal paper workflow. */
const PAGE_W = 612; // 8.5in
const FORM_H = 468; // 6.5in per challan form
const PAD_TOP = 30; // breathing room inside each form
const MARGIN = 36;
const NAVY = [26, 35, 126];
const GREEN = [19, 115, 51];
const INK = [32, 33, 36];
const MUTED = [95, 99, 104];
const LINE = [210, 214, 228];

let logoCache; // dataURL, or null when unavailable
const loadLogo = () => new Promise((resolve) => {
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
const amountLines = (row) => {
  const record = row.record || {};
  const monthlyFee = row.charge - (Number(record.misc) || 0) - (Number(record.fine) || 0);
  const lines = [{ label: 'Monthly fee', value: rs(monthlyFee) }];
  if (Number(record.misc) > 0) {
    lines.push({ label: `Other charges${record.note ? ` (${record.note})` : ''}`, value: rs(record.misc) });
  }
  if (row.arrearsIn > 0) lines.push({ label: 'Previous balance (arrears)', value: rs(row.arrearsIn) });
  if (row.arrearsIn < 0) lines.push({ label: 'Credit carried forward', value: `- ${rs(-row.arrearsIn)}` });
  if (Number(record.fine) > 0) lines.push({ label: 'Fine', value: rs(record.fine) });
  if (Number(record.received) > 0) {
    lines.push({ label: 'Total for the month', value: rs(Math.max(0, row.due)) });
    lines.push({
      label: `Already paid${record.receivedDate ? ` (${record.receivedDate})` : ''}`,
      value: `- ${rs(record.received)}`,
      paid: true,
    });
    lines.push({ label: 'Remaining payable', value: rs(Math.max(0, row.balance)), total: true });
  } else {
    lines.push({ label: 'Total payable', value: rs(Math.max(0, row.due)), total: true });
  }
  return lines;
};

/** Draw one copy (student or office) starting at y; returns the y after it. */
const drawCopy = (doc, top, copyLabel, family, row, month, settings, logo) => {
  const left = MARGIN;
  const right = PAGE_W - MARGIN;
  let y = top;

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
    doc.text(cells[2], left + 280, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...INK);
    doc.text(cells[1], left + 70, y);
    doc.text(cells[3], left + 280 + 70, y);
    y += 14;
  });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...MUTED);
  doc.text('Student(s)', left, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...INK);
  const nameLines = doc.splitTextToSize(names, right - left - 70);
  doc.text(nameLines, left + 70, y);
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

/** Dashed cut line between the two copies. */
const drawCutLine = (doc, y) => {
  doc.setDrawColor(...MUTED);
  for (let x = MARGIN; x < PAGE_W - MARGIN; x += 9) {
    doc.line(x, y, x + 4, y);
  }
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text('cut here', PAGE_W / 2, y - 3, { align: 'center' });
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
  const doc = new jsPDF({ unit: 'pt', format: 'legal' });

  items.forEach(({ family, row }, index) => {
    if (index > 0) doc.addPage();
    drawCopy(doc, PAD_TOP, 'Student Copy', family, row, month, settings, logo);
    drawCutLine(doc, FORM_H);
    drawCopy(doc, FORM_H + PAD_TOP, 'Office Copy', family, row, month, settings, logo);
  });

  return doc;
};

/** File name like "Challan-Sep-2026-Family-12.pdf". */
export const challanPdfName = (items, month) =>
  items.length === 1
    ? `Challan-${monthShort(month)}-Family-${items[0].family.id}.pdf`
    : `Challans-${monthShort(month)}-${items.length}-families.pdf`;
