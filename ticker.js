//=== dependencies ===
//node fetch
//crypto
//mongodb
//mongoose
//express.js
//moment.js

var moment = require('moment');
var BTCUSDRecord = require('./models/model_Record');
var BTCUSDAve = require('./models/model_Ave');
var BTCUSDLine = require('./models/model_Line');
var BTCUSDThread = require('./models/model_Thread');
var BTCUSDProfit = require('./models/model_Profit');
var BTCUSDManual = require('./models/model_Manual');


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

app.set('limit', 0.03);
app.set('baseAmount', 50);
app.set('deltaRate', 0);

//========================= GENERAL ============================

var dateGen = function(inputDate){
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
    var output = {
      thisYr: idA,
      thisMth: idB,
      thisDay: idC,
      thisHr: idD,
      thisMin: idE,
      thisSec: idF
    };
    return output;
};

var idGenerator = function(inputDate){
    
    var thisDate = dateGen(inputDate);
    app.set('thisYr', thisDate.thisYr);
    app.set('thisMth', thisDate.thisMth);
	  app.set('thisDay', thisDate.thisDay);
	  app.set('thisHr', thisDate.thisHr);
	  app.set('thisMin', thisDate.thisMin);
	  app.set('thisSec', thisDate.thisSec);

    var id = thisDate.thisYr.toString().concat(thisDate.thisMth,thisDate.thisDay,thisDate.thisHr,thisDate.thisMin,thisDate.thisSec);
    console.log("id gen: ",id);
    return id;
};

var rangeDateGen = function(momentDate){
  //note input is already moment format
  var idA = momentDate.year();
  var idB = momentDate.month();
  var idC = momentDate.date();
  var idD = momentDate.hour();
  var idE = momentDate.minute();
  var idF = momentDate.second();
  
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

  var output = idA.toString().concat(idB,idC,idD,idE,idF);

  return output;
};

var getRange = function(inputDate){
  var lowLimit = 0;
  var highLimit = 0;
  
  var beforeDate = moment(inputDate).subtract(3,'hours');
  var checkDate = moment(inputDate);

  lowLimit = parseInt(rangeDateGen(beforeDate));
  highLimit = parseInt(rangeDateGen(checkDate));
  
  var range = {
    low: lowLimit,
    high: highLimit
  };

  return range;
};

//========================= FETCH ============================

//get latest market price from exchange api
var saveRecord = function(){
	CEX.BTC_LastPrice().then((res) => {
		console.log('market price',res);
		var updated = new Date();
    var genID = parseInt(idGenerator(updated));
		
		var data = {
			id: genID,
			price: res.lprice,
			currency:res.curr1.concat(res.curr2),
			updated: updated
		}
		
    var record = new BTCUSDRecord(data);
		record.save();

		app.set('currentPrice', res.lprice);
	});
};

