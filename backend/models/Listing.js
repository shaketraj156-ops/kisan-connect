const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmerName: { type: String, required: true },
  crop: { type: String, required: true },
  quantity: { type: Number, required: true },
  askingPrice: { type: Number, required: true },
  location: { type: String, required: true },
  contact: { type: String, required: true },
  grade: { type: String, required: true },
  shareTruckPool: { type: Boolean, default: false },
  imageUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Listing', ListingSchema);
