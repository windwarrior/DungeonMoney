var TP_PROFIT_MARGIN = 0.85;

// Constant like libraries
var TOKEN_COSTS = require('./token_costs');

// Method like libraries
var api_utils = require('./api_utils');
var salvage = require('./salvage');
/*
This miner will query the API for certain item ID's, collect all information
about these items, and determine what the best way is to make money out of
these items
*/

var API_URL = "https://api.guildwars2.com/";

module.exports = {
  mine: mine
}

/*
Mines a list of id's for the best way to salvage them

NOTE: Assumes that the salvageService was inited
@param list of ids
*/
function mine(item_ids) {
  var promises = [];
  promises.push(api_utils.getItemsPromise(item_ids));
  promises.push(api_utils.getTPPrices(item_ids));

  return Promise.all(promises).then(function (arr) {
    let item_promise = arr[0];
    let tp_promise = arr[1];

    item_promise = api_utils.mergeItemArrays(item_promise, tp_promise);

    return item_promise;
  }).then(function (item_arr) {
    return assignTokenCost(item_arr);
  }).then(function (item_arr) {
    return classifyItems(item_arr);
  }).catch(function (e) {
    console.log(e);
  });
}

/*
Function that assigns a cost in token based on some heuristics for determining
its type, this will filter it based on its type and call a corresponding
function. That function is responsible for taking into account the rarity and
possible different types of weapons/armor/consumables
*/
function assignTokenCost(items_array) {
    for (let item of items_array) {
      // So, we have to check if its a weapons
      if (item["type"].toLowerCase() == "weapon") {
        item["token_cost"] = assignWeaponTokenCost(item);
      } else if (item["type"].toLowerCase() == "armor") {
        item["token_cost"] = assignArmorTokenCost(item);
      } else if (item["type"].toLowerCase() == "consumable") {
        item["token_cost"] = assignConsumableTokenCost(item);
      } else if (item["type"].toLowerCase() == "upgradecomponent") {
        item["token_cost"] = assignUpgradeComponentTokenCost(item);
      }
    }

    return items_array;
}

/*
Heuristicly determine token cost of a consumable, since we cannot query any
system for a cost in tokens, we just try to reason and hardcode prices
*/
function assignConsumableTokenCost(item) {
  // For dungeons there are currently three types of consumables
  // 1) Recipe unlocks
  // 2) Slaying potions
  // 3) Transform tonics

  if ("unlock_type" in item["details"] && item["details"]["unlock_type"].toLowerCase() == "craftingrecipe") {
    // Best heuristic to determine its a crafting recipe
    return TOKEN_COSTS.RECIPE_COST;
  } else if ("duration_ms" in item["details"]) {
    // It has a duration, its a slaying potion
    return TOKEN_COSTS.SLAYING_POTION_COST;
  } else {
    // Its not a recipe, and not a slaying potion, for now its a tonics
    return TOKEN_COSTS.TRANSFORM_TONIC_COST;
  }
}

/*
Heuristicly determine token cost of a piece of armor
*/
function assignArmorTokenCost(item) {
  let armor_name = item["details"]["type"].toLowerCase();


  // There are two cases, rare and exotic armor
  if (item["rarity"].toLowerCase() == "rare") {
    return TOKEN_COSTS.ARMOR_TOKEN_COST_RARE[armor_name];
  } else {
    return TOKEN_COSTS.ARMOR_TOKEN_COST_EXOTIC[armor_name];
  }
}

/*
Heuristically determine token cost of a weapon
*/
function assignWeaponTokenCost(item) {
  let weapon_name = item["details"]["type"].toLowerCase();

  return TOKEN_COSTS.WEAPON_TOKEN_COST[weapon_name];
}

