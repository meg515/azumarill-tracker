// ===================== CONSTANTS =====================
const STATUS_COLORS = {
  NEED: "#8FB3C4",
  OWNED: "#4CAF7D",
  ORDERED: "#E8A94B",
  VERIFY: "#9B87C4",
  SKIP: "#A9B4BC",
};
const CORE_STATUS_ORDER = ["NEED", "OWNED", "ORDERED", "SKIP"];
const BONUS_STATUS_ORDER = ["NEED", "OWNED", "ORDERED", "VERIFY", "SKIP"];
const WISHLIST_LEVELS = ["Low", "Medium", "High"];
const LANG_FLAGS = {
  English: "🇺🇸", Japanese: "🇯🇵", Spanish: "🇪🇸",
  Chinese: "🇨🇳", Thai: "🇹🇭", Indonesian: "🇮🇩",
};
const SPECIES_EMOJI = { Azurill: "🔵", Marill: "💧", Azumarill: "🌊" };
const REGIONAL_LANGS = new Set(["Chinese", "Thai", "Indonesian"]);
const BASELINE_LANGS = ["English", "Japanese", "Spanish"];
const SPECIES_TARGETS = { Azurill: 21, Marill: 124, Azumarill: 112 };

// ===================== STATE =====================
const state = {
  ownership: new Map(),      // stableKey -> personal fields
  cameoOwnership: new Map(), // id -> personal fields (built-in seed cameos)
  customCameos: [],          // user-added, fully self-contained cameo records
  extras: [],
  oddities: [],
  migrationSummary: { matchedCount: 0, unmatchedCount: 0, hadLegacyData: false },
  migrationReport: [],
  currentTab: "home",
  currentSubScreen: null,
  collectionFilters: emptyFilters(),
  specialsPrefilter: null,
  activeDetailKind: null,   // 'core' | 'cameo' | 'extra' | 'oddity'
  activeDetailKey: null,
  pendingImportPayload: null,
  pendingImportDiff: null,
  searchOpen: false,
};

function emptyFilters() {
  return {
    species: "all",
    statuses: [],
    languages: [],
    regions: [],
    eras: [],
    funCollections: [],
    difficulties: [],
    wishlist: [],
    finishFlags: [],   // reverseHolo, mirror, holo, stamped, firstEdition, unlimited, promo
    search: "",
  };
}

// ===================== UTIL =====================
function $(id) { return document.getElementById(id); }
function esc(s) {
  if (s === null || s === undefined) return "";
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function money(n) {
  if (n === null || n === undefined || isNaN(n)) return "$0.00";
  return "$" + Number(n).toFixed(2);
}
function toast(msg) {
  const el = $("toast");
  el.textContent = msg;
  el.classList.remove("hidden");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.add("hidden"), 2200);
}
function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

// ===================== MERGED DATA =====================
function getMergedCoreCards() {
  return MASTER_CORE_CARDS.map(card => {
    const personal = state.ownership.get(card.stableKey) || {};
    return {
      ...card,
      status: personal.status || "NEED",
      qtyOwned: personal.qtyOwned || 0,
      pricePaid: personal.pricePaid ?? null,
      purchaseDate: personal.purchaseDate || null,
      seller: personal.seller || null,
      condition: personal.condition || null,
      notes: personal.notes || null,
      wishlistPriority: personal.wishlistPriority || null,
      imageUrl: personal.imageUrl || null,
      imageSource: personal.imageSource || null,
    };
  });
}
function getMergedCameos() {
  const builtIn = MASTER_CAMEOS.map(card => {
    const personal = state.cameoOwnership.get(card.id) || {};
    return {
      ...card,
      isCustom: false,
      status: personal.status || card.status || "VERIFY",
      qtyOwned: personal.qtyOwned || 0,
      pricePaid: personal.pricePaid ?? null,
      purchaseDate: personal.purchaseDate || null,
      seller: personal.seller || null,
      condition: personal.condition || null,
      notes: personal.notes || card.notes || null,
      wishlistPriority: personal.wishlistPriority || null,
      imageUrl: personal.imageUrl || null,
    };
  });
  // Custom cameos are fully self-contained records already -- no separate
  // ownership store to merge, unlike built-ins. See db.js STORE_CUSTOM_CAMEOS.
  const custom = state.customCameos.map(c => ({
    ...c,
    isCustom: true,
    status: c.status || "NEED",
    qtyOwned: c.qtyOwned || 0,
    pricePaid: c.pricePaid ?? null,
  }));
  return [...builtIn, ...custom];
}

// ===================== INIT =====================
async function init() {
  state.migrationSummary = await runV1ToV2MigrationIfNeeded();

  const [ownership, cameoOwnership, customCameos, extras, oddities, migrationReport] = await Promise.all([
    dbGetAllOwnership(), dbGetAllCameoOwnership(), dbGetAllCustomCameos(), dbGetAllExtras(), dbGetAllOddities(), dbGetMigrationReport(),
  ]);
  state.ownership = ownership;
  state.cameoOwnership = cameoOwnership;
  state.customCameos = customCameos;
  state.extras = extras;
  state.oddities = oddities;
  state.migrationReport = migrationReport;

  renderMigrationBanner();
  renderHome();
  renderCollection();
  renderSpecials();
  renderCameos();
  renderOddities();
  renderSpending();
  renderMigrationScreen();
  renderWishlistScreen();
  updateAboutInfo();
  updateDatasetInfo();
  updateStorageInfo();

  bindNav();
  bindHeader();
  bindCollectionUI();
  bindMoreUI();
  bindModals();

  // Activate the initial screen. Without this, no `.screen` element ever
  // gets `.screen-active` until the user taps a nav button once -- meaning
  // the app would open to a blank page below the header on first launch.
  goToTab("home");

  registerServiceWorker();
}

// ===================== NAVIGATION =====================
function bindNav() {
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => goToTab(btn.dataset.tab));
  });
}
function goToTab(tab) {
  state.currentTab = tab;
  state.currentSubScreen = null;
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("nav-active", b.dataset.tab === tab));
  showScreen("screen-" + tab);
  $("backBtn").classList.add("hidden");
  const titles = { home: "Azurill → Marill → Azumarill", collection: "Collection", specials: "Special Collections", cameos: "Bonus Cameos", more: "More" };
  $("headerTitle").textContent = titles[tab] || "";
  $("bottomNav").classList.remove("hidden");
  closeSearch();

  if (tab === "collection" && state.specialsPrefilter) applyFunCollectionPrefilter();
}
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("screen-active"));
  $(id).classList.add("screen-active");
  $("mainScroll").scrollTop = 0;
  window.scrollTo(0, 0);
}
function goToSubScreen(id, title) {
  state.currentSubScreen = id;
  showScreen("screen-" + id);
  $("headerTitle").textContent = title;
  $("backBtn").classList.remove("hidden");
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("nav-active"));
}
function bindHeader() {
  $("backBtn").addEventListener("click", () => {
    const parentTab = ["spending", "data", "about", "oddities", "migration", "wishlist", "hunt"].includes(state.currentSubScreen)
      ? (state.currentSubScreen === "hunt" ? "collection" : (state.currentSubScreen === "oddities" ? "more" : "more"))
      : state.currentTab;
    goToTab(parentTab);
  });
  $("searchToggleBtn").addEventListener("click", () => {
    if (state.currentTab !== "collection") goToTab("collection");
    toggleSearch();
  });
  $("clearSearchBtn").addEventListener("click", () => {
    $("searchInput").value = "";
    state.collectionFilters.search = "";
    renderCollection();
  });
  $("searchInput").addEventListener("input", debounce(e => {
    state.collectionFilters.search = e.target.value.trim().toLowerCase();
    renderCollection();
  }, 180));
}
function toggleSearch() {
  state.searchOpen = !state.searchOpen;
  $("headerSearch").classList.toggle("hidden", !state.searchOpen);
  if (state.searchOpen) setTimeout(() => $("searchInput").focus(), 80);
}
function closeSearch() {
  state.searchOpen = false;
  $("headerSearch").classList.add("hidden");
}

