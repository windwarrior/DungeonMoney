var api_utils = require('./api_utils');

var T5_RATE_BLSK = 2; // This is data pulled from my hat, its based on the 1,5 chance on getting silk/thick/mithril with mystic
var T6_RATE_BLSK = 0.5;

var SILK_SCRAP_ID = 19748;
var SILK_SALVAGE_RATE_BLSK = T5_RATE_BLSK;

var GOSSAMER_SCRAP_ID = 19745;
var GOSSAMER_SALVAGE_RATE_BLSK = T6_RATE_BLSK;

var MITHRIL_ORE_ID = 19700;
var MITHRIL_ORE_RATE_BLSK = T5_RATE_BLSK;

var ORICHALCUM_ORE_ID = 19701;
var ORICHALCUM_ORE_RATE_BLSK = T6_RATE_BLSK;

var THICK_LEATHER_SECTION_ID = 19729;
var THICK_LEATHER_SECTION_RATE_BLSK = T5_RATE_BLSK;

var HARDENED_LEATHER_SECTION_ID = 19732;
var HARDENED_LEATHER_SECTION_RATE_BLSK = T6_RATE_BLSK;

var ECTOPLASM_ID = 19721;
var ECTOPLASM_SALVAGE_RATE_BLSK = 1.25; // This is generally agreed upon

var SOLDIERS_INSIGNIA_ID = 46712;
var MAGIS_INSIGNIA_ID = 46711;
var RABID_INSIGNIA_ID = 46710;
var DIRE_INSIGNIA_ID = 49522;
var SHAMAN_INSIGNIA_ID = 46708;

var SOLDIERS_INSCRIPTION_ID = 46688;
var MAGIS_INSCRIPTION_ID = 46687;
var RABID_INSCRIPTION_ID = 46686;
var DIRE_INSCRIPTION_ID = 46690;
var SHAMAN_INSCRIPTION_ID = 46684;

var INS_SALVAGE_RATE_BLSK = 0.5; // This is generally agreed upon


