# AUDIT REPORT — Azurill → Marill → Azumarill Tracker (v3 patch)
Dataset: **AZF-2026-08-10-v1** (AZF-257 field-mapping corrected) · Audited: 2026-08-12

This is a patch to the previously-delivered v2 project, addressing an independent audit's
findings. Nothing was rebuilt from scratch. All checks below were verified by the
reproducible script at `tests/audit.mjs` — run `cd tests && npm install && npm test` to
reproduce this report yourself. Where a check isn't fully automatable (mostly visual/manual
mobile-layout judgment), that's noted explicitly.

## What was fixed in this patch

1. **Custom Cameo persistence bug (highest priority)** — user-added Cameos were pushed into
   the in-memory `MASTER_CAMEOS` array, which resets on every reload; only their ownership
   fields were ever saved to IndexedDB, so the actual card definition could vanish. Fixed by
   adding a new `customCameos` IndexedDB store that holds the complete self-contained record
   (id, cardName, featuredMember, product, cardNumber, language, cameoType, image, status,
   qty, price, purchase date, seller, condition, notes, wishlist priority, createdAt,
   updatedAt). Built-in seed Cameos are unaffected.
2. **Conflict-safe backup import** — import now computes a diff (new / updated / conflict)
   by comparing `updatedAt` timestamps between the incoming file and on-device data, across
   Core, Cameos, custom Cameos, Global Extras, and Bonus Oddities. Conflicts (local data
   newer than the backup) default to keeping the local version; you can explicitly choose
   "use the backup version" instead. The confirmation screen shows the new/updated/conflict
   counts before anything is written.
3. **AZF-257 field-mapping correction** — "Narumi Sato" (the card's real illustrator, per a
   web search cross-referencing artofpkm.com and a retailer listing) was sitting in the
   Pack/Product Status field. Corrected to Pack/Product Status = "Current sealed possible",
   Best Way to Get It = the standard current-set guidance text used by every other
   "Current sealed possible" row, added a proper `artist` field, and fixed a stale Source
   URL to a verified working Bulbapedia page. Stable ID (AZF-257) and the 257-card total are
   unchanged. The same correction was applied to a corrected copy of the source spreadsheet.
4. **Bonus Oddities field parity** — added purchase date, seller, condition, and wishlist
   priority to match Global Extras; all persist to IndexedDB and appear in JSON/CSV export.
5. **README/in-app privacy wording** — corrected the absolute "nothing leaves your phone"
   claim to accurately describe the optional Pokémon TCG API image lookup.
6. **Reproducible audit script** — added at `tests/audit.mjs`, see `tests/README.md`.

### Two bugs found and fixed while patching

**A critical blank-screen bug (not part of the requested fixes, found via a real-browser
visual pass after the jsdom-based patch was otherwise complete).** `init()` never marked any
`.screen` element as `.screen-active` on first load — only tapping a bottom-nav button did
that. Since `.screen` defaults to `display: none`, the app opened to a fully blank page below
the header until the user tapped a nav item once. This had been present since the very first
delivery; it was invisible to the jsdom-based test suite because jsdom couldn't load the
external stylesheet in that environment, so `display: none` was never actually applied there
— every element looked "present" to the DOM checks even though it would render blank in a
real browser. Caught by taking real screenshots with headless Chromium at an iPhone viewport
after the rest of the patch was done, specifically because a visual pass hadn't been done
yet. Fixed with one line (`goToTab("home")` at the end of `init()`) and a new regression
check (`28b`) that verifies a screen is actually activated on boot, so this class of bug is
now caught by the automated suite too, not just a screenshot.

**A status-save race condition**, found while building the reproducible test for the
unsaved-field-loss fix: tapping a status button and then tapping Save in very quick
succession could fire two concurrent `dbSetOwnership` writes, and the second (Save) could
occasionally read a stale pre-status-write record and overwrite the status back. Fixed by
having Save always write the status currently shown in the picker explicitly, rather than
relying on the earlier write having already landed. This applies to both Core cards and
Cameos.

## Full 37-item checklist