// ===================== MIGRATION BANNER / SCREEN =====================
function renderMigrationBanner() {
  const s = state.migrationSummary;
  if (!s.hadLegacyData) { $("migrationBanner").classList.add("hidden"); return; }
  $("migrationBanner").classList.remove("hidden");
  $("migrationBanner").innerHTML = `
    <span>🔀 Old saved data migrated: <strong>${s.matchedCount}</strong> matched automatically${s.unmatchedCount ? `, <strong>${s.unmatchedCount}</strong> need a manual look` : ""}.</span>
    ${s.unmatchedCount ? `<button id="viewMigrationBannerBtn">View</button>` : ""}
  `;
  if (s.unmatchedCount) {
    $("viewMigrationBannerBtn").addEventListener("click", () => { goToSubScreen("migration", "Migration Report"); });
  }
}
function renderMigrationScreen() {
  const s = state.migrationSummary;
  $("migrationRowSub").textContent = state.migrationReport.length
    ? `${state.migrationReport.length} record(s) need a manual look`
    : "Old saved data that needs a manual look";
  $("migrationSummaryCard").innerHTML = `
    <h3>Migration summary</h3>
    <p>${s.hadLegacyData
      ? `${s.matchedCount} old record(s) matched automatically to the new AZF-numbered dataset. ${s.unmatchedCount} couldn't be confidently matched and are listed below — nothing was deleted.`
      : "No old on-device data was found to migrate, or it's already been migrated."}</p>
  `;
  if (!state.migrationReport.length) {
    $("migrationReportList").innerHTML = `<p class="empty-hint">Nothing waiting for review.</p>`;
    return;
  }
  $("migrationReportList").innerHTML = state.migrationReport.map(r => `
    <div class="data-card">
      <h3>${esc(r.sourceLabel || "Unknown record")}</h3>
      <p><strong>Why it wasn't auto-matched:</strong> ${esc(r.reason)}</p>
      <p><strong>Old saved data:</strong> status ${esc(r.personal?.status || "NEED")}${r.personal?.qtyOwned ? `, qty ${r.personal.qtyOwned}` : ""}${r.personal?.pricePaid ? `, paid ${money(r.personal.pricePaid)}` : ""}${r.personal?.notes ? `, notes: "${esc(r.personal.notes)}"` : ""}</p>
    </div>
  `).join("");
}

// ===================== HOME =====================
function computeCoreStats(cards) {
  const total = cards.length;
  const owned = cards.filter(c => c.status === "OWNED").length;
  const ordered = cards.filter(c => c.status === "ORDERED").length;
  const need = cards.filter(c => c.status === "NEED").length;
  const skip = cards.filter(c => c.status === "SKIP").length;
  const pct = total ? Math.round((owned / total) * 100) : 0;
  return { total, owned, ordered, need, skip, pct };
}
function setRing(fillEl, pctEl, pct) {
  const circumference = 2 * Math.PI * 52;
  fillEl.style.strokeDasharray = circumference.toFixed(1);
  fillEl.style.strokeDashoffset = (circumference * (1 - pct / 100)).toFixed(1);
  pctEl.textContent = pct + "%";
}
function renderHome() {
  const cards = getMergedCoreCards();
  const stats = computeCoreStats(cards);
  $("homeOwnedCount").textContent = stats.owned;
  $("homeTotalCount").textContent = stats.total;
  setRing($("homeRingFill"), $("homePct"), stats.pct);

  $("homeMiniStats").innerHTML = `
    <span class="mini-stat" style="color:${STATUS_COLORS.ORDERED}">${stats.ordered} ordered</span>
    <span class="mini-stat" style="color:${STATUS_COLORS.SKIP}">${stats.skip} skipped</span>
  `;

  const speciesHtml = ["Azurill", "Marill", "Azumarill"].map(sp => {
    const spCards = cards.filter(c => c.species === sp);
    const spStats = computeCoreStats(spCards);
    return `
      <button class="species-tile" data-species="${sp}">
        <span class="species-emoji">${SPECIES_EMOJI[sp]}</span>
        <span class="species-name">${sp}</span>
        <span class="species-frac">${spStats.owned} / ${spStats.total}</span>
        <div class="species-bar-track"><div class="species-bar-fill" style="width:${spStats.pct}%"></div></div>
        <span class="species-pct">${spStats.pct}%</span>
      </button>`;
  }).join("");
  $("speciesTiles").innerHTML = speciesHtml;
  $("speciesTiles").querySelectorAll(".species-tile").forEach(btn => {
    btn.addEventListener("click", () => {
      state.collectionFilters = emptyFilters();
      state.collectionFilters.species = btn.dataset.species;
      goToTab("collection");
      syncSpeciesChipUI();
      renderCollection();
    });
  });

  // language progress (baseline languages individually, regional grouped)
  const langRows = BASELINE_LANGS.map(lang => {
    const langCards = cards.filter(c => c.language === lang);
    const s = computeCoreStats(langCards);
    return { label: lang, flag: LANG_FLAGS[lang], ...s };
  });
  const regionalCards = cards.filter(c => REGIONAL_LANGS.has(c.language));
  const regionalStats = computeCoreStats(regionalCards);
  langRows.push({ label: "Regional Exclusives", flag: "🌏", ...regionalStats });

  $("langProgressList").innerHTML = langRows.map(r => `
    <div class="lang-progress-row">
      <span class="lang-progress-flag">${r.flag}</span>
      <span class="lang-progress-label">${esc(r.label)}</span>
      <div class="lang-progress-bar-track"><div class="lang-progress-bar-fill" style="width:${r.pct}%"></div></div>
      <span class="lang-progress-frac">${r.owned}/${r.total}</span>
    </div>
  `).join("");

  const fcStats = computeFunCollectionStats(cards);
  $("specialsPreview").innerHTML = fcStats.slice(0, 3).map(specialTileHtml).join("");
  $("specialsPreview").querySelectorAll(".special-tile").forEach(el => {
    el.addEventListener("click", () => jumpToFunCollection(el.dataset.key));
  });

  const recent = [...state.ownership.values()]
    .filter(r => r.status === "OWNED" || r.status === "ORDERED")
    .filter(r => r.updatedAt)
    .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""))
    .slice(0, 6);
  if (recent.length === 0) {
    $("recentActivity").innerHTML = `<p class="empty-hint">Cards you mark OWNED or ORDERED will show up here.</p>`;
  } else {
    $("recentActivity").innerHTML = recent.map(r => {
      const card = MASTER_CORE_CARDS.find(c => c.stableKey === r.stableKey);
      if (!card) return "";
      return `<div class="recent-row" data-corelink="${card.stableKey}">
        <span class="status-dot" style="background:${STATUS_COLORS[r.status]}"></span>
        <span class="recent-row-text">
          <span class="recent-row-title">${esc(card.cardVariant)} · ${esc(card.language)}</span>
          <span class="recent-row-sub">${esc(card.product)}</span>
        </span>
      </div>`;
    }).join("");
    $("recentActivity").querySelectorAll(".recent-row").forEach(el => {
      el.addEventListener("click", () => openCardDetail(el.dataset.corelink));
    });
  }
}

// ===================== FUN COLLECTIONS =====================
function computeFunCollectionStats(cards) {
  return FUN_COLLECTIONS_META.map(meta => {
    const inCollection = cards.filter(c => c.funCollections.includes(meta.key));
    const owned = inCollection.filter(c => c.status === "OWNED").length;
    return { ...meta, total: inCollection.length, owned, pct: inCollection.length ? Math.round((owned / inCollection.length) * 100) : 0 };
  }).filter(fc => fc.total > 0);
}
function specialTileHtml(fc) {
  return `<button class="special-tile" data-key="${esc(fc.key)}">
    <span class="special-emoji">${fc.emoji}</span>
    <span class="special-name">${esc(fc.key)}</span>
    <span class="special-frac">${fc.owned} / ${fc.total}</span>
    <div class="special-bar-track"><div class="special-bar-fill" style="width:${fc.pct}%"></div></div>
  </button>`;
}
function renderSpecials() {
  const cards = getMergedCoreCards();
  const fcStats = computeFunCollectionStats(cards);
  $("specialsGrid").innerHTML = fcStats.map(specialTileHtml).join("");
  $("specialsGrid").querySelectorAll(".special-tile").forEach(el => {
    el.addEventListener("click", () => jumpToFunCollection(el.dataset.key));
  });
  renderGlobalExtras();
}
function jumpToFunCollection(key) {
  state.specialsPrefilter = key;
  goToTab("collection");
}
function applyFunCollectionPrefilter() {
  state.collectionFilters = emptyFilters();
  state.collectionFilters.funCollections = [state.specialsPrefilter];
  state.specialsPrefilter = null;
  syncSpeciesChipUI();
  renderCollection();
}

// ===================== COLLECTION =====================
function syncSpeciesChipUI() {
  document.querySelectorAll("#speciesChipRow .chip").forEach(c => {
    c.classList.toggle("chip-active", c.dataset.speciesFilter === state.collectionFilters.species);
  });
}
function bindCollectionUI() {
  document.querySelectorAll("#speciesChipRow .chip").forEach(chip => {
    chip.addEventListener("click", () => {
      state.collectionFilters.species = chip.dataset.speciesFilter;
      syncSpeciesChipUI();
      renderCollection();
    });
  });
  $("openFiltersBtn").addEventListener("click", openFilterSheet);
  $("huntNextBtn").addEventListener("click", () => { renderHuntNext(); goToSubScreen("hunt", "Hunt Next"); });
}

const FINISH_FLAG_DEFS = [
  { key: "isReverseHolo", label: "Reverse Holo" },
  { key: "isHolo", label: "Holo" },
  { key: "isMirror", label: "Mirror" },
  { key: "isStamped", label: "Stamped" },
  { key: "is1stEdition", label: "1st Edition" },
  { key: "isUnlimited", label: "Unlimited" },
  { key: "isPromo", label: "Promo / Special product" },
];

function cardMatchesFilters(card, f) {
  if (f.species !== "all" && card.species !== f.species) return false;
  if (f.statuses.length && !f.statuses.includes(card.status)) return false;
  if (f.languages.length && !f.languages.includes(card.language)) return false;
  if (f.regions.length && !f.regions.includes(card.region)) return false;
  if (f.eras.length && !f.eras.includes(card.era || "Unknown")) return false;
  if (f.funCollections.length && !f.funCollections.some(k => card.funCollections.includes(k))) return false;
  if (f.difficulties.length && !f.difficulties.includes(card.difficulty)) return false;
  if (f.wishlist.length && !f.wishlist.includes(card.wishlistPriority || "None")) return false;
  if (f.finishFlags.length && !f.finishFlags.every(k => card[k])) return false;
  if (f.search) {
    const blob = [card.cardVariant, card.product, card.cardNumber, card.language, card.region, card.specialPrinting, card.stableKey]
      .filter(Boolean).join(" ").toLowerCase();
    if (!blob.includes(f.search)) return false;
  }
  return true;
}
function countActiveFilters() {
  const f = state.collectionFilters;
  return f.statuses.length + f.languages.length + f.regions.length + f.eras.length + f.funCollections.length +
    f.difficulties.length + f.wishlist.length + f.finishFlags.length;
}
function renderCollection() {
  const cards = getMergedCoreCards();
  const filtered = cards.filter(c => cardMatchesFilters(c, state.collectionFilters));

  $("collectionResultCount").textContent = `${filtered.length} card${filtered.length === 1 ? "" : "s"}`;
  const activeCount = countActiveFilters();
  $("filterCountBadge").textContent = activeCount;
  $("filterCountBadge").classList.toggle("hidden", activeCount === 0);

  renderActiveFilterTags();
  $("collectionEmptyHint").classList.toggle("hidden", filtered.length > 0);
  $("collectionGrid").innerHTML = filtered.map(cardTileHtml).join("");
  $("collectionGrid").querySelectorAll(".card-tile").forEach(el => {
    el.addEventListener("click", () => openCardDetail(el.dataset.stablekey));
  });
}
function renderActiveFilterTags() {
  const f = state.collectionFilters;
  const tags = [];
  f.statuses.forEach(s => tags.push({ label: s, clear: () => f.statuses = f.statuses.filter(x => x !== s) }));
  f.languages.forEach(l => tags.push({ label: l, clear: () => f.languages = f.languages.filter(x => x !== l) }));
  f.regions.forEach(r => tags.push({ label: r, clear: () => f.regions = f.regions.filter(x => x !== r) }));
  f.eras.forEach(e => tags.push({ label: e, clear: () => f.eras = f.eras.filter(x => x !== e) }));
  f.funCollections.forEach(k => tags.push({ label: k, clear: () => f.funCollections = f.funCollections.filter(x => x !== k) }));
  f.difficulties.forEach(d => tags.push({ label: d, clear: () => f.difficulties = f.difficulties.filter(x => x !== d) }));
  f.wishlist.forEach(w => tags.push({ label: w + " priority", clear: () => f.wishlist = f.wishlist.filter(x => x !== w) }));
  f.finishFlags.forEach(k => {
    const def = FINISH_FLAG_DEFS.find(d => d.key === k);
    tags.push({ label: def ? def.label : k, clear: () => f.finishFlags = f.finishFlags.filter(x => x !== k) });
  });
  $("activeFilterTags").innerHTML = tags.map((t, i) => `<span class="active-filter-tag">${esc(t.label)}<button data-i="${i}">✕</button></span>`).join("");
  $("activeFilterTags").querySelectorAll("button").forEach((btn, i) => {
    btn.addEventListener("click", () => { tags[i].clear(); renderCollection(); });
  });
}
function cardTileHtml(card) {
  const flag = LANG_FLAGS[card.language] || "🌐";
  const isRegional = REGIONAL_LANGS.has(card.language);
  const img = card.imageUrl
    ? `<img src="${esc(card.imageUrl)}" alt="${esc(card.cardVariant)}" loading="lazy">`
    : `<span class="card-tile-placeholder">🃏</span>`;
  const wishStar = card.wishlistPriority === "High" ? `<span class="wishlist-badge">⭐</span>` : "";
  return `
    <div class="card-tile" data-stablekey="${card.stableKey}">
      <div class="card-tile-image">
        ${img}
        <span class="status-badge" style="background:${STATUS_COLORS[card.status]}">${card.status}</span>
        <span class="lang-badge">${flag}</span>
        ${wishStar}
        ${isRegional ? `<span class="regional-badge">${esc(card.region)}</span>` : ""}
      </div>
      <div class="card-tile-info">
        <div class="card-tile-name">${esc(card.cardVariant)}</div>
        <div class="card-tile-set">${esc(card.product)}</div>
        <div class="card-tile-meta">
          <span class="card-tile-num">#${esc(card.cardNumber || "—")}</span>
          <span class="card-tile-num">${esc(card.language)}</span>
        </div>
      </div>
    </div>`;
}

// ---- Filter sheet ----
function openFilterSheet() {
  const f = state.collectionFilters;
  const languages = [...new Set(MASTER_CORE_CARDS.map(c => c.language))];
  const regions = [...new Set(MASTER_CORE_CARDS.map(c => c.region))];
  const eras = [...new Set(MASTER_CORE_CARDS.map(c => c.era || "Unknown"))].sort();
  const difficulties = ["Easy", "Medium", "Hard", "Very Hard"];

  const optRow = (arr, active, dataAttr) => arr.map(v =>
    `<button class="filter-opt ${active.includes(v) ? "filter-opt-active" : ""}" data-${dataAttr}="${esc(v)}">${esc(v)}</button>`
  ).join("");

  $("filterModalSheet").innerHTML = `
    <div class="sheet-handle"></div>
    <div class="sheet-close-row"><button id="closeFilterSheet">✕</button></div>
    <h3 style="margin-bottom:14px;">Filters</h3>
    <div class="filter-section"><h4>Status</h4><div class="filter-options">${optRow(CORE_STATUS_ORDER, f.statuses, "status")}</div></div>
    <div class="filter-section"><h4>Language</h4><div class="filter-options">${optRow(languages, f.languages, "lang")}</div></div>
    <div class="filter-section"><h4>Region</h4><div class="filter-options">${optRow(regions, f.regions, "region")}</div></div>
    <div class="filter-section"><h4>Era</h4><div class="filter-options">${optRow(eras, f.eras, "era")}</div></div>
    <div class="filter-section"><h4>Fun Collection</h4><div class="filter-options">${optRow(FUN_COLLECTIONS_META.map(m => m.key), f.funCollections, "fc")}</div></div>
    <div class="filter-section"><h4>Difficulty</h4><div class="filter-options">${optRow(difficulties, f.difficulties, "diff")}</div></div>
    <div class="filter-section"><h4>Wishlist priority</h4><div class="filter-options">${optRow(WISHLIST_LEVELS, f.wishlist, "wish")}</div></div>
    <div class="filter-section"><h4>Finish / product type</h4><div class="filter-options">
      ${FINISH_FLAG_DEFS.map(d => `<button class="filter-opt ${f.finishFlags.includes(d.key) ? "filter-opt-active" : ""}" data-finish="${d.key}">${esc(d.label)}</button>`).join("")}
    </div></div>
    <div class="filter-sheet-actions">
      <button class="primary-btn secondary" id="clearFiltersBtn">Clear all</button>
      <button class="primary-btn" id="applyFiltersBtn">Show results</button>
    </div>
  `;
  $("filterModalOverlay").classList.remove("hidden");
  $("closeFilterSheet").addEventListener("click", closeFilterSheet);
  $("filterModalSheet").querySelectorAll("[data-status]").forEach(b => b.addEventListener("click", () => toggleFilterVal(f.statuses, b.dataset.status, b)));
  $("filterModalSheet").querySelectorAll("[data-lang]").forEach(b => b.addEventListener("click", () => toggleFilterVal(f.languages, b.dataset.lang, b)));
  $("filterModalSheet").querySelectorAll("[data-region]").forEach(b => b.addEventListener("click", () => toggleFilterVal(f.regions, b.dataset.region, b)));
  $("filterModalSheet").querySelectorAll("[data-era]").forEach(b => b.addEventListener("click", () => toggleFilterVal(f.eras, b.dataset.era, b)));
  $("filterModalSheet").querySelectorAll("[data-fc]").forEach(b => b.addEventListener("click", () => toggleFilterVal(f.funCollections, b.dataset.fc, b)));
  $("filterModalSheet").querySelectorAll("[data-diff]").forEach(b => b.addEventListener("click", () => toggleFilterVal(f.difficulties, b.dataset.diff, b)));
  $("filterModalSheet").querySelectorAll("[data-wish]").forEach(b => b.addEventListener("click", () => toggleFilterVal(f.wishlist, b.dataset.wish, b)));
  $("filterModalSheet").querySelectorAll("[data-finish]").forEach(b => b.addEventListener("click", () => toggleFilterVal(f.finishFlags, b.dataset.finish, b)));
  $("clearFiltersBtn").addEventListener("click", () => {
    f.statuses = []; f.languages = []; f.regions = []; f.eras = []; f.funCollections = [];
    f.difficulties = []; f.wishlist = []; f.finishFlags = [];
    openFilterSheet();
  });
  $("applyFiltersBtn").addEventListener("click", () => { closeFilterSheet(); renderCollection(); });
}
function toggleFilterVal(arr, val, btn) {
  const idx = arr.indexOf(val);
  if (idx === -1) arr.push(val); else arr.splice(idx, 1);
  btn.classList.toggle("filter-opt-active");
}
function closeFilterSheet() { $("filterModalOverlay").classList.add("hidden"); }

// ===================== HUNT NEXT =====================
function renderHuntNext() {
  const cards = getMergedCoreCards().filter(c => c.status === "NEED");

  const easy = cards.filter(c => c.difficulty === "Easy");
  const medium = cards.filter(c => c.difficulty === "Medium");
  const current = cards.filter(c => c.packStatus === "Current sealed possible");
  const highWishlist = cards.filter(c => c.wishlistPriority === "High");

  // group by product to find bundle opportunities (2+ needed cards from the same set/product)
  const byProduct = {};
  cards.forEach(c => { (byProduct[c.product || "Unknown"] = byProduct[c.product || "Unknown"] || []).push(c); });
  const bundleGroups = Object.entries(byProduct).filter(([, list]) => list.length >= 2).sort((a, b) => b[1].length - a[1].length);

  // seller-bundle suggestion: group by acquisition route keywords (very rough heuristic on acquisition text)
  const byRoute = {};
  cards.forEach(c => {
    const routeKey = (c.acquisition || "").match(/TCGplayer|eBay|Cardmarket|Japanese marketplace|proxy|card show/i);
    const key = routeKey ? routeKey[0] : null;
    if (key) (byRoute[key] = byRoute[key] || []).push(c);
  });
  const routeGroups = Object.entries(byRoute).filter(([, list]) => list.length >= 3).sort((a, b) => b[1].length - a[1].length);

  function section(title, blurb, list, opts = {}) {
    if (!list.length) return "";
    const shown = list.slice(0, opts.limit || 6);
    return `
      <div class="hunt-section">
        <h3>${esc(title)} <span class="hunt-count">${list.length}</span></h3>
        <p class="screen-intro">${esc(blurb)}</p>
        <div class="card-grid">${shown.map(cardTileHtml).join("")}</div>
        ${list.length > shown.length ? `<p class="empty-hint">+ ${list.length - shown.length} more</p>` : ""}
      </div>`;
  }

  let html = "";
  html += section("⭐ High-priority wishlist", "Cards you've personally flagged as High priority.", highWishlist);
  html += section("🟢 Easy needs", "Lower-difficulty cards still on your NEED list — good quick wins.", easy);
  html += section("🟡 Medium needs", "A bit more searching, but still very doable.", medium);
  html += section("🛒 Currently obtainable in packs", "Still in print — you could pull these, though buying the single is usually cheaper for one-family collecting.", current);

  if (bundleGroups.length) {
    html += `<div class="hunt-section"><h3>📦 Same set/product opportunities</h3><p class="screen-intro">Needing several cards from one set means one seller search could cover them all.</p>`;
    html += bundleGroups.slice(0, 5).map(([product, list]) => `
      <div class="data-card">
        <h3>${esc(product)} <span class="hunt-count">${list.length} needed</span></h3>
        <p>${list.map(c => esc(c.cardVariant + " · " + c.language + " #" + (c.cardNumber || "—"))).join(", ")}</p>
      </div>
    `).join("");
    html += `</div>`;
  }
  if (routeGroups.length) {
    html += `<div class="hunt-section"><h3>🧺 Smart to bundle from one seller</h3><p class="screen-intro">These share a common best route — worth checking one seller/search for several at once.</p>`;
    html += routeGroups.slice(0, 5).map(([route, list]) => `
      <div class="data-card"><h3>${esc(route)} <span class="hunt-count">${list.length} cards</span></h3></div>
    `).join("");
    html += `</div>`;
  }

  if (!html) html = `<p class="empty-hint">Nothing left to hunt — either you own it all or everything's ORDERED/SKIP. 🎉</p>`;

  $("huntSections").innerHTML = html;
  $("huntSections").querySelectorAll(".card-tile").forEach(el => {
    el.addEventListener("click", () => openCardDetail(el.dataset.stablekey));
  });
}

