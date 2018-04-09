//=== dependencies ===
//node fetch
//crypto
//mongodb
//mongoose
//express.js
//moment.js

import moment from 'moment';
import BTCUSDRecord from './models/model_Record';
import BTCUSDAve from './models/model_Ave';
import BTCUSDLine from './models/model_Line';
import BTCUSDThread from './models/model_Thread';
import BTCUSDProfit from './models/model_Profit';

var CEX = require('./cex.js');
var express = require('express');
var app = express();
var exports = module.exports = {};

//========================= GLOBALS ============================
app.set('currency', "BTCUSD");
app.set('currentPrice', 0);

app.set('thisYr', 0);
app.set('thisMth', 0);
app.set('thisDay', 0);
app.set('thisHr', 0);
app.set('thisMin', 0);
app.set('thisSec', 0);

app.set('records', []);
app.set('aggregates', []);
app.set('lines', []);
app.set('threads', []);
app.set('profits', []);

app.set('aveMth', 0);
app.set('aveDay', 0);
app.set('aveHr', 0);

app.set('totalSeed', 0);
app.set('totalThreadValue', 0);
app.set('totalProfits', 0);

app.set('limit', 0.01);
app.set('amount', 100);

//========================= GENERAL ============================

var idGenerator = function(inputDate){
    var id;
    var input = moment(inputDate);
    
    var idA = input.year();
    var idB = input.month();
    var idC = input.date();
    var idD = input.hour();
    var idE = input.minute();
    var idF = input.second();
    
    idB = idB + 1;
    if (idB.toString().length < 2){
      idB = "0".concat(idB.toString());
    }
    if (idC.toString().length < 2){
      idC = "0".concat(idC.toString());
    }
    if (idD.toString().length < 2){
      idD = "0".concat(idD.toString());
    }
    if (idE.toString().length < 2){
      idE = "0".concat(idE.toString());
    }
    if (idF.toString().length < 2){
      idF = "0".concat(idF.toString());
    }
    //console.log("year: " + idA.toString() + " month: " + idB.toString() + " day: " + idC.toString() + " hour: " + idD.toString() + " minute: " + idE.toString());
    app.set('thisYr', idA);
    app.set('thisMth', idB);
	  app.set('thisDay', idC);
	  app.set('thisHr', idD);
	  app.set('thisMin', idE);
	  app.set('thisSec', idF);

    id = idA.toString().concat(idB,idC,idD,idE,idF);
    
    return id;
};

//========================= FETCH ============================

//get latest market price from exchange api
var saveRecord = function(){
	CEX.BTC_LastPrice().then((res) => {
		console.log('market price',res);
		var genID = idGenerator(updated);
		var updated = new Date();
		var data = {
			id: genID,
			price: res.lprice,
			currency:res.curr1.concat(res.curr2),
			updated: updated
		}
		
		//console.log('data',data);

		var record = new BTCUSDRecord(data);
		record.save();

		app.set('currentPrice', res.lprice);
	});
};

//check database
var checkDatabase = function(){
    BTCUSDRecord.find(function (err, records) {
	  if (err) return console.error(err);
	  //console.log("records",records);
	  app.set('records', records);
	  aggregateData(records);
    //get aggregates when done
    BTCUSDAve.find(function (err, aggregates) {
      if (err) return console.error(err);
      //console.log("aggregates",aggregates);
      app.set('aggregates', aggregates);

      //get lines when done
      BTCUSDLine.find(function (err, lines) {
        if (err) return console.error(err);
        console.log("lines",lines);
        app.set('lines', lines);

        //get threads when done
        BTCUSDThread.find(function (err, threads) {
          if (err) return console.error(err);
          console.log("threads",threads);
          app.set('threads', threads);
          
          //========================ANALYSE DATA=============================
          //finally analyse data when all info available
          analyseData();
          //========================ANALYSE DATA=============================

        });
        //finished get threads

      });
      //finished get lines
    });
    //finished get aggregates
	});
  //profits non critical
	BTCUSDProfit.find(function (err, profits) {
	  if (err) return console.error(err);
	  console.log("profits",profits);
	  app.set('profits', profits);
	});
  
};

