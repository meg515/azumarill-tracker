# Unresolved Image Matches

## Summary

No card images were pre-fetched or hardcoded during this build. Every card ships with an attractive placeholder until you either add an image yourself or use the in-app matcher. This was a deliberate choice, explained below.

| Group | Count | Status |
|---|---|---|
| English-language Core cards | 97 | Eligible for on-device auto-match (see below) — **all 97 currently unmatched until you tap "Find image"** |
| Japanese-language Core cards | 83 | Manual URL only, by design |
| Spanish-language Core cards | 61 | Manual URL only, by design |
| Chinese / Thai / Indonesian regional cards | 16 | Manual URL only, by design |
| Cameos | 2 | Manual URL only |
| **Total unresolved at ship time** | **257 / 257** | All start as placeholders |

## Why nothing was pre-matched

Your instructions were explicit: don't guess image matches, prefer a lawful programmatic data source over scraping, and never substitute an English image for a Japanese or Spanish card. Confidently pre-matching even just the 97 English cards would have meant either scraping retailer sites (against their terms, and against your instructions) or making ~100 individual calls to a card-data API and eyeballing each result for correctness without the ability to visually verify them myself in this environment — exactly the "guessing" you asked me not to do.

## How image matching actually works in the app

- **English-language Core cards** show a **"Find image (Pokémon TCG API)"** button on their detail screen. Tapping it makes a live request, from your phone, to the public [Pokémon TCG API](https://pokemontcg.io) (`api.pokemontcg.io`) — a data source built specifically for programmatic access, not a scrape. It searches by the card's set name and number. If it finds a match, you see a preview and tap **"Use this image"** to confirm it — nothing is saved automatically. If there's no confident match, it tells you plainly instead of guessing.
- **Japanese, Spanish, and regional-language cards** don't get this button at all. The Pokémon TCG API's non-English coverage isn't reliable enough to auto-match without visual confirmation I can't perform, and showing an English card's art on a Japanese or Spanish entry would misrepresent what you actually own. These cards are manual-URL-only.
- **Any card, any language** can have an image URL typed in manually at any time — that's stored as `imageSource: "manual"` versus `"auto-matched"` for ones you confirmed via the API, so you can always tell which is which.
- Manual and auto-matched images both persist through refresh, and are both included in JSON backup/import.

## If you'd like this pre-populated instead

If you want me to run the English-card matching pass for you now rather than doing it card-by-card on your phone, say so — I can do it in this session with your explicit go-ahead per match (or in bulk with spot-checks), rather than shipping it as an on-device feature.

---

## v3 patch note

Image handling was not part of this patch's required fixes and is unchanged from the prior
audit — the counts and behavior described above are still accurate as of 2026-08-12. The
only image-related change in this patch is that manual image overrides on custom Cameos now
actually persist correctly (see `MIGRATION_NOTES.md`), since the whole custom Cameo record
— including its image field — is now saved to IndexedDB instead of being lost on reload.
