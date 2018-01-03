import mongoose, { Schema } from 'mongoose';

// Define average schema
var BTCUSDAveSchema = new Schema({
  id: String,
  price: Number,
  currency: String,
  updated: Date,
});

export default mongoose.model('BTCUSDAve', BTCUSDAveSchema);