// ===================== CARD DETAIL (CORE) =====================
// Fix for unsaved-field loss: status buttons update ONLY their own active
// classes + fire a background save, never rebuild the modal DOM. All other
// fields save together on the explicit Save tap. Nothing in this modal ever
// re-renders while the user might have unsaved text in it.
function openCardDetail(stableKey) {
  const card = getMergedCoreCards().find(c => c.stableKey === stableKey);
  if (!card) return;
  state.activeDetailKind = "core";
  state.activeDetailKey = stableKey;

  const flag = LANG_FLAGS[card.language] || "🌐";
  const badges = [
    `<span class="tag-pill">${flag} ${esc(card.language)}</span>`,
    `<span class="tag-pill">${esc(card.region)}</span>`,
    card.difficulty ? `<span class="tag-pill">${esc(card.difficulty)}</span>` : "",
    card.specialPrinting ? `<span class="tag-pill pink">${esc(card.specialPrinting)}</span>` : "",
    card.era ? `<span class="tag-pill">${esc(card.era)}</span>` : "",
    card.artist ? `<span class="tag-pill">🎨 ${esc(card.artist)}</span>` : "",
  ].filter(Boolean).join("");
  const funBadges = card.funCollections.map(k => {
    const meta = FUN_COLLECTIONS_META.find(m => m.key === k);
    return `<span class="tag-pill pink">${meta ? meta.emoji : ""} ${esc(k)}</span>`;
  }).join("");

  const img = card.imageUrl
    ? `<img src="${esc(card.imageUrl)}" alt="${esc(card.cardVariant)}">`
    : `<span class="detail-placeholder">🃏</span>`;

  const marketLinks = [
    { label: "TCGplayer", url: "https://www.tcgplayer.com/" },
    { label: "eBay", url: "https://www.ebay.com/" },
    { label: "Cardmarket", url: "https://www.cardmarket.com/" },
  ].map(m => `<a class="marketplace-link" href="${m.url}" target="_blank" rel="noopener">${m.label}</a>`).join("");

  const canAutoImage = card.language === "English";

  $("cardModalSheet").innerHTML = `
    <div class="sheet-handle"></div>
    <div class="sheet-close-row"><button id="closeCardModal">✕</button></div>
    <div class="detail-image-wrap" id="detailImageWrap">${img}</div>
    ${card.imageSource === "auto-matched" ? `<p class="image-source-note">🔎 Image auto-matched from Pokémon TCG API — <button id="clearImageBtn" class="text-btn-inline">remove</button></p>` : ""}
    <div class="detail-title">${esc(card.cardVariant)}</div>
    <div class="detail-sub">${esc(card.product)} · #${esc(card.cardNumber || "—")} · ${esc(card.stableKey)}</div>
    ${card.dataIssues && card.dataIssues.length ? `<div class="verify-note">⚠️ This row has a data-quality flag from the spreadsheet import: ${card.dataIssues.map(esc).join(" · ")} — double-check the source link before buying.</div>` : ""}
    <div class="detail-badges">${badges}${funBadges}</div>

    <div class="status-picker" id="statusPicker">
      ${CORE_STATUS_ORDER.map(s => `<button class="status-opt ${card.status === s ? "status-opt-active" : ""}" data-status="${s}">${s}</button>`).join("")}
    </div>

    <div class="detail-section">
      <div class="detail-section-label">How to get this card</div>
      <div class="acquire-box">
        <p>${esc(card.acquisition || "No acquisition notes yet.")}</p>
        <div class="search-copy-row">
          <input type="text" id="searchTermInput" readonly value="${esc(card.searchTerms || "")}">
          <button class="copy-btn" id="copySearchBtn">Copy</button>
        </div>
        <div class="marketplace-links">${marketLinks}</div>
      </div>
      ${card.cleanNotes ? `<p class="research-note">📋 ${esc(card.cleanNotes)}</p>` : ""}
    </div>

    ${canAutoImage ? `
    <div class="detail-section">
      <div class="detail-section-label">Card image</div>
      <button class="primary-btn secondary" id="findImageBtn">🔎 Find image (Pokémon TCG API)</button>
      <div id="imageMatchResult"></div>
    </div>` : `
    <div class="detail-section">
      <div class="detail-section-label">Card image</div>
      <p class="verify-note">This is a ${esc(card.language)} card — automatic image matching is only offered for English cards, to avoid showing you the wrong language's print. Add an image URL below if you have one.</p>
    </div>`}

    <div class="detail-section">
      <div class="detail-section-label">Your collection details</div>
      <div class="form-grid-2">
        <div class="form-row"><label>Qty owned</label><input type="number" min="0" id="fieldQty" value="${card.qtyOwned || 0}"></div>
        <div class="form-row"><label>Price paid</label><input type="number" min="0" step="0.01" id="fieldPrice" value="${card.pricePaid ?? ""}" placeholder="0.00"></div>
      </div>
      <div class="form-grid-2">
        <div class="form-row"><label>Purchase date</label><input type="date" id="fieldDate" value="${card.purchaseDate || ""}"></div>
        <div class="form-row"><label>Seller / source</label><input type="text" id="fieldSeller" value="${esc(card.seller || "")}" placeholder="eBay, TCGplayer…"></div>
      </div>
      <div class="form-row"><label>Condition</label><input type="text" id="fieldCondition" value="${esc(card.condition || "")}" placeholder="NM, LP, raw…"></div>
      <div class="form-row"><label>Wishlist priority</label>
        <select id="fieldWishlist">
          <option value="">None</option>
          ${WISHLIST_LEVELS.map(w => `<option value="${w}" ${card.wishlistPriority === w ? "selected" : ""}>${w}</option>`).join("")}
        </select>
      </div>
      <div class="form-row"><label>Card image URL (manual override)</label><input type="text" id="fieldImage" value="${esc(card.imageUrl || "")}" placeholder="https://…"></div>
      <div class="form-row"><label>Notes</label><textarea id="fieldNotes" placeholder="Anything to remember…">${esc(card.notes || "")}</textarea></div>
    </div>

    ${card.sourceUrl ? `<a class="source-link" href="${esc(card.sourceUrl)}" target="_blank" rel="noopener">View source →</a>` : ""}

    <div class="detail-actions"><button class="primary-btn" id="saveCardDetailBtn">Save</button></div>
  `;
  $("cardModalOverlay").classList.remove("hidden");

  $("closeCardModal").addEventListener("click", closeCardModal);

  // Status buttons: update classes in place + persist in background. NO rerender.
  $("statusPicker").querySelectorAll(".status-opt").forEach(btn => {
    btn.addEventListener("click", async () => {
      $("statusPicker").querySelectorAll(".status-opt").forEach(b => b.classList.remove("status-opt-active"));
      btn.classList.add("status-opt-active");
      const newStatus = btn.dataset.status;
      await dbSetOwnership(stableKey, { status: newStatus });
      state.ownership = await dbGetAllOwnership();
      renderHome(); renderCollection(); renderSpecials();
      toast(`Marked ${newStatus}`);
    });
  });

  $("copySearchBtn").addEventListener("click", () => {
    const val = $("searchTermInput").value;
    navigator.clipboard?.writeText(val).then(() => toast("Search copied")).catch(() => toast("Couldn't copy — select and copy manually"));
  });

  if (canAutoImage) {
    $("findImageBtn").addEventListener("click", () => findCardImage(card));
  }
  if (card.imageSource === "auto-matched") {
    $("clearImageBtn")?.addEventListener("click", async () => {
      await dbSetOwnership(stableKey, { imageUrl: null, imageSource: null });
      state.ownership = await dbGetAllOwnership();
      openCardDetail(stableKey);
      refreshAllViews();
    });
  }

  $("saveCardDetailBtn").addEventListener("click", async () => {
    const patch = {
      // Always write the status currently shown in the picker explicitly,
      // rather than relying on a separate earlier write having already
      // landed -- otherwise a fast status-tap-then-Save could race two
      // concurrent dbSetOwnership calls and lose the status update.
      status: $("statusPicker").querySelector(".status-opt-active")?.dataset.status || card.status,
      qtyOwned: Number($("fieldQty").value) || 0,
      pricePaid: $("fieldPrice").value === "" ? null : Number($("fieldPrice").value),
      purchaseDate: $("fieldDate").value || null,
      seller: $("fieldSeller").value.trim() || null,
      condition: $("fieldCondition").value.trim() || null,
      wishlistPriority: $("fieldWishlist").value || null,
      imageUrl: $("fieldImage").value.trim() || null,
      notes: $("fieldNotes").value.trim() || null,
    };
    if (patch.imageUrl && patch.imageUrl !== (card.imageUrl || "")) patch.imageSource = "manual";
    if (!patch.imageUrl) patch.imageSource = null;
    await dbSetOwnership(stableKey, patch);
    state.ownership = await dbGetAllOwnership();
    refreshAllViews();
    toast("Saved");
    closeCardModal();
  });
}
function closeCardModal() {
  $("cardModalOverlay").classList.add("hidden");
  state.activeDetailKind = null;
  state.activeDetailKey = null;
}
function refreshAllViews() {
  renderHome(); renderCollection(); renderSpecials(); renderSpending(); renderWishlistScreen(); renderMigrationScreen();
}

