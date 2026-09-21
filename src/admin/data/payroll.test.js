import { employedIn, monthSalary, salaryRow, salarySummary, teacherYear } from './payroll';

const TEACHER = { id: 1, name: 'Teacher A', monthlySalary: 25000 };

describe('monthSalary', () => {
  test('uses the contract salary when the month has no override', () => {
    expect(monthSalary(TEACHER, undefined)).toBe(25000);
    expect(monthSalary(TEACHER, { salary: '' })).toBe(25000);
  });

  test('a month override wins, including zero (unpaid leave)', () => {
    expect(monthSalary(TEACHER, { salary: 30000 })).toBe(30000);
    expect(monthSalary(TEACHER, { salary: 0 })).toBe(0);
  });
});

describe('employedIn', () => {
  test('months before joining and after leaving are off payroll', () => {
    const teacher = { ...TEACHER, joinedOn: '2026-05', leftOn: '2026-10' };
    expect(employedIn(teacher, '2026-04')).toBe(false);
    expect(employedIn(teacher, '2026-05')).toBe(true);
    expect(employedIn(teacher, '2026-10')).toBe(true);
    expect(employedIn(teacher, '2026-11')).toBe(false);
  });
});

describe('salaryRow', () => {
  test('payable adds allowance and subtracts deduction', () => {
    const row = salaryRow(TEACHER, { allowance: 2000, deduction: 500 }, '2026-09');
    expect(row.payable).toBe(26500);
    expect(row.status).toBe('unpaid');
  });

  test('a part payment leaves the rest remaining', () => {
    const row = salaryRow(TEACHER, { paid: 10000 }, '2026-09');
    expect(row.remaining).toBe(15000);
    expect(row.status).toBe('partial');
  });

  test('paying the full amount marks it paid', () => {
    const row = salaryRow(TEACHER, { paid: 25000 }, '2026-09');
    expect(row.remaining).toBe(0);
    expect(row.status).toBe('paid');
  });

  test('months off payroll charge nothing', () => {
    const teacher = { ...TEACHER, joinedOn: '2026-09' };
    const row = salaryRow(teacher, undefined, '2026-08');
    expect(row.payable).toBe(0);
    expect(row.status).toBe('inactive');
  });
});

describe('salarySummary', () => {
  test('totals the month across staff', () => {
    const teachers = [TEACHER, { id: 2, name: 'Teacher B', monthlySalary: 18000 }];
    const salaries = { 1: { '2026-09': { paid: 25000 } }, 2: { '2026-09': { paid: 8000 } } };
    const summary = salarySummary(teachers, salaries, '2026-09');
    expect(summary.payable).toBe(43000);
    expect(summary.paid).toBe(33000);
    expect(summary.outstanding).toBe(10000);
    expect(summary.paidCount).toBe(1);
    expect(summary.partialCount).toBe(1);
  });
});

describe('teacherYear', () => {
  test('sums what was payable and paid across the session', () => {
    const months = ['2026-03', '2026-04', '2026-05'];
    const byMonth = { '2026-03': { paid: 25000 }, '2026-04': { paid: 20000 } };
    const year = teacherYear(TEACHER, byMonth, months);
    expect(year.totalPayable).toBe(75000);
    expect(year.totalPaid).toBe(45000);
  });
});
