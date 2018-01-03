import mongoose, { Schema } from 'mongoose';

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

export default mongoose.model('BTCUSDLine', BTCUSDLineSchema);