var SalvageService = {
  // Remains false till we have downloaded some data from anet
  initialised: false,

  _salvageRateByID: function (id) {
    switch (id) {
      case SILK_SCRAP_ID:
        return SILK_SALVAGE_RATE_BLSK;
      case GOSSAMER_SCRAP_ID:
        return  GOSSAMER_SALVAGE_RATE_BLSK;
      case MITHRIL_ORE_ID:
        return MITHRIL_ORE_RATE_BLSK;
      case ORICHALCUM_ORE_ID:
        return  ORICHALCUM_ORE_RATE_BLSK;
      case THICK_LEATHER_SECTION_ID:
        return THICK_LEATHER_SECTION_RATE_BLSK;
      case HARDENED_LEATHER_SECTION_ID:
        return HARDENED_LEATHER_SECTION_RATE_BLSK;
      case ECTOPLASM_ID:
        return  ECTOPLASM_SALVAGE_RATE_BLSK;
      case SOLDIERS_INSIGNIA_ID:
      case MAGIS_INSIGNIA_ID:
      case RABID_INSIGNIA_ID:
      case DIRE_INSIGNIA_ID:
      case SHAMAN_INSIGNIA_ID:
      case SOLDIERS_INSCRIPTION_ID:
      case MAGIS_INSCRIPTION_ID:
      case RABID_INSCRIPTION_ID:
      case DIRE_INSCRIPTION_ID:
      case SHAMAN_INSCRIPTION_ID:
        return INS_SALVAGE_RATE_BLSK;
      default:
        return 0;
    }
  },

  // The function that creates a promise for a set of items, asks the TP about
  // them,merges the result and also adds salvage rate information to it
  _createCommonSalvageComponentPromise: function (item_ids) {
    let promises = [];

    promises.push(api_utils.getItemsPromise(item_ids));
    promises.push(api_utils.getTPPrices(item_ids));

    return Promise.all(promises).then(function (arr) {
      return api_utils.mergeItemArrays(arr[0], arr[1]);
    }).then(function (item_arr) {
        for (let item of item_arr) {
          item["salvage_rate_blsk"] = this._salvageRateByID(item["id"]);

          item["component_expected_value_buys"] = item["salvage_rate_blsk"] * item["tp_value"]["buys"];
          item["component_expected_value_sells"] = item["salvage_rate_blsk"] * item["tp_value"]["sells"];
        }

        return item_arr;
    }.bind(this));
  },

  _createLightArmorSalvagePromise: function () {
    let item_ids = [SILK_SCRAP_ID, GOSSAMER_SCRAP_ID, ECTOPLASM_ID];

    return this._createCommonSalvageComponentPromise(item_ids).then(function (item_arr) {
      this.salvage_light_armor_template_blsk = item_arr;
    }.bind(this));
  },

  _createMediumArmorSalvagePromise: function () {
    let item_ids = [THICK_LEATHER_SECTION_ID, HARDENED_LEATHER_SECTION_ID, ECTOPLASM_ID];

    return this._createCommonSalvageComponentPromise(item_ids).then(function (item_arr) {
      this.salvage_medium_armor_template_blsk = item_arr;
    }.bind(this));
  },

  _createHeavyArmorSalvagePromise: function () {
    let item_ids = [MITHRIL_ORE_ID, ORICHALCUM_ORE_ID, ECTOPLASM_ID];

    return this._createCommonSalvageComponentPromise(item_ids).then(function (item_arr) {
      this.salvage_heavy_armor_template_blsk = item_arr;
    }.bind(this));
  },

  _createWeaponSalvagePromise: function () {
    let item_ids = [MITHRIL_ORE_ID, ORICHALCUM_ORE_ID, ECTOPLASM_ID];

    return this._createCommonSalvageComponentPromise(item_ids).then(function (item_arr) {
      this.salvage_weapon_template_blsk = item_arr;
    }.bind(this));
  },

  _createInsPromise: function () {
    let item_ids = [SOLDIERS_INSIGNIA_ID, MAGIS_INSIGNIA_ID, RABID_INSIGNIA_ID, DIRE_INSIGNIA_ID, SHAMAN_INSIGNIA_ID,
                    SOLDIERS_INSCRIPTION_ID, MAGIS_INSCRIPTION_ID, RABID_INSCRIPTION_ID, DIRE_INSCRIPTION_ID, SHAMAN_INSCRIPTION_ID];

    return this._createCommonSalvageComponentPromise(item_ids).then(function (item_arr) {
      this.ins_list_blsk = item_arr;
    }.bind(this));
  },

  _findIns: function (item) {
    let attrs = item["details"]["infix_upgrade"]["attributes"];

    // First sort the upgrades of this item based on their stats and otherwise alphabetical
    attrs.sort(function (a, b) {
      if (b["modifier"] - a["modifier"] == 0) {
        if (a["attribute"] < b["attribute"]) {
          return -1;
        } else if (a["attribute"] > b["attribute"]) {
          return 1;
        } else {
          return 0;
        }
      } else {
        return b["modifier"] - a["modifier"];
      }
    });

    console.log(attrs);

    var isWeapon = item["type"].toLowerCase() == "weapon";

    var id = -1;

    switch (attrs[0]["attribute"]) {
      case "Power":
        switch (attrs[1]["attribute"]) {
          case "Toughness":
            id = isWeapon ? SOLDIERS_INSCRIPTION_ID: SOLDIERS_INSIGNIA_ID;
            break;
        }
        break;
      case "Vitality":
        switch (attrs[1]["attribute"]) {
          case "Condition Damage":
            id = isWeapon ? SHAMANS_INSCRIPTION_ID : SHAMANS_INSIGNIA_ID;
            break;
        }
        break;
      case "ConditionDamage":
        switch (attrs[1]["attribute"]) {
          case "Tougness":
            id = isWeapon ? DIRE_INSCRIPTION_ID : DIRE_INSIGNIA_ID;
            break;
          case "Power":
            switch (attrs[2]["attribute"]) {
              case "Toughness":
                id = isWeapon ? RABID_INSCRIPTION_ID : RABID_INSIGNIA_ID;
                break;
            }
        }
        break;
      case "Healing":
        switch (attrs[1]["attribute"]) {
          case "Precision":
            id = isWeapon ? MAGIS_INSCRIPTION_ID : MAGIS_INSIGNIA_ID;
            break;
        }
        break;
    }

    return this.ins_list_blsk.find(function (item, index, array) {
      return item["id"] == id;
    });
  },

  init: function () {
    var promises = [this._createLightArmorSalvagePromise(), this._createMediumArmorSalvagePromise(), this._createHeavyArmorSalvagePromise(), this._createInsPromise()];

    return Promise.all(promises).then(function (arr) {
      this.initialised = true;
    }.bind(this));
  },

  getSalvageProduct: function (item) {
    var allPromises = [];

    let res = [];

    console.log(item);

    // Just to be sure, lets check if the item is salvagable
    if (!("NoSalvage" in item["flags"]) &&
      (item["type"].toLowerCase() == "weapon" || item["type"].toLowerCase() == "armor")) {
        if (item["rarity"].toLowerCase() == "exotic") {
          // Just not yet considering rares
          if (item["type"] == "weapon") {
            res = this.salvage_weapon_template_blsk.slice(0); // Shallow copy of the salvage template, since we dont really need to copy the inner objects anyway
          } else {
            switch (item["details"]["weight_class"].toLowerCase()) {
              case "light":
                res = this.salvage_light_armor_template_blsk.slice(0);
                break;
              case "medium":
                res = this.salvage_medium_armor_template_blsk.slice(0);
                break;
              case "heavy":
                res = this.salvage_heavy_armor_template_blsk.slice(0);
                break;
            }

          }

          let ins = this._findIns(item);

          if (ins) {
            res.push(ins);
          }
        }
    }

    return res;
  }
}

module.exports = {
  SalvageService: SalvageService
}
