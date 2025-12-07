const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // Customer Fields
  customerId: { type: String, required: true },
  customerName: { type: String, required: true, index: true }, // Indexed for search
  phoneNumber: { type: String, required: true, index: true },  // Indexed for search
  gender: { type: String, index: true }, // Indexed for filtering
  age: { type: Number },
  region: { type: String, index: true }, // Indexed for filtering
  customerType: { type: String },

  // Product Fields
  productId: { type: String, required: true },
  productName: { type: String, required: true, index: true }, // Indexed for search
  brand: { type: String },
  category: { type: String, index: true }, // Indexed for filtering
  tags: [String], // Array of strings for tags

  // Sales Fields
  quantity: { type: Number, required: true },
  pricePerUnit: { type: Number },
  discountPercent: { type: Number },
  totalAmount: { type: Number, index: true }, // Indexed for range filtering
  currency: { type: String, default: 'INR' }, // INR, USD, EUR, etc.
  finalAmount: { type: Number },

  // Operational Fields
  date: { type: Date, required: true, index: true }, // Indexed for sorting/filtering
  paymentMethod: { type: String, index: true }, // Indexed for filtering
  orderStatus: { type: String },
  deliveryType: { type: String },
  storeId: { type: String },
  storeLocation: { type: String },
  salespersonId: { type: String },
  employeeName: { type: String },
  imageUrl: { type: String } // Base64 string or URL
}, { timestamps: true });

// Create text index for full-text search requirement
transactionSchema.index({ customerName: 'text', phoneNumber: 'text' });

module.exports = mongoose.model('Transaction', transactionSchema);