//========================= AGGREGATE ============================

var aggregateData = function(data){
    //console.log("retrieved data",data);
    var exist = false;
    var hourSet = [];
    var daySet = [];
    var monthSet = [];
    var hourSum = 0;
    var daySum = 0;
    var monthSum = 0;
    
    var checkYear = app.get('thisYr');
    var checkMonth = app.get('thisMth');
    var checkDate = app.get('thisDay');
    var checkHour = app.get('thisHr');
    var checkMinute = app.get('thisMin');
    //var checkSecond = app.get('thisSec');

    if (data && data.length){
      for (var i = 0; i < data.length; i++) { 
        var dataID = data[i].id;
        var dataYear = dataID.substr(0, 4);
        var dataMonth = dataID.substr(4, 2);
        var dataDate = dataID.substr(6, 2);
        var dataHour = dataID.substr(8, 2);
        //var dataMinute = dataID.substr(10, 2);
        //var dataSecond = dataID.substr(12, 2);

        if (dataYear == checkYear && dataMonth == checkMonth && dataDate == checkDate && dataHour == checkHour){
          hourSet.push(data[i]);
        }

        if (dataYear == checkYear && dataMonth == checkMonth && dataDate == checkDate){
          daySet.push(data[i]);
        }

        if (dataYear == checkYear && dataMonth == checkMonth){
          monthSet.push(data[i]);
        }
      }

      //perform hour aggregation
      for (var i = 0; i < hourSet.length; i++) { 
        hourSum = hourSum + hourSet[i].price;
      }

      //perform day aggregation
      for (var i = 0; i < daySet.length; i++) { 
        daySum = daySum + daySet[i].price;
      }

      //perform month aggregation
      for (var i = 0; i < monthSet.length; i++) { 
        monthSum = monthSum + monthSet[i].price;
      }
      //console.log("hour sum: " + hourSum.toFixed(2) + ", day sum: " + daySum.toFixed(2) + ", month sum: " + monthSum.toFixed(2));
      if (hourSum != 0 && daySum != 0 && monthSum != 0){
      	  var hourAve = hourSum/hourSet.length;
	      var dayAve = daySum/daySet.length;
	      var monthAve = monthSum/monthSet.length;

	      //check if existing data on average hour
	      //if yes, update. if not, add. 
	      var hrId = checkYear.toString().concat(checkMonth.toString(),checkDate.toString(),checkHour.toString());

	      var checkAggregates = app.get('aggregates');
	      if(checkAggregates == null || checkAggregates.length == 0){
	      	exist = false;
	      } else if (Array.isArray(checkAggregates) === true && checkAggregates.length > 0){
	      	for (var i = 0; i < checkAggregates.length; i++) { 
	            if(checkAggregates[i].id == hrId){
	              exist = true;
	            } 
	        }
	      }

	      var updatedDate = new Date();
	      var addItem = {
	          id: hrId,
	          price: hourAve,
	          currency: app.get("currency"),
	          updated: updatedDate
	      }

	      if(exist === true){
	        //update
	        BTCUSDAve.findOneAndUpdate({id: hrId}, addItem, {new: true}, function(err, agg) {
				if (err)
	        	throw err;
	        	//console.log("updated aggregate",agg);
			});
	      } else {
	      	//add
	        var aggregate = new BTCUSDAve(addItem);
			    aggregate.save();
	      }

	      app.set('aveMth', monthAve.toFixed(2));
		    app.set('aveDay', dayAve.toFixed(2));
		    app.set('aveHr', hourAve.toFixed(2));

	      //console.log("hour ave: " + hourAve.toFixed(2) + ", day ave: " + dayAve.toFixed(2) + ", month ave: " + monthAve.toFixed(2));
      }
      
    }
};

 

