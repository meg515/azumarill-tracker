// Metadata for Special Collections tiles. Keys must match the strings used
// in each card's funCollections array (see master-data.js). Computed live
// from the 257 Core records only -- a tag with zero matching cards just
// won't render a tile.
const FUN_COLLECTIONS_META = [
  { key: "Asako Ito", emoji: "🧶", blurb: "Cards illustrated by Asako Ito." },
  { key: "Yuka Morii", emoji: "🪨", blurb: "Clay-model art by Yuka Morii." },
  { key: "McDonald's", emoji: "🍟", blurb: "Official McDonald's TCG releases." },
  { key: "Southern Islands", emoji: "🏝", blurb: "The Southern Islands special set." },
  { key: "Airline Promo", emoji: "✈️", blurb: "Official airline distribution promos." },
  { key: "e-Reader", emoji: "📡", blurb: "e-Card / e-Reader era printings." },
  { key: "Light Pokémon", emoji: "✨", blurb: "Neo Destiny's Light Pokémon mechanic." },
  { key: "Regional Exclusives", emoji: "🌏", blurb: "Unique Thai, Indonesian, Chinese, and other regional releases." },
  { key: "Stamped Cards", emoji: "🏷", blurb: "Official stamps that change the physical card." },
  { key: "Illustration / Art Rare", emoji: "🖼", blurb: "Modern showcase artwork prints." },
  { key: "Japanese Exclusives", emoji: "🗾", blurb: "Releases that only ever existed in Japan." },
  { key: "Prize Pack", emoji: "🎖", blurb: "Play! Pokémon Prize Pack parallels." },
  { key: "Deck-Exclusive Cards", emoji: "🃏", blurb: "Cards only ever issued inside a specific deck product." },
];
