//import mongoose, { Schema } from 'mongoose';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define profits schema
var BTCUSDProfitSchema = new Schema({
  id: String,
  parent: String,
  profit: Number,
  orderId: String,
  BTCAmt: Number,
  sellAmt: Number,
  fee: Number,
  exitAmt: Number,
  currency: String,
  submitted: Date,
  updated: Date
});

module.exports = mongoose.model('BTCUSDProfit', BTCUSDProfitSchema);

//export default mongoose.model('BTCUSDProfit', BTCUSDProfitSchema);