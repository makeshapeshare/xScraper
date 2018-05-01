//import mongoose, { Schema } from 'mongoose';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define record history schema
var BTCUSDRecordSchema = new Schema({
  id: Number,
  price: Number,
  currency: String,
  updated: Date,
});

module.exports = mongoose.model('BTCUSDRecord', BTCUSDRecordSchema);

//export default mongoose.model('BTCUSDRecord', BTCUSDRecordSchema);

