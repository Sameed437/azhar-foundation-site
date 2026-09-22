/**
 * Supabase driver — real authentication and a real database.
 *
 * Activates when both env vars are set (then rebuild/redeploy):
 *   REACT_APP_SUPABASE_URL=https://<project>.supabase.co
 *   REACT_APP_SUPABASE_ANON_KEY=<anon key>
 *
 * Run supabase/schema.sql in the project's SQL editor first; it creates the
 * tables and locks them to signed-in users only (row level security).
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL;
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabaseConfigured = () => Boolean(url && anonKey);

export const createSupabaseDriver = () => {
  const supabase = createClient(url, anonKey);

  const rowToFamily = (row) => ({
    id: row.id,
    name: row.name,
    guardian: row.guardian || '',
    phone: row.phone || '',
    students: row.students || [],
    listFee: row.list_fee ?? '',
    monthlyFee: row.monthly_fee ?? 0,
    openingArrears: row.opening_arrears ?? 0,
    notes: row.notes || '',
    activeFrom: row.active_from || '',
    activeTo: row.active_to || '',
    sort: row.sort ?? row.id,
  });

  const familyToRow = (family) => ({
    id: family.id,
    name: family.name,
    guardian: family.guardian || null,
    phone: family.phone || null,
    students: family.students || [],
    list_fee: family.listFee === '' ? null : Number(family.listFee),
    monthly_fee: Number(family.monthlyFee) || 0,
    opening_arrears: Number(family.openingArrears) || 0,
    notes: family.notes || null,
    active_from: family.activeFrom || null,
    active_to: family.activeTo || null,
    sort: family.sort ?? family.id,
  });

  const rowToTeacher = (row) => ({
    id: row.id,
    name: row.name,
    role: row.role || '',
    phone: row.phone || '',
    cnic: row.cnic || '',
    monthlySalary: row.monthly_salary ?? 0,
    joinedOn: row.joined_on || '',
    leftOn: row.left_on || '',
    notes: row.notes || '',
    sort: row.sort ?? row.id,
  });

  const teacherToRow = (teacher) => ({
    id: teacher.id,
    name: teacher.name,
    role: teacher.role || null,
    phone: teacher.phone || null,
    cnic: teacher.cnic || null,
    monthly_salary: Number(teacher.monthlySalary) || 0,
    joined_on: teacher.joinedOn || null,
    left_on: teacher.leftOn || null,
    notes: teacher.notes || null,
    sort: teacher.sort ?? teacher.id,
  });

  const salaryToRow = (teacherId, month, record) => ({
    teacher_id: teacherId,
    month,
    salary: record.salary === '' || record.salary == null ? null : Number(record.salary),
    allowance: Number(record.allowance) || 0,
    deduction: Number(record.deduction) || 0,
    paid: Number(record.paid) || 0,
    paid_date: record.paidDate || null,
    note: record.note || null,
  });

  return {
    mode: 'supabase',

    async hasAccount() {
      return true; // accounts are managed in the Supabase dashboard
    },

    async signIn(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error ? { ok: false, error: error.message } : { ok: true };
    },

    async signOut() {
      await supabase.auth.signOut();
    },

    async currentUser() {
      const { data } = await supabase.auth.getUser();
      return data.user ? { email: data.user.email, mode: 'supabase' } : null;
    },

    async fetchAll() {
      const [familiesRes, recordsRes, settingsRes, teachersRes, salariesRes] = await Promise.all([
        supabase.from('families').select('*').order('sort'),
        supabase.from('fee_records').select('*'),
        supabase.from('app_settings').select('*').eq('id', 1).maybeSingle(),
        supabase.from('teachers').select('*').order('sort'),
        supabase.from('salary_records').select('*'),
      ]);

      const firstError = familiesRes.error || recordsRes.error || settingsRes.error;
      if (firstError) throw new Error(firstError.message);
      // Staff tables are newer: if they aren't created yet, run without them
      // rather than blocking the whole panel.
      const staffMissing = teachersRes.error || salariesRes.error;

      const records = {};
      for (const row of recordsRes.data || []) {
        records[row.family_id] = records[row.family_id] || {};
        records[row.family_id][row.month] = {
          fee: row.fee ?? '',
          misc: row.misc ?? 0,
          fine: row.fine ?? 0,
          received: row.received ?? 0,
          receivedArrears: row.received_arrears ?? null,
          receivedDate: row.received_date || '',
          note: row.note || '',
        };
      }

      const salaries = {};
      for (const row of salariesRes.data || []) {
        salaries[row.teacher_id] = salaries[row.teacher_id] || {};
        salaries[row.teacher_id][row.month] = {
          salary: row.salary ?? '',
          allowance: row.allowance ?? 0,
          deduction: row.deduction ?? 0,
          paid: row.paid ?? 0,
          paidDate: row.paid_date || '',
          note: row.note || '',
        };
      }

      return {
        families: (familiesRes.data || []).map(rowToFamily),
        records,
        teachers: staffMissing ? [] : (teachersRes.data || []).map(rowToTeacher),
        salaries: staffMissing ? {} : salaries,
        staffTablesMissing: Boolean(staffMissing),
        settings: settingsRes.data?.value || {},
      };
    },

    async saveFamily(family) {
      const { error } = await supabase.from('families').upsert(familyToRow(family));
      if (error) throw new Error(error.message);
      return family;
    },

    async deleteFamily(familyId) {
      const records = await supabase.from('fee_records').delete().eq('family_id', familyId);
      if (records.error) throw new Error(records.error.message);
      const { error } = await supabase.from('families').delete().eq('id', familyId);
      if (error) throw new Error(error.message);
    },

    async saveRecord(familyId, month, record) {
      const { error } = await supabase.from('fee_records').upsert({
        family_id: familyId,
        month,
        fee: record.fee === '' ? null : Number(record.fee),
        misc: Number(record.misc) || 0,
        fine: Number(record.fine) || 0,
        received: Number(record.received) || 0,
        received_arrears: record.receivedArrears == null || record.receivedArrears === ''
          ? null
          : Number(record.receivedArrears) || 0,
        received_date: record.receivedDate || null,
        note: record.note || null,
      });
      if (error) throw new Error(error.message);
    },

    /** Bulk edits (maintenance tools) — chunked upserts, not one call each. */
    async saveFamilies(families) {
      const rows = families.map(familyToRow);
      for (let i = 0; i < rows.length; i += 200) {
        const { error } = await supabase.from('families').upsert(rows.slice(i, i + 200));
        if (error) throw new Error(error.message);
      }
    },

    async saveRecords(entries) {
      const rows = entries.map(({ familyId, month, record }) => ({
        family_id: familyId,
        month,
        fee: record.fee === '' || record.fee == null ? null : Number(record.fee),
        misc: Number(record.misc) || 0,
        fine: Number(record.fine) || 0,
        received: Number(record.received) || 0,
        received_arrears: record.receivedArrears == null || record.receivedArrears === ''
          ? null
          : Number(record.receivedArrears) || 0,
        received_date: record.receivedDate || null,
        note: record.note || null,
      }));
      for (let i = 0; i < rows.length; i += 200) {
        const { error } = await supabase.from('fee_records').upsert(rows.slice(i, i + 200));
        if (error) throw new Error(error.message);
      }
    },

    async saveTeacher(teacher) {
      const { error } = await supabase.from('teachers').upsert(teacherToRow(teacher));
      if (error) throw new Error(error.message);
      return teacher;
    },

    async deleteTeacher(teacherId) {
      const salaries = await supabase.from('salary_records').delete().eq('teacher_id', teacherId);
      if (salaries.error) throw new Error(salaries.error.message);
      const { error } = await supabase.from('teachers').delete().eq('id', teacherId);
      if (error) throw new Error(error.message);
    },

    async saveSalary(teacherId, month, record) {
      const { error } = await supabase
        .from('salary_records')
        .upsert(salaryToRow(teacherId, month, record));
      if (error) throw new Error(error.message);
    },

    async saveSettings(settings) {
      const { error } = await supabase
        .from('app_settings')
        .upsert({ id: 1, value: settings });
      if (error) throw new Error(error.message);
    },

    async replaceAll(snapshot) {
      // Used by restore/import: wipe then re-insert.
      const wipeRecords = await supabase.from('fee_records').delete().gte('family_id', 0);
      if (wipeRecords.error) throw new Error(wipeRecords.error.message);
      const wipeFamilies = await supabase.from('families').delete().gte('id', 0);
      if (wipeFamilies.error) throw new Error(wipeFamilies.error.message);
      // Staff tables may not exist in older projects — ignore their errors.
      await supabase.from('salary_records').delete().gte('teacher_id', 0);
      await supabase.from('teachers').delete().gte('id', 0);

      const familyRows = (snapshot.families || []).map(familyToRow);
      if (familyRows.length) {
        const { error } = await supabase.from('families').insert(familyRows);
        if (error) throw new Error(error.message);
      }

      const recordRows = [];
      for (const [familyId, byMonth] of Object.entries(snapshot.records || {})) {
        for (const [month, record] of Object.entries(byMonth)) {
          recordRows.push({
            family_id: Number(familyId),
            month,
            fee: record.fee === '' || record.fee == null ? null : Number(record.fee),
            misc: Number(record.misc) || 0,
            fine: Number(record.fine) || 0,
            received: Number(record.received) || 0,
            received_arrears: record.receivedArrears == null || record.receivedArrears === ''
              ? null
              : Number(record.receivedArrears) || 0,
            received_date: record.receivedDate || null,
            note: record.note || null,
          });
        }
      }
      for (let i = 0; i < recordRows.length; i += 500) {
        const { error } = await supabase.from('fee_records').insert(recordRows.slice(i, i + 500));
        if (error) throw new Error(error.message);
      }

      const teacherRows = (snapshot.teachers || []).map(teacherToRow);
      if (teacherRows.length) {
        const { error } = await supabase.from('teachers').insert(teacherRows);
        if (error) throw new Error(`${error.message} (run the staff tables SQL first)`);
      }

      const salaryRows = [];
      for (const [teacherId, byMonth] of Object.entries(snapshot.salaries || {})) {
        for (const [month, record] of Object.entries(byMonth)) {
          salaryRows.push(salaryToRow(Number(teacherId), month, record));
        }
      }
      for (let i = 0; i < salaryRows.length; i += 500) {
        const { error } = await supabase.from('salary_records').insert(salaryRows.slice(i, i + 500));
        if (error) throw new Error(error.message);
      }

      if (snapshot.settings) {
        await this.saveSettings(snapshot.settings);
      }
    },
  };
};