| # | Check | Result |
|---|---|---|
| 1 | 257/257 Core records imported | **PASS** |
| 2 | 257 unique Stable IDs | **PASS** |
| 3 | AZF-001 through AZF-257 with no gaps | **PASS** |
| 4 | Azurill = 21 | **PASS** |
| 5 | Marill = 124 | **PASS** |
| 6 | Azumarill = 112 | **PASS** |
| 7 | English = 97 | **PASS** |
| 8 | Japanese = 83 | **PASS** |
| 9 | Spanish = 61 | **PASS** |
| 10 | Chinese = 9 | **PASS** |
| 11 | Thai = 4 | **PASS** |
| 12 | Indonesian = 3 | **PASS** |
| 13 | Core denominator = 257 | **PASS** |
| 14 | Only OWNED counts toward Core completion | **PASS** |
| 15 | Cameos do not affect Core completion | **PASS** |
| 16 | Global Extras do not affect Core completion | **PASS** |
| 17 | Bonus Oddities do not affect Core completion | **PASS** |
| 18 | IndexedDB persistence still works | **PASS** |
| 19 | Core personal data still persists | **PASS** |
| 20 | Wishlist priority still persists | **PASS** |
| 21 | Status changes do not wipe unsaved modal fields | **PASS** (race-condition fix applied — see above) |
| 22 | Filters still work | **PASS** |
| 23 | Hunt Next still works | **PASS** |
| 24 | Manual image overrides still persist | **PASS** |
| 25 | CSV export still works | **PASS** |
| 26 | JSON export/import still works | **PASS** |
| 27 | PWA manifest and service worker still work | **PASS** (cache bumped to v3 for the new files) |
| 28 | Mobile layout still works at iPhone widths | **PASS** — verified with real screenshots (headless Chromium, 390×844 viewport) across Home, Collection, Filters, card detail, Specials, Cameos, More, Backup & Data, Bonus Oddities, and Hunt Next, after fixing the blank-initial-screen bug described above |
| 29 | Acquisition/search fields remain intact | **PASS** |
| 30 | Migration support for older tracker data remains intact | **PASS** |
| 31 | Custom Cameo survives reload | **PASS** |
| 32 | Custom Cameo survives JSON backup/restore | **PASS** |
| 33 | Older backup cannot silently overwrite newer local data | **PASS** |
| 34 | Bonus Oddities save all collector fields | **PASS** |
| 35 | AZF-257 has correct field mapping | **PASS** |
| 36 | AZF-257 remains AZF-257 | **PASS** |
| 37 | Core count remains exactly 257 | **PASS** |

**Every item passes — see `tests/audit.mjs` output for the exact reproducible run (50
checks total once sub-checks are included; every one passes).**

## Files changed in this patch

- `js/db.js` — new `customCameos` store (schema bumped to v3), conflict-safe
  `dbComputeImportDiff`/`dbApplyImportDiff`, `createdAt` stamping added to Global Extras and
  Bonus Oddities on creation, `DB` and other internals exposed on `window` for the test
  script.
- `js/app.js` — custom Cameo CRUD wired to the new store instead of mutating
  `MASTER_CAMEOS`; conflict-aware import confirmation screen; Bonus Oddities editor extended
  with purchase date/seller/condition/wishlist; status-save race condition fixed for both
  Core and Cameo detail screens; artist badge added to card detail; privacy wording
  corrected; **`init()` now activates the initial screen** (`goToTab("home")`), fixing a
  blank-page-on-launch bug present since the first delivery.
- `data/master-data.js` — AZF-257 corrected (packStatus, acquisition text, new `artist`
  field, source URL); `MASTER_DATA_VERSION` bumped to 3.
- `Azurill_Marill_Azumarill_MASTER_FINAL_2026-08-10_CORRECTED.xlsx` — new file, the source
  spreadsheet with the same AZF-257 row corrected (Pack/Product Status, Best Way to Get It,
  Source URL, and an `Artist=Narumi Sato` tag added to Notes following the sheet's existing
  `StableKey=` convention). All other 256 rows byte-for-byte unchanged.
- `sw.js` — cache name bumped to v3, new store/file additions don't change the precache
  list (no new static files were added).
- `README.md` — install instructions unchanged; privacy wording corrected.
- `tests/` — new: `audit.mjs`, `package.json`, `README.md`.

## Known limitations (carried over, still accurate)

- Era is best-effort for 24 of 257 cards (unchanged from the prior audit — this patch didn't
  touch era derivation).
- Card images: still no images pre-fetched; the on-device Pokémon TCG API lookup for
  English cards is unchanged. See `UNRESOLVED_IMAGES.md`.
- Hunt Next's "smart to bundle from one seller" grouping remains a simple keyword heuristic
  on the acquisition text, not a real-time marketplace analysis.
- No other contradictions were found in the frozen 257-card dataset during this patch. AZF-257
  was the only record with a field-mapping issue; no Pokémon cards were added, removed, or
  renumbered.
