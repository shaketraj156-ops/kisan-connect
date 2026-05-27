const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  role: { type: String, enum: ['farmer', 'buyer'], required: true },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
