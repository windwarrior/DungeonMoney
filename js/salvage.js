var api_utils = require('./api_utils');
var deepcopy = require('deepcopy');

var SILK_SCRAP_ID = 19748;
var GOSSAMER_SCRAP_ID = 19745;
var MITHRIL_ORE_ID = 19700;
var ORICHALCUM_ORE_ID = 19701;
var THICK_LEATHER_SECTION_ID = 19729;
var HARDENED_LEATHER_SECTION_ID = 19732;
var ELDER_WOOD_LOG_ID = 19722;
var ANCIENT_WOOD_LOG_ID = 19725;
var ECTOPLASM_ID = 19721;

var SOLDIERS_INSIGNIA_ID = 46712;
var MAGIS_INSIGNIA_ID = 46711;
var RABID_INSIGNIA_ID = 46710;
var DIRE_INSIGNIA_ID = 49522;
var SHAMANS_INSIGNIA_ID = 46708;

var SOLDIERS_INSCRIPTION_ID = 46688;
var MAGIS_INSCRIPTION_ID = 46687;
var RABID_INSCRIPTION_ID = 46686;
var DIRE_INSCRIPTION_ID = 46690;
var SHAMANS_INSCRIPTION_ID = 46684;

var ECTO_RATE_EXOTIC_BLSK = 1.75;
var ECTO_RATE_EXOTIC_MYSTIC = 1.25;

var T5_RATE_BLSK = 2; // This is data pulled from my hat, its based on the 1,5 chance on getting silk/thick/mithril with mystic
var T6_RATE_BLSK = 0.5;

var T5_RATE_MYSTIC = 1.5;
var T6_RATE_MYSTIC = 0.25;

var T5_WEAPON_RATE_MYSTIC = T5_RATE_MYSTIC / 2;
var T6_WEAPON_RATE_MYSTIC = T6_RATE_MYSTIC / 2;

var T5_WEAPON_RATE_BLSK = T5_RATE_BLSK / 2;
var T6_WEAPON_RATE_BLSK = T6_RATE_BLSK / 2;

var INS_RATE_BLSK = 0.62; // This is generally agreed upon
var INS_RATE_MYSTIC = 0.42;

