const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: String,
  price:{ type: Number, required: true },
  description: String,
  category: String,
  sold: Boolean,
  image: String,
  dateOfSale: Date,
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
