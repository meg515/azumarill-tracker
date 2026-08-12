# Migration Notes — old numeric IDs → AZF stable IDs

## Why this exists

The previous version of the tracker keyed your saved data (status, price, notes, etc.) by a plain numeric row position (1–179) from the old 179-row dataset. The newly-audited dataset has 257 rows in a different order with real permanent IDs (AZF-001..AZF-257). A raw row-position match would silently attach your old "card #47" data to whatever happens to be row 47 in the new sheet — almost certainly the wrong card. This migration avoids that.

## How it works

1. On first load after this update, the app checks whether any old-format data exists in your phone's storage.
2. If it does, each old record is matched against the new 257-card dataset using **species + set/product + card number + language** — the same four fields a human would use to recognize "this is the same card."
3. **Confident match (exactly one candidate):** migrated automatically to the new AZF ID, carrying over status, quantity, price, purchase date, seller, condition, notes, and any manual image URL.
4. **Split match (the old row now maps to more than one new row, e.g. a set that got split into separate Standard + Reverse Holo rows):** if exactly one of the candidates is the plain/standard finish, your old data migrates there, and the card gets a note that a separate finish variant now exists as its own target you may want to check.
5. **No confident match:** nothing is guessed. The old record — with its full personal data intact — is preserved in the **Migration Report** (More → Migration Report) so you can manually re-apply it to the right card, or decide it no longer applies (e.g. a language that the audit determined was never actually released).
6. The old data store itself is **never deleted** — it's simply no longer read from going forward. Nothing you entered before this update can be lost by this process.

## Import migration

The same logic runs automatically if you import a JSON backup that was exported from the old (pre-audit) version of the app — you don't need to do anything differently. The app detects the old format by checking whether the backup's records use `coreId` (old) or `stableKey` (new), and migrates on the fly during import.

## Status downgrade note

The old dataset allowed a `VERIFY` status on Core cards; the newly-audited Core dataset has zero VERIFY rows by design (the audit resolved them all). Any old record you'd marked VERIFY is migrated with status reset to `NEED` — nothing is silently marked OWNED or otherwise upgraded.

## Tested behavior

An automated test seeded three representative old-format records (a clean one-to-one match, a language that no longer exists in the new dataset, and a genuinely ambiguous multi-candidate case) and confirmed:
- The clean match migrated with its status and notes intact.
- The other two landed in the Migration Report, untouched and undeleted.

If your current on-device data is empty (a fresh install, or you hadn't recorded anything yet in the old version), migration will simply have nothing to do — you'll see 0 matched / 0 unmatched, which is expected and not an error.

---

## v3 patch addendum

### Custom Cameos — nothing to migrate, but worth knowing

Before this patch, a manually-added Cameo's card definition was never actually saved to
IndexedDB — only its status/notes/etc. were. That means if you added a custom Cameo in the
v2 build, it was already gone the next time you reloaded the app (that was the bug). There
is nothing to recover from that period, because the data genuinely wasn't persisted. Going
forward, custom Cameos are fully self-contained records in their own IndexedDB store and
survive reload, backup/restore, and app updates normally.

### Backup import is now conflict-safe

Older versions replaced all on-device data wholesale on import. As of this patch, import
first computes a diff against what's already on your device (by comparing `updatedAt`
timestamps) and shows you counts of new / updated / conflicting records before anything is
written. Conflicts — where your on-device record is newer than the one in the backup file —
default to keeping your on-device version; you can explicitly choose to use the backup
version instead from a dropdown on the same screen. This applies across Core, Cameos,
custom Cameos, Global Extras, and Bonus Oddities.

If you're restoring onto a brand-new install with nothing on-device yet, every record in the
backup will simply show as "new" — there's nothing to conflict with.
