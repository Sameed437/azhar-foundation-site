import { monthLabel, monthShort } from './calc';
import { challanDate } from './whatsapp';
import { amountLines, loadLogo } from './challanPdf';

/* The challan as a picture for WhatsApp — parents see it right in the chat.
   Drawn at 2x of the PDF's point grid for a sharp image on phones. */

const S = 2; // px per pt
const W = 612; // pt — same width as the printed form (8.5in)
const MARGIN = 36;
const NAVY = '#1a237e';
const GREEN = '#137333';
const INK = '#202124';
const MUTED = '#5f6368';
const LINE = '#d2d6e4';

const font = (sizePt, weight = 'normal') =>
  `${weight === 'bold' ? '700 ' : ''}${Math.round(sizePt * S)}px "Segoe UI", Arial, sans-serif`;

const wrapText = (ctx, text, maxWidthPt) => {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const attempt = line ? `${line} ${word}` : word;
    if (ctx.measureText(attempt).width <= maxWidthPt * S || !line) line = attempt;
    else { lines.push(line); line = word; }
  }
  if (line) lines.push(line);
  return lines;
};

/** Renders one family's challan to a PNG blob. */
export const buildChallanImage = async (family, row, month, settings) => {
  const logo = await loadLogo();
  const canvas = document.createElement('canvas');
  canvas.width = W * S;
  canvas.height = 480 * S; // tall scratch surface; cropped to content at the end
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const left = MARGIN;
  const right = W - MARGIN;
  let y = 34;

  /* header */
  const logoImg = await new Promise((resolve) => {
    if (!logo) { resolve(null); return; }
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = logo;
  });
  if (logoImg) {
    try { ctx.drawImage(logoImg, left * S, (y - 6) * S, 34 * S, 34 * S); } catch (e) { /* skip logo */ }
  }
  const textX = left + (logoImg ? 44 : 0);
  ctx.textAlign = 'left';
  ctx.fillStyle = NAVY;
  ctx.font = font(15, 'bold');
  ctx.fillText(settings.schoolName, textX * S, (y + 8) * S);
  ctx.fillStyle = MUTED;
  ctx.font = font(10);
  ctx.fillText(`Fee Challan — ${monthShort(month)}`, textX * S, (y + 22) * S);
  y += 40;

  ctx.strokeStyle = NAVY;
  ctx.lineWidth = 2 * S;
  ctx.beginPath();
  ctx.moveTo(left * S, y * S);
  ctx.lineTo(right * S, y * S);
  ctx.stroke();
  y += 16;

  /* meta */
  const enrolled = family.students.filter((s) => !s.left);
  const listed = enrolled.length ? enrolled : family.students;
  const names = listed.map((s) => `${s.name}${s.klass ? ` (${s.klass})` : ''}`).join(' + ')
    || family.name;
  const metaRow = (label1, value1, label2, value2) => {
    ctx.font = font(9, 'bold');
    ctx.fillStyle = MUTED;
    ctx.fillText(label1, left * S, y * S);
    if (label2) ctx.fillText(label2, (left + 280) * S, y * S);
    ctx.font = font(9);
    ctx.fillStyle = INK;
    ctx.fillText(value1, (left + 72) * S, y * S);
    if (label2) ctx.fillText(value2, (left + 280 + 72) * S, y * S);
    y += 15;
  };
  metaRow('Family ID', String(family.id), 'Month', monthLabel(month));
  metaRow('Due date', challanDate(month, settings.dueDay), 'Valid till', challanDate(month, settings.validityDay));
  ctx.font = font(9, 'bold');
  ctx.fillStyle = MUTED;
  ctx.fillText('Student(s)', left * S, y * S);
  ctx.font = font(9);
  ctx.fillStyle = INK;
  const nameLines = wrapText(ctx, names, right - left - 72);
  nameLines.forEach((line, i) => ctx.fillText(line, (left + 72) * S, (y + i * 12) * S));
  y += nameLines.length * 12 + 10;

  /* amounts */
  for (const line of amountLines(row)) {
    const rowH = 19;
    if (line.total) {
      ctx.fillStyle = '#eef0fa';
      ctx.fillRect(left * S, (y - 13) * S, (right - left) * S, rowH * S);
      ctx.fillStyle = NAVY;
      ctx.font = font(11.5, 'bold');
    } else if (line.paid) {
      ctx.fillStyle = GREEN;
      ctx.font = font(10, 'bold');
    } else {
      ctx.fillStyle = INK;
      ctx.font = font(10);
    }
    ctx.textAlign = 'left';
    ctx.fillText(line.label, (left + 6) * S, y * S);
    ctx.textAlign = 'right';
    ctx.fillText(line.value, (right - 6) * S, y * S);
    ctx.textAlign = 'left';
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(left * S, (y + 6) * S);
    ctx.lineTo(right * S, (y + 6) * S);
    ctx.stroke();
    y += rowH;
  }
  y += 8;

  /* notes */
  ctx.fillStyle = MUTED;
  ctx.font = font(7.5);
  const note2 = (settings.challanNote2 || '').replace('Rs. 100', `Rs. ${settings.finePerDay}`);
  [settings.challanNote1, note2].filter(Boolean).forEach((note, i) => {
    const wrapped = wrapText(ctx, `${i + 1}. ${note}`, right - left);
    wrapped.forEach((line) => {
      ctx.fillText(line, left * S, y * S);
      y += 10;
    });
  });
  y += 14;

  /* crop to content */
  const out = document.createElement('canvas');
  out.width = W * S;
  out.height = Math.min(canvas.height, Math.round(y * S));
  out.getContext('2d').drawImage(canvas, 0, 0);

  return new Promise((resolve) => out.toBlob(resolve, 'image/png'));
};
