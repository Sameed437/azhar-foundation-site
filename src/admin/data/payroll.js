/**
 * Payroll engine — pure functions, no storage.
 *
 * Each month stands on its own (unlike fees, salary is not carried forward):
 *   payable = salary for the month + allowance/bonus − deduction
 *   remaining = payable − paid
 */

const num = (value) => Number(value) || 0;

/** The salary charged for a month: the record's override, else the contract. */
export const monthSalary = (teacher, record) =>
  record && record.salary !== '' && record.salary != null
    ? num(record.salary)
    : num(teacher?.monthlySalary);

/** Is the teacher on the payroll in this month? */
export const employedIn = (teacher, month) => {
  const from = teacher.joinedOn || '';
  const to = teacher.leftOn || '';
  if (from && month < from) return false;
  if (to && month > to) return false;
  return true;
};

/** One teacher's line for one month. */
export const salaryRow = (teacher, record, month) => {
  if (!employedIn(teacher, month)) {
    return {
      month, record, inactive: true,
      base: 0, allowance: 0, deduction: 0, payable: 0, paid: 0, remaining: 0,
      status: 'inactive',
    };
  }

  const base = monthSalary(teacher, record);
  const allowance = num(record?.allowance);
  const deduction = num(record?.deduction);
  const payable = Math.max(0, base + allowance - deduction);
  const paid = num(record?.paid);
  const remaining = payable - paid;

  const status = paid <= 0
    ? (payable <= 0 ? 'clear' : 'unpaid')
    : remaining <= 0 ? 'paid' : 'partial';

  return { month, record, inactive: false, base, allowance, deduction, payable, paid, remaining, status };
};

/** Everything the salary sheet and dashboard need for one month. */
export const salarySummary = (teachers, salaries, month) => {
  const perTeacher = teachers.map((teacher) => ({
    teacher,
    row: salaryRow(teacher, salaries?.[teacher.id]?.[month], month),
  }));

  const onPayroll = perTeacher.filter(({ row }) => !row.inactive || row.paid > 0);
  const total = (pick) => onPayroll.reduce((sum, entry) => sum + pick(entry.row), 0);

  return {
    perTeacher,
    payable: total((row) => row.payable),
    paid: total((row) => row.paid),
    outstanding: total((row) => Math.max(0, row.remaining)),
    allowances: total((row) => row.allowance),
    deductions: total((row) => row.deduction),
    paidCount: onPayroll.filter(({ row }) => row.status === 'paid').length,
    partialCount: onPayroll.filter(({ row }) => row.status === 'partial').length,
    unpaidCount: onPayroll.filter(({ row }) => row.status === 'unpaid').length,
    staffCount: onPayroll.length,
  };
};

/** A teacher's totals across the whole session. */
export const teacherYear = (teacher, byMonth, months) => {
  const rows = months.map((month) => salaryRow(teacher, byMonth?.[month], month));
  return {
    rows,
    totalPayable: rows.reduce((sum, row) => sum + row.payable, 0),
    totalPaid: rows.reduce((sum, row) => sum + row.paid, 0),
  };
};

/** Roles offered in the editor; free text is allowed too. */
export const ROLES = [
  'Principal',
  'Vice Principal',
  'Senior Teacher',
  'Teacher',
  'Junior Teacher',
  'Montessori Teacher',
  'Academy Teacher',
  'Coordinator',
  'Clerk / Accounts',
  'Librarian',
  'Lab Assistant',
  'Ayah / Helper',
  'Security Guard',
  'Sweeper',
  'Driver',
];
