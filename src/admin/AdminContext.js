import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getDriver, normalizeSnapshot, storageMode } from './data/store';
import { sessionMonths } from './data/calc';

const AdminContext = createContext(null);

export const useAdmin = () => useContext(AdminContext);

/**
 * Holds the signed-in user and the full data snapshot, and wraps every write
 * so the UI updates immediately while the driver persists in the background.
 */
export const AdminProvider = ({ children }) => {
  const driver = useMemo(() => getDriver(), []);
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);
  const [data, setData] = useState(() => normalizeSnapshot({}));
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const snapshot = await driver.fetchAll();
      setData(normalizeSnapshot(snapshot));
      setLoadError('');
    } catch (error) {
      setLoadError(error.message || 'Could not load data.');
    }
  }, [driver]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const currentUser = await driver.currentUser();
      if (cancelled) return;
      setUser(currentUser);
      if (currentUser) await refresh();
      if (!cancelled) setBooting(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [driver, refresh]);

  const signIn = useCallback(async (email, secret) => {
    const result = await driver.signIn(email, secret);
    if (result.ok) {
      setUser(await driver.currentUser());
      await refresh();
    }
    return result;
  }, [driver, refresh]);

  const signOut = useCallback(async () => {
    await driver.signOut();
    setUser(null);
  }, [driver]);

  const persist = useCallback((work) => {
    work().catch((error) => setSaveError(error.message || 'Could not save.'));
  }, []);

  const saveFamily = useCallback((family) => {
    setData((current) => {
      const families = current.families.some((f) => f.id === family.id)
        ? current.families.map((f) => (f.id === family.id ? family : f))
        : [...current.families, family];
      return normalizeSnapshot({ ...current, families });
    });
    persist(() => driver.saveFamily(family));
  }, [driver, persist]);

  const deleteFamily = useCallback((familyId) => {
    setData((current) => {
      const records = { ...current.records };
      delete records[familyId];
      return normalizeSnapshot({
        ...current,
        families: current.families.filter((f) => f.id !== familyId),
        records,
      });
    });
    persist(() => driver.deleteFamily(familyId));
  }, [driver, persist]);

  const saveRecord = useCallback((familyId, month, record) => {
    setData((current) => ({
      ...current,
      records: {
        ...current.records,
        [familyId]: { ...(current.records[familyId] || {}), [month]: record },
      },
    }));
    persist(() => driver.saveRecord(familyId, month, record));
  }, [driver, persist]);

  const saveSettings = useCallback((settings) => {
    setData((current) => normalizeSnapshot({ ...current, settings }));
    persist(() => driver.saveSettings(settings));
  }, [driver, persist]);

  const replaceAll = useCallback(async (snapshot) => {
    await driver.replaceAll(snapshot);
    await refresh();
  }, [driver, refresh]);

  const months = useMemo(
    () => sessionMonths(data.settings.sessionStart),
    [data.settings.sessionStart]
  );

  /** Default working month: today if inside the session, else its first month. */
  const currentMonth = useMemo(() => {
    const now = new Date();
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return months.includes(key) ? key : months[0];
  }, [months]);

  const value = {
    mode: storageMode(),
    driver,
    user,
    booting,
    data,
    months,
    currentMonth,
    loadError,
    saveError,
    clearSaveError: () => setSaveError(''),
    signIn,
    signOut,
    refresh,
    saveFamily,
    deleteFamily,
    saveRecord,
    saveSettings,
    replaceAll,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};
