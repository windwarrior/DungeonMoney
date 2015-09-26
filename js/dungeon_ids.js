var range = require('./range');

module.exports = {
  dungeons: [
    /*{
      dungeon_name: "Caudecus's Manor",
      dungeon_symbolic_name: "cadecus_manor",
      currency_id: 9,
      item_ids: [
        8881, // Powerful Potion of Outlaw Slaying
        8897, // Knavish Tonic
        10255, // Recipe: Extended Potion of Outlaw Slaying
        //...range.range(24843, 24845), // runes of aristocracy
        ...range.range(35829, 35846), // light exotic armor pieces
        ...range.range(35811, 35828), // medium exotic armor pieces
        ...range.range(35847, 35864), // heavy exotic armor pieces
        ...range.range(35754, 35810), // weapons
      ]
    },*/
    {
    	dungeon_name: "Ascalonian Catacombs",
      dungeon_symbolic_name: "ascalonian_catacombs",
    	currency_id: 5,
      item_ids: [
      //  ...range.range(35865, 35921), // weapons
        ...range.range(35922, 35939), // medium exotic armor
        ...range.range(35940, 35957), // light exotic armor
        ...range.range(35958, 35974), // heavy exotic armor

    	]
    }
  ]
}