function assignUpgradeComponentTokenCost(item) {
  switch(item["rarity"].toLowerCase()) {
    case "masterwork":
      return item["details"]["type"].toLowerCase() == "rune" ? TOKEN_COSTS.MINOR_RUNE : TOKEN_COSTS.MINOR_SIGIL;
    case "rare":
      return item["details"]["type"].toLowerCase() == "rune" ? TOKEN_COSTS.MAJOR_RUNE : TOKEN_COSTS.MAJOR_SIGIL;
    case "exotic":
      return item["details"]["type"].toLowerCase() == "rune" ? TOKEN_COSTS.SUPERIOR_RUNE : TOKEN_COSTS.SUPERIOR_SIGIL;
    default:
      return 0;
  }
}

/*
Classifies items based on their possible profit potential

@param list of item's retrieved from the api that are decorated with TP info
@return list of item's with values for different sell strategies
*/
function classifyItems(items_array) {
  for (let item of items_array) {
    // We can now determine if it is sellable on the TP, salvagable or sellable
    // to a vendor.

    // A dictionary that holds *our* values
    item["values"] = {};

    if (!("NoSell" in item["flags"])) {
      // It is sellable!
      item["values"]["sell"] = item["vendor_value"];
    }

    if (!("AccountBound" in item["flags"]) && item["tp_value"]) {
      // It is tpable!
      item["values"]["tp_sells_pre_tax"] = item["tp_value"]["sells"];
      item["values"]["tp_buys_pre_tax"] = item["tp_value"]["buys"]

      item["values"]["tp_sells"] = item["tp_value"]["sells"] * TP_PROFIT_MARGIN;
      item["values"]["tp_buys"] = item["tp_value"]["buys"] * TP_PROFIT_MARGIN;

    }


    if (!("NoSalvage" in item["flags"]) &&
      (item["type"].toLowerCase() == "weapon" || item["type"].toLowerCase() == "armor")) {

      // Lets first see where this product will salvage into
      item["salvages_to"] = salvage.SalvageService.getSalvageProduct(item);

      for (let kit in item["salvages_to"]) {
        item["values"][`salvage_sells_${kit}_pre_tax`] = 0;
        item["values"][`salvage_buys_${kit}_pre_tax`] = 0;

        for (let subcomponent of item["salvages_to"][kit]) {
          subcomponent["expected_result"] = {};
          subcomponent["expected_result"]["sells"] = subcomponent["salvage_rate"] * subcomponent["tp_value"]["sells"];
          subcomponent["expected_result"]["buys"] = subcomponent["salvage_rate"] * subcomponent["tp_value"]["buys"];

          item["values"][`salvage_sells_${kit}_pre_tax`] += subcomponent["expected_result"]["sells"];
          item["values"][`salvage_buys_${kit}_pre_tax`] += subcomponent["expected_result"]["buys"];

          item["values"][`salvage_sells_${kit}`] = item["values"][`salvage_sells_${kit}_pre_tax`] * TP_PROFIT_MARGIN;
          item["values"][`salvage_buys_${kit}`] = item["values"][`salvage_buys_${kit}_pre_tax`] * TP_PROFIT_MARGIN;
        }
      }
    }

    let best_val = -1;
    let best_key = null;

    let best_val_only_buy = -1;
    let best_key_only_buy = null;

    for (let key in item["values"]) {
      if (key.indexOf("pre_tax") < 0 && item["values"][key]) {
        if (item["values"][key] > best_val) {
          best_val = item["values"][key];
          best_key = key;
        }

        if (item["values"][key] > best_val_only_buy && key.indexOf("sells") < 0) {
          // Its not a sell listing and its better then the previous only buy
          best_val_only_buy = item["values"][key];
          best_key_only_buy = item["values"][key];
        }
      }

    }

    item["values"]["strategy"] = best_key;
    item["values"]["strategy_profit"] = best_val;

    item["values"]["strategy_only_buy"] = best_key_only_buy;
    item["values"]["strategy_only_buy_profit"] = best_val_only_buy;

    item["values"]["strategy_profit_per_token"] = best_val / item["token_cost"];
    item["values"]["strategy_only_buy_profit_per_token"] = best_val_only_buy / item["token_cost"];
  }

  return items_array;
}
