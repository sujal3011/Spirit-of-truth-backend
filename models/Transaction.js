const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: String,
  },

  amount: {
    type: Number,
    required: true,
    default: 0,
  },
  orderId: { type: String, required: true },
  currency: {
    type: String,
    required: true,
    default: "USD",
  },
  status: {
    type: String,
    required: true,
    default: "pending",
  },
  donationDate: { type: Date, default: null },
  description: { type: String, default: null },
  purchasedItems: { type: String, default: "Donation" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },
});
const Transaction = mongoose.model("transaction", TransactionSchema);

module.exports = Transaction;
