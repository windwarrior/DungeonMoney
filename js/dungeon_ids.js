var range = require('./range');

module.exports = {
  dungeons: [
    {
      dungeon_name: "Caudecus's Manor",
      dungeon_symbolic_name: "cadecus_manor",
      currency_id: 9,
      item_ids: [
        8881, // Powerful Potion of Outlaw Slaying
        8897, // Knavish Tonic
        10255, // Recipe: Extended Potion of Outlaw Slaying
        ...range.range(24676, 24679), // sigil of justice
        ...range.range(24843, 24846), // runes of aristocracy
        ...range.range(35754, 35811), // weapons
        ...range.range(35811, 35829), // medium exotic armor pieces
        ...range.range(35829, 35847), // light exotic armor pieces
        ...range.range(35847, 35864), // heavy exotic armor pieces
      ]
    },
    {
    	dungeon_name: "Ascalonian Catacombs",
      dungeon_symbolic_name: "ascalonian_catacombs",
    	currency_id: 5,
      item_ids: [
        8896, // Ghostly Tonic
        10254, // Recipe: Extended Potion of Ghost Slaying
        ...range.range(24807, 24810), // Sigil of ghost slaying
        ...range.range(24840, 24843), // Rune of the monk
        ...range.range(35865, 35922), // weapons
        ...range.range(35922, 35940), // medium exotic armor
        ...range.range(35940, 35958), // light exotic armor
        ...range.range(35958, 35975), // heavy exotic armor
    	]
    },
    {
      dungeon_name: "Twilight Arbor",
      dungeon_symbolic_name: "twilight_arbor",
      currency_id: 5,
      item_ids: [
        8882, // Powerful Potion of Nightmare Court Slaying
        8899,  // Overgrown Tonic
        10257, // Recipe:Extended Potion of Nightmare Court Slaying
        ...range.range(24846, 24849), // Rune of the Nightmare
        ...range.range(24679, 24682), // Sigil of Dreams
        ...range.range(17372, 17390), // exotic armor (rabid)
        ...range.range(18576, 18612), // exotic armor (magi/rampager)
        ...range.range(17353, 17372), // weapons (rampager)
        ...range.range(18538, 18576), // weapons (magi/rabid)
      ]
    },
    {
      dungeon_name: "Sorrow's Embrace",
      dungeon_symbolic_name: "sorrows_embrace",
      currency_id: 5,
      item_ids: [
        8892, // Powerful Potion of Dredge Slaying
        8898,  // Tonic of the Moletariate
        10256, // Recipe: Extended Potion of Dredge Slaying
        ...range.range(24849, 24852), // Rune of the Forgeman
        ...range.range(24682, 24685), // Sigil of Sorrow
        ...range.range(17409, 17426), // exotic armor (Carrion)
        ...range.range(18724, 18760), // exotic armor (knights/soldiers)
        ...range.range(17390, 17409), //exotic weapon (carrion)
        ...range.range(18686, 18724), //exotic weapon (knights/soldiers)
      ]
    },
  ]
}