//========================= ANALYSE ============================

var analyseTrend = function(){
    var currentPrice = app.get("currentPrice");
    var currentHrAve = app.get("aveHr");
    if (currentPrice && currentHrAve && currentPrice != 0 && currentHrAve != 0){
      if(currentPrice > currentHrAve){
        //rising trend
        return true;
      }else{
        //falling trend
        return false;
      }  
    } else{
      //not initialized
      return false;
    }
};
  
var analyseData = function(){
    var currentPrice = app.get("currentPrice");
    var mylines = app.get("lines");
    var mythreads = app.get("threads");

    if (currentPrice && mylines && mythreads){
      //check for inactive lines to buy
      for (var j = 0; j < mylines.length; j++) { 
        var thisLine = mylines[j];
        if(thisLine.active === false){
          //inactive thread, decide by trend
          //console.log("analysing line", thisLine);
          if (analyseTrend() === true){
            //upward trend, buy and start new thread
            console.log("up trend. BUY");
            buy(thisLine, currentPrice);
          } else{
            //downward trend, wait
            console.log("down trend. WAIT");
          }
        }
      }

      //check for active threads to sell
      for (var i = 0; i < mythreads.length; i++) { 
        var thisThread = mythreads[i];
        //console.log("analysing thread",thisThread);
        if(thisThread.active === true){
          //active thread, compare thread price
          if (currentPrice > thisThread.startPrice && (currentPrice - thisThread.startPrice) > (thisThread.limit * thisThread.startPrice) ){
            //profit hit, sell
            console.log("profit. SELL");
            sell(thisThread, currentPrice);
          } else{
            //continue to wait
            console.log("no profit. WAIT");
          }
        } 
      }
    }
};

//========================= FRAMEWORK ============================

var startLine = function(price){
    var startRes = { status: "initiated" };
    var ind = 0;
    var xLimit = app.get("limit");
    //var xAmt = app.get("amount");
    //var xAmt = 0.012 * price;
    var xAmt = 0.003 * price;
    var xCurrency = app.get("currency");

    var mylines = app.get("lines");
    if (!Array.isArray(mylines) || !mylines.length) {
    	//no lines here
    	ind = 1;
    } else{
    	ind = parseInt(mylines.length) + 1;
    }

    //define line object
    var genID = "L".concat(ind.toString(),"X");
    var updatedDate = new Date();
    var addLine = {
        id : genID,
        limit : xLimit,
        startDate : updatedDate,
        //endDate : null,
        active : true,
        //amount : xAmt, //deprecated. amount changes to 0.012 of transacted price
        profitToDate : 0,
        averagePeriod : [],
        cycles : 0,
        currency : xCurrency,
        updated : updatedDate
    };

    if (price && price != null){
    	//add new line
    	var newLine = new BTCUSDLine(addLine);
		  newLine.save(function (err, xLine) {
			if (err) return console.error(err);
	  		console.log("started new line",xLine);
			 //start new thread here
  			var xThread = startThread(addLine, xAmt, price, updatedDate, xCurrency);
  			startRes = {
  				status: "ok",
  				line: xLine,
  				thread: xThread
  			}
        //console.log("completed line start",startRes);
  			
  		}); 
    }
    return startRes;
};

