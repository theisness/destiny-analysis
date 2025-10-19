const mongoose = require('mongoose');

const InviteCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, maxlength: 255 },
  active: { type: Boolean, default: true },
  usedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  usedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InviteCode', InviteCodeSchema);