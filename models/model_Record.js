import mongoose, { Schema } from 'mongoose';

// Define record history schema
var BTCUSDRecordSchema = new Schema({
  id: String,
  price: Number,
  currency: String,
  updated: Date,
});

export default mongoose.model('BTCUSDRecord', BTCUSDRecordSchema);

