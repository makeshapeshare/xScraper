var exports = module.exports = {};

const GDAX = require('gdax');

const publicClient = new GDAX.PublicClient();

const passPhrase = 'u6n9l3r8rgd';
const apiKey = '73f6c1de8d6e86a063e3e7883fd0a205';
const base64secret = 'mgIvvJKGK4XPYfE+wceL6Ajecb+WeCrVkc6LgdTb+YZSAsCO8uAjR3JALZeNlFAC3tTd8n54jxvPKeR6mHezJg==';
const apiURI = 'https://api.gdax.com';

const authenticatedClient = new GDAX.AuthenticatedClient(apiKey, base64secret, passPhrase, apiURI);

const accBTC = '961d589b-8ab0-4c7e-8b69-0b55a7ca48bb';
const accETH = 'd030179d-072f-47e4-a336-376ca6939f60';
const accLTC = '69eb62c6-83ec-42ac-9b5e-96ae23a6857a';

const BTC_USD = 'BTC-USD';
const ETH_USD = 'ETH-USD';
const LTC_USD = 'LTC-USD';

//=============== GET ACCOUNTS ===============
	  	
exports.getAccounts = function(){
  	
  	return new Promise( /* executor */ function(resolve, reject) { 
  		authenticatedClient.getAccounts((error, response, data) => {
		  if (error) {
		    // handle the error
		    reject (error);
		  } else {
		    // work with data
		    //console.log('accounts',data);
		    resolve (data);
		  }
		});
  	}); 
  	
}

exports.getBTCAccount = function(){
  	
  	return new Promise( /* executor */ function(resolve, reject) { 
  		authenticatedClient.getAccount(accBTC,(error, response, data) => {
		  if (error) {
		    // handle the error
		    reject (error);
		  } else {
		    // work with data
		    //console.log('BTC account',data);
		    resolve (data);
		  }
		});
  	}); 
}

exports.getETHAccount = function(){
  	
  	return new Promise( /* executor */ function(resolve, reject) { 
  		authenticatedClient.getAccount(accETH,(error, response, data) => {
		  if (error) {
		    // handle the error
		    reject (error);
		  } else {
		    // work with data
		    //console.log('BTC account',data);
		    resolve (data);
		  }
		});
  	}); 
}

//=============== GET PRICE ===============

exports.getBTCTicker = function(){
  	
  	return new Promise( /* executor */ function(resolve, reject) { 
  		
  		authenticatedClient.getProductTicker((error, response, data) => {
		  if (error) {
		    // handle the error
		    reject (error);
		  } else {
		    // work with data
		    //console.log('BTC account',data);
		    resolve (data);
		  }
		});
  	}); 
}

exports.getETHTicker = function(){
  	const getParams = {
		"product_id": ETH_USD
	};	
  	const myCallback = (err, response, data) => {  
  		console.log("testing ok", data);
  	};
	const result = publicClient.getProductTicker(myCallback);
  	return result;
}


exports.getBTCSocket = function(){
  	
  	return new Promise( /* executor */ function(resolve, reject) { 
  		const websocket = new GDAX.WebsocketClient([BTC_USD]);
		const websocketCallback = (data) => {
			if (!(data.type === "done" && data.reason === "filled" && data.price)){
				//console.log("found match: ", data.price);
				console.dir(data.price);	
			}
         	return;
			//console.dir(data);	
			
		};
		websocket.on('message', websocketCallback);
  	}); 
}

exports.getETHSocket = function(){
  	
  	return new Promise( /* executor */ function(resolve, reject) { 
  		const websocket = new GDAX.WebsocketClient([ETH_USD]);
		const websocketCallback = (data) => {
			if (!(data.type === "done" && data.reason === "filled"))
         	return;
			console.dir(data);	
		};
		websocket.on('message', websocketCallback);
  	}); 
}

//=============== GET ORDERS ===============

exports.getOrders = function(){
  	
  	return new Promise( /* executor */ function(resolve, reject) { 
  		authenticatedClient.getOrders((error, response, data) => {
		  if (error) {
		    // handle the error
		    reject (error);
		  } else {
		    // work with data
		    //console.log('BTC account',data);
		    resolve (data);
		  }
		});
  	}); 
}

exports.getOrder = function(orderID){
  	
  	return new Promise( /* executor */ function(resolve, reject) { 
  		authenticatedClient.getOrder(orderID,(error, response, data) => {
		  if (error) {
		    // handle the error
		    reject (error);
		  } else {
		    // work with data
		    //console.log('BTC account',data);
		    resolve (data);
		  }
		});
  	}); 
}

//=============== PLACE ORDERS ===============

exports.buyBTCOrder = function(buyDetails){
  	
  	return new Promise( /* executor */ function(resolve, reject) { 
  		const buyParams = {
	        "price": buyDetails.price,
	        "size": buyDetails.size,
	        "product_id": BTC_USD,
	    };
	    this.buyOrderId = authenticatedClient.buy(buyParams,(error, response, data) => {
		  if (error) {
		    // handle the error
		    reject (error);
		  } else {
		    // work with data
		    //console.log('BTC account',data);
		    resolve (data);
		  }
		});
  	}); 
}

exports.sellBTCOrder = function(buyDetails){
  	
  	return new Promise( /* executor */ function(resolve, reject) { 
  		const sellParams = {
	        "price": buyDetails.price,
	        "size": buyDetails.size,
	        "product_id": BTC_USD,
	    };
	    this.sellOrderId = authenticatedClient.sell(sellParams,(error, response, data) => {
		  if (error) {
		    // handle the error
		    reject (error);
		  } else {
		    // work with data
		    //console.log('BTC account',data);
		    resolve (data);
		  }
		});
  	}); 
}

exports.buyETHOrder = function(buyDetails){
  	
  	return new Promise( /* executor */ function(resolve, reject) { 
  		const buyParams = {
	        "price": buyDetails.price,
	        "size": buyDetails.size,
	        "product_id": ETH_USD,
	    };
	    this.buyOrderId = authenticatedClient.buy(buyParams,(error, response, data) => {
		  if (error) {
		    // handle the error
		    reject (error);
		  } else {
		    // work with data
		    //console.log('BTC account',data);
		    resolve (data);
		  }
		});
  	}); 
}

exports.sellETHOrder = function(buyDetails){
  	
  	return new Promise( /* executor */ function(resolve, reject) { 
  		const sellParams = {
	        "price": buyDetails.price,
	        "size": buyDetails.size,
	        "product_id": ETH_USD,
	    };
	    this.sellOrderId = authenticatedClient.sell(sellParams,(error, response, data) => {
		  if (error) {
		    // handle the error
		    reject (error);
		  } else {
		    // work with data
		    //console.log('BTC account',data);
		    resolve (data);
		  }
		});
  	}); 
}