var SalvageService = {
  // Remains false till we have downloaded some data from anet
  initialised: false,

  _salvageRateByID: function (id, kit, isWeapon) {
    /*
    Ores can both be salvaged from armor and weapons, but weapons also produce
    wood, so the drop rates must differ. Ores check wether its a weapon to
    have the ability to have individual droprates
    */
    switch (id) {
      case THICK_LEATHER_SECTION_ID:
      case SILK_SCRAP_ID:
        switch (kit) {
          case "blsk":
            return T5_RATE_BLSK;
          case "mystic":
            return T5_RATE_MYSTIC;
        }
      case HARDENED_LEATHER_SECTION_ID:
      case GOSSAMER_SCRAP_ID:
        switch (kit) {
          case "blsk":
            return T6_RATE_BLSK;
          case "mystic":
            return T6_RATE_MYSTIC;
        }
      case MITHRIL_ORE_ID:
        switch (kit) {
          case "blsk":
            return isWeapon ? T5_WEAPON_RATE_BLSK : T5_RATE_BLSK;
          case "mystic":
            return isWeapon ? T5_WEAPON_RATE_MYSTIC : T5_RATE_MYSTIC;
        }
      case ORICHALCUM_ORE_ID:
        switch (kit) {
          case "blsk":
            return isWeapon ? T6_WEAPON_RATE_BLSK : T6_RATE_BLSK;
          case "mystic":
            return isWeapon ? T6_WEAPON_RATE_MYSTIC : T6_RATE_MYSTIC;
        }
        return  isWeapon ? T6_RATE : T6_WEAPON_RATE;
      case ECTOPLASM_ID:
        switch (kit) {
          case "blsk":
            return ECTO_RATE_EXOTIC_BLSK;
          case "mystic":
            return ECTO_RATE_EXOTIC_MYSTIC;
        }
        return  ECTO_RATE;
      case ELDER_WOOD_LOG_ID:
        switch (kit) {
          case "blsk":
            return T5_WEAPON_RATE_BLSK;
          case "mystic":
            return T5_WEAPON_RATE_BLSK;
        }
      case ANCIENT_WOOD_LOG_ID:
        switch (kit) {
          case "blsk":
            return T6_WEAPON_RATE_BLSK;
          case "mystic":
            return T6_WEAPON_RATE_BLSK;
        }
      case SOLDIERS_INSIGNIA_ID:
      case MAGIS_INSIGNIA_ID:
      case RABID_INSIGNIA_ID:
      case DIRE_INSIGNIA_ID:
      case SHAMANS_INSIGNIA_ID:
      case SOLDIERS_INSCRIPTION_ID:
      case MAGIS_INSCRIPTION_ID:
      case RABID_INSCRIPTION_ID:
      case DIRE_INSCRIPTION_ID:
      case SHAMANS_INSCRIPTION_ID:
        switch (kit) {
          case "blsk":
            return INS_RATE_BLSK;
          case "mystic":
            return INS_RATE_MYSTIC;
        }

    }

    return 0;
  },

  // The function that creates a promise for a set of items, asks the TP about
  // them,merges the result and also adds salvage rate information to it
  _createCommonSalvageComponentPromise: function (item_ids, isWeapon) {
    let promises = [];

    promises.push(api_utils.getItemsPromise(item_ids));
    promises.push(api_utils.getTPPrices(item_ids));

    return Promise.all(promises).then(function (arr) {
      return api_utils.mergeItemArrays(arr[0], arr[1]);
    }).then(function (item_arr) {
      // We want it like
      /*
        {
          'mystic': [
            {
              name: "Glob",
              rate: 0.875
            }
            ...
          ],
          'blsk': [
            {
              name: "Glob",
              rate: 1.25
            }
            ...
          ],

        }
      */
      // But we get it the other way around

      let result = {};

      for (let kit of ["mystic", "blsk"]) {
        for (let item of item_arr) {
          item["salvage_rate"] = this._salvageRateByID(item["id"], kit, isWeapon)
        }

        // As we set the salvage_rate per item (of the item_arr), we cannot
        // simply reuse the same item_arr for all the kits, we need a deepcopy
        let kit_result = deepcopy(item_arr);
        result[kit] = kit_result;
      }

      return result;
    }.bind(this));
  },

  _createInsPromise: function () {
    let item_ids = [SOLDIERS_INSIGNIA_ID, MAGIS_INSIGNIA_ID, RABID_INSIGNIA_ID, DIRE_INSIGNIA_ID, SHAMANS_INSIGNIA_ID,
                    SOLDIERS_INSCRIPTION_ID, MAGIS_INSCRIPTION_ID, RABID_INSCRIPTION_ID, DIRE_INSCRIPTION_ID, SHAMANS_INSCRIPTION_ID];

    let promises = [];

    promises.push(api_utils.getItemsPromise(item_ids));
    promises.push(api_utils.getTPPrices(item_ids));

    return Promise.all(promises).then(function (arr) {
      return api_utils.mergeItemArrays(arr[0], arr[1]);
    }).then(function (items) {
      let items_mystic = items;
      let items_blsk = deepcopy(items);

      for (let item of items_mystic) {
        item["salvage_rate"] = INS_RATE_MYSTIC;
      }

      for (let item of items_blsk) {
        item["salvage_rate"] = INS_RATE_BLSK;
      }

      this.ins_list_mystic = items_mystic;
      this.ins_list_blsk = items_blsk;
    }.bind(this));
  },

  _createLightArmorSalvagePromise: function () {
    let item_ids = [SILK_SCRAP_ID, GOSSAMER_SCRAP_ID, ECTOPLASM_ID];

    return this._createCommonSalvageComponentPromise(item_ids, false).then(function (salvage_obj) {
      this.salvage_light_armor_template = salvage_obj;
    }.bind(this));
  },

  _createMediumArmorSalvagePromise: function () {
    let item_ids = [THICK_LEATHER_SECTION_ID, HARDENED_LEATHER_SECTION_ID, ECTOPLASM_ID];

    return this._createCommonSalvageComponentPromise(item_ids, false).then(function (salvage_obj) {
      this.salvage_medium_armor_template = salvage_obj;
    }.bind(this));
  },

  _createHeavyArmorSalvagePromise: function () {
    let item_ids = [MITHRIL_ORE_ID, ORICHALCUM_ORE_ID, ECTOPLASM_ID];

    return this._createCommonSalvageComponentPromise(item_ids, false).then(function (salvage_obj) {
      this.salvage_heavy_armor_template = salvage_obj;
    }.bind(this));
  },

  _createWeaponSalvagePromise: function () {
    let item_ids = [MITHRIL_ORE_ID, ORICHALCUM_ORE_ID, ELDER_WOOD_LOG_ID, ANCIENT_WOOD_LOG_ID, ECTOPLASM_ID];

    return this._createCommonSalvageComponentPromise(item_ids, true).then(function (salvage_obj) {
      this.salvage_weapon_template = salvage_obj;
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
          case "ConditionDamage":
            id = isWeapon ? SHAMANS_INSCRIPTION_ID : SHAMANS_INSIGNIA_ID;
            break;
        }
        break;
      case "ConditionDamage":
        switch (attrs[1]["attribute"]) {
          case "Toughness":
            id = isWeapon ? DIRE_INSCRIPTION_ID : DIRE_INSIGNIA_ID;
            break;
          case "Precision":
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

    let result = {
      "blsk": this.ins_list_blsk.find(function (it, i, a) { return it["id"] == id;}),
      "mystic": this.ins_list_mystic.find(function (it, i, a) { return it["id"] == id;})
    };

    return result;
  },

  init: function () {
    var promises = [this._createLightArmorSalvagePromise(),
                    this._createMediumArmorSalvagePromise(),
                    this._createHeavyArmorSalvagePromise(),
                    this._createWeaponSalvagePromise(),
                    this._createInsPromise()];

    return Promise.all(promises).then(function (arr) {
      this.initialised = true;
    }.bind(this));
  },

  getSalvageProduct: function (item) {
    var allPromises = [];

    let res;


    // Just to be sure, lets check if the item is salvagable
    if (!("NoSalvage" in item["flags"]) &&
      (item["type"].toLowerCase() == "weapon" || item["type"].toLowerCase() == "armor")) {
        if (item["rarity"].toLowerCase() == "exotic") {
          // Just not yet considering rares

          let salvage_template;

          if (item["type"].toLowerCase() == "weapon") {
            salvage_template = this.salvage_weapon_template;
          } else {
            switch (item["details"]["weight_class"].toLowerCase()) {
              case "light":
                // Its now a shallow object copy, but the containing arrays are also shallowly copied
                salvage_template = this.salvage_light_armor_template;

                break;
              case "medium":
                salvage_template = this.salvage_medium_armor_template;
                break;
              case "heavy":
                salvage_template = this.salvage_heavy_armor_template;
                break;
            }

          }

          if (salvage_template) {
            // Shallow copy of the object
            res = $.extend(true, {}, salvage_template);


            let ins = this._findIns(item);

            for (let kit in ins) {
              if (ins[kit] && kit in res) {
                res[kit].push(ins[kit]);
              }
            }
          }
        }
    }

    return res;
  }
}

module.exports = {
  SalvageService: SalvageService
}
