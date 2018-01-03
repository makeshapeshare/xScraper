import mongoose, { Schema } from 'mongoose';

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

export default mongoose.model('BTCUSDProfit', BTCUSDProfitSchema);