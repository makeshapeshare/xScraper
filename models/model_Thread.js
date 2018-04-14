//import mongoose, { Schema } from 'mongoose';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define threads schema
var BTCUSDThreadSchema = new Schema({
  id: String,
  parent: String,
  limit: Number,
  startDate: Date,
  endDate: Date,
  active: Boolean,
  amount: Number,
  bitcoin: Number,
  startPrice: Number,
  endPrice: Number,
  startTixPrice: Number,
  endTixPrice: Number,
  exitAmount: Number,
  profit: Number,
  period: Number,
  cycle: Number,
  currency: String,
  orderId: String,
  updated: Date
});

module.exports = mongoose.model('BTCUSDThread', BTCUSDThreadSchema);

//export default mongoose.model('BTCUSDThread', BTCUSDThreadSchema);