// ---- Image matching via Pokémon TCG API (English cards only, user-confirmed) ----
async function findCardImage(card) {
  const resultEl = $("imageMatchResult");
  resultEl.innerHTML = `<p class="empty-hint">Searching…</p>`;
  try {
    const setQuery = encodeURIComponent(card.product || "");
    const numQuery = encodeURIComponent((card.cardNumber || "").split("/")[0]);
    const url = `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent('set.name:"' + card.product + '" number:' + numQuery)}&pageSize=5`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("API error " + res.status);
    const data = await res.json();
    const results = (data.data || []).filter(c => c.name && c.name.toLowerCase().includes(card.species.toLowerCase()));
    if (!results.length) {
      resultEl.innerHTML = `<p class="empty-hint">No confident match found. Use the manual image URL field below instead.</p>`;
      return;
    }
    const top = results[0];
    resultEl.innerHTML = `
      <div class="image-match-preview">
        <img src="${esc(top.images?.small)}" alt="${esc(top.name)}">
        <div>
          <p><strong>${esc(top.name)}</strong> — ${esc(top.set?.name || "")} #${esc(top.number || "")}</p>
          <button class="primary-btn" id="useMatchedImageBtn" style="margin-top:6px;">Use this image</button>
        </div>
      </div>`;
    $("useMatchedImageBtn").addEventListener("click", async () => {
      await dbSetOwnership(card.stableKey, { imageUrl: top.images?.large || top.images?.small, imageSource: "auto-matched" });
      state.ownership = await dbGetAllOwnership();
      openCardDetail(card.stableKey);
      refreshAllViews();
      toast("Image saved");
    });
  } catch (err) {
    resultEl.innerHTML = `<p class="empty-hint">Couldn't reach the image API right now (needs an internet connection). Use the manual image URL field below instead.</p>`;
  }
}