var startThread = function(line, xAmt, xPrice, xDate, xCurrency){
    //console.log("starting thread with this line..", line);
    //test with initial price
    //var testPrice = 17000; //CHANGE THIS BACK DURING DEPLOYMENT

    if (line && xAmt && xPrice){
      //define thread object
      var thisCycle = parseInt(line.cycles) + 1;
      var checkId = line.id.concat(thisCycle.toString());
      
      //var buyAmt = 0; //development
      var buyAmt = xAmt; //deployment
      
      
      //======================CEX BUY========================
      CEX.BTC_placeMarketOrder("buy",buyAmt).then((res) => {
        console.log('buy response',res);

        if(res && res.id && res.id != null){

          var orderId = res.id;

          CEX.getOrderDetails(orderId).then((response) => {
            var BTCAmt = parseFloat(response['a:BTC:cds']);
            var feeUSDAmt = parseFloat(response['tfa:USD']);
            var txUSDAmt = parseFloat(response['tta:USD']);
            
            var buyData = {
              orderId: orderId,
              BTCAmt: BTCAmt,
              txPrice: (1/BTCAmt) * txUSDAmt,
              txAmt : (txUSDAmt + feeUSDAmt),
              fee: feeUSDAmt,
              finAmt: txUSDAmt
            };
            console.log('buy data',buyData);
            
            //==================APP OPS===================

            var addThread ={
              id : checkId,
              parent : line.id,
              startDate : xDate,
              //endDate : null,
              active : true,
              limit : line.limit,
              amount_ : parseFloat(buyData.finAmt),//deployment
              //amount : parseFloat(xAmt),//development
              amount : parseFloat(buyData.txAmt),//deployment
              //bitcoin : (xAmt/xPrice),//development
              bitcoin : buyData.BTCAmt,//deployment
              //startPrice : xPrice, //development
              startPrice : buyData.txPrice, //deployment
              startTixPrice : xPrice,
              //exitAmount : null,
              //endPrice : null,
              profit : 0,
              period: 0,
              cycle : thisCycle,
              currency : xCurrency,
              updated : xDate
            };
            //console.log("this is the new thread..", addThread);
            BTCUSDThread.find({ id: checkId }, function(err, eThread) {
              if (err) return console.error(err);
              if (eThread && eThread.length > 0){
                //existing thread. something is wrong
                console.log("returned existing thread during start thread. Please investigate", eThread);
              } else{
                //
                console.log("no existing thread during start thread. Starting new thread", eThread);
                var newThread = new BTCUSDThread(addThread);
                newThread.save(function (err, xThread) {
                  if (err) return console.error(err);
                  console.log("started new thread",xThread);
                  //update line to be active
                  var updateLine ={
                    active: true
                  };
                  BTCUSDLine.findOneAndUpdate({id: xThread.parent}, updateLine, {new: true}, function(err, xLine) {
                    if (err)
                        throw err;
                        console.log("updated line after starting thread",xLine);
                  });
                  //get all threads from db and update app
                  BTCUSDThread.find(function (err, threads) {
                    if (err) return console.error(err);
                    console.log("threads",threads);
                    app.set('threads', threads);
                  });
                  return xThread;
                });  
                //
              }
            }).limit(1);

            //==================APP OPS===================

          });//======================CEX ORDER DETAILS========================

        } //end if res.id
        else{ 
          //error. order not executed
          console.log('buy error',res);
        }
        
      });//======================CEX BUY========================
      
    }
};

//========================= TRADE ============================

var buyCEX = function(buyAmt){
  var buyAmt = 0; //testing only, to replace with development
  CEX.BTC_placeMarketOrder("buy",buyAmt).then((res) => {
    console.log('buy response',res);
    var orderId = res.orderId;

    CEX.getOrderDetails(orderId).then((res) => {
      var BTCAmt = parseFloat(res['a:BTC:cds']);
      var feeUSDAmt = parseFloat(res['tfa:USD']);
      var txUSDAmt = parseFloat(res['tta:USD']);
      
      var buyData = {
        orderId: orderId,
        BTCAmt: BTCAmt,
        txPrice: (1/BTCAmt) * txUSDAmt,
        txAmt : (txUSDAmt + feeUSDAmt),
        fee: feeUSDAmt,
        finAmt: txUSDAmt
      };
      console.log('buy data',buyData);
      return buyData;
    });
  });
};

