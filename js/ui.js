window.$ = window.jQuery = require('jquery');
require("babelify/polyfill");
var Handlebars = require('handlebars');

require("datatables");

function errorFunc(error, human_error) {
  var source = $("#error-template").html();
  var template = Handlebars.compile(source);
  var context = {
    human_error: human_error ? human_error : 'Something broke horribly! Yell at your favorite windwarrior!',
    dev_error: JSON.stringify(error),
  }

  var html = template(context);

  $("#errors").append(html);
}

function chromeRedraw() {
  // HACK: Apparantly chrome forgets to redraw sometimes
  $('body').css('overflow', 'hidden').height();
  $('body').css('overflow', 'auto');

  $('body').each(function () {
    var redraw = this.offsetHeight;
  });
}

Handlebars.registerHelper("formatGold", function(coin, icons) {
  coin = Math.round(coin);
  var gold   = Math.floor(coin / 10000) % 100;
  var silver = Math.floor(coin / 100) % 100;
  var copper = Math.floor(coin) % 100;

  let res = `<span>${copper}</span>` + icons.ui_coin_copper;

  if (silver > 0) {
    res = `<span>${silver}</span>` + icons.ui_coin_silver + res;
  }

  if (gold > 0) {
    res = `<span>${gold}</span>` + icons.ui_coin_gold + res;
  }

  return new Handlebars.SafeString('<div class="moneyBox">' + res + '</div>');
});

Handlebars.registerHelper("formatToken", function(token_cost, token_icon) {
  let res = `<span>${token_cost}</span>` + token_icon;

  return new Handlebars.SafeString(res);
});

var miner = require('./miner');
var DUNGEON_IDS = require('./dungeon_ids');
var salvage = require('./salvage');

$(document).ready(function () {
  // For the UI to work we first need icons for gold
  let first_order_promises = [];
  let icons = {};

  first_order_promises.push(Promise.resolve($.ajax("https://api.guildwars2.com/v1/files.json")).then(function (fileJson) {
    for (let icon_name of ["ui_coin_gold", "ui_coin_silver", "ui_coin_copper"]) {
      let signature = fileJson[icon_name]["signature"];
      let file_id = fileJson[icon_name]["file_id"];

      let gold_icon_location = `https://render.guildwars2.com/file/${signature}/${file_id}.png`;
      icons[icon_name] = `<img class="icon-compact" src="${gold_icon_location}"/>`;
    }
  }));

  first_order_promises.push(salvage.SalvageService.init());

  for (let dungeon of DUNGEON_IDS.dungeons) {
    let currency_promise = Promise.resolve($.ajax(`https://api.guildwars2.com/v2/currencies/${dungeon["currency_id"]}`)).then(function (result) {
      return $.extend(dungeon, result);
    }).catch(function (error) {
      errorFunc(error, `Failed to load data for currency ${dungeon["name"]}`);
    });

    first_order_promises.push(currency_promise);
  }

  Promise.all(first_order_promises).then(function (resArr) {
    let second_order_promises = [];

    for (let dungeon of DUNGEON_IDS.dungeons) {
      let data_promise = miner.mine(dungeon["item_ids"]).then(function(items) {
        return namifyItems(items);
      }).then(function (items) {
        dungeon["items"] = items;
      }).catch(function (error) {
        errorFunc(error, `Failed to load/process items for ${dungeon["name"]}`);
      });
      second_order_promises.push(data_promise);
    }

    return Promise.all(second_order_promises).then(function (resArr) {
      var listTemplateSource = $("#dungeon_item_table").html();
      var listTemplate = Handlebars.compile(listTemplateSource);

      let tabTemplateSource = $("#dungeon_tab_row").html();
      let tabTemplate = Handlebars.compile(tabTemplateSource);

      for (let dungeon of DUNGEON_IDS.dungeons) {
        // now all dungeons are indeed complete
        var listTemplateContext = {
          token_icon: `<img class="icon-compact" src="${dungeon["icon"]}"/>`,
          items: dungeon["items"],
          icons: icons,
          dungeon_symbolic_name: dungeon["dungeon_symbolic_name"],
          dungeon_name: dungeon["dungeon_name"],
        };

        $("#dungeon_panels").append(listTemplate(listTemplateContext));

        var tabTemplateContext = {
          dungeon_symbolic_name: dungeon["dungeon_symbolic_name"],
          dungeon_name: dungeon["dungeon_name"],
          dungeon_short: dungeon["dungeon_short"],
        }

        $("#dungeon_tabs").append(tabTemplate(tabTemplateContext));

        // This has to be let, never change it to var, breaks stuff
        let table = $(`#${dungeon["dungeon_symbolic_name"]}_table`).DataTable({
          "paging":   false,
          "order": [[ 4, "desc"]],
          "searching": false,
          "info": false,
        });

        //tables[dungeon["dungeon_name"]] = table;

        $(`#${dungeon["dungeon_symbolic_name"]}_table`).on('click', 'tr.child-revealer', function () {
          let row = table.row(this);

          let item_id = $(this).data("item-id");

          let item = dungeon["items"].find(function (elem) {
            return elem["id"] == item_id;
          })

          if ( row.child.isShown() ) {
              // This row is already open - close it
              row.child.hide();
          }
          else {
              // Open this row
              row.child(createDetailedUI(item, icons)).show();

              if ("salvage_sells" in item["values"]) {
                $(`#${item_id}_salvage_table`).DataTable({
                  "paging":   false,
                  "order": [[ 4, "desc"]],
                  "searching": false,
                  "info": false,
                });
              }

              $(`#${item_id}_panels`).removeClass("active");
              $(`#${item_id}_${item.values.strategy}`).addClass("active");

              $(`#${item_id}_tabs`).removeClass("active");
              $(`#${item_id}_${item.values.strategy}_tab`).addClass("active");
          }


          // It sometimes does not draw, so force it
          table.draw();

          chromeRedraw();
        });
      }
    }).then(function () {
      $("#dungeon_tabs a:first").tab('show');
    }).catch(function (error) {
      errorFunc(error, `Something broke horribly!`);
    }).then(function (elem) {
      $("#loading-spinner").hide();
    });

  });
})

// Creates the detailview per item
function createDetailedUI (item, icons) {
  var itemDetailRowSource = $("#item_detail_row").html();
  var itemDetailRowTemplate = Handlebars.compile(itemDetailRowSource);

  var itemDetailRowContext = {
    item: item,
    icons: icons
  }

  return itemDetailRowTemplate(itemDetailRowContext);
}


function namifyItems(items) {
  for (let item of items) {
    if (item["type"].toLowerCase() == "armor" ||
      item["type"].toLowerCase() == "weapon") {
      // Okay we want an array of all attributes (that should now be sorted!)

      let attributeArray = [];

      for (let attr of item["details"]["infix_upgrade"]["attributes"]) {
        attributeArray.push("+" + attr["attribute"].replace(/([a-z](?=[A-Z]))/g, '$1 '));
      }

      item["full_name"] = item["name"] + " (" + attributeArray.join(', ') + ")";
    } else {
      item["full_name"] = item["name"];
    }
  }

  return items;
}
