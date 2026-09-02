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
      const [familiesRes, recordsRes, settingsRes] = await Promise.all([
        supabase.from('families').select('*').order('sort'),
        supabase.from('fee_records').select('*'),
        supabase.from('app_settings').select('*').eq('id', 1).maybeSingle(),
      ]);

      const firstError = familiesRes.error || recordsRes.error || settingsRes.error;
      if (firstError) throw new Error(firstError.message);

      const records = {};
      for (const row of recordsRes.data || []) {
        records[row.family_id] = records[row.family_id] || {};
        records[row.family_id][row.month] = {
          fee: row.fee ?? '',
          misc: row.misc ?? 0,
          fine: row.fine ?? 0,
          received: row.received ?? 0,
          receivedDate: row.received_date || '',
          note: row.note || '',
        };
      }

      return {
        families: (familiesRes.data || []).map(rowToFamily),
        records,
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
        received_date: record.receivedDate || null,
        note: record.note || null,
      });
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
            received_date: record.receivedDate || null,
            note: record.note || null,
          });
        }
      }
      for (let i = 0; i < recordRows.length; i += 500) {
        const { error } = await supabase.from('fee_records').insert(recordRows.slice(i, i + 500));
        if (error) throw new Error(error.message);
      }

      if (snapshot.settings) {
        await this.saveSettings(snapshot.settings);
      }
    },
  };
};
