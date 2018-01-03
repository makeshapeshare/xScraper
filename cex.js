var exports = module.exports = {};
var fetch = require('node-fetch');
var moment = require('moment');
var crypto = require('crypto');

const userid = "up111246186";
const key = "ZvHZroIBCmAbDwoZtB0XaK8";
const secret = "9p40KC9er6l53eh79gs8f8s93Q";

const GET_Limit = "https://cex.io/api/currency_limits";
const GET_Ticker_BTCUSD = "https://cex.io/api/ticker/BTC/USD";
const GET_Last_BTCUSD = "https://cex.io/api/last_price/BTC/USD";
const GET_Chart_BTCUSD = "https://cex.io/api/price_stats/BTC/USD";
const GET_Orderbook_BTCUSD = "https://cex.io/api/order_book/BTC/USD/?depth=1";

const POST_AccountBalance = "https://cex.io/api/balance/";
const POST_OpenOrders = "https://cex.io/api/open_orders/";
const POST_CancelOrder = "https://cex.io/api/cancel_order/";
const POST_PlaceOrder_BTCUSD = "https://cex.io/api/place_order/BTC/USD";
const POST_PlaceInstantOrder_BTCUSD = "https://cex.io/api/place_order/BTC/USD";
const POST_GetOrderDetails = "https://cex.io/api/get_order/";
const POST_GetOrderTransactions = "https://cex.io/api/get_order_tx/";
const POST_GetFees = "https://cex.io/api/get_myfee";

//=============== GENERAL ===============

exports.getPromise = function(url,param){
	return new Promise((resolve, reject) => {
  		fetch(url,param)
	    .then(function(res) {
	        return res.json();
	    }).then(function(json) {
	    	resolve(json);
	        return json;
	    }).catch(function(error) {
		  	console.log('Error: ', error);
		  	reject(error);
		});
  	});
}

exports.getNonce = function(){
  	return moment.now();
}

exports.getKey = function(){
  	return key;
}

exports.getUserid = function(){
  	return userid;
}

exports.getSignature = function(nonce){
  	return crypto.createHmac('sha256', Buffer.from(secret)).update(nonce.toString().concat(userid,key)).digest('hex').toUpperCase();
}


//=============== GET PUBLIC ===============

exports.getLimits = function(){
  	return this.getPromise(GET_Limit);
}

exports.BTC_Ticker = function(){
  	return this.getPromise(GET_Ticker_BTCUSD);
}

exports.BTC_LastPrice = function(){
  	return this.getPromise(GET_Last_BTCUSD);
}

exports.BTC_Chart = function(){
  	var opts = {
  		'lastHours': 24, 
    	'maxRespArrSize': 100 
  	};
  	var param = {
  		method: 'POST',
  		headers: {'Content-Type': 'application/json'},
  		body: JSON.stringify(opts)	
  	};
  	return this.getPromise(GET_Chart_BTCUSD,param);
}

exports.BTC_Orderbook = function(){
  	return this.getPromise(GET_Orderbook_BTCUSD);
}

//=============== GET PRIVATE ===============
    
exports.getAccountBalance = function(){
  	var nonce = this.getNonce();
  	var opts = {
  		'key': key, 
    	'signature': this.getSignature(nonce), 
    	'nonce': nonce 
  	};
  	var param = {
  		method: 'POST',
  		headers: {'Content-Type': 'application/json'},
  		body: JSON.stringify(opts)	
  	};
  	return this.getPromise(POST_AccountBalance,param);
}

exports.getOpenOrders = function(){
  	var nonce = this.getNonce();
  	var opts = {
  		'key': key, 
    	'signature': this.getSignature(nonce), 
    	'nonce': nonce 
  	};
  	var param = {
  		method: 'POST',
  		headers: {'Content-Type': 'application/json'},
  		body: JSON.stringify(opts)	
  	};
  	return this.getPromise(POST_OpenOrders,param);
}

exports.cancelOrder = function(orderid){
  	var nonce = this.getNonce();
  	var opts = {
  		'key': key, 
    	'signature': this.getSignature(nonce), 
    	'nonce': nonce,
    	 'id': orderid
  	};
  	var param = {
  		method: 'POST',
  		headers: {'Content-Type': 'application/json'},
  		body: JSON.stringify(opts)	
  	};
  	return this.getPromise(POST_CancelOrder,param);
}

exports.BTC_placeLimitOrder = function(type,amount,price){
  	var nonce = this.getNonce();
  	var opts = {
  		'key': key, 
    	'signature': this.getSignature(nonce), 
    	'nonce': nonce,
    	'type': type,
    	'amount': amount,
    	'price': price,
  	};
  	var param = {
  		method: 'POST',
  		headers: {'Content-Type': 'application/json'},
  		body: JSON.stringify(opts)	
  	};
  	return this.getPromise(POST_PlaceOrder_BTCUSD,param);
}

exports.BTC_placeMarketOrder = function(type,amount){
  	var nonce = this.getNonce();
  	var opts = {
  		'key': key, 
    	'signature': this.getSignature(nonce), 
    	'nonce': nonce,
    	'type': type,
    	'amount': amount,
    	'order_type': "market",
  	};
  	var param = {
  		method: 'POST',
  		headers: {'Content-Type': 'application/json'},
  		body: JSON.stringify(opts)	
  	};
  	return this.getPromise(POST_PlaceInstantOrder_BTCUSD,param);
}

exports.getOrderDetails = function(orderid){
  	var nonce = this.getNonce();
  	var opts = {
  		'key': key, 
    	'signature': this.getSignature(nonce), 
    	'nonce': nonce,
    	'id': orderid,
  	};
  	var param = {
  		method: 'POST',
  		headers: {'Content-Type': 'application/json'},
  		body: JSON.stringify(opts)	
  	};
  	return this.getPromise(POST_GetOrderDetails,param);
}

exports.getOrderTransactions = function(orderid){
  	var nonce = this.getNonce();
  	var opts = {
  		'key': key, 
    	'signature': this.getSignature(nonce), 
    	'nonce': nonce,
    	'id': orderid,
  	};
  	var param = {
  		method: 'POST',
  		headers: {'Content-Type': 'application/json'},
  		body: JSON.stringify(opts)	
  	};
  	return this.getPromise(POST_GetOrderTransactions,param);
}

exports.getFees = function(){
  	var nonce = this.getNonce();
  	var opts = {
  		'key': key, 
    	'signature': this.getSignature(nonce), 
    	'nonce': nonce
  	};
  	var param = {
  		method: 'POST',
  		headers: {'Content-Type': 'application/json'},
  		body: JSON.stringify(opts)	
  	};
  	return this.getPromise(POST_GetFees,param);
}