// ===================== CAMEOS =====================
function renderCameos() {
  const cameos = getMergedCameos();
  const owned = cameos.filter(c => c.status === "OWNED").length;
  const pct = cameos.length ? Math.round((owned / cameos.length) * 100) : 0;
  $("cameoOwnedCount").textContent = owned;
  $("cameoTotalCount").textContent = cameos.length;
  setRing($("cameoRingFill"), $("cameoPct"), pct);

  $("cameoGrid").innerHTML = cameos.map(c => {
    const img = c.imageUrl ? `<img src="${esc(c.imageUrl)}" alt="${esc(c.cardName)}">` : `<span class="card-tile-placeholder">👀</span>`;
    return `
    <div class="card-tile" data-cameoid="${c.id}" data-custom="${c.isCustom ? "1" : "0"}">
      <div class="card-tile-image">
        ${img}
        <span class="status-badge" style="background:${STATUS_COLORS[c.status] || STATUS_COLORS.VERIFY}">${c.status}</span>
        ${c.wishlistPriority === "High" ? `<span class="wishlist-badge">⭐</span>` : ""}
        ${c.isCustom ? `<span class="regional-badge">Custom</span>` : ""}
      </div>
      <div class="card-tile-info">
        <div class="card-tile-name">${esc(c.cardName)}</div>
        <div class="card-tile-set">${esc(c.product || "")} · features ${esc(c.featuredMember)}</div>
      </div>
    </div>`;
  }).join("");
  $("cameoGrid").querySelectorAll(".card-tile").forEach(el => {
    el.addEventListener("click", () => openCameoDetail(Number(el.dataset.cameoid), el.dataset.custom === "1"));
  });
}

function openCameoDetail(id, isCustom) {
  const c = getMergedCameos().find(x => x.id === id && x.isCustom === isCustom);
  if (!c) return;
  const img = c.imageUrl ? `<img src="${esc(c.imageUrl)}" alt="${esc(c.cardName)}">` : `<span class="detail-placeholder">👀</span>`;
  $("cardModalSheet").innerHTML = `
    <div class="sheet-handle"></div>
    <div class="sheet-close-row"><button id="closeCardModal">✕</button></div>
    <div class="detail-image-wrap">${img}</div>
    <div class="detail-title">${esc(c.cardName)}</div>
    <div class="detail-sub">${esc(c.product || "")} ${c.cardNumber ? "· #" + esc(c.cardNumber) : ""}</div>
    <div class="detail-badges">
      <span class="tag-pill">${esc(c.language || "")}</span>
      <span class="tag-pill pink">Features ${esc(c.featuredMember)}</span>
      ${c.cameoType ? `<span class="tag-pill">${esc(c.cameoType)}</span>` : ""}
      ${c.isCustom ? `<span class="tag-pill pink">Custom</span>` : ""}
    </div>
    <div class="status-picker" id="cameoStatusPicker">
      ${BONUS_STATUS_ORDER.map(s => `<button class="status-opt ${c.status === s ? "status-opt-active" : ""}" data-status="${s}">${s}</button>`).join("")}
    </div>
    <div class="verify-note">👀 Cameo identification often needs visual confirmation before you buy. ${esc(c.notes || "")}</div>
    <div class="detail-section">
      <div class="detail-section-label">How to get this card</div>
      <div class="acquire-box"><p>${esc(c.acquisition || "No acquisition notes yet.")}</p></div>
    </div>
    <div class="detail-section">
      <div class="detail-section-label">${c.isCustom ? "Card definition (yours to edit)" : "Your collection details"}</div>
      ${c.isCustom ? `
      <div class="form-row"><label>Card name</label><input type="text" id="fieldCardName" value="${esc(c.cardName || "")}"></div>
      <div class="form-row"><label>Featured family member</label><input type="text" id="fieldFeatured" value="${esc(c.featuredMember || "")}"></div>
      <div class="form-grid-2">
        <div class="form-row"><label>Set / product</label><input type="text" id="fieldProduct" value="${esc(c.product || "")}"></div>
        <div class="form-row"><label>Card #</label><input type="text" id="fieldCardNumber" value="${esc(c.cardNumber || "")}"></div>
      </div>
      <div class="form-grid-2">
        <div class="form-row"><label>Language</label><input type="text" id="fieldLanguage" value="${esc(c.language || "")}"></div>
        <div class="form-row"><label>Cameo description</label><input type="text" id="fieldCameoType" value="${esc(c.cameoType || "")}"></div>
      </div>` : ""}
      <div class="form-grid-2">
        <div class="form-row"><label>Qty owned</label><input type="number" min="0" id="fieldQty" value="${c.qtyOwned || 0}"></div>
        <div class="form-row"><label>Price paid</label><input type="number" min="0" step="0.01" id="fieldPrice" value="${c.pricePaid ?? ""}" placeholder="0.00"></div>
      </div>
      <div class="form-grid-2">
        <div class="form-row"><label>Purchase date</label><input type="date" id="fieldDate" value="${c.purchaseDate || ""}"></div>
        <div class="form-row"><label>Seller / source</label><input type="text" id="fieldSeller" value="${esc(c.seller || "")}"></div>
      </div>
      <div class="form-row"><label>Condition</label><input type="text" id="fieldCondition" value="${esc(c.condition || "")}"></div>
      <div class="form-row"><label>Wishlist priority</label>
        <select id="fieldWishlist"><option value="">None</option>${WISHLIST_LEVELS.map(w => `<option value="${w}" ${c.wishlistPriority === w ? "selected" : ""}>${w}</option>`).join("")}</select>
      </div>
      <div class="form-row"><label>Image URL</label><input type="text" id="fieldImage" value="${esc(c.imageUrl || "")}"></div>
      <div class="form-row"><label>Notes</label><textarea id="fieldNotes">${esc(c.notes || "")}</textarea></div>
    </div>
    ${c.sourceUrl ? `<a class="source-link" href="${esc(c.sourceUrl)}" target="_blank" rel="noopener">View source →</a>` : ""}
    <div class="detail-actions">
      ${c.isCustom ? `<button class="primary-btn danger" id="deleteCameoBtn" style="flex:0 0 auto;">Delete</button>` : ""}
      <button class="primary-btn" id="saveCameoDetailBtn">Save</button>
    </div>
  `;
  $("cardModalOverlay").classList.remove("hidden");
  $("closeCardModal").addEventListener("click", closeCardModal);
  $("cameoStatusPicker").querySelectorAll(".status-opt").forEach(btn => {
    btn.addEventListener("click", async () => {
      $("cameoStatusPicker").querySelectorAll(".status-opt").forEach(b => b.classList.remove("status-opt-active"));
      btn.classList.add("status-opt-active");
      if (c.isCustom) { await dbUpdateCustomCameo(id, { status: btn.dataset.status }); state.customCameos = await dbGetAllCustomCameos(); }
      else { await dbSetCameoOwnership(id, { status: btn.dataset.status }); state.cameoOwnership = await dbGetAllCameoOwnership(); }
      renderCameos();
      toast(`Marked ${btn.dataset.status}`);
    });
  });
  $("saveCameoDetailBtn").addEventListener("click", async () => {
    const patch = {
      status: $("cameoStatusPicker").querySelector(".status-opt-active")?.dataset.status || c.status,
      qtyOwned: Number($("fieldQty").value) || 0,
      pricePaid: $("fieldPrice").value === "" ? null : Number($("fieldPrice").value),
      purchaseDate: $("fieldDate").value || null,
      seller: $("fieldSeller").value.trim() || null,
      condition: $("fieldCondition").value.trim() || null,
      wishlistPriority: $("fieldWishlist").value || null,
      imageUrl: $("fieldImage").value.trim() || null,
      notes: $("fieldNotes").value.trim() || null,
    };
    if (c.isCustom) {
      patch.cardName = $("fieldCardName").value.trim() || "Untitled cameo";
      patch.featuredMember = $("fieldFeatured").value.trim();
      patch.product = $("fieldProduct").value.trim();
      patch.cardNumber = $("fieldCardNumber").value.trim();
      patch.language = $("fieldLanguage").value.trim();
      patch.cameoType = $("fieldCameoType").value.trim();
      await dbUpdateCustomCameo(id, patch);
      state.customCameos = await dbGetAllCustomCameos();
    } else {
      await dbSetCameoOwnership(id, patch);
      state.cameoOwnership = await dbGetAllCameoOwnership();
    }
    refreshAllViews(); renderCameos();
    toast("Saved");
    closeCardModal();
  });
  if (c.isCustom) {
    $("deleteCameoBtn").addEventListener("click", async () => {
      await dbDeleteCustomCameo(id);
      state.customCameos = await dbGetAllCustomCameos();
      renderCameos();
      toast("Cameo deleted");
      closeCardModal();
    });
  }
}

