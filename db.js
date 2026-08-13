// ===================== IndexedDB layer =====================
// Two concerns live here, kept strictly separate:
//   1. The frozen master card dataset (data/master-data.js) -- never written to.
//   2. Personal collection data (this file) -- survives master dataset updates.
//
// Schema v2 moves Core ownership from a numeric "coreId" key to the permanent
// "stableKey" (AZF-001..AZF-257) so future dataset updates never orphan your
// saved progress. The old v1 store is kept around untouched as a migration
// source -- nothing is ever silently deleted.

const DB_NAME = "azumarillTrackerDB";
const DB_VERSION = 3;

const STORE_OWNERSHIP_LEGACY = "ownership";        // v1, keyPath coreId (number) -- read-only migration source
const STORE_OWNERSHIP = "ownershipV2";              // v2, keyPath stableKey (string)
const STORE_CAMEO = "cameoOwnership";               // built-in seed cameos' personal fields, keyPath id
const STORE_CUSTOM_CAMEOS = "customCameos";         // v3, full self-contained records for user-added cameos, keyPath id (autoincrement)
const STORE_EXTRAS = "globalExtras";                // keyPath id, autoincrement
const STORE_ODDITIES = "bonusOddities";             // keyPath id, autoincrement
const STORE_MIGRATION_REPORT = "migrationReport";   // keyPath id, autoincrement
const STORE_META = "meta";                          // keyPath key

let _dbPromise = null;

