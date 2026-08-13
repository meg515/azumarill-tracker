# Azurill → Marill → Azumarill Collection Tracker

A mobile-first, installable Pokédex-style tracker for your Azurill family TCG collection. This build runs on the frozen, fully audited dataset **AZF-2026-08-10-v1** (257 Core cards, with AZF-257's field-mapping error corrected — see `AUDIT_REPORT.md`).

If you're updating from an earlier version: your old saved data is migrated automatically the first time you open this build — see `MIGRATION_NOTES.md`. Nothing is deleted.

## What's confirmed

See `AUDIT_REPORT.md` for the full PASS/FAIL against all 37 required checks. Short version: **everything required passes**, verified by a reproducible script — see `tests/README.md` to run it yourself.

Also see:
- `MIGRATION_NOTES.md` — how old saved data maps onto the new stable IDs, and how backup import now protects newer on-device data
- `UNRESOLVED_IMAGES.md` — why images start as placeholders and how the in-app matcher works
- `Azurill_Marill_Azumarill_MASTER_FINAL_2026-08-10_CORRECTED.xlsx` — the source spreadsheet with AZF-257's field-mapping issue corrected to match the app

## Installing on your iPhone

1. Get the whole `azumarill-tracker` folder onto your phone somewhere reachable by Safari — easiest is uploading it to iCloud Drive, Google Drive, or Dropbox, or serving it from a free static host (GitHub Pages, Netlify, Vercel all work with drag-and-drop).
   - It **will not work by just double-tapping index.html in Files** — Safari needs to load it over `http://` or `https://`, not `file://`, for storage and the service worker to behave.
   - The fastest no-fuss option: drag the folder onto [Netlify Drop](https://app.netlify.com/drop) from a computer — it gives you a live `https://` link in seconds, free, no account required.
2. Open that link in **Safari** on your iPhone (not Chrome — Add to Home Screen needs Safari on iOS).
3. Tap the **Share** button (square with an arrow) → **Add to Home Screen** → **Add**.
4. Launch it from your Home Screen icon from now on. It opens full-screen, works offline, and remembers everything you enter. Your personal collection data is stored locally on your device. Optional external services may be contacted for features such as card-image lookup, but your ownership, purchase, notes, and collection records are not uploaded as part of those lookups.

**If you already had the previous version installed:** just replace the files at the same hosting location and relaunch from your existing Home Screen icon. The service worker cache is versioned, so it'll pick up the new files automatically; your saved data migrates in place the first time it loads.

## Using it

- **Home** — overall Core progress ring, species breakdown, English/Japanese/Spanish + Regional Exclusives progress, Special Collections preview, recent activity.
- **Collection** — browse/filter all 257 Core cards. Tap **Filters** for species, status, language, region, era, fun collection, difficulty, wishlist priority, and finish type (reverse holo, holo, mirror, stamped, 1st Edition, Unlimited, promo). Tap **Hunt Next** for collecting-help sections: easy/medium needs, currently-obtainable-in-packs, same-set bundling, same-seller bundling, and your High-priority wishlist.
- **Specials** — mini progress trackers for Asako Ito, Yuka Morii, McDonald's, Southern Islands, Airline Promo, e-Reader, Light Pokémon, Regional Exclusives, Stamped Cards, Illustration/Art Rare, Japanese Exclusives, Prize Pack, and Deck-Exclusive Cards — plus Global Extras (manual add-your-own translated duplicates, never affects Core %).
- **Cameos** — bonus-only cards featuring the family in someone else's artwork. Add your own with the **+ Add a cameo** button — custom Cameos are fully saved (not just their status) and survive reload, backup, and updates.
- **More** — Bonus Oddities (error cards/printing anomalies, bonus-only, with the same full collector fields as Global Extras), Spending, Backup & Data, Migration Report, High-priority wishlist, About.

Every card detail screen has a status picker (NEED/OWNED/ORDERED/SKIP for Core; adds VERIFY for Cameos/Extras/Oddities), qty/price/date/seller/condition/notes/wishlist fields, a **Copy Search** button for the pasteable search term, marketplace links, and — for English-language Core cards only — a **Find image** button that looks up official card art live from the Pokémon TCG API and asks you to confirm before saving it.

Tapping a status button saves instantly and never wipes anything you've typed elsewhere on the screen; all other fields save together when you tap **Save**.

## Updating the card database later

Card data lives in `data/master-data.js`, completely separate from your personal ownership data (which lives in the browser's IndexedDB, keyed by the permanent `AZF-###` stable ID). You can replace `master-data.js` with a future export any time — your statuses, prices, and notes won't be touched, as long as future updates keep existing AZF IDs stable and only append new ones (AZF-258, AZF-259, ...). Bump `MASTER_DATA_VERSION` and `MASTER_DATASET_LABEL` at the top of that file when you do.

## Backing up

More → Backup & Data → **Export JSON backup** regularly (especially before you update the master data file). Keep the file somewhere off your phone — iCloud, email to yourself, wherever. **Import** shows you a summary of what's in the file (dataset version, record counts, and how many records are new/updated/conflicting against what's already on your device) before writing anything. If a record in the backup is older than what's already on your device, it's kept as a conflict and your newer data is protected by default — you can explicitly choose to use the backup version instead if you want to. Old-format (pre-audit) backups are migrated automatically the same way on-device data is.

## Running the audit yourself

`tests/audit.mjs` is a reproducible, automated script that verifies the dataset and drives the actual app code (not just spot-checks) through create/reload/edit/export/import flows. See `tests/README.md`.

## Known limitations

Short version — see `AUDIT_REPORT.md` for the full list:
- Era is derived best-effort from the Master Inventory sheet; 24 of 257 cards show "Unknown" era rather than a guess.
- No card images were pre-fetched during this build — see `UNRESOLVED_IMAGES.md` for why, and how the in-app matcher works instead.
