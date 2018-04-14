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


//var BTCUSDHistory = mongoose.model('BTCUSDHistory');

exports.getHome = function(req, res) {
  res.send('Hello Louis.');
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

exports.getPriceBTCUSD = function(req, res) {
  CEX.BTC_LastPrice().then((priceRes) => {
    res.json(priceRes);
  });
};