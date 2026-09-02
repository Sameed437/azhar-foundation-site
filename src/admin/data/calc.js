/**
 * Fee engine — pure functions only, no storage.
 *
 * Mirrors the school's existing ledger: the session runs March to February,
 * each family (siblings share one account) owes a net monthly fee, and any
 * shortfall rolls forward as arrears onto the next month's challan.
 */

/** Month labels in session order (March first, like the Excel sheets). */
export const MONTH_NAMES = [
  'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December', 'January', 'February',
];

/**
 * The twelve "YYYY-MM" keys of a session.
 * sessionStart 2026 → 2026-03 … 2027-02, displayed as "2026–27".
 */
export const sessionMonths = (sessionStart) => {
  const months = [];
  for (let i = 0; i < 12; i += 1) {
    const monthIndex = 2 + i; // March = index 2
    const year = sessionStart + Math.floor(monthIndex / 12);
    const month = (monthIndex % 12) + 1;
    months.push(`${year}-${String(month).padStart(2, '0')}`);
  }
  return months;
};

export const sessionLabel = (sessionStart) =>
  `${sessionStart}–${String((sessionStart + 1) % 100).padStart(2, '0')}`;

/** "2026-09" → "September 2026" */
export const monthLabel = (key) => {
  const [year, month] = key.split('-').map(Number);
  const names = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return `${names[month - 1]} ${year}`;
};

/** "2026-09" → "Sep-2026" (challan style) */
export const monthShort = (key) => {
  const [year, month] = key.split('-').map(Number);
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${names[month - 1]}-${year}`;
};

/** Rs. formatting — integers only, thousands separated. */
export const rs = (amount) =>
  `Rs. ${Math.round(Number(amount) || 0).toLocaleString('en-PK')}`;

const num = (value) => Number(value) || 0;

/**
 * One month's charge for a family, before arrears.
 * fee defaults to the family's net monthly fee when the record leaves it blank.
 */
export const monthCharge = (family, record) => {
  const fee = record && record.fee !== '' && record.fee != null
    ? num(record.fee)
    : num(family.monthlyFee);
  return fee + num(record?.misc) + num(record?.fine);
};

/**
 * Ledger for one family across the session's months (in order).
 * Returns per-month rows with charge, received, arrears carried in,
 * total due, balance and status — plus session totals.
 */
export const familyLedger = (family, recordsByMonth, months) => {
  const activeFrom = family.activeFrom || months[0];
  const activeTo = family.activeTo || months[months.length - 1];
  let arrears = num(family.openingArrears);
  const rows = [];

  for (const month of months) {
    if (month < activeFrom || month > activeTo) {
      rows.push({ month, inactive: true, charge: 0, received: 0, arrearsIn: arrears, due: arrears, balance: arrears, status: 'inactive' });
      continue;
    }

    const record = recordsByMonth[month];
    const charge = monthCharge(family, record);
    const received = num(record?.received);
    const due = charge + arrears;
    const balance = due - received;
    const status = received <= 0
      ? (due <= 0 ? 'clear' : 'unpaid')
      : balance <= 0 ? 'paid' : 'partial';

    rows.push({ month, record, charge, received, arrearsIn: arrears, due, balance, status });
    arrears = balance;
  }

  const totalCharged = rows.reduce((sum, row) => sum + row.charge, 0) + num(family.openingArrears);
  const totalReceived = rows.reduce((sum, row) => sum + row.received, 0);

  return { rows, totalCharged, totalReceived, closingBalance: arrears };
};

/**
 * Everything the fee sheet and dashboard need for one month, across families.
 */
export const monthSummary = (families, records, months, month) => {
  const perFamily = families.map((family) => {
    const ledger = familyLedger(family, records[family.id] || {}, months);
    const row = ledger.rows.find((r) => r.month === month);
    return { family, row, ledger };
  });

  const active = perFamily.filter(({ row }) => row && !row.inactive);
  const total = (pick) => active.reduce((sum, entry) => sum + pick(entry.row), 0);

  return {
    perFamily,
    expected: total((row) => row.due),
    charged: total((row) => row.charge),
    received: total((row) => row.received),
    outstanding: total((row) => Math.max(0, row.balance)),
    arrearsIn: total((row) => row.arrearsIn),
    paidCount: active.filter(({ row }) => row.status === 'paid').length,
    partialCount: active.filter(({ row }) => row.status === 'partial').length,
    unpaidCount: active.filter(({ row }) => row.status === 'unpaid').length,
    activeCount: active.length,
  };
};

/** Concession actually given for a month (list fee minus charged fee). */
export const monthConcession = (family, record) => {
  const list = num(family.listFee);
  if (!list) return 0;
  const fee = record && record.fee !== '' && record.fee != null
    ? num(record.fee)
    : num(family.monthlyFee);
  return Math.max(0, list - fee);
};

/** Days late → fine, from settings. Zero before/on the validity date. */
export const lateFine = (paidDate, month, settings) => {
  if (!paidDate) return 0;
  const [year, monthNum] = month.split('-').map(Number);
  const validity = new Date(year, monthNum - 1, num(settings.validityDay) || 10);
  const paid = new Date(paidDate);
  const daysLate = Math.floor((paid - validity) / 86400000);
  return daysLate > 0 ? daysLate * (num(settings.finePerDay) || 0) : 0;
};
