import mongoose, { Schema } from 'mongoose';

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

export default mongoose.model('BTCUSDThread', BTCUSDThreadSchema);