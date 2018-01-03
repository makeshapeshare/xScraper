
var CEX = require('./cex.js');

var buyDetails = {
	size : 0.01
};


//CEX.getSignature(CEX.getNonce(), CEX.getKey(),CEX.getUserid());
var getPrice = function(){
	CEX.BTC_LastPrice().then((res) => {
		console.log('results',res);
	});
};

var iterate = function(){
	setInterval(getPrice, 60000);
};

iterate();



// CEX.BTC_Ticker().then((res) => {
// 	console.log('results',res);
// });

CEX.BTC_LastPrice().then((res) => {
	console.log('results',res);
});



// CEX.getLimits().then((res) => {
// 	console.log('results',res);
// 	for (i = 0; i < res.data.pairs.length; i++) { 
// 		console.log('pair',res.data.pairs[i]);
// 	}
// });



