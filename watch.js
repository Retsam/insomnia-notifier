var notifier = require("node-notifier");
var Promise = require("bluebird");
var request = require("request-promise");

var REFRESH_RATE = 30000;
var UPDATE_URI = "https://www.gog.com/insomnia/current_deal";

var region = "US";

var currentTitle = null;

function handleUpdate(saleData) {
    var title = saleData.product.title;
    if(title === currentTitle) {
        console.log("Current sale still running");
        return;
    }
    currentTitle = title;

    var priceInfo = getPriceInfo(saleData.product.prices);
    notifier.notify({
        title: "New Sale: "+title,
        message: priceInfo.is + " ("+saleData.discount+"% off)"
    });
}

function getPriceInfo(prices) {
    var currency = "USD";
    var priceData = prices.groupsPrices["USD"]["1"].split(";");

    function format(amount) {
        if(currency === "USD") {
            return "$" + amount;
        }
        return amount + currency;
    }

    return {
        was: format(priceData[0]),
        is: format(priceData[1])
    }
}

function checkForUpdate() {
    var options = {
        uri: UPDATE_URI,
        json: true
    };

    console.log("Checking if there's a new sale");
    return request(options).then(handleUpdate);
}

function watchUpdates() {
    return checkForUpdate()
        .delay(30000)
        .then(watchUpdates);
}

watchUpdates();