function openDB() {
  if (_dbPromise) return _dbPromise;
  _dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_OWNERSHIP_LEGACY)) {
        db.createObjectStore(STORE_OWNERSHIP_LEGACY, { keyPath: "coreId" });
      }
      if (!db.objectStoreNames.contains(STORE_OWNERSHIP)) {
        db.createObjectStore(STORE_OWNERSHIP, { keyPath: "stableKey" });
      }
      if (!db.objectStoreNames.contains(STORE_CAMEO)) {
        db.createObjectStore(STORE_CAMEO, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_CUSTOM_CAMEOS)) {
        db.createObjectStore(STORE_CUSTOM_CAMEOS, { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(STORE_EXTRAS)) {
        db.createObjectStore(STORE_EXTRAS, { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(STORE_ODDITIES)) {
        db.createObjectStore(STORE_ODDITIES, { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(STORE_MIGRATION_REPORT)) {
        db.createObjectStore(STORE_MIGRATION_REPORT, { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return _dbPromise;
}

function tx(storeName, mode) {
  return openDB().then(db => db.transaction(storeName, mode).objectStore(storeName));
}
function reqToPromise(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const DB = {
  async getAll(storeName) {
    const store = await tx(storeName, "readonly");
    return reqToPromise(store.getAll());
  },
  async get(storeName, key) {
    const store = await tx(storeName, "readonly");
    return reqToPromise(store.get(key));
  },
  async put(storeName, value) {
    const store = await tx(storeName, "readwrite");
    return reqToPromise(store.put(value));
  },
  async delete(storeName, key) {
    const store = await tx(storeName, "readwrite");
    return reqToPromise(store.delete(key));
  },
  async clear(storeName) {
    const store = await tx(storeName, "readwrite");
    return reqToPromise(store.clear());
  },
  async putMany(storeName, values) {
    const db = await openDB();
    const store = db.transaction(storeName, "readwrite").objectStore(storeName);
    return new Promise((resolve, reject) => {
      values.forEach(v => store.put(v));
      store.transaction.oncomplete = () => resolve();
      store.transaction.onerror = () => reject(store.transaction.error);
    });
  }
};

// ---- Core ownership (v2, stableKey-keyed) ----
async function dbGetAllOwnership() {
  const rows = await DB.getAll(STORE_OWNERSHIP);
  const map = new Map();
  rows.forEach(r => map.set(r.stableKey, r));
  return map;
}
async function dbSetOwnership(stableKey, patch) {
  const existing = await DB.get(STORE_OWNERSHIP, stableKey) || { stableKey, status: "NEED" };
  const merged = { ...existing, ...patch, stableKey, updatedAt: new Date().toISOString() };
  await DB.put(STORE_OWNERSHIP, merged);
  return merged;
}

// ---- Cameo ownership (built-in seed cameos only -- personal fields) ----
async function dbGetAllCameoOwnership() {
  const rows = await DB.getAll(STORE_CAMEO);
  const map = new Map();
  rows.forEach(r => map.set(r.id, r));
  return map;
}
async function dbSetCameoOwnership(id, patch) {
  const existing = await DB.get(STORE_CAMEO, id) || { id, status: "NEED" };
  const merged = { ...existing, ...patch, id, updatedAt: new Date().toISOString() };
  await DB.put(STORE_CAMEO, merged);
  return merged;
}

// ---- Custom Cameos (user-added, FULLY self-contained records -- v3 fix) ----
// Unlike built-in seed cameos (whose card definition lives in the frozen
// MASTER_CAMEOS array), a custom cameo has no master-data counterpart, so its
// entire definition -- not just ownership fields -- must live in IndexedDB.
// Previously these were pushed into the in-memory MASTER_CAMEOS array only,
// which is why they vanished on reload. This store fixes that.
async function dbGetAllCustomCameos() { return DB.getAll(STORE_CUSTOM_CAMEOS); }
async function dbAddCustomCameo(record) {
  const now = new Date().toISOString();
  const full = { ...record, createdAt: now, updatedAt: now };
  return DB.put(STORE_CUSTOM_CAMEOS, full);
}
async function dbUpdateCustomCameo(id, patch) {
  const existing = await DB.get(STORE_CUSTOM_CAMEOS, id);
  if (!existing) return null;
  const merged = { ...existing, ...patch, id, updatedAt: new Date().toISOString() };
  await DB.put(STORE_CUSTOM_CAMEOS, merged);
  return merged;
}
async function dbDeleteCustomCameo(id) { return DB.delete(STORE_CUSTOM_CAMEOS, id); }

// ---- Global Extras (manual, user-added) ----
async function dbGetAllExtras() { return DB.getAll(STORE_EXTRAS); }
async function dbAddExtra(record) {
  const now = new Date().toISOString();
  return DB.put(STORE_EXTRAS, { ...record, createdAt: now, updatedAt: now });
}
async function dbUpdateExtra(id, patch) {
  const existing = await DB.get(STORE_EXTRAS, id);
  if (!existing) return null;
  const merged = { ...existing, ...patch, id, updatedAt: new Date().toISOString() };
  await DB.put(STORE_EXTRAS, merged);
  return merged;
}
async function dbDeleteExtra(id) { return DB.delete(STORE_EXTRAS, id); }

// ---- Bonus Oddities (manual, user-added) ----
async function dbGetAllOddities() { return DB.getAll(STORE_ODDITIES); }
async function dbAddOddity(record) {
  const now = new Date().toISOString();
  return DB.put(STORE_ODDITIES, { ...record, createdAt: now, updatedAt: now });
}
async function dbUpdateOddity(id, patch) {
  const existing = await DB.get(STORE_ODDITIES, id);
  if (!existing) return null;
  const merged = { ...existing, ...patch, id, updatedAt: new Date().toISOString() };
  await DB.put(STORE_ODDITIES, merged);
  return merged;
}
async function dbDeleteOddity(id) { return DB.delete(STORE_ODDITIES, id); }

// ---- Migration report (read-only list for the user) ----
async function dbGetMigrationReport() { return DB.getAll(STORE_MIGRATION_REPORT); }
async function dbAddMigrationReportEntry(entry) { return DB.put(STORE_MIGRATION_REPORT, entry); }

// ---- Meta / settings ----
async function dbGetMeta(key, fallback) {
  const row = await DB.get(STORE_META, key);
  return row ? row.value : fallback;
}
async function dbSetMeta(key, value) { return DB.put(STORE_META, { key, value }); }

// ===================== MIGRATION: v1 (numeric coreId) -> v2 (stableKey) =====================
// Confident match requires species + set/product + card number + language to
// agree exactly with exactly one v2 record (or exactly one "base" finish
// candidate when the old row could map to more than one new finish variant,
// e.g. a set that split into Standard + Reverse Holo rows). Anything less
// confident is preserved in the migration report, never discarded.

function _normKey(s) { return (s || "").toString().trim().toLowerCase(); }
function _matchKey(species, product, cardNumber, language) {
  return [_normKey(species), _normKey(product), _normKey(cardNumber), _normKey(language)].join("|");
}
function _isBaseFinish(card) {
  return !(card.isReverseHolo || card.isMirror || card.is1stEdition || card.isUnlimited || card.isStamped);
}
function _buildNewCardIndex() {
  const idx = new Map();
  MASTER_CORE_CARDS.forEach(card => {
    const k = _matchKey(card.species, card.product, card.cardNumber, card.language);
    if (!idx.has(k)) idx.set(k, []);
    idx.get(k).push(card);
  });
  return idx;
}
const CORE_STATUS_VALUES = ["NEED", "OWNED", "ORDERED", "SKIP"];

// Matches an array of legacy-style personal records (each needs a
// `legacyDescriptor` of {species, product, cardNumber, language}) against
// the current MASTER_CORE_CARDS. Returns { matched: [v2 records], unmatched: [report rows] }.
function migrateLegacyOwnershipRecords(legacyRecords) {
  const idx = _buildNewCardIndex();
  const matched = [];
  const unmatched = [];

  legacyRecords.forEach(({ personal, descriptor, sourceLabel }) => {
    if (!descriptor) {
      unmatched.push({ sourceLabel, descriptor: null, personal, reason: "No legacy card description available to match against." });
      return;
    }
    const key = _matchKey(descriptor.species, descriptor.product, descriptor.cardNumber, descriptor.language);
    let candidates = idx.get(key) || [];
    let note = null;
    if (candidates.length > 1) {
      const base = candidates.filter(_isBaseFinish);
      if (base.length === 1) {
        candidates = base;
        note = "Matched to the standard finish -- this card now also has separate finish variant(s) in the audited dataset worth checking.";
      }
    }
    if (candidates.length === 1) {
      let status = personal.status || "NEED";
      if (!CORE_STATUS_VALUES.includes(status)) status = "NEED"; // VERIFY no longer exists in Core
      matched.push({
        stableKey: candidates[0].stableKey,
        status,
        qtyOwned: personal.qtyOwned || 0,
        pricePaid: personal.pricePaid ?? null,
        purchaseDate: personal.purchaseDate || null,
        seller: personal.seller || null,
        condition: personal.condition || null,
        notes: personal.notes || null,
        wishlistPriority: personal.wishlistPriority || null,
        imageUrl: personal.imageUrl || null,
        imageSource: personal.imageUrl ? "manual" : null,
        updatedAt: new Date().toISOString(),
        migrationNote: note,
      });
    } else {
      unmatched.push({
        sourceLabel,
        descriptor,
        personal,
        reason: candidates.length === 0 ? "No card in the audited dataset matches this species/set/number/language combination." : "Multiple possible matches in the audited dataset -- couldn't confidently pick one.",
      });
    }
  });

  return { matched, unmatched };
}

// Runs once per browser (guarded by a meta flag). Reads the old v1 store,
// looks up each old numeric coreId in LEGACY_V1_LOOKUP for its card
// description, and migrates into the v2 store.
async function runV1ToV2MigrationIfNeeded() {
  const already = await dbGetMeta("migrationV2Done", false);
  if (already) return await dbGetMeta("migrationV2Summary", { matchedCount: 0, unmatchedCount: 0 });

  const legacyRows = await DB.getAll(STORE_OWNERSHIP_LEGACY);
  if (!legacyRows.length) {
    const summary = { matchedCount: 0, unmatchedCount: 0, ranAt: new Date().toISOString(), hadLegacyData: false };
    await dbSetMeta("migrationV2Done", true);
    await dbSetMeta("migrationV2Summary", summary);
    return summary;
  }

  const lookupById = new Map(LEGACY_V1_LOOKUP.map(l => [l.oldCoreId, l]));
  const legacyRecords = legacyRows.map(row => {
    const desc = lookupById.get(row.coreId);
    return {
      sourceLabel: desc ? `${desc.species} · ${desc.cardVariant} · ${desc.product || ""} #${desc.cardNumber || "—"} (${desc.language}) [old ID ${row.coreId}]` : `Old core ID ${row.coreId}`,
      descriptor: desc ? { species: desc.species, product: desc.product, cardNumber: desc.cardNumber, language: desc.language } : null,
      personal: row,
    };
  });

  const { matched, unmatched } = migrateLegacyOwnershipRecords(legacyRecords);
  if (matched.length) await DB.putMany(STORE_OWNERSHIP, matched);
  for (const u of unmatched) {
    await dbAddMigrationReportEntry({
      sourceLabel: u.sourceLabel,
      descriptor: u.descriptor,
      personal: u.personal,
      reason: u.reason,
      migratedAt: new Date().toISOString(),
    });
  }

  const summary = {
    matchedCount: matched.length,
    unmatchedCount: unmatched.length,
    ranAt: new Date().toISOString(),
    hadLegacyData: true,
  };
  await dbSetMeta("migrationV2Done", true);
  await dbSetMeta("migrationV2Summary", summary);
  return summary;
}

// ===================== EXPORT / IMPORT =====================
async function dbExportAll() {
  const [ownership, cameo, customCameos, extras, oddities, migrationReport] = await Promise.all([
    DB.getAll(STORE_OWNERSHIP),
    DB.getAll(STORE_CAMEO),
    DB.getAll(STORE_CUSTOM_CAMEOS),
    DB.getAll(STORE_EXTRAS),
    DB.getAll(STORE_ODDITIES),
    DB.getAll(STORE_MIGRATION_REPORT),
  ]);
  return {
    schemaVersion: 3,
    datasetVersion: MASTER_DATASET_LABEL,
    exportedAt: new Date().toISOString(),
    ownership,             // v2, stableKey-keyed
    cameoOwnership: cameo, // built-in seed cameos' personal fields
    customCameos,          // v3: full self-contained user-added cameo records
    globalExtras: extras,
    bonusOddities: oddities,
    migrationReport,
  };
}

function summarizeImportPayload(data) {
  const isLegacy = Array.isArray(data.ownership) && data.ownership.length > 0 && !("stableKey" in data.ownership[0]) && ("coreId" in data.ownership[0]);
  return {
    schemaVersion: data.schemaVersion || 1,
    datasetVersion: data.datasetVersion || "unknown (pre-audit backup)",
    exportedAt: data.exportedAt || "unknown",
    isLegacyFormat: isLegacy,
    counts: {
      core: Array.isArray(data.ownership) ? data.ownership.length : 0,
      cameos: Array.isArray(data.cameoOwnership) ? data.cameoOwnership.length : 0,
      customCameos: Array.isArray(data.customCameos) ? data.customCameos.length : 0,
      extras: Array.isArray(data.globalExtras) ? data.globalExtras.length : 0,
      oddities: Array.isArray(data.bonusOddities) ? data.bonusOddities.length : 0,
    },
  };
}

// ---- Normalize an import payload into v2/v3-shaped record arrays, running
// the legacy (numeric coreId) migration on the fly if needed. Does NOT touch
// the database -- pure data transform, safe to call for a dry-run diff. ----
function prepareImportRecords(data) {
  let core = [];
  let unmatchedLegacy = [];

  if (Array.isArray(data.ownership) && data.ownership.length) {
    const isLegacy = !("stableKey" in data.ownership[0]) && ("coreId" in data.ownership[0]);
    if (isLegacy) {
      const lookupById = new Map(LEGACY_V1_LOOKUP.map(l => [l.oldCoreId, l]));
      const legacyRecords = data.ownership.map(row => {
        const desc = lookupById.get(row.coreId);
        return {
          sourceLabel: desc ? `${desc.species} · ${desc.cardVariant} · ${desc.product || ""} #${desc.cardNumber || "—"} (${desc.language}) [imported old ID ${row.coreId}]` : `Imported old core ID ${row.coreId}`,
          descriptor: desc ? { species: desc.species, product: desc.product, cardNumber: desc.cardNumber, language: desc.language } : null,
          personal: row,
        };
      });
      const { matched, unmatched } = migrateLegacyOwnershipRecords(legacyRecords);
      core = matched;
      unmatchedLegacy = unmatched;
    } else {
      core = data.ownership;
    }
  }

  return {
    core,
    cameoOwnership: Array.isArray(data.cameoOwnership) ? data.cameoOwnership : [],
    customCameos: Array.isArray(data.customCameos) ? data.customCameos : [],
    extras: Array.isArray(data.globalExtras) ? data.globalExtras : [],
    oddities: Array.isArray(data.bonusOddities) ? data.bonusOddities : [],
    unmatchedLegacy,
  };
}

// ---- Compare one incoming array against local records (by key) and bucket
// each into new / update (incoming newer or local has no timestamp) /
// conflict (local is newer than incoming) / unchanged. ----
function _diffRecords(incomingList, localList, keyField) {
  const localMap = new Map(localList.map(r => [r[keyField], r]));
  const result = { new: [], update: [], conflict: [], unchanged: [] };
  for (const incoming of incomingList) {
    const local = localMap.get(incoming[keyField]);
    if (!local) { result.new.push(incoming); continue; }
    const localTime = local.updatedAt || "";
    const incomingTime = incoming.updatedAt || "";
    if (!localTime) { result.update.push(incoming); }
    else if (!incomingTime) { result.conflict.push({ incoming, local }); }
    else if (incomingTime > localTime) { result.update.push(incoming); }
    else if (incomingTime === localTime) { result.unchanged.push(incoming); }
    else { result.conflict.push({ incoming, local }); }
  }
  return result;
}

// ---- Dry-run diff for the import confirmation screen. Read-only. ----
async function dbComputeImportDiff(data) {
  const prepared = prepareImportRecords(data);
  const [localCore, localCameo, localCustomCameos, localExtras, localOddities] = await Promise.all([
    DB.getAll(STORE_OWNERSHIP), DB.getAll(STORE_CAMEO), DB.getAll(STORE_CUSTOM_CAMEOS),
    DB.getAll(STORE_EXTRAS), DB.getAll(STORE_ODDITIES),
  ]);
  const diffs = {
    core: _diffRecords(prepared.core, localCore, "stableKey"),
    cameoOwnership: _diffRecords(prepared.cameoOwnership, localCameo, "id"),
    customCameos: _diffRecords(prepared.customCameos, localCustomCameos, "id"),
    extras: _diffRecords(prepared.extras, localExtras, "id"),
    oddities: _diffRecords(prepared.oddities, localOddities, "id"),
  };
  const totals = { new: 0, update: 0, conflict: 0, unchanged: 0 };
  Object.values(diffs).forEach(d => {
    totals.new += d.new.length; totals.update += d.update.length;
    totals.conflict += d.conflict.length; totals.unchanged += d.unchanged.length;
  });
  return { prepared, diffs, totals, unmatchedLegacy: prepared.unmatchedLegacy };
}

// ---- Commit an import using a precomputed diff. mode: "preferLocal"
// (default -- conflicts are skipped, local data wins) or "preferBackup"
// (conflicts are overwritten with the imported version). New and
// non-conflicting updates are always applied either way. ----
async function dbApplyImportDiff(diffResult, mode) {
  const preferBackup = mode === "preferBackup";
  const stores = [
    { store: STORE_OWNERSHIP, diff: diffResult.diffs.core },
    { store: STORE_CAMEO, diff: diffResult.diffs.cameoOwnership },
    { store: STORE_CUSTOM_CAMEOS, diff: diffResult.diffs.customCameos },
    { store: STORE_EXTRAS, diff: diffResult.diffs.extras },
    { store: STORE_ODDITIES, diff: diffResult.diffs.oddities },
  ];
  let applied = 0, skipped = 0;
  for (const { store, diff } of stores) {
    const toPut = [...diff.new, ...diff.update];
    if (preferBackup) toPut.push(...diff.conflict.map(c => c.incoming));
    else skipped += diff.conflict.length;
    if (toPut.length) await DB.putMany(store, toPut);
    applied += toPut.length;
  }
  for (const u of diffResult.unmatchedLegacy) {
    await dbAddMigrationReportEntry({
      sourceLabel: u.sourceLabel, descriptor: u.descriptor, personal: u.personal,
      reason: u.reason, migratedAt: new Date().toISOString(),
    });
  }
  return { applied, skippedConflicts: skipped, unmatchedFromImport: diffResult.unmatchedLegacy.length };
}

// ---- Full wholesale replace, used only by Reset-then-restore flows where
// conflict-safety doesn't apply (there's nothing local left to conflict
// with). Kept for internal/test use. ----
async function dbImportAllReplace(data) {
  const prepared = prepareImportRecords(data);
  await Promise.all([
    DB.clear(STORE_OWNERSHIP), DB.clear(STORE_CAMEO), DB.clear(STORE_CUSTOM_CAMEOS),
    DB.clear(STORE_EXTRAS), DB.clear(STORE_ODDITIES),
  ]);
  if (prepared.core.length) await DB.putMany(STORE_OWNERSHIP, prepared.core);
  if (prepared.cameoOwnership.length) await DB.putMany(STORE_CAMEO, prepared.cameoOwnership);
  if (prepared.customCameos.length) await DB.putMany(STORE_CUSTOM_CAMEOS, prepared.customCameos);
  if (prepared.extras.length) await DB.putMany(STORE_EXTRAS, prepared.extras);
  if (prepared.oddities.length) await DB.putMany(STORE_ODDITIES, prepared.oddities);
  for (const u of prepared.unmatchedLegacy) {
    await dbAddMigrationReportEntry({
      sourceLabel: u.sourceLabel, descriptor: u.descriptor, personal: u.personal,
      reason: u.reason, migratedAt: new Date().toISOString(),
    });
  }
  return { importedCore: prepared.core.length, unmatchedFromImport: prepared.unmatchedLegacy.length };
}

async function dbResetAll() {
  await Promise.all([
    DB.clear(STORE_OWNERSHIP),
    DB.clear(STORE_CAMEO),
    DB.clear(STORE_CUSTOM_CAMEOS),
    DB.clear(STORE_EXTRAS),
    DB.clear(STORE_ODDITIES),
  ]);
}

// Expose the low-level DB helper for the reproducible audit script in
// /tests and for debugging in the browser console. The app itself only
// ever uses the named db*() helper functions above.
if (typeof window !== "undefined") window.DB = DB;
