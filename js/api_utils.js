module.exports = {
  getItemsPromise: getItemsPromise,
  getTPPrices: getTPPrices,
  mergeItemArrays: mergeItemArrays
}


/*
Function that retrieves a list of item id's from the API

@param List of item id's
@return Promise that resolves with a list of items
*/
function getItemsPromise(item_ids) {
  let id_string = item_ids.join(',');

  let api_query = `https://api.guildwars2.com/v2/items?ids=${id_string}`;

  return Promise.resolve($.ajax(api_query));
}

/*
Function that retrieves a list of prices from the tp for a list of item ids

@param List of item id's
@return Promise that resolves with a list of items
*/
function getTPPrices(item_ids) {
  let id_string = item_ids.join(',');

  let api_query = `https://api.guildwars2.com/v2/commerce/prices?ids=${id_string}`;

  return Promise.resolve($.ajax(api_query)).catch(function (e) {
    // if no items are sellable, we just return an empty array
    return [];
  });
}

/*
Function that merges an array of items and an array of tp values into a single
array
*/
function mergeItemArrays(item_items, tp_items) {
  for (let tp_item of tp_items) {
    for (let item of item_items) {
      if (item["id"] == tp_item["id"]) {
        item["tp_value"] = {
          "buys": tp_item["buys"]["unit_price"],
          "sells": tp_item["sells"]["unit_price"]
        };
      }
    }
  }

  return item_items;
}
