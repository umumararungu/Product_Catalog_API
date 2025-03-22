const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  variants: [
    {
      name: { type: String, required: true },
      sku: { type: String, required: true },
      additionalCost: { type: Number, default: 0 },
      stockCount: { type: Number, default: 0 },
    },
  ],
  stockCount: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
});