//check database
var checkDatabase = function(){
    //get current datetime
    //e.g format 2018|05|01|15|09|23
    var today = new Date();
    var thisDate = dateGen(today);
    var upperLim = parseInt(thisDate.thisYr.toString().concat(thisDate.thisMth,thisDate.thisDay,"23","59","59"));
    var lowerLim = parseInt(thisDate.thisYr.toString().concat(thisDate.thisMth,thisDate.thisDay,"00","00","00"));
    //only return 2 days
    BTCUSDRecord.find( {id: {$gt: lowerLim, $lt: upperLim}},function (err, records) {
    if (err) return console.error(err);
    //console.log("day records: ", records);
    aggregateData(records);
    
    //get aggregates when done
    var aveUppLim = parseInt(thisDate.thisYr.toString().concat(thisDate.thisMth,thisDate.thisDay,"23"));
    var aveLowLim = parseInt(thisDate.thisYr.toString().concat(thisDate.thisMth,thisDate.thisDay,"00"));
    BTCUSDAve.find({id: {$gt: aveLowLim, $lt: aveUppLim}},function (err, aggregates) {
      if (err) return console.error(err);
      app.set('aggregates', aggregates);
      //console.log("aggregates: ", aggregates);

      //get lines when done
      BTCUSDLine.find(function (err, lines) {
        if (err) return console.error(err);
        app.set('lines', lines);

        //get threads when done
        BTCUSDThread.find(function (err, threads) {
          if (err) return console.error(err);
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
    app.set('profits', profits);
  });
  
};

//========================= AGGREGATE ============================

var aggregateData = function(data){
    //console.log("retrieved data",data);
    //only 1 day returned from data records
    var exist = false;
    var hourSet = [];
    var daySet = [];
    var hourSum = 0;
    var daySum = 0;
    
    var rangeSet = [];

    var checkYear = app.get('thisYr');
    var checkMonth = app.get('thisMth');
    var checkDate = app.get('thisDay');
    var checkHour = app.get('thisHr');
    
    var checkLowest = null;
    var checkLow = null;
    var checkRange = getRange(new Date());

    if (data && data.length){
      
      for (var i = 0; i < data.length; i++) { 
        var checkID = parseInt(data[i].id); 
        var dataID = checkID.toString();
        var dataYear = dataID.substr(0, 4);
        var dataMonth = dataID.substr(4, 2);
        var dataDate = dataID.substr(6, 2);
        var dataHour = dataID.substr(8, 2);

        
        if (dataYear == checkYear && dataMonth == checkMonth && dataDate == checkDate && dataHour == checkHour){
          hourSet.push(data[i]);
        }
        if (dataYear == checkYear && dataMonth == checkMonth && dataDate == checkDate){
          daySet.push(data[i]);
        }

        if(checkID > parseInt(checkRange.low) && checkID < parseInt(checkRange.high)){
          rangeSet.push(data[i]);
        }
      }

      //perform hour aggregation and extract lowest
      for (var i = 0; i < hourSet.length; i++) { 
        hourSum = hourSum + hourSet[i].price;
      }

      //perform day aggregation
      for (var i = 0; i < daySet.length; i++) { 
        daySum = daySum + daySet[i].price;
      }

      //perform range check
      if(rangeSet && rangeSet.length > 0){
        //console.log("rangeset",rangeSet);
        for (var i = 0; i < rangeSet.length; i++) { 
          if(i == 0){
            checkLowest = rangeSet[i];
          } else{
            //checkLow = rangeSet[i];
            if(rangeSet[i].price < checkLowest.price){
              checkLowest = rangeSet[i];
            }   
          }
        }
        //console.log("lowest",checkLowest);
      }

      //console.log("day set: ", daySet);
      
      if (hourSum != 0 && daySum != 0){
        var hourAve = hourSum/hourSet.length;
        var dayAve = daySum/daySet.length;

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
      });
        } else {
          //add
          var aggregate = new BTCUSDAve(addItem);
          aggregate.save();
        }

        app.set('aveDay', dayAve.toFixed(2));
        app.set('aveHr', hourAve.toFixed(2));
      }

      //calculate delta rate
      var dataLength = data.length;
      if (dataLength && dataLength > 0 && checkLowest && checkLowest != null){

        var mostRecent = data[dataLength - 1];
        var delta = mostRecent.price - checkLowest.price;
        var deltaRate = delta/mostRecent.price;
        //console.log("most recent: ", mostRecent);
        //console.log("checkLowest: ", checkLowest);
        //console.log("delta rate check lowest: ", deltaRate);
        app.set('deltaRate', deltaRate);
      }
      
      
    }
};

//========================= ANALYSE ============================

var analyseTrend = function(){
    
    var currentPrice = app.get("currentPrice");
    var currentHrAve = app.get("aveHr");
    var deltaRate = app.get("deltaRate");
    var controlRate = app.get("limit")/2;
    
    if (currentPrice && currentHrAve && deltaRate && currentPrice != 0 && currentHrAve != 0 && deltaRate > 0){
      //condition A : current price above average price
      //condition B : if delta rate of increase above control rate, true
      if(currentPrice > currentHrAve && deltaRate > controlRate){
        //satisfied
        return true;
      }else{
        //not satisfied
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
    var deltaRate = app.get("deltaRate");
    //console.log("check delta.",deltaRate);

    if (currentPrice && mylines && mythreads){
      //check for inactive lines to buy
      for (var j = 0; j < mylines.length; j++) { 
        var thisLine = mylines[j];
        
        if(thisLine.active === false){
          //inactive thread, decide by trend
          if (analyseTrend() === true){
            //upward trend, buy and start new thread
            console.log("up trend. BUY");
            //in dev, disable buy
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
        if(thisThread.active === true){
          //active thread, compare thread price
          if (currentPrice > thisThread.startPrice && (currentPrice - thisThread.startPrice) > (thisThread.limit * thisThread.startPrice) ){
            //profit hit, sell
            console.log("profit. SELL", thisThread.id);
            //in dev, disable sell
            sell(thisThread, currentPrice);
          } else{
            //continue to wait
            console.log("no profit. WAIT", thisThread.id);
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
    var xAmt = app.get("baseAmount");
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
        active : true,
        amount : xAmt, 
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
  		}); 
    }
    return startRes;
};

var startThread = function(line, xAmt, xPrice, xDate, xCurrency){
    if (line && xAmt && xPrice){
      //define thread object
      var thisCycle = parseInt(line.cycles) + 1;
      var checkId = line.id.concat(thisCycle.toString());
      
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
              active : true,
              limit : line.limit,
              amount_ : parseFloat(buyData.finAmt),//deployment
              amount : parseFloat(buyData.txAmt),//deployment
              bitcoin : buyData.BTCAmt,//deployment
              startPrice : buyData.txPrice, //deployment
              startTixPrice : xPrice,
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

var sell = function(thread, price){
  if(thread && price){
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
          var btcx = sellData.BTCAmt; //deployment
          var feex = sellData.fee; //deployment
          var sellx = sellData.txAmt; //deployment 
          var orderx = sellData.orderId; //deployment
          var pricex = sellData.txPrice; //deployment
          var tpricex = price; //deployment & development
          var exitx = sellData.finAmt; //deployment
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
            endDate : end,
            active : false,
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
              //updated thread after selling
              var lineProfx = 0;
              var aCycle = 0;
              var checkPeriod = [];
              var startx = null;
              var lineAmt = 50;
              var allProfit = 0;
              
              //update lines with metadata
              if (Array.isArray(checkLines) === true && checkLines.length > 0){
                for (var i = 0; i < checkLines.length; i++) { 
                  if(checkLines[i].id == thread.parent){
                    if(checkLines[i].amount && checkLines[i].amount != null){
                      lineAmt = checkLines[i].amount;  
                    }
                    lineProfx = checkLines[i].profitToDate;
                    startx = checkLines[i].startDate;
                    aCycle = parseInt(checkLines[i].cycles) + 1;
                    
                    //check period
                    checkPeriod = checkLines[i].averagePeriod;
                    if (checkPeriod == null){
                     checkPeriod = [];
                    }
                    if (Array.isArray(checkPeriod) === false){
                     checkPeriod = [];
                    }
                    checkPeriod.push(periodx);
                    
                    //check doubling
                    allProfit = parseFloat(lineProfx) + parseFloat(profitx);
                    if (allProfit > 1.1 * lineAmt){
                      lineAmt = lineAmt * 2;
                    }

                    var endLine = {
                      id : thread.parent,
                      limit : thread.limit,
                      amount : lineAmt,
                      startDate : startx,
                      active : false,
                      profitToDate : allProfit,
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
    var xAmt = app.get("baseAmount");
    if (line && price){
      if (line.amount && line.amount > 0){
        xAmt = line.amount;
      }
      var xCurrency = app.get("currency");
      var updatedDate = new Date();

      //=============== CEX deployment =================
      startThread(line, xAmt, price, updatedDate, xCurrency);
    }
};



//========================= RUN ============================

var iterate = function(){
	saveRecord();
	checkDatabase();
};


var subiterate = function() {
  var a = setInterval(function(){
    iterate();
    clearInterval(a);
    subiterate();
  }, 15000);
};

exports.execute = function(){
	subiterate();
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
	var res = null;
  var acc = null;
  var currentPrice = app.get("currentPrice");
  //only start line if there is sufficient funds
  var xAmt = parseInt(app.get("baseAmount"));
  CEX.getAccountBalance().then((res) => {
    acc = res;
    console.log('acc is',acc);
    if (acc.USD.available > xAmt){
      res = startLine(currentPrice);
    }
    return res;
  });

  return res;
  // if (acc.USD.available > xAmt){
  //   res = {
  //     status: "error. insufficient funds",
  //     line: null,
  //     thread: null
  //   };
  //   //res = startLine(currentPrice);
  //   return res;
  // } else{
  //   res = "error. insufficient funds";
  //   return res;
  // }

};

exports.forceSell = function(threadid){
  var currentPrice = app.get("currentPrice");
  console.log("server force sell ",threadid);
  BTCUSDThread.findOne({ id: threadid }, function(err, eThread) {
    console.log("detected ethread",eThread);
    //if (err) return console.error(err);
    if (eThread && eThread.id.toString() == threadid.toString()){
      console.log("detected thread to force sell ",eThread);
      sell(eThread, currentPrice);
      return threadid;
    } else{ 
      return "error thread not found";
    }
  });
};

exports.manualBuy = function(usd){
  console.log("server manual buy ",usd);
  var currentPrice = app.get("currentPrice");

  CEX.BTC_placeMarketOrder("buy",usd).then((res) => {
    console.log('buy response',res);

    if(res && res.id && res.id != null){

      var orderId = res.id;
      var orderDate = new Date();

      CEX.getOrderDetails(orderId).then((response) => {
        var BTCAmt = parseFloat(response['a:BTC:cds']);
        var feeUSDAmt = parseFloat(response['tfa:USD']);
        var txUSDAmt = parseFloat(response['tta:USD']);
            
        var addManual = {
          orderId: orderId,
          type: "buy",
          txDate: orderDate,
          amount: usd,
          bitcoin: BTCAmt,
          txAmt : (txUSDAmt + feeUSDAmt),
          fee: feeUSDAmt,
          finAmt: txUSDAmt,
          txPrice: currentPrice,
          txTixPrice: (1/BTCAmt) * txUSDAmt,
          currency: "BTCUSD"
        };

        console.log('buy data',addManual);
        
        var newManual = new BTCUSDManual(addManual);
        newManual.save(function (err, xManual) {
          if (err) return console.error(err);
          console.log("new manual trade",xManual);
        });
      });
      return usd;
    }
    else{
      return "manual buy error";
    }
  });
};

exports.manualSell = function(btc){
  console.log("server manual sell ",btc);
  var currentPrice = app.get("currentPrice");

  CEX.BTC_placeMarketOrder("sell",btc).then((res) => { 
    console.log('sell response',res);

    if(res && res.id && res.id != null){

      var orderId = res.id;
      var orderDate = new Date();

      CEX.getOrderDetails(orderId).then((response) => {
        var BTCAmt = parseFloat(response['a:BTC:cds']);
        var feeUSDAmt = parseFloat(response['tfa:USD']);
        var txUSDAmt = parseFloat(response['tta:USD']);
        
        var addManual = {
          orderId: orderId,
          type: "sell",
          txDate: orderDate,
          amount: txUSDAmt - feeUSDAmt,
          bitcoin: BTCAmt,
          txAmt : txUSDAmt,
          fee: feeUSDAmt,
          finAmt: txUSDAmt - feeUSDAmt,
          txPrice: currentPrice,
          txTixPrice: (1/BTCAmt) * txUSDAmt,
          currency: "BTCUSD"
        };
        
        console.log('sell data',addManual);
        
        var newManual = new BTCUSDManual(addManual);
        newManual.save(function (err, xManual) {
          if (err) return console.error(err);
          console.log("new manual trade",xManual);
        });
      });
      return btc;
    }
    else{
      return "manual buy error";
    }
  });
};