function bindCameoAdd() {
  $("addCameoBtn").addEventListener("click", () => openCameoEditor());
}
function openCameoEditor() {
  $("addExtraSheet").innerHTML = `
    <div class="sheet-handle"></div>
    <div class="sheet-close-row"><button id="closeExtraModal">✕</button></div>
    <h3 style="margin-bottom:14px;">Add a cameo</h3>
    <div class="form-row"><label>Card name</label><input type="text" id="cmName" placeholder="Grotle"></div>
    <div class="form-row"><label>Featured family member</label><input type="text" id="cmFeatured" placeholder="Marill"></div>
    <div class="form-grid-2">
      <div class="form-row"><label>Set / product</label><input type="text" id="cmProduct"></div>
      <div class="form-row"><label>Card #</label><input type="text" id="cmCardNum"></div>
    </div>
    <div class="form-row"><label>Language</label><input type="text" id="cmLanguage" placeholder="English"></div>
    <div class="form-row"><label>Cameo description</label><input type="text" id="cmCameoType" placeholder="Artwork cameo"></div>
    <div class="form-row"><label>Status</label><select id="cmStatus">${BONUS_STATUS_ORDER.map(s => `<option value="${s}">${s}</option>`).join("")}</select></div>
    <div class="form-row"><label>Image URL</label><input type="text" id="cmImage" placeholder="https://…"></div>
    <div class="form-row"><label>Notes</label><textarea id="cmNotes"></textarea></div>
    <div class="detail-actions"><button class="primary-btn" id="saveCameoAddBtn">Save</button></div>
  `;
  $("addExtraOverlay").classList.remove("hidden");
  $("closeExtraModal").addEventListener("click", () => $("addExtraOverlay").classList.add("hidden"));
  $("saveCameoAddBtn").addEventListener("click", async () => {
    // Fully self-contained record -- persisted directly to IndexedDB, never
    // pushed into the in-memory MASTER_CAMEOS array (that was the bug).
    const record = {
      cardName: $("cmName").value.trim() || "Untitled cameo",
      featuredMember: $("cmFeatured").value.trim(),
      product: $("cmProduct").value.trim(),
      cardNumber: $("cmCardNum").value.trim(),
      language: $("cmLanguage").value.trim(),
      cameoType: $("cmCameoType").value.trim() || "User-added",
      status: $("cmStatus").value,
      qtyOwned: 0,
      pricePaid: null,
      purchaseDate: null,
      seller: null,
      condition: null,
      wishlistPriority: null,
      imageUrl: $("cmImage").value.trim() || null,
      acquisition: null,
      notes: $("cmNotes").value.trim() || null,
      sourceUrl: null,
    };
    await dbAddCustomCameo(record);
    state.customCameos = await dbGetAllCustomCameos();
    renderCameos();
    $("addExtraOverlay").classList.add("hidden");
    toast("Cameo added");
  });
}

// ===================== GLOBAL EXTRAS =====================
function renderGlobalExtras() {
  if (!state.extras.length) {
    $("globalExtrasGrid").innerHTML = `<p class="empty-hint" style="grid-column:1/-1;">No Global Extras added yet — this is your treasure-hunt space for fun translated copies.</p>`;
    return;
  }
  $("globalExtrasGrid").innerHTML = state.extras.map(ex => `
    <div class="card-tile" data-extraid="${ex.id}">
      <div class="card-tile-image">
        ${ex.imageUrl ? `<img src="${esc(ex.imageUrl)}" alt="${esc(ex.cardName)}">` : `<span class="card-tile-placeholder">🌟</span>`}
        <span class="status-badge" style="background:${STATUS_COLORS[ex.status] || STATUS_COLORS.NEED}">${ex.status || "NEED"}</span>
        ${ex.wishlistPriority === "High" ? `<span class="wishlist-badge">⭐</span>` : ""}
      </div>
      <div class="card-tile-info">
        <div class="card-tile-name">${esc(ex.cardName)}</div>
        <div class="card-tile-set">${esc(ex.language || "")} · ${esc(ex.finish || ex.variant || "")}</div>
      </div>
    </div>`).join("");
  $("globalExtrasGrid").querySelectorAll(".card-tile").forEach(el => {
    el.addEventListener("click", () => openExtraEditor(Number(el.dataset.extraid)));
  });
}
function openExtraEditor(id) {
  const ex = id ? state.extras.find(e => e.id === id) : null;
  $("addExtraSheet").innerHTML = `
    <div class="sheet-handle"></div>
    <div class="sheet-close-row"><button id="closeExtraModal">✕</button></div>
    <h3 style="margin-bottom:14px;">${ex ? "Edit" : "Add"} Global Extra</h3>
    <div class="form-row"><label>Species</label><input type="text" id="exSpecies" value="${esc(ex?.species || "")}" placeholder="Marill"></div>
    <div class="form-row"><label>Card name</label><input type="text" id="exName" value="${esc(ex?.cardName || "")}" placeholder="Marill"></div>
    <div class="form-grid-2">
      <div class="form-row"><label>Set / product</label><input type="text" id="exProduct" value="${esc(ex?.product || "")}"></div>
      <div class="form-row"><label>Card #</label><input type="text" id="exCardNumber" value="${esc(ex?.cardNumber || "")}"></div>
    </div>
    <div class="form-grid-2">
      <div class="form-row"><label>Language</label><input type="text" id="exLanguage" value="${esc(ex?.language || "")}" placeholder="French"></div>
      <div class="form-row"><label>Finish</label><input type="text" id="exFinish" value="${esc(ex?.finish || "")}" placeholder="Reverse holo"></div>
    </div>
    <div class="form-row"><label>Status</label>
      <select id="exStatus">${BONUS_STATUS_ORDER.map(s => `<option value="${s}" ${ex?.status === s ? "selected" : ""}>${s}</option>`).join("")}</select>
    </div>
    <div class="form-grid-2">
      <div class="form-row"><label>Qty owned</label><input type="number" min="0" id="exQty" value="${ex?.qtyOwned ?? 0}"></div>
      <div class="form-row"><label>Price paid</label><input type="number" min="0" step="0.01" id="exPrice" value="${ex?.pricePaid ?? ""}"></div>
    </div>
    <div class="form-grid-2">
      <div class="form-row"><label>Purchase date</label><input type="date" id="exDate" value="${ex?.purchaseDate || ""}"></div>
      <div class="form-row"><label>Seller / source</label><input type="text" id="exSeller" value="${esc(ex?.seller || "")}"></div>
    </div>
    <div class="form-row"><label>Condition</label><input type="text" id="exCondition" value="${esc(ex?.condition || "")}"></div>
    <div class="form-row"><label>Wishlist priority</label>
      <select id="exWishlist"><option value="">None</option>${WISHLIST_LEVELS.map(w => `<option value="${w}" ${ex?.wishlistPriority === w ? "selected" : ""}>${w}</option>`).join("")}</select>
    </div>
    <div class="form-row"><label>Image URL</label><input type="text" id="exImage" value="${esc(ex?.imageUrl || "")}"></div>
    <div class="form-row"><label>Notes</label><textarea id="exNotes">${esc(ex?.notes || "")}</textarea></div>
    <div class="detail-actions">
      ${ex ? `<button class="primary-btn danger" id="deleteExtraBtn" style="flex:0 0 auto;">Delete</button>` : ""}
      <button class="primary-btn" id="saveExtraBtn">Save</button>
    </div>
  `;
  $("addExtraOverlay").classList.remove("hidden");
  $("closeExtraModal").addEventListener("click", () => $("addExtraOverlay").classList.add("hidden"));
  $("saveExtraBtn").addEventListener("click", async () => {
    const record = {
      species: $("exSpecies").value.trim(), cardName: $("exName").value.trim() || "Untitled card",
      product: $("exProduct").value.trim(), cardNumber: $("exCardNumber").value.trim(),
      language: $("exLanguage").value.trim(), finish: $("exFinish").value.trim(),
      status: $("exStatus").value, qtyOwned: Number($("exQty").value) || 0,
      pricePaid: $("exPrice").value === "" ? null : Number($("exPrice").value),
      purchaseDate: $("exDate").value || null, seller: $("exSeller").value.trim() || null,
      condition: $("exCondition").value.trim() || null, wishlistPriority: $("exWishlist").value || null,
      imageUrl: $("exImage").value.trim() || null, notes: $("exNotes").value.trim() || null,
    };
    if (ex) { await dbUpdateExtra(ex.id, record); } else { await dbAddExtra(record); }
    state.extras = await dbGetAllExtras();
    renderGlobalExtras(); refreshAllViews();
    $("addExtraOverlay").classList.add("hidden");
    toast("Saved");
  });
  if (ex) {
    $("deleteExtraBtn").addEventListener("click", async () => {
      await dbDeleteExtra(ex.id);
      state.extras = await dbGetAllExtras();
      renderGlobalExtras(); refreshAllViews();
      $("addExtraOverlay").classList.add("hidden");
      toast("Deleted");
    });
  }
}

