import { monthLabel, rs } from './calc';

/** "5-Sep-2026" — the date style used on the existing Word challan. */
export const challanDate = (month, day) => {
  const [year, monthNum] = month.split('-').map(Number);
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day}-${names[monthNum - 1]}-${year}`;
};

/** "0300-1234567" / "03001234567" / "+92 300..." → "923001234567" for wa.me */
export const waPhone = (phone) => {
  let digits = (phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) digits = `92${digits.slice(1)}`;
  else if (digits.startsWith('3') && digits.length === 10) digits = `92${digits}`;
  return digits.startsWith('92') && digits.length === 12 ? digits : '';
};

/** The challan as a WhatsApp message — same numbers as the printed form. */
export const challanMessage = (family, row, month, settings) => {
  const enrolled = family.students.filter((s) => !s.left);
  const listed = enrolled.length ? enrolled : family.students;
  const names = listed.map((s) => `${s.name}${s.klass ? ` (${s.klass})` : ''}`).join(' + ')
    || family.name;
  const monthlyFee = row.charge - (Number(row.record?.misc) || 0) - (Number(row.record?.fine) || 0);

  const lines = [
    `*${settings.schoolName}*`,
    `Fee Challan — ${monthLabel(month)}`,
    `Family ID: ${family.id}`,
    `Student(s): ${names}`,
    '',
    `Monthly fee: ${rs(monthlyFee)}`,
  ];
  if (Number(row.record?.misc) > 0) lines.push(`Other charges: ${rs(row.record.misc)}`);
  if (row.arrearsIn > 0) lines.push(`Previous balance: ${rs(row.arrearsIn)}`);
  if (Number(row.record?.fine) > 0) lines.push(`Fine: ${rs(row.record.fine)}`);
  if (Number(row.record?.received) > 0) {
    lines.push(`Already paid: ${rs(row.record.received)}`);
    lines.push(`*Remaining payable: ${rs(Math.max(0, row.balance))}*`);
  } else {
    lines.push(`*Total payable: ${rs(Math.max(0, row.due))}*`);
  }
  lines.push(
    '',
    `Due date: ${challanDate(month, settings.dueDay)} (valid till ${challanDate(month, settings.validityDay)})`,
    'Please pay at the school office. Thank you.'
  );
  return lines.join('\n');
};

/** Full wa.me link for one family's challan message ('' when no valid phone). */
export const waChallanLink = (family, row, month, settings) => {
  const phone = waPhone(family.phone);
  if (!phone) return '';
  return `https://wa.me/${phone}?text=${encodeURIComponent(challanMessage(family, row, month, settings))}`;
};
