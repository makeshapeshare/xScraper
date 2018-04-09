
var xScraperController = require('./controller.js');
//localhost:3000/<route>
module.exports = function(app){
	app.route('/').get(xScraperController.getHome);
	
	app.route('/account').get(xScraperController.getAccount);

	app.route('/records').get(xScraperController.getRecords);
	//app.route('/records/:recordId').get(xScraperController.getRecordId);

	app.route('/lines/start').get(xScraperController.startLine);

	app.route('/lines').get(xScraperController.getLines);

	app.route('/linethreads/:lineId').get(xScraperController.getLineThreads);

	app.route('/threads').get(xScraperController.getThreads);


	app.route('/priceBTCUSD').get(xScraperController.getPriceBTCUSD);
}

