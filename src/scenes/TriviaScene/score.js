const KEY = "trivia-accentos:ranking:v1";
const MAX_ENTRIES = 10;
const NAME_MIN = 2;
const NAME_MAX = 16;

function normalizeName(name) {
  return name.trim().replace(/\s+/g, " ");
}

function isValidName(name) {
  const clean = normalizeName(name);
  return clean.length >= NAME_MIN && clean.length <= NAME_MAX;
}

function isValidEntry(entry) {
  return (
    entry !== null &&
    typeof entry === "object" &&
    typeof entry.id === "string" &&
    typeof entry.name === "string" &&
    entry.name.length > 0 &&
    Number.isFinite(entry.score) &&
    Number.isFinite(entry.total) &&
    entry.total > 0 &&
    Number.isFinite(entry.percent) &&
    Number.isFinite(entry.durationMs) &&
    Number.isFinite(entry.createdAt)
  );
}

// Más porcentaje primero; a igual porcentaje gana quien terminó más rápido y,
// si también empatan, quien lo hizo antes.
function compareEntries(a, b) {
  return (
    b.percent - a.percent ||
    a.durationMs - b.durationMs ||
    a.createdAt - b.createdAt
  );
}

function loadRanking() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(isValidEntry)
      .sort(compareEntries)
      .slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

function saveRanking(entry) {
  const ranking = [...loadRanking(), entry]
    .sort(compareEntries)
    .slice(0, MAX_ENTRIES);

  try {
    window.localStorage.setItem(KEY, JSON.stringify(ranking));
  } catch {
    // Sin storage (modo privado o cuota llena) el ranking vive solo en memoria.
  }

  return ranking;
}

function createEntry({ name, score, total, durationMs }) {
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  return {
    id,
    name: normalizeName(name),
    score,
    total,
    percent,
    durationMs,
    createdAt: Date.now(),
  };
}

export {
  MAX_ENTRIES,
  NAME_MAX,
  NAME_MIN,
  createEntry,
  isValidName,
  loadRanking,
  normalizeName,
  saveRanking,
};
