/**
 * Class-label helpers. The register writes classes as free text — "PG", "N",
 * "Prep", "PP", "1" … "10" — so filters need a sensible school order rather
 * than an alphabetical one.
 */

const NAMED_ORDER = {
  pg: 0,
  playgroup: 0,
  n: 1,
  nursery: 1,
  p: 2,
  pp: 2,
  prep: 2,
  kg: 2,
};

export const classSortKey = (klass) => {
  const key = String(klass || '').trim().toLowerCase();
  if (key in NAMED_ORDER) return NAMED_ORDER[key];
  const numeric = parseInt(key, 10);
  if (Number.isFinite(numeric)) return 10 + numeric;
  return 100; // anything unrecognised sorts last
};

/** Every distinct class present in the register, in school order. */
export const uniqueClasses = (families) => {
  const byNormal = new Map();
  for (const family of families) {
    for (const student of family.students || []) {
      const label = String(student.klass || '').trim();
      if (label) byNormal.set(label.toLowerCase(), label);
    }
  }
  return [...byNormal.values()].sort(
    (a, b) => classSortKey(a) - classSortKey(b) || a.localeCompare(b)
  );
};

/** True when any sibling in the family is in the given class ('' = all). */
export const familyHasClass = (family, klass) =>
  !klass ||
  (family.students || []).some(
    (student) =>
      String(student.klass || '').trim().toLowerCase() ===
      String(klass).trim().toLowerCase()
  );
