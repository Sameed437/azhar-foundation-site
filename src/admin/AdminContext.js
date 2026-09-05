import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  const [pendingSaves, setPendingSaves] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [lastSavedAt, setLastSavedAt] = useState(0);
  /** Per-key promise chains: writes to the same family/record run in order. */
  const chainsRef = useRef(new Map());
  /** Writes that exhausted their retries, kept so "Retry" can resend them. */
  const failedRef = useRef([]);

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

  /**
   * Persist a write in the background: writes to the same key run in order,
   * failures retry twice (network blips), and only then land in the retry
   * queue with a visible error. A newer edit to the same key supersedes any
   * queued failure for it — the screen always holds the latest value.
   */
  const persist = useCallback((key, work) => {
    if (failedRef.current.some((f) => f.key === key)) {
      failedRef.current = failedRef.current.filter((f) => f.key !== key);
      setFailedCount(failedRef.current.length);
    }
    setPendingSaves((n) => n + 1);
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const prev = chainsRef.current.get(key) || Promise.resolve();
    const next = prev
      .then(async () => {
        for (let attempt = 0; ; attempt++) {
          try {
            await work();
            setLastSavedAt(Date.now());
            return;
          } catch (error) {
            if (attempt < 2) { await sleep(800 * (attempt + 1)); continue; }
            failedRef.current.push({ key, work });
            setFailedCount(failedRef.current.length);
            setSaveError(error.message || 'Could not save.');
            return;
          }
        }
      })
      .finally(() => setPendingSaves((n) => n - 1));
    chainsRef.current.set(key, next);
  }, []);

  /** Resend every write that previously failed (same data, same order). */
  const retryFailed = useCallback(() => {
    const queue = failedRef.current;
    failedRef.current = [];
    setFailedCount(0);
    setSaveError('');
    queue.forEach(({ key, work }) => persist(key, work));
  }, [persist]);

  /** Don't let the tab close while a save is in flight or failed. */
  useEffect(() => {
    if (pendingSaves === 0 && failedCount === 0) return undefined;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [pendingSaves, failedCount]);

  const saveFamily = useCallback((family) => {
    setData((current) => {
      const families = current.families.some((f) => f.id === family.id)
        ? current.families.map((f) => (f.id === family.id ? family : f))
        : [...current.families, family];
      return normalizeSnapshot({ ...current, families });
    });
    persist(`family-${family.id}`, () => driver.saveFamily(family));
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
    persist(`family-${familyId}`, () => driver.deleteFamily(familyId));
  }, [driver, persist]);

  const saveRecord = useCallback((familyId, month, record) => {
    setData((current) => ({
      ...current,
      records: {
        ...current.records,
        [familyId]: { ...(current.records[familyId] || {}), [month]: record },
      },
    }));
    persist(`record-${familyId}-${month}`, () => driver.saveRecord(familyId, month, record));
  }, [driver, persist]);

  const saveSettings = useCallback((settings) => {
    setData((current) => normalizeSnapshot({ ...current, settings }));
    persist('settings', () => driver.saveSettings(settings));
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
    pendingSaves,
    failedCount,
    lastSavedAt,
    retryFailed,
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