var sellCEX = function(sellAmt){
  var sellAmt = 0; //testing only, to replace with development
  CEX.BTC_placeMarketOrder("sell",sellAmt).then((res) => {
    console.log('sell response',res);
    var orderId = res.orderId;

    CEX.getOrderDetails(orderId).then((res) => {
      var BTCAmt = parseFloat(res['a:BTC:cds']);
      var feeUSDAmt = parseFloat(res['tfa:USD']);
      var txUSDAmt = parseFloat(res['tta:USD']);
      
      var sellData = {
        orderId: orderId,
        BTCAmt: BTCAmt,
        txPrice: (1/BTCAmt) * txUSDAmt,
        txAmt : txUSDAmt,
        fee: feeUSDAmt,
        finAmt: txUSDAmt - feeUSDAmt
      };
      console.log('sell data',sellData);
      return sellData;
    });
  });
};


var sell = function(thread, price){
  if(thread && price){
    //console.log("terminating thread..", thread);
      
    var end = new Date();
      
    //======================CEX SELL========================
    var sellAmt = thread.bitcoin; //amount in BTC

    CEX.BTC_placeMarketOrder("sell",sellAmt).then((res) => { //to investigate how to make this more stable by changing to limit orders
      console.log('sell response',res);

      if(res && res.id && res.id != null){

        var orderId = res.id;

        CEX.getOrderDetails(orderId).then((response) => {
          var BTCAmt = parseFloat(response['a:BTC:cds']);
          var feeUSDAmt = parseFloat(response['tfa:USD']);
          var txUSDAmt = parseFloat(response['tta:USD']);
          
          var sellData = {
            orderId: orderId,
            BTCAmt: BTCAmt,
            txPrice: (1/BTCAmt) * txUSDAmt,
            txAmt : txUSDAmt,
            fee: feeUSDAmt,
            finAmt: txUSDAmt - feeUSDAmt
          };
          console.log('sell data',sellData);
            
          //==================APP OPS===================
          //var btcx = thread.bitcoin; //development
          var btcx = sellData.BTCAmt; //deployment

          //var feex = 0; //development
          var feex = sellData.fee; //deployment 

          //var sellx = parseFloat(thread.bitcoin * price); //development
          var sellx = sellData.txAmt; //deployment 

          //var orderx = thread.id; //development
          var orderx = sellData.orderId; //deployment

          //var pricex = price; //development
          var pricex = sellData.txPrice; //deployment

          var tpricex = price; //deployment & development

          //var exitx = sellx; //development
          var exitx = sellData.finAmt; //deployment
          
          //var profitx = parseFloat(exitx - thread.amount); //development
          var profitx = parseFloat(sellData.finAmt - thread.amount); //deployment

          var endMoment = moment(end).format();
          var startMoment = moment(thread.startDate).format();
          
          var periodx_ = moment(endMoment).diff(moment(startMoment));
          var periodx = parseInt(periodx_/1000); //in seconds
          
          var existT = false;
          var existL = false;
          var lineDB = [];

          var checkLines = app.get("lines");
          var checkThreads = app.get("threads");

          if(checkThreads == null || checkThreads.length == 0){      
            existT = false;
          } else if (Array.isArray(checkThreads) === true && checkThreads.length > 0){
            for (var i = 0; i < checkThreads.length; i++) { 
              if(checkThreads[i].id == thread.id){
                existT = true;
              } 
            }
          }
          var endThread = {
            //id : thread.id,
            //parent : thread.parent,
            //startDate : thread.startDate,
            endDate : end,
            active : false,
            //limit : thread.limit,
            //amount : thread.amount,
            //bitcoin : thread.bitcoin,
            //startPrice : thread.price,
            exitAmount : parseFloat(exitx),
            endTixPrice : parseFloat(tpricex),
            endPrice : parseFloat(pricex),
            profit : parseFloat(profitx),
            period: periodx,
            cycle : thread.cycle,
            orderId : orderx.toString()
          };
          if(existT === true){
            //update thread server
            console.log("updating this end Thread", endThread);
            BTCUSDThread.findOneAndUpdate({id: thread.id}, endThread, {new: true}, function(err, xThread) {
              if (err)
              throw err;
              console.log("updated thread after selling",xThread);
              var lineProfx = 0;
              var aCycle = 0;
              var checkPeriod = [];
              var startx = null;
              
              //update lines with metadata
              if (Array.isArray(checkLines) === true && checkLines.length > 0){
                for (var i = 0; i < checkLines.length; i++) { 
                  if(checkLines[i].id == thread.parent){
                    console.log("entered line item",checkLines[i]);
                    lineProfx = checkLines[i].profitToDate;
                    startx = checkLines[i].startDate;
                    aCycle = parseInt(checkLines[i].cycles) + 1;
                    checkPeriod = checkLines[i].averagePeriod;
                    console.log("period before..........", checkPeriod);
                    if (checkPeriod == null){
                     checkPeriod = [];
                    }
                    if (Array.isArray(checkPeriod) === false){
                     checkPeriod = [];
                    }
                    checkPeriod.push(periodx);
                    //console.log("periodx", periodx);
                    console.log("period after..........", checkPeriod);
                    var endLine = {
                      id : thread.parent,
                      limit : thread.limit,
                      startDate : startx,
                      //endDate : null,
                      active : false,
                      profitToDate : parseFloat(lineProfx) + parseFloat(profitx),
                      averagePeriod : checkPeriod,
                      cycles : aCycle
                    };
                    //update line server
                    BTCUSDLine.findOneAndUpdate({id: thread.parent}, endLine, {new: true}, function(err, xLine) {
                      if (err)
                      throw err;
                      console.log("updated line after selling",xLine);

                      //update profit
                      var addProfit ={
                        id: thread.id,
                        parent: thread.parent,
                        orderId: orderx.toString(),
                        BTCAmt: parseFloat(btcx),
                        sellAmt: parseFloat(sellx),
                        fee: parseFloat(feex),
                        exitAmt: parseFloat(exitx),
                        profit: parseFloat(profitx),
                        submitted: new Date()
                      };
                      var newProfit = new BTCUSDProfit(addProfit);
                      newProfit.save(function (err, xProfit) {
                        if (err) return console.error(err);
                        console.log("made new profit",xProfit);
                      });
                    }); //end BTCUSDLine Update
                  } //end if checklines id
                } //end checklines for loop
              } //end checklines is array
            }); //end BTCUSDThread Update
          } //end existT is true

          //==================APP OPS===================

        });//======================CEX ORDER DETAILS========================
      } //end if res.id
      else{
        //error. order not executed
        console.log('buy error',res);
      }
      
    });//======================CEX SELL========================
      
  } //if thread and price
}; 



var buy = function(line, price){
    if (line && price){
      //define thread object
      //var xLimit = app.get("limit");
      //var xAmt = app.get("amount"); //deprecated
      var xAmt = 0.003 * price;
      var xCurrency = app.get("currency");
      var updatedDate = new Date();

      //=============== CEX deployment =================
      startThread(line, xAmt, price, updatedDate, xCurrency); 
      //startThread(line, price, updatedDate, xCurrency);
    }
};



//========================= RUN ============================

var iterate = function(){
	saveRecord();
	checkDatabase();
	//analyseData();
};

exports.execute = function(){
	setInterval(iterate, 15000);

  // CEX.BTC_placeMarketOrder("sell",0.01).then((res) => {
  //     console.log('sell response',res);
  // });
  // CEX.BTC_placeLimitOrder("sell",0.01,15650).then((res) => {
  //   console.log('sell response',res);
  //   var orderId = res.id;

  //   CEX.getOrderDetails(orderId).then((response) => {
  //     console.log("sell order details", response);
  //   });

  // });
};

exports.pressStartLine = function(){
	var currentPrice = app.get("currentPrice");
	var res = startLine(currentPrice);
	return res;
};
