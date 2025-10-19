const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  baziId: { type: mongoose.Schema.Types.ObjectId, ref: 'BaziRecord', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  replyToCommentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  content: { type: String, default: '' },
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  images: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

CommentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Comment', CommentSchema);