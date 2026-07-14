const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true
  },
  productType: {
    type: String,
    required: true,
    enum: ['Tyre Inflator', 'Nitrogen Inflator', 'Air Compressor', 'Other']
  },
  model: String,
  category: String,
  specifications: {
    type: Map,
    of: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);