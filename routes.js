
var xScraperController = require('./controller.js');
//localhost:3000/<route>
module.exports = function(app){
	app.route('/').get(xScraperController.getHome);

	app.route('/limits').get(xScraperController.getLimits);	
	
	app.route('/account').get(xScraperController.getAccount);

	app.route('/records').get(xScraperController.getRecords);
	//app.route('/records/:recordId').get(xScraperController.getRecordId);

	app.route('/lines/start').get(xScraperController.startLine);

	app.route('/lines').get(xScraperController.getLines);

	app.route('/linethreads/:lineId').get(xScraperController.getLineThreads);

	app.route('/threads').get(xScraperController.getThreads);

	app.route('/threads/active').get(xScraperController.getActiveThreads);

	app.route('/priceBTCUSD').get(xScraperController.getPriceBTCUSD);

	app.route('/forcesell/:threadId').get(xScraperController.forceSell);	

	app.route('/manual/trades').get(xScraperController.manualTrades);	

	app.route('/manual/buy/:usd').get(xScraperController.manualBuy);	

	app.route('/manual/sell/:btc').get(xScraperController.manualSell);	
}

