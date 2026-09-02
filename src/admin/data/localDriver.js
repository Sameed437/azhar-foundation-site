/**
 * localStorage driver — the zero-setup mode.
 *
 * All data lives under one versioned key as a single JSON document. At the
 * scale of this school (~150 family accounts × 12 months) that is well under
 * 1 MB, so read-modify-write on the whole document is simple and safe.
 */
const KEY = 'afs-admin-v1';
const AUTH_KEY = 'afs-admin-passcode-v1';

const load = () => {
  try {
    return JSON.parse(window.localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
};

const save = (data) => {
  window.localStorage.setItem(KEY, JSON.stringify(data));
};

const mutate = (fn) => {
  const data = load();
  fn(data);
  save(data);
  return data;
};

const sha256 = async (text) => {
  const bytes = new TextEncoder().encode(text);
  const digest = await window.crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
};

export const localDriver = {
  mode: 'local',

  /* ---- auth: a device passcode. This is a lock on the door, not a vault —
     real multi-user security is what the Supabase mode is for. ---- */
  async hasAccount() {
    return Boolean(window.localStorage.getItem(AUTH_KEY));
  },

  async createPasscode(passcode) {
    window.localStorage.setItem(AUTH_KEY, await sha256(passcode));
    return { ok: true };
  },

  async signIn(_email, passcode) {
    const stored = window.localStorage.getItem(AUTH_KEY);
    if (!stored) return { ok: false, error: 'No passcode set yet.' };
    if ((await sha256(passcode)) !== stored) {
      return { ok: false, error: 'Wrong passcode.' };
    }
    window.sessionStorage.setItem('afs-admin-unlocked', '1');
    return { ok: true };
  },

  async signOut() {
    window.sessionStorage.removeItem('afs-admin-unlocked');
  },

  async currentUser() {
    return window.sessionStorage.getItem('afs-admin-unlocked')
      ? { email: 'This device', mode: 'local' }
      : null;
  },

  /* ---- data ---- */
  async fetchAll() {
    return load();
  },

  async saveFamily(family) {
    mutate((data) => {
      data.families = data.families || [];
      const index = data.families.findIndex((f) => f.id === family.id);
      if (index >= 0) data.families[index] = family;
      else data.families.push(family);
    });
    return family;
  },

  async deleteFamily(familyId) {
    mutate((data) => {
      data.families = (data.families || []).filter((f) => f.id !== familyId);
      if (data.records) delete data.records[familyId];
    });
  },

  async saveRecord(familyId, month, record) {
    mutate((data) => {
      data.records = data.records || {};
      data.records[familyId] = data.records[familyId] || {};
      data.records[familyId][month] = record;
    });
  },

  async saveSettings(settings) {
    mutate((data) => {
      data.settings = settings;
    });
  },

  /** Replace everything — used by restore-from-backup and Excel import. */
  async replaceAll(snapshot) {
    save(snapshot);
  },
};
