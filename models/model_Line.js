//import mongoose, { Schema } from 'mongoose';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define lines schema
var BTCUSDLineSchema = new Schema({
  id: String,
  limit: Number,
  startDate: Date,
  endDate: Date,
  active: Boolean,
  amount: Number,
  profitToDate: Number,
  averagePeriod: [{type: Number}],
  cycles: Number,
  currency: String,
  updated: Date
});

module.exports = mongoose.model('BTCUSDLine', BTCUSDLineSchema);

//export default mongoose.model('BTCUSDLine', BTCUSDLineSchema);