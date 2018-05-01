
//import mongoose, { Schema } from 'mongoose';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define average schema
var BTCUSDAveSchema = new Schema({
  id: Number,
  price: Number,
  currency: String,
  updated: Date,
});

module.exports = mongoose.model('BTCUSDAve', BTCUSDAveSchema);

//export default mongoose.model('BTCUSDAve', BTCUSDAveSchema);