// ===================== BONUS ODDITIES =====================
function renderOddities() {
  if (!state.oddities.length) {
    $("odditiesGrid").innerHTML = `<p class="empty-hint" style="grid-column:1/-1;">No Bonus Oddities logged yet — add documented error cards or printing anomalies here.</p>`;
    return;
  }
  $("odditiesGrid").innerHTML = state.oddities.map(o => `
    <div class="card-tile" data-oddid="${o.id}">
      <div class="card-tile-image">
        ${o.imageUrl ? `<img src="${esc(o.imageUrl)}" alt="${esc(o.cardName)}">` : `<span class="card-tile-placeholder">🧬</span>`}
        <span class="status-badge" style="background:${STATUS_COLORS[o.status] || STATUS_COLORS.NEED}">${o.status || "NEED"}</span>
        ${o.wishlistPriority === "High" ? `<span class="wishlist-badge">⭐</span>` : ""}
      </div>
      <div class="card-tile-info">
        <div class="card-tile-name">${esc(o.cardName)}</div>
        <div class="card-tile-set">${esc(o.anomalyType || "")}</div>
      </div>
    </div>`).join("");
  $("odditiesGrid").querySelectorAll(".card-tile").forEach(el => {
    el.addEventListener("click", () => openOddityEditor(Number(el.dataset.oddid)));
  });
}
function bindOddityAdd() {
  $("addOddityBtn").addEventListener("click", () => openOddityEditor(null));
}
function openOddityEditor(id) {
  const o = id ? state.oddities.find(x => x.id === id) : null;
  $("addExtraSheet").innerHTML = `
    <div class="sheet-handle"></div>
    <div class="sheet-close-row"><button id="closeExtraModal">✕</button></div>
    <h3 style="margin-bottom:14px;">${o ? "Edit" : "Add"} Bonus Oddity</h3>
    <div class="form-row"><label>Card name</label><input type="text" id="odName" value="${esc(o?.cardName || "")}"></div>
    <div class="form-row"><label>Anomaly type</label><input type="text" id="odType" value="${esc(o?.anomalyType || "")}" placeholder="Ink ghosting, dot-code error…"></div>
    <div class="form-row"><label>Status</label><select id="odStatus">${BONUS_STATUS_ORDER.map(s => `<option value="${s}" ${o?.status === s ? "selected" : ""}>${s}</option>`).join("")}</select></div>
    <div class="form-grid-2">
      <div class="form-row"><label>Qty owned</label><input type="number" min="0" id="odQty" value="${o?.qtyOwned ?? 0}"></div>
      <div class="form-row"><label>Price paid</label><input type="number" min="0" step="0.01" id="odPrice" value="${o?.pricePaid ?? ""}"></div>
    </div>
    <div class="form-grid-2">
      <div class="form-row"><label>Purchase date</label><input type="date" id="odDate" value="${o?.purchaseDate || ""}"></div>
      <div class="form-row"><label>Seller / source</label><input type="text" id="odSeller" value="${esc(o?.seller || "")}"></div>
    </div>
    <div class="form-row"><label>Condition</label><input type="text" id="odCondition" value="${esc(o?.condition || "")}"></div>
    <div class="form-row"><label>Wishlist priority</label>
      <select id="odWishlist"><option value="">None</option>${WISHLIST_LEVELS.map(w => `<option value="${w}" ${o?.wishlistPriority === w ? "selected" : ""}>${w}</option>`).join("")}</select>
    </div>
    <div class="form-row"><label>Image URL</label><input type="text" id="odImage" value="${esc(o?.imageUrl || "")}"></div>
    <div class="form-row"><label>Notes</label><textarea id="odNotes">${esc(o?.notes || "")}</textarea></div>
    <div class="detail-actions">
      ${o ? `<button class="primary-btn danger" id="deleteOddityBtn" style="flex:0 0 auto;">Delete</button>` : ""}
      <button class="primary-btn" id="saveOddityBtn">Save</button>
    </div>
  `;
  $("addExtraOverlay").classList.remove("hidden");
  $("closeExtraModal").addEventListener("click", () => $("addExtraOverlay").classList.add("hidden"));
  $("saveOddityBtn").addEventListener("click", async () => {
    const record = {
      cardName: $("odName").value.trim() || "Untitled oddity", anomalyType: $("odType").value.trim(),
      status: $("odStatus").value, qtyOwned: Number($("odQty").value) || 0,
      pricePaid: $("odPrice").value === "" ? null : Number($("odPrice").value),
      purchaseDate: $("odDate").value || null, seller: $("odSeller").value.trim() || null,
      condition: $("odCondition").value.trim() || null, wishlistPriority: $("odWishlist").value || null,
      imageUrl: $("odImage").value.trim() || null, notes: $("odNotes").value.trim() || null,
    };
    if (o) { await dbUpdateOddity(o.id, record); } else { await dbAddOddity(record); }
    state.oddities = await dbGetAllOddities();
    renderOddities(); refreshAllViews();
    $("addExtraOverlay").classList.add("hidden");
    toast("Saved");
  });
  if (o) {
    $("deleteOddityBtn").addEventListener("click", async () => {
      await dbDeleteOddity(o.id);
      state.oddities = await dbGetAllOddities();
      renderOddities();
      $("addExtraOverlay").classList.add("hidden");
      toast("Deleted");
    });
  }
}

// ===================== WISHLIST SCREEN =====================
function renderWishlistScreen() {
  const cards = getMergedCoreCards().filter(c => c.wishlistPriority === "High");
  const cameos = getMergedCameos().filter(c => c.wishlistPriority === "High");
  const extras = state.extras.filter(e => e.wishlistPriority === "High");
  const oddities = state.oddities.filter(o => o.wishlistPriority === "High");
  if (!cards.length && !cameos.length && !extras.length && !oddities.length) {
    $("wishlistGrid").innerHTML = `<p class="empty-hint" style="grid-column:1/-1;">Nothing flagged High priority yet — set it from any card's detail screen.</p>`;
    return;
  }
  let html = cards.map(cardTileHtml).join("");
  html += cameos.map(c => `
    <div class="card-tile" data-cameoid="${c.id}" data-custom="${c.isCustom ? "1" : "0"}">
      <div class="card-tile-image">${c.imageUrl ? `<img src="${esc(c.imageUrl)}">` : `<span class="card-tile-placeholder">👀</span>`}<span class="status-badge" style="background:${STATUS_COLORS[c.status]}">${c.status}</span></div>
      <div class="card-tile-info"><div class="card-tile-name">${esc(c.cardName)}</div><div class="card-tile-set">Cameo</div></div>
    </div>`).join("");
  html += extras.map(e => `
    <div class="card-tile" data-extraid="${e.id}">
      <div class="card-tile-image">${e.imageUrl ? `<img src="${esc(e.imageUrl)}">` : `<span class="card-tile-placeholder">🌟</span>`}<span class="status-badge" style="background:${STATUS_COLORS[e.status] || STATUS_COLORS.NEED}">${e.status || "NEED"}</span></div>
      <div class="card-tile-info"><div class="card-tile-name">${esc(e.cardName)}</div><div class="card-tile-set">Global Extra</div></div>
    </div>`).join("");
  html += oddities.map(o => `
    <div class="card-tile" data-oddid="${o.id}">
      <div class="card-tile-image">${o.imageUrl ? `<img src="${esc(o.imageUrl)}">` : `<span class="card-tile-placeholder">🧬</span>`}<span class="status-badge" style="background:${STATUS_COLORS[o.status] || STATUS_COLORS.NEED}">${o.status || "NEED"}</span></div>
      <div class="card-tile-info"><div class="card-tile-name">${esc(o.cardName)}</div><div class="card-tile-set">Bonus Oddity</div></div>
    </div>`).join("");
  $("wishlistGrid").innerHTML = html;
  $("wishlistGrid").querySelectorAll("[data-stablekey]").forEach(el => el.addEventListener("click", () => openCardDetail(el.dataset.stablekey)));
  $("wishlistGrid").querySelectorAll("[data-cameoid]").forEach(el => el.addEventListener("click", () => openCameoDetail(Number(el.dataset.cameoid), el.dataset.custom === "1")));
  $("wishlistGrid").querySelectorAll("[data-extraid]").forEach(el => el.addEventListener("click", () => openExtraEditor(Number(el.dataset.extraid))));
  $("wishlistGrid").querySelectorAll("[data-oddid]").forEach(el => el.addEventListener("click", () => openOddityEditor(Number(el.dataset.oddid))));
}

// ===================== MORE / SPENDING / DATA =====================
function bindMoreUI() {
  $("moreOdditiesBtn").addEventListener("click", () => { goToSubScreen("oddities", "Bonus Oddities"); });
  $("moreSpendingBtn").addEventListener("click", () => goToSubScreen("spending", "Spending"));
  $("moreDataBtn").addEventListener("click", () => goToSubScreen("data", "Backup & Data"));
  $("moreMigrationBtn").addEventListener("click", () => { renderMigrationScreen(); goToSubScreen("migration", "Migration Report"); });
  $("moreWishlistBtn").addEventListener("click", () => { renderWishlistScreen(); goToSubScreen("wishlist", "High-Priority Wishlist"); });
  $("moreAboutBtn").addEventListener("click", () => goToSubScreen("about", "About"));
  $("addExtraBtn").addEventListener("click", () => openExtraEditor(null));
  bindOddityAdd();
  bindCameoAdd();

  $("exportJsonBtn").addEventListener("click", exportJsonBackup);
  $("importJsonBtn").addEventListener("click", () => $("importFileInput").click());
  $("importFileInput").addEventListener("change", handleImportFile);
  $("exportCsvBtn").addEventListener("click", exportCsvBackup);
  $("resetDataBtn").addEventListener("click", confirmResetData);
}

