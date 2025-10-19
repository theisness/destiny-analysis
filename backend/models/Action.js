const mongoose = require('mongoose');

const ActionSchema = new mongoose.Schema({
  commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['like'], required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Action', ActionSchema);