var casper = require('casper').create({
    waitTimeout: 1000,
    verbose: true,
    logLevel: 'error', 
    pageSettings: {
        userAgent: "Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US) AppleWebKit/534.16 (KHTML, like Gecko) Chrome/10.0.648.204 Safari/534.16"
    }
});

var fs = require('fs');

var csgoHome = "http://steamcommunity.com/market/search?q=appid%3A730";
var pages = 0;
var currentPage = 1;
var weaponsAll = [];
var weaponsOnPage = [];

var terminate = function(){
	fs.write('weapons.txt', weaponsAll.join('\n'), 'w');
	casper.log("the end", 'info');
}

var processPage = function(){
	var url;
	casper.log("crawling the page " + currentPage, 'info');

	weaponsOnPage = casper.evaluate(function(){
		var tempNames = [];
		var weaponNames = document.querySelectorAll('a.market_listing_row_link div.market_listing_item_name_block span.market_listing_item_name');
		var weaponQuantities = document.querySelectorAll('a.market_listing_row_link div.market_listing_right_cell span.market_listing_num_listings_qty');
		var weaponPrices = document.querySelectorAll('a.market_listing_row_link div.market_listing_right_cell span:last-child');
		for (var i = 0; i < weaponNames.length; i++) {
			var tempPrice = weaponPrices[i].innerHTML.substring(weaponPrices[i].innerHTML.indexOf("$"));
			tempNames[i] = weaponNames[i].innerHTML.concat(" ", weaponQuantities[i].innerHTML, " ", tempPrice);
		};
		return tempNames;	
	});

	weaponsAll = weaponsAll.concat(weaponsOnPage);
	// this.echo(weaponsOnPage.join("\n"));

	if (currentPage === pages) {
		return terminate.call(casper);
	}

	currentPage++;
    casper.log("requesting next page: " + currentPage, 'info');
    url = this.getCurrentUrl();
    this.thenClick("#searchResults_btn_next").then(function() {
        this.waitFor(function() {
            return url !== this.getCurrentUrl();
        }, processPage, terminate);
    });

}


casper.start(csgoHome, function(){
	pages = casper.evaluate(function(){
		return document.querySelector('#searchResults_links span:last-child').innerHTML;
	});
})

casper.waitForSelector('#searchResults_btn_next', processPage, terminate);
casper.run();