function renderSpending() {
  const cards = getMergedCoreCards();
  const cameos = getMergedCameos();
  const extraCosts = state.extras.map(e => ({ species: "Extras", price: e.pricePaid, name: e.cardName, date: e.purchaseDate }));
  const oddityCosts = state.oddities.map(o => ({ species: "Oddities", price: o.pricePaid, name: o.cardName, date: o.purchaseDate }));

  const allSpends = [
    ...cards.filter(c => c.pricePaid).map(c => ({ species: c.species, price: c.pricePaid, name: c.cardVariant + " · " + c.language, date: c.purchaseDate })),
    ...cameos.filter(c => c.pricePaid).map(c => ({ species: "Cameos", price: c.pricePaid, name: c.cardName, date: c.purchaseDate })),
    ...extraCosts.filter(e => e.price),
    ...oddityCosts.filter(o => o.price),
  ];

  const total = allSpends.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  $("spendTotalValue").textContent = money(total);

  const bySpecies = {};
  allSpends.forEach(s => { bySpecies[s.species] = (bySpecies[s.species] || 0) + Number(s.price); });
  const order = ["Azurill", "Marill", "Azumarill", "Cameos", "Extras", "Oddities"];
  $("spendBySpecies").innerHTML = order.filter(sp => bySpecies[sp]).map(sp =>
    `<div class="spend-species-row"><span class="name">${SPECIES_EMOJI[sp] || "🌟"} ${sp}</span><span class="val">${money(bySpecies[sp])}</span></div>`
  ).join("") || `<p class="empty-hint">No purchases logged yet.</p>`;

  const recent = allSpends.filter(s => s.date).sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 8);
  $("spendRecent").innerHTML = recent.length
    ? recent.map(s => `<div class="recent-row"><span class="recent-row-text"><span class="recent-row-title">${esc(s.name)}</span><span class="recent-row-sub">${esc(s.date || "")}</span></span><span class="val" style="font-weight:800;color:var(--primary-dark);">${money(s.price)}</span></div>`).join("")
    : `<p class="empty-hint">Purchases you log with a price will appear here.</p>`;
}

async function exportJsonBackup() {
  const data = await dbExportAll();
  const blob = new Blob([JSON.stringify(data, null, 1)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `azumarill-collection-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast("Backup exported");
}

async function handleImportFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!data || (!data.ownership && !data.cameoOwnership && !data.globalExtras)) {
      toast("That file doesn't look like a valid backup");
      e.target.value = "";
      return;
    }
    state.pendingImportPayload = data;
    const diffResult = await dbComputeImportDiff(data);
    state.pendingImportDiff = diffResult;
    showImportConfirm(data, diffResult);
  } catch (err) {
    console.error(err);
    toast("Couldn't read that file");
  } finally {
    e.target.value = "";
  }
}
function showImportConfirm(data, diffResult) {
  const summary = summarizeImportPayload(data);
  const t = diffResult.totals;
  $("importConfirmSheet").innerHTML = `
    <div class="sheet-handle"></div>
    <div class="sheet-close-row"><button id="closeImportConfirm">✕</button></div>
    <h3 style="margin-bottom:10px;">Import this backup?</h3>
    <div class="data-card">
      <p><strong>Dataset:</strong> ${esc(summary.datasetVersion)}${summary.isLegacyFormat ? " (pre-audit format — will be migrated automatically)" : ""}</p>
      <p><strong>Exported:</strong> ${esc(summary.exportedAt)}</p>
      <p><strong>Contains:</strong> ${summary.counts.core} Core record(s), ${summary.counts.cameos} built-in cameo update(s), ${summary.counts.customCameos} custom cameo(s), ${summary.counts.extras} Global Extra(s), ${summary.counts.oddities} Bonus Oddit${summary.counts.oddities === 1 ? "y" : "ies"}.</p>
    </div>
    <div class="data-card">
      <p><strong>${t.new}</strong> new record(s) will be added.</p>
      <p><strong>${t.update}</strong> record(s) will be updated (the backup version is newer).</p>
      <p><strong>${t.conflict}</strong> conflict(s) — your on-device version is newer than the backup's.</p>
      ${t.unchanged ? `<p>${t.unchanged} record(s) are already identical.</p>` : ""}
    </div>
    ${t.conflict ? `
    <div class="data-card">
      <p><strong>For those ${t.conflict} conflict(s):</strong></p>
      <div class="form-row">
        <select id="conflictModeSelect">
          <option value="preferLocal" selected>Keep my newer on-device data (recommended)</option>
          <option value="preferBackup">Use the backup version instead</option>
        </select>
      </div>
    </div>` : ""}
    <p class="screen-intro">Your card database stays the same either way. This can't be undone unless you have another backup.</p>
    <div class="detail-actions">
      <button class="primary-btn secondary" id="cancelImportBtn">Cancel</button>
      <button class="primary-btn" id="confirmImportBtn">Import</button>
    </div>
  `;
  $("importConfirmOverlay").classList.remove("hidden");
  $("closeImportConfirm").addEventListener("click", () => $("importConfirmOverlay").classList.add("hidden"));
  $("cancelImportBtn").addEventListener("click", () => $("importConfirmOverlay").classList.add("hidden"));
  $("confirmImportBtn").addEventListener("click", doImport);
}
async function doImport() {
  const diffResult = state.pendingImportDiff;
  if (!diffResult) return;
  const mode = $("conflictModeSelect") ? $("conflictModeSelect").value : "preferLocal";
  try {
    const result = await dbApplyImportDiff(diffResult, mode);
    const [ownership, cameoOwnership, customCameos, extras, oddities, migrationReport] = await Promise.all([
      dbGetAllOwnership(), dbGetAllCameoOwnership(), dbGetAllCustomCameos(), dbGetAllExtras(), dbGetAllOddities(), dbGetMigrationReport(),
    ]);
    state.ownership = ownership;
    state.cameoOwnership = cameoOwnership;
    state.customCameos = customCameos;
    state.extras = extras;
    state.oddities = oddities;
    state.migrationReport = migrationReport;
    refreshAllViews(); renderCameos(); renderOddities(); renderGlobalExtras();
    $("importConfirmOverlay").classList.add("hidden");
    const skippedNote = result.skippedConflicts ? ` (${result.skippedConflicts} conflict(s) kept your newer local data)` : "";
    toast(result.unmatchedFromImport
      ? `Imported — ${result.unmatchedFromImport} record(s) need a manual look`
      : `Imported ${result.applied} record(s)${skippedNote}`);
  } catch (err) {
    console.error(err);
    toast("Import failed");
  }
}

function csvEscape(v) {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function exportCsvBackup() {
  const cards = getMergedCoreCards();
  const cameos = getMergedCameos();
  const rows = [["Section", "Species/Card", "Status", "Qty", "Price Paid", "Purchase Date", "Seller", "Condition", "Notes"]];
  cards.forEach(c => rows.push(["Core", `${c.species} - ${c.cardVariant} (${c.language}) ${c.stableKey}`, c.status, c.qtyOwned, c.pricePaid, c.purchaseDate, c.seller, c.condition, c.notes]));
  cameos.forEach(c => rows.push(["Cameo", c.cardName, c.status, c.qtyOwned, c.pricePaid, c.purchaseDate, c.seller, c.condition, c.notes]));
  state.extras.forEach(e => rows.push(["Global Extra", e.cardName, e.status, e.qtyOwned, e.pricePaid, e.purchaseDate, e.seller, e.condition, e.notes]));
  state.oddities.forEach(o => rows.push(["Bonus Oddity", o.cardName, o.status, o.qtyOwned, o.pricePaid, o.purchaseDate, o.seller, o.condition, o.notes]));
  const csv = rows.map(r => r.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `azumarill-collection-spending-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast("CSV exported");
}

function confirmResetData() {
  if (!confirm("This clears every status, price, and note you've entered. Your card database stays intact. Continue?")) return;
  if (!confirm("Really reset? This can't be undone unless you have a backup exported.")) return;
  dbResetAll().then(async () => {
    state.ownership = new Map();
    state.cameoOwnership = new Map();
    state.customCameos = [];
    state.extras = [];
    state.oddities = [];
    refreshAllViews(); renderCameos(); renderOddities(); renderGlobalExtras();
    toast("Collection data reset");
  });
}

function updateAboutInfo() {
  $("aboutSourceInfo").textContent = `${MASTER_CORE_CARDS.length} Core cards and ${MASTER_CAMEOS.length} cameo cards, loaded from dataset ${MASTER_DATASET_LABEL}.`;
}
function updateDatasetInfo() {
  $("datasetInfo").innerHTML = `Frozen dataset <strong>${esc(MASTER_DATASET_LABEL)}</strong> · ${MASTER_CORE_CARDS.length} Core cards · Stable IDs AZF-001 through AZF-${String(MASTER_CORE_CARDS.length).padStart(3, "0")}.`;
}
async function updateStorageInfo() {
  const privacyNote = `Your personal collection data is stored locally on this device and isn't uploaded anywhere. The only exception is the optional "Find image" lookup on English Core cards, which sends a set name and card number (not your ownership/purchase/notes data) to the Pokémon TCG API. Export a backup to keep your data safe.`;
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const est = await navigator.storage.estimate();
      const usedKB = ((est.usage || 0) / 1024).toFixed(0);
      $("storageInfo").textContent = `Using about ${usedKB} KB on this device, stored locally in IndexedDB. ${privacyNote}`;
    } else {
      $("storageInfo").textContent = privacyNote;
    }
  } catch {
    $("storageInfo").textContent = privacyNote;
  }
}

// ===================== MODALS =====================
function bindModals() {
  [$("cardModalOverlay"), $("filterModalOverlay"), $("addExtraOverlay"), $("importConfirmOverlay")].forEach(overlay => {
    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.classList.add("hidden"); });
  });
}

// ===================== SERVICE WORKER =====================
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(err => console.warn("SW registration failed", err));
    });
  }
}

// Expose app state on window for debugging in the browser console and for
// the reproducible audit script in /tests -- read-only convenience, the
// app itself always references the bare `state` binding internally.
window.state = state;
window.emptyFilters = emptyFilters;

// ===================== BOOT =====================
document.addEventListener("DOMContentLoaded", init);
