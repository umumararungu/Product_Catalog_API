const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  variants: [
    {
      size: { type: Number, required: true },
      color: { type: String, required: true },
    },
  ],
  stockCount: { type: Number, default: 1 },
  discount: { type: Number, default: 0 },
  image: {type: String},
  createdAt: { type: Date, default: Date.now() }
});

module.exports = mongoose.model("Product", productSchema);