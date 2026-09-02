import {
  familyLedger,
  monthCharge,
  monthSummary,
  sessionLabel,
  sessionMonths,
} from './calc';

const MONTHS = sessionMonths(2026);

describe('sessionMonths', () => {
  test('runs March through February', () => {
    expect(MONTHS[0]).toBe('2026-03');
    expect(MONTHS[5]).toBe('2026-08');
    expect(MONTHS[11]).toBe('2027-02');
    expect(MONTHS).toHaveLength(12);
  });

  test('labels like the workbook', () => {
    expect(sessionLabel(2026)).toBe('2026–27');
  });
});

describe('monthCharge', () => {
  const family = { monthlyFee: 2500 };

  test('defaults to the family fee', () => {
    expect(monthCharge(family, undefined)).toBe(2500);
  });

  test('a record can override the fee and add misc/fine', () => {
    expect(monthCharge(family, { fee: 2000, misc: 500, fine: 100 })).toBe(2600);
  });

  test('an explicit zero fee is honoured (fee waived)', () => {
    expect(monthCharge(family, { fee: 0 })).toBe(0);
  });
});

describe('familyLedger', () => {
  test('arrears roll forward month over month', () => {
    const family = { id: 1, monthlyFee: 1000 };
    const records = {
      '2026-03': { received: 1000 },
      '2026-04': { received: 400 }, // 600 short
      '2026-05': { received: 0 },
    };
    const { rows } = familyLedger(family, records, MONTHS);

    expect(rows[0].status).toBe('paid');
    expect(rows[1].balance).toBe(600);
    expect(rows[1].status).toBe('partial');
    expect(rows[2].arrearsIn).toBe(600);
    expect(rows[2].due).toBe(1600);
    expect(rows[2].status).toBe('unpaid');
  });

  test('opening arrears from a previous session are carried in', () => {
    const family = { id: 1, monthlyFee: 1000, openingArrears: 2000 };
    const { rows } = familyLedger(family, {}, MONTHS);
    expect(rows[0].due).toBe(3000);
  });

  test('months outside the active range charge nothing', () => {
    const family = { id: 1, monthlyFee: 1000, activeFrom: '2026-09' };
    const { rows } = familyLedger(family, {}, MONTHS);
    expect(rows[0].inactive).toBe(true);
    expect(rows[0].charge).toBe(0);
    const september = rows.find((row) => row.month === '2026-09');
    expect(september.charge).toBe(1000);
  });

  test('an overpayment becomes credit against the next month', () => {
    const family = { id: 1, monthlyFee: 1000 };
    const records = { '2026-03': { received: 2500 } };
    const { rows } = familyLedger(family, records, MONTHS);
    expect(rows[0].balance).toBe(-1500);
    expect(rows[1].due).toBe(-500); // 1000 charge minus 1500 credit
  });
});

describe('monthSummary', () => {
  test('totals across families for one month', () => {
    const families = [
      { id: 1, monthlyFee: 1000 },
      { id: 2, monthlyFee: 2000 },
    ];
    const records = {
      1: { '2026-03': { received: 1000 } },
      2: { '2026-03': { received: 500 } },
    };
    const summary = monthSummary(families, records, MONTHS, '2026-03');

    expect(summary.charged).toBe(3000);
    expect(summary.received).toBe(1500);
    expect(summary.outstanding).toBe(1500);
    expect(summary.paidCount).toBe(1);
    expect(summary.partialCount).toBe(1);
  });
});
