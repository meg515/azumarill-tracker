// Old v1 dataset descriptors (coreId 1-179), used ONLY as a one-time migration lookup
// so legacy IndexedDB records (keyed by old numeric coreId) can be matched to the
// new AZF-### stable-keyed dataset. Not used for anything else.
const LEGACY_V1_LOOKUP = [
 {
  "oldCoreId": 1,
  "species": "Azurill",
  "cardVariant": "Azurill",
  "product": "EX Sandstorm",
  "cardNumber": "31/100",
  "language": "English"
 },
 {
  "oldCoreId": 2,
  "species": "Azurill",
  "cardVariant": "Azurill",
  "product": "EX Sandstorm",
  "cardNumber": "31/100",
  "language": "Spanish"
 },
 {
  "oldCoreId": 3,
  "species": "Azurill",
  "cardVariant": "Azurill",
  "product": "Miracle of the Desert",
  "cardNumber": "041/053",
  "language": "Japanese"
 },
 {
  "oldCoreId": 4,
  "species": "Azurill",
  "cardVariant": "Azurill",
  "product": "EX Delta Species",
  "cardNumber": "20/113",
  "language": "English"
 },
 {
  "oldCoreId": 5,
  "species": "Azurill",
  "cardVariant": "Azurill",
  "product": "EX Delta Species",
  "cardNumber": "20/113",
  "language": "Spanish"
 },
 {
  "oldCoreId": 6,
  "species": "Azurill",
  "cardVariant": "Azurill",
  "product": "Holon Research Tower",
  "cardNumber": "066/086",
  "language": "Japanese"
 },
 {
  "oldCoreId": 7,
  "species": "Azurill",
  "cardVariant": "Azurill",
  "product": "Diamond & Pearl",
  "cardNumber": "69/130",
  "language": "English"
 },
 {
  "oldCoreId": 8,
  "species": "Azurill",
  "cardVariant": "Azurill",
  "product": "Diamond & Pearl",
  "cardNumber": "69/130",
  "language": "Spanish"
 },
 {
  "oldCoreId": 9,
  "species": "Azurill",
  "cardVariant": "Azurill",
  "product": "Space-Time Creation",
  "cardNumber": null,
  "language": "Japanese"
 },
 {
  "oldCoreId": 10,
  "species": "Azurill",
  "cardVariant": "Azurill",
  "product": "Cosmic Eclipse",
  "cardNumber": "146/236",
  "language": "English"
 },
 {
  "oldCoreId": 11,
  "species": "Azurill",
  "cardVariant": "Azurill",
  "product": "Cosmic Eclipse",
  "cardNumber": "146/236",
  "language": "Spanish"
 },
 {
  "oldCoreId": 12,
  "species": "Azurill",
  "cardVariant": "Azurill",
  "product": "Alter Genesis",
  "cardNumber": "057/095",
  "language": "Japanese"
 },
 {
  "oldCoreId": 13,
  "species": "Azurill",
  "cardVariant": "Azurill",
  "product": "Storm Emeralda",
  "cardNumber": "054/076",
  "language": "Japanese"
 },
 {
  "oldCoreId": 14,
  "species": "Azurill",
  "cardVariant": "Azurill",
  "product": "Shining Synergy - Summon",
  "cardNumber": "082",
  "language": "Chinese"
 },
 {
  "oldCoreId": 15,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Wizards Black Star Promos",
  "cardNumber": "29",
  "language": "English"
 },
 {
  "oldCoreId": 16,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Wizards Black Star Promos",
  "cardNumber": "29",
  "language": "Spanish"
 },
 {
  "oldCoreId": 17,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Unnumbered Promotional cards",
  "cardNumber": null,
  "language": "Japanese"
 },
 {
  "oldCoreId": 18,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Neo Genesis",
  "cardNumber": "66/111",
  "language": "English"
 },
 {
  "oldCoreId": 19,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Neo Genesis",
  "cardNumber": "66/111",
  "language": "Spanish"
 },
 {
  "oldCoreId": 20,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Gold, Silver, to a New World...",
  "cardNumber": null,
  "language": "Japanese"
 },
 {
  "oldCoreId": 21,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Southern Islands",
  "cardNumber": "11/18",
  "language": "English"
 },
 {
  "oldCoreId": 22,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Southern Islands",
  "cardNumber": "11/18",
  "language": "Spanish"
 },
 {
  "oldCoreId": 23,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Southern Islands",
  "cardNumber": null,
  "language": "Japanese"
 },
 {
  "oldCoreId": 24,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Expedition Base Set",
  "cardNumber": "120/165",
  "language": "English"
 },
 {
  "oldCoreId": 25,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Expedition Base Set",
  "cardNumber": "120/165",
  "language": "Spanish"
 },
 {
  "oldCoreId": 26,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Base Expansion Pack",
  "cardNumber": "013/128",
  "language": "Japanese"
 },
 {
  "oldCoreId": 27,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Aquapolis",
  "cardNumber": "53/147",
  "language": "English"
 },
 {
  "oldCoreId": 28,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Aquapolis",
  "cardNumber": "53/147",
  "language": "Spanish"
 },
 {
  "oldCoreId": 29,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "The Town on No Map",
  "cardNumber": "024/092",
  "language": "Japanese"
 },
 {
  "oldCoreId": 30,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "EX Sandstorm",
  "cardNumber": "68/100",
  "language": "English"
 },
 {
  "oldCoreId": 31,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "EX Sandstorm",
  "cardNumber": "68/100",
  "language": "Spanish"
 },
 {
  "oldCoreId": 32,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Miracle of the Desert",
  "cardNumber": "016/053",
  "language": "Japanese"
 },
 {
  "oldCoreId": 33,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "EX Team Rocket Returns",
  "cardNumber": "68/109",
  "language": "English"
 },
 {
  "oldCoreId": 34,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "EX Team Rocket Returns",
  "cardNumber": "68/109",
  "language": "Spanish"
 },
 {
  "oldCoreId": 35,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Rocket Gang Strikes Back",
  "cardNumber": "023/084",
  "language": "Japanese"
 },
 {
  "oldCoreId": 36,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "EX Delta Species",
  "cardNumber": "76/113",
  "language": "English"
 },
 {
  "oldCoreId": 37,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "EX Delta Species",
  "cardNumber": "76/113",
  "language": "Spanish"
 },
 {
  "oldCoreId": 38,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Holon Research Tower Water Quarter Deck",
  "cardNumber": "004/015",
  "language": "Japanese"
 },
 {
  "oldCoreId": 39,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Diamond & Pearl",
  "cardNumber": "88/130",
  "language": "English"
 },
 {
  "oldCoreId": 40,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Diamond & Pearl",
  "cardNumber": "88/130",
  "language": "Spanish"
 },
 {
  "oldCoreId": 41,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Space-Time Creation",
  "cardNumber": null,
  "language": "Japanese"
 },
 {
  "oldCoreId": 42,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "HeartGold & SoulSilver",
  "cardNumber": "74/123",
  "language": "English"
 },
 {
  "oldCoreId": 43,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "HeartGold & SoulSilver",
  "cardNumber": "74/123",
  "language": "Spanish"
 },
 {
  "oldCoreId": 44,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "SoulSilver Collection",
  "cardNumber": "024/070",
  "language": "Japanese"
 },
 {
  "oldCoreId": 45,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Boundaries Crossed",
  "cardNumber": "36/149",
  "language": "English"
 },
 {
  "oldCoreId": 46,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Boundaries Crossed",
  "cardNumber": "36/149",
  "language": "Spanish"
 },
 {
  "oldCoreId": 47,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Freeze Bolt",
  "cardNumber": "015/059",
  "language": "Japanese"
 },
 {
  "oldCoreId": 48,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Primal Clash",
  "cardNumber": "102/160",
  "language": "English"
 },
 {
  "oldCoreId": 49,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Primal Clash",
  "cardNumber": "102/160",
  "language": "Spanish"
 },
 {
  "oldCoreId": 50,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Tidal Storm",
  "cardNumber": "047/070",
  "language": "Japanese"
 },
 {
  "oldCoreId": 51,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Steam Siege",
  "cardNumber": "76/114",
  "language": "English"
 },
 {
  "oldCoreId": 52,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Steam Siege",
  "cardNumber": "76/114",
  "language": "Spanish"
 },
 {
  "oldCoreId": 53,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Cruel Traitor",
  "cardNumber": "036/054",
  "language": "Japanese"
 },
 {
  "oldCoreId": 54,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Burning Shadows",
  "cardNumber": "34/147",
  "language": "English"
 },
 {
  "oldCoreId": 55,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Burning Shadows",
  "cardNumber": "34/147",
  "language": "Spanish"
 },
 {
  "oldCoreId": 56,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "To Have Seen the Battle Rainbow",
  "cardNumber": "019/051",
  "language": "Japanese"
 },
 {
  "oldCoreId": 57,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Lost Thunder",
  "cardNumber": "135/214",
  "language": "English"
 },
 {
  "oldCoreId": 58,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Lost Thunder",
  "cardNumber": "135/214",
  "language": "Spanish"
 },
 {
  "oldCoreId": 59,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Super-Burst Impact",
  "cardNumber": "062/095",
  "language": "Japanese"
 },
 {
  "oldCoreId": 60,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Fusion Strike",
  "cardNumber": "058/264",
  "language": "English"
 },
 {
  "oldCoreId": 61,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Fusion Strike",
  "cardNumber": "058/264",
  "language": "Spanish"
 },
 {
  "oldCoreId": 62,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Eevee Heroes",
  "cardNumber": "016/069",
  "language": "Japanese"
 },
 {
  "oldCoreId": 63,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Paldea Evolved",
  "cardNumber": "044/193",
  "language": "English"
 },
 {
  "oldCoreId": 64,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Paldea Evolved",
  "cardNumber": "044/193",
  "language": "Spanish"
 },
 {
  "oldCoreId": 65,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Snow Hazard",
  "cardNumber": "016/071",
  "language": "Japanese"
 },
 {
  "oldCoreId": 66,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Paldea Evolved",
  "cardNumber": "204/193",
  "language": "English"
 },
 {
  "oldCoreId": 67,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Paldea Evolved",
  "cardNumber": "204/193",
  "language": "Spanish"
 },
 {
  "oldCoreId": 68,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Snow Hazard",
  "cardNumber": "073/071",
  "language": "Japanese"
 },
 {
  "oldCoreId": 69,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Temporal Forces",
  "cardNumber": "064/162",
  "language": "English"
 },
 {
  "oldCoreId": 70,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Temporal Forces",
  "cardNumber": "064/162",
  "language": "Spanish"
 },
 {
  "oldCoreId": 71,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Wild Force",
  "cardNumber": "026/071",
  "language": "Japanese"
 },
 {
  "oldCoreId": 72,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Stellar Crown",
  "cardNumber": "033/142",
  "language": "English"
 },
 {
  "oldCoreId": 73,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Stellar Crown",
  "cardNumber": "033/142",
  "language": "Spanish"
 },
 {
  "oldCoreId": 74,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Pokémon Card Game Battle Academy",
  "cardNumber": "013/066",
  "language": "Japanese"
 },
 {
  "oldCoreId": 75,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Surging Sparks",
  "cardNumber": "073/191",
  "language": "English"
 },
 {
  "oldCoreId": 76,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Surging Sparks",
  "cardNumber": "073/191",
  "language": "Spanish"
 },
 {
  "oldCoreId": 77,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Stellar Tera Type Starter Set Sylveon ex",
  "cardNumber": "003/022",
  "language": "Japanese"
 },
 {
  "oldCoreId": 78,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Ascended Heroes",
  "cardNumber": "083/217",
  "language": "English"
 },
 {
  "oldCoreId": 79,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Ascended Heroes",
  "cardNumber": "083/217",
  "language": "Spanish"
 },
 {
  "oldCoreId": 80,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Start Deck 100 Battle Collection",
  "cardNumber": "295/742",
  "language": "Japanese"
 },
 {
  "oldCoreId": 81,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Ascended Heroes",
  "cardNumber": "232/217",
  "language": "English"
 },
 {
  "oldCoreId": 82,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Ascended Heroes",
  "cardNumber": "232/217",
  "language": "Spanish"
 },
 {
  "oldCoreId": 83,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Start Deck 100 Battle Collection",
  "cardNumber": "748/742",
  "language": "Japanese"
 },
 {
  "oldCoreId": 84,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Unnumbered Promotional cards",
  "cardNumber": null,
  "language": "Japanese"
 },
 {
  "oldCoreId": 85,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Pokémon Card web",
  "cardNumber": "010/048",
  "language": "Japanese"
 },
 {
  "oldCoreId": 86,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Totodile Half Deck",
  "cardNumber": "2",
  "language": "Japanese"
 },
 {
  "oldCoreId": 87,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "McDonald's Pokémon-e Minimum Pack",
  "cardNumber": "009/018",
  "language": "Japanese"
 },
 {
  "oldCoreId": 88,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Everyone's Exciting Battle",
  "cardNumber": "011/047",
  "language": "Japanese"
 },
 {
  "oldCoreId": 89,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "HS Trainer Kit",
  "cardNumber": "G15",
  "language": "English"
 },
 {
  "oldCoreId": 90,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "HS Trainer Kit",
  "cardNumber": "G24",
  "language": "English"
 },
 {
  "oldCoreId": 91,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "McDonald's Collection 2015",
  "cardNumber": "10/12",
  "language": "English"
 },
 {
  "oldCoreId": 92,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Start Deck 100",
  "cardNumber": "088/414",
  "language": "Japanese"
 },
 {
  "oldCoreId": 93,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Generations Start Deck Lugia ex & Tyranitar ex",
  "cardNumber": "029/175",
  "language": "Japanese"
 },
 {
  "oldCoreId": 94,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Pokémon Card Game Battle Academy",
  "cardNumber": "013/066",
  "language": "Japanese"
 },
 {
  "oldCoreId": 95,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Scarlet & Violet Thai Promos",
  "cardNumber": "124",
  "language": "Thai"
 },
 {
  "oldCoreId": 96,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Fearless Terastal",
  "cardNumber": "034",
  "language": "Chinese"
 },
 {
  "oldCoreId": 97,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Final Flame Dance",
  "cardNumber": "006",
  "language": "Chinese"
 },
 {
  "oldCoreId": 98,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Travel Special Pack",
  "cardNumber": "096",
  "language": "Chinese"
 },
 {
  "oldCoreId": 99,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "M-P Thai Promos",
  "cardNumber": "063",
  "language": "Thai"
 },
 {
  "oldCoreId": 100,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Stellar Crystal",
  "cardNumber": "076",
  "language": "Chinese"
 },
 {
  "oldCoreId": 101,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "Happy Set Decidueye & Melmetal & Koraidon & Miraidon",
  "cardNumber": "e018",
  "language": "Chinese"
 },
 {
  "oldCoreId": 102,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "M-P Indonesian Promos",
  "cardNumber": "075",
  "language": "Indonesian"
 },
 {
  "oldCoreId": 103,
  "species": "Marill",
  "cardVariant": "Marill",
  "product": "M-P Indonesian Promos",
  "cardNumber": "095",
  "language": "Indonesian"
 },
 {
  "oldCoreId": 104,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Neo Genesis",
  "cardNumber": "2/111",
  "language": "English"
 },
 {
  "oldCoreId": 105,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Neo Genesis",
  "cardNumber": "2/111",
  "language": "Spanish"
 },
 {
  "oldCoreId": 106,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Gold, Silver, to a New World...",
  "cardNumber": null,
  "language": "Japanese"
 },
 {
  "oldCoreId": 107,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Aquapolis",
  "cardNumber": "H4/H32",
  "language": "English"
 },
 {
  "oldCoreId": 108,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Aquapolis",
  "cardNumber": "H4/H32",
  "language": "Spanish"
 },
 {
  "oldCoreId": 109,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "The Town on No Map",
  "cardNumber": "026/092",
  "language": "Japanese"
 },
 {
  "oldCoreId": 110,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Aquapolis",
  "cardNumber": "4/147",
  "language": "English"
 },
 {
  "oldCoreId": 111,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Aquapolis",
  "cardNumber": "4/147",
  "language": "Spanish"
 },
 {
  "oldCoreId": 112,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "The Town on No Map",
  "cardNumber": "025/092",
  "language": "Japanese"
 },
 {
  "oldCoreId": 113,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "EX Sandstorm",
  "cardNumber": "30/100",
  "language": "English"
 },
 {
  "oldCoreId": 114,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "EX Sandstorm",
  "cardNumber": "30/100",
  "language": "Spanish"
 },
 {
  "oldCoreId": 115,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Miracle of the Desert",
  "cardNumber": "017/053",
  "language": "Japanese"
 },
 {
  "oldCoreId": 116,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "EX Team Rocket Returns",
  "cardNumber": "1/109",
  "language": "English"
 },
 {
  "oldCoreId": 117,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "EX Team Rocket Returns",
  "cardNumber": "1/109",
  "language": "Spanish"
 },
 {
  "oldCoreId": 118,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Rocket Gang Strikes Back",
  "cardNumber": "025/084",
  "language": "Japanese"
 },
 {
  "oldCoreId": 119,
  "species": "Azumarill",
  "cardVariant": "Azumarill δ",
  "product": "EX Delta Species",
  "cardNumber": "19/113",
  "language": "English"
 },
 {
  "oldCoreId": 120,
  "species": "Azumarill",
  "cardVariant": "Azumarill δ",
  "product": "EX Delta Species",
  "cardNumber": "19/113",
  "language": "Spanish"
 },
 {
  "oldCoreId": 121,
  "species": "Azumarill",
  "cardVariant": "Azumarill δ",
  "product": "Holon Research Tower Water Quarter Deck",
  "cardNumber": "006/015",
  "language": "Japanese"
 },
 {
  "oldCoreId": 122,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "EX Delta Species",
  "cardNumber": "114/113",
  "language": "English"
 },
 {
  "oldCoreId": 123,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "EX Delta Species",
  "cardNumber": "114/113",
  "language": "Spanish"
 },
 {
  "oldCoreId": 124,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "PCG-P Promotional cards",
  "cardNumber": "077/PCG-P",
  "language": "Japanese"
 },
 {
  "oldCoreId": 125,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Diamond & Pearl",
  "cardNumber": "18/130",
  "language": "English"
 },
 {
  "oldCoreId": 126,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Diamond & Pearl",
  "cardNumber": "18/130",
  "language": "Spanish"
 },
 {
  "oldCoreId": 127,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Space-Time Creation",
  "cardNumber": null,
  "language": "Japanese"
 },
 {
  "oldCoreId": 128,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "HeartGold & SoulSilver",
  "cardNumber": "2/123",
  "language": "English"
 },
 {
  "oldCoreId": 129,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "HeartGold & SoulSilver",
  "cardNumber": "2/123",
  "language": "Spanish"
 },
 {
  "oldCoreId": 130,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "SoulSilver Collection",
  "cardNumber": "025/070",
  "language": "Japanese"
 },
 {
  "oldCoreId": 131,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Boundaries Crossed",
  "cardNumber": "37/149",
  "language": "English"
 },
 {
  "oldCoreId": 132,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Boundaries Crossed",
  "cardNumber": "37/149",
  "language": "Spanish"
 },
 {
  "oldCoreId": 133,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Freeze Bolt",
  "cardNumber": "016/059",
  "language": "Japanese"
 },
 {
  "oldCoreId": 134,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Primal Clash",
  "cardNumber": "103/160",
  "language": "English"
 },
 {
  "oldCoreId": 135,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Primal Clash",
  "cardNumber": "103/160",
  "language": "Spanish"
 },
 {
  "oldCoreId": 136,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Tidal Storm",
  "cardNumber": "048/070",
  "language": "Japanese"
 },
 {
  "oldCoreId": 137,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Primal Clash",
  "cardNumber": "104/160",
  "language": "English"
 },
 {
  "oldCoreId": 138,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Primal Clash",
  "cardNumber": "104/160",
  "language": "Spanish"
 },
 {
  "oldCoreId": 139,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Tidal Storm",
  "cardNumber": "049/070",
  "language": "Japanese"
 },
 {
  "oldCoreId": 140,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Steam Siege",
  "cardNumber": "77/114",
  "language": "English"
 },
 {
  "oldCoreId": 141,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Steam Siege",
  "cardNumber": "77/114",
  "language": "Spanish"
 },
 {
  "oldCoreId": 142,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Cruel Traitor",
  "cardNumber": "037/054",
  "language": "Japanese"
 },
 {
  "oldCoreId": 143,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Burning Shadows",
  "cardNumber": "35/147",
  "language": "English"
 },
 {
  "oldCoreId": 144,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Burning Shadows",
  "cardNumber": "35/147",
  "language": "Spanish"
 },
 {
  "oldCoreId": 145,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "To Have Seen the Battle Rainbow",
  "cardNumber": "020/051",
  "language": "Japanese"
 },
 {
  "oldCoreId": 146,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Lost Thunder",
  "cardNumber": "136/214",
  "language": "English"
 },
 {
  "oldCoreId": 147,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Lost Thunder",
  "cardNumber": "136/214",
  "language": "Spanish"
 },
 {
  "oldCoreId": 148,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Super-Burst Impact",
  "cardNumber": "063/095",
  "language": "Japanese"
 },
 {
  "oldCoreId": 149,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Fusion Strike",
  "cardNumber": "059/264",
  "language": "English"
 },
 {
  "oldCoreId": 150,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Fusion Strike",
  "cardNumber": "059/264",
  "language": "Spanish"
 },
 {
  "oldCoreId": 151,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Eevee Heroes",
  "cardNumber": "017/069",
  "language": "Japanese"
 },
 {
  "oldCoreId": 152,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Paldea Evolved",
  "cardNumber": "045/193",
  "language": "English"
 },
 {
  "oldCoreId": 153,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Paldea Evolved",
  "cardNumber": "045/193",
  "language": "Spanish"
 },
 {
  "oldCoreId": 154,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Snow Hazard",
  "cardNumber": "017/071",
  "language": "Japanese"
 },
 {
  "oldCoreId": 155,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Temporal Forces",
  "cardNumber": "065/162",
  "language": "English"
 },
 {
  "oldCoreId": 156,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Temporal Forces",
  "cardNumber": "065/162",
  "language": "Spanish"
 },
 {
  "oldCoreId": 157,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Wild Force",
  "cardNumber": "027/071",
  "language": "Japanese"
 },
 {
  "oldCoreId": 158,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Stellar Crown",
  "cardNumber": "034/142",
  "language": "English"
 },
 {
  "oldCoreId": 159,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Stellar Crown",
  "cardNumber": "034/142",
  "language": "Spanish"
 },
 {
  "oldCoreId": 160,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Pokémon Card Game Battle Academy",
  "cardNumber": "014/066",
  "language": "Japanese"
 },
 {
  "oldCoreId": 161,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Surging Sparks",
  "cardNumber": "074/191",
  "language": "English"
 },
 {
  "oldCoreId": 162,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Surging Sparks",
  "cardNumber": "074/191",
  "language": "Spanish"
 },
 {
  "oldCoreId": 163,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Stellar Tera Type Starter Set Sylveon ex",
  "cardNumber": "004/022",
  "language": "Japanese"
 },
 {
  "oldCoreId": 164,
  "species": "Azumarill",
  "cardVariant": "Light Azumarill",
  "product": "Neo Destiny",
  "cardNumber": "13/105",
  "language": "English"
 },
 {
  "oldCoreId": 165,
  "species": "Azumarill",
  "cardVariant": "Light Azumarill",
  "product": "Neo Destiny",
  "cardNumber": "13/105",
  "language": "Spanish"
 },
 {
  "oldCoreId": 166,
  "species": "Azumarill",
  "cardVariant": "Light Azumarill",
  "product": "Darkness, and to Light...",
  "cardNumber": null,
  "language": "Japanese"
 },
 {
  "oldCoreId": 167,
  "species": "Azumarill",
  "cardVariant": "Azumarill ex",
  "product": "Ascended Heroes",
  "cardNumber": "084/217",
  "language": "English"
 },
 {
  "oldCoreId": 168,
  "species": "Azumarill",
  "cardVariant": "Azumarill ex",
  "product": "Ascended Heroes",
  "cardNumber": "084/217",
  "language": "Spanish"
 },
 {
  "oldCoreId": 169,
  "species": "Azumarill",
  "cardVariant": "Azumarill ex",
  "product": "Start Deck 100 Battle Collection",
  "cardNumber": "297/742",
  "language": "Japanese"
 },
 {
  "oldCoreId": 170,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Everyone's Exciting Battle",
  "cardNumber": "012/047",
  "language": "Japanese"
 },
 {
  "oldCoreId": 171,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Generations Start Deck Lugia ex & Tyranitar ex",
  "cardNumber": "030/175",
  "language": "Japanese"
 },
 {
  "oldCoreId": 172,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Pokémon Card Game Battle Academy",
  "cardNumber": "014/066",
  "language": "Japanese"
 },
 {
  "oldCoreId": 173,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Scarlet & Violet Thai Promos",
  "cardNumber": "211",
  "language": "Thai"
 },
 {
  "oldCoreId": 174,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Scarlet & Violet Indonesian Promos",
  "cardNumber": "214",
  "language": "Indonesian"
 },
 {
  "oldCoreId": 175,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Fearless Terastal",
  "cardNumber": "035",
  "language": "Chinese"
 },
 {
  "oldCoreId": 176,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Final Flame Dance",
  "cardNumber": "007",
  "language": "Chinese"
 },
 {
  "oldCoreId": 177,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Play! Pokémon Prize Pack Series Seven",
  "cardNumber": "SSP 074",
  "language": "English"
 },
 {
  "oldCoreId": 178,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "M-P Thai Promos",
  "cardNumber": "064",
  "language": "Thai"
 },
 {
  "oldCoreId": 179,
  "species": "Azumarill",
  "cardVariant": "Azumarill",
  "product": "Stellar Crystal",
  "cardNumber": "077",
  "language": "Chinese"
 }
];
