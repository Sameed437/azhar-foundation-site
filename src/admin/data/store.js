/**
 * Storage layer for the admin panel.
 *
 * Two interchangeable drivers behind one interface:
 *   local    — this browser's localStorage. Works instantly, single device.
 *              Back up from Settings; clearing browser data erases it.
 *   supabase — real database + login. Activates automatically once
 *              REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY are set
 *              (see supabase/schema.sql and the README).
 *
 * Shapes:
 *   family  { id, name, guardian, phone, students:[{name, klass}], listFee,
 *             monthlyFee, openingArrears, notes, activeFrom, activeTo, sort }
 *   records { [familyId]: { [YYYY-MM]: { fee, misc, fine, received,
 *             receivedDate, note } } }
 *   teacher { id, name, role, phone, cnic, monthlySalary, joinedOn, leftOn,
 *             notes, sort }
 *   salaries{ [teacherId]: { [YYYY-MM]: { salary, allowance, deduction, paid,
 *             paidDate, note } } }
 *   settings{ sessionStart, dueDay, validityDay, finePerDay, schoolName, ... }
 */
import { localDriver } from './localDriver';
import { createSupabaseDriver, supabaseConfigured } from './supabaseDriver';

export const DEFAULT_SETTINGS = {
  sessionStart: 2026,
  dueDay: 5,
  validityDay: 10,
  finePerDay: 100,
  schoolName: 'Azhar Foundation School (A.F.S)',
  schoolSubtitle: 'The Foundation Builders',
  challanNote1: 'Fee & dues once paid are neither refundable nor adjustable in any case.',
  challanNote2: 'After the validity date, a fine of Rs. 100/- per day will be charged.',
};

let driver = null;

export const storageMode = () => (supabaseConfigured() ? 'supabase' : 'local');

export const getDriver = () => {
  if (!driver) {
    driver = supabaseConfigured() ? createSupabaseDriver() : localDriver;
  }
  return driver;
};

/** Normalise a loaded snapshot so the UI can trust every field. */
export const normalizeSnapshot = (snapshot) => ({
  families: (snapshot?.families || [])
    .map((family) => ({
      students: [],
      listFee: '',
      openingArrears: 0,
      notes: '',
      guardian: '',
      phone: '',
      activeFrom: '',
      activeTo: '',
      ...family,
    }))
    .sort((a, b) => (a.sort ?? a.id) - (b.sort ?? b.id)),
  records: snapshot?.records || {},
  teachers: (snapshot?.teachers || [])
    .map((teacher) => ({
      role: '',
      phone: '',
      cnic: '',
      monthlySalary: 0,
      joinedOn: '',
      leftOn: '',
      notes: '',
      ...teacher,
    }))
    .sort((a, b) => (a.sort ?? a.id) - (b.sort ?? b.id)),
  salaries: snapshot?.salaries || {},
  /** Supabase project without the staff tables yet — the UI offers the SQL. */
  staffTablesMissing: Boolean(snapshot?.staffTablesMissing),
  settings: { ...DEFAULT_SETTINGS, ...(snapshot?.settings || {}) },
});
