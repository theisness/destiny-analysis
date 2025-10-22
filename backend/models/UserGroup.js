const mongoose = require('mongoose');

const UserGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '分组名不能为空'],
    unique: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('UserGroup', UserGroupSchema);