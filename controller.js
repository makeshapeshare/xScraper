var exports = module.exports = {};

var mongoose = require('mongoose');
var CEX = require('./cex.js');
var tick = require('./ticker.js');

/*
import BTCUSDRecord from './models/model_Record';
import BTCUSDLine from './models/model_Line';
import BTCUSDThread from './models/model_Thread';
*/
var BTCUSDRecord = require('./models/model_Record');
var BTCUSDLine = require('./models/model_Line');
var BTCUSDThread = require('./models/model_Thread');
var BTCUSDManual = require('./models/model_Manual');

//var BTCUSDHistory = mongoose.model('BTCUSDHistory');

exports.getHome = function(req, res) {
  res.send('Hello Louis.');
};

exports.getLimits = function(req, res) {
  CEX.getLimits().then((lim) => {
    res.json(lim);
  });
};

exports.getAccount = function(req, res) {
  CEX.getAccountBalance().then((acc) => {
    res.json(acc);
  });
};

exports.getRecords = function(req, res) {
  BTCUSDRecord.find({}, function(err, records) {
    if (err)
      res.send(err);
    res.json(records);
  });
};

exports.getRecordId = function(req, res) {
  BTCUSDRecord.findById(req.params.id, function(err, record) {
    if (err)
      res.send(err);
    res.json(record);
  });
};

exports.startLine = function(req, res) {
  var lineRes = tick.pressStartLine();
  if (lineRes && lineRes != null){
    res.json(lineRes);  
  } else{
    res.send('Line Start Error');
  }
};

exports.getLines = function(req, res) {
  BTCUSDLine.find({}, function(err, lines) {
    if (err)
      res.send(err);
    res.json(lines);
  });
};

exports.getLineThreads = function(req, res) {
  BTCUSDThread.find({parent:req.params.lineId}, function(err, threads) {
    if (err)
      res.send(err);
    res.json(threads);
  });
};

exports.getThreads = function(req, res) {
  BTCUSDThread.find({}, function(err, threads) {
    if (err)
      res.send(err);
    res.json(threads);
  });
};

exports.getActiveThreads = function(req, res) {
  BTCUSDThread.find({active:true}, function(err, threads) {
    if (err)
      res.send(err);
    res.json(threads);
  });
};

exports.getPriceBTCUSD = function(req, res) {
  CEX.BTC_LastPrice().then((priceRes) => {
    res.json(priceRes);
  });
};

exports.forceSell = function(req, res) {
  //database ops
  var sellThread = tick.forceSell(req.params.threadId);
  if (sellThread && sellThread != null){
    console.log("force selling this thread: ",sellThread);  
    res.json(sellThread);  
  } else{
    res.json({
      status: "err",
      err: 'Force Sell Error'
    });
  }
};

exports.manualTrades = function(req, res) {
  BTCUSDManual.find({}, function(err, trades) {
    if (err)
      res.send(err);
    res.json(trades);
  });
};

exports.manualBuy = function(req, res) {
  //database ops
  var buyCEX = tick.manualBuy(req.params.usd);
  if (buyCEX && buyCEX != null){
    console.log("manual buying with USD: ",req.params.usd);  
    res.json({
      status: "ok",
      res: buyCEX
    });  
  } else{
    res.json({
      status: "err",
      err: 'Manual Buy Error'
    });
  }
};

exports.manualSell = function(req, res) {
  //database ops
  var sellCEX = tick.manualSell(req.params.btc);
  if (sellCEX && sellCEX != null){
    console.log("manual selling BTC: ",req.params.btc);  
    res.json({
      status: "ok",
      res: sellCEX
    });  
  } else{
    res.json({
      status: "err",
      err: 'Manual Sell Error'
    });
  }
};