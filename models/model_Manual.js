var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define manual schema
var BTCUSDManualSchema = new Schema({
  orderId: String,
  type: String,
  txDate: Date,
  amount: Number,
  bitcoin: Number,
  txAmt: Number,
  fee: Number,
  finAmt: Number,
  txPrice: Number,
  txTixPrice: Number,
  currency: String
});

module.exports = mongoose.model('BTCUSDManual', BTCUSDManualSchema);

