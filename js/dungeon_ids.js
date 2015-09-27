var range = require('./range');

module.exports = {
  dungeons: [
    {
      dungeon_name: "Caudecus's Manor",
      dungeon_short: "CM",
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
      dungeon_short: "AC",
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
      dungeon_short: "TA",
      dungeon_symbolic_name: "twilight_arbor",
      currency_id: 11,
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
      dungeon_short: "SE",
      dungeon_symbolic_name: "sorrows_embrace",
      currency_id: 10,
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
    {
      dungeon_name: "Citadel of Flame",
      dungeon_short: "CoF",
      dungeon_symbolic_name: "citadel_of_flame",
      currency_id: 13,
      item_ids: [
        8879, // Powerful Potion of Flame Legion Slaying
        8900,  // Fiery Tonic
        10258, // Recipe: Extended Potion of Flame Legion Slaying
        ...range.range(24852, 24855), // Rune of the Baelfire
        ...range.range(24673, 24676), // Sigil of Smothering
        ...range.range(17335, 17353), // exotic armor (Berserker)
        ...range.range(18428, 18464), // exotic armor (carrior/rampager)
        ...range.range(17316, 17335), // exotic weapon (berserker)
        ...range.range(18390, 18428), //exotic weapon (carrion/rampager)
      ]
    },
    {
      dungeon_name: "Honor of the Waves",
      dungeon_short: "HotW",
      dungeon_symbolic_name: "honor_of_the_waves",
      currency_id: 12,
      item_ids: [
        8883, // Powerful Potion of Sons of Svanir Slaying
        8902,  // Ursan Tonic
        10260, // Recipe: Extended Potion of Sons of Svanir Slaying
        ...range.range(24855, 24858), // Rune of Sanctuary
        ...range.range(24669, 24672), // Sigil of Wrath
        ...range.range(18114, 18168), // exotic armor (all stats)
        ...range.range(18057, 18114), //exotic weapon (all stats)
      ]
    },
    {
      dungeon_name: "Crucible of Eternity",
      dungeon_short: "CoE",
      dungeon_symbolic_name: "crucible_of_eternity",
      currency_id: 14,
      item_ids: [
        8887, // Powerful Potion of Inquest Slaying
        8903,  // Sinister Automatonic
        10261, // Recipe: Extended Potion of Inquest Slaying
        ...range.range(24783, 24786), // Rune of the Golemancer
        ...range.range(24670, 24673), // Sigil of Mad Scientists

        // HACK This dungeon is totally weird in how the items are set up o.O
        ...range.range(17744, 17756), // exotic armor
        ...range.range(17762, 17774), // exotic armor
        ...range.range(17780, 17792), // exotic armor
        ...range.range(46417, 46435), // exotic armor

        ...range.range(17687, 17725), //exotic weapon
        ...range.range(46398, 46417), //exotic weapon (dire)
      ]
    },
    {
      dungeon_name: "Ruined City of Arah",
      dungeon_short: "Arah",
      dungeon_symbolic_name: "ruined_city_of_arah",
      currency_id: 6,
      item_ids: [
        8893, // Powerful Potion of Undead Slaying
        8901,  // Phantasmal Tonic
        10259,  // Recipe: Extended Potion of Undead Slaying
        ...range.range(24858, 24861), // Rune of Orr
        ...range.range(24640, 24643), // Sigil of Mad Scientists

        ...range.range(17929, 17983), //exotic armor
        ...range.range(17872, 17929), //exotic weapon
      ]
    },
  ]
}
