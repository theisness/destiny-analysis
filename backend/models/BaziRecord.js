const mongoose = require('mongoose');

const BaziRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, '请输入姓名'],
    trim: true
  },
  gender: {
    type: String,
    enum: ['男', '女'],
    required: [true, '请选择性别']
  },
  inputType: {
    type: String,
    enum: ['gregorian', 'lunar', 'sizhu'],
    default: 'gregorian'
  },
  gregorianDate: {
    year: Number,
    month: Number,
    day: Number,
    hour: Number,
    minute: Number
  },
  lunarDate: {
    year: Number,
    month: Number,
    day: Number,
    hour: Number,
    minute: Number,
    isLeapMonth: Boolean
  },
  baziResult: {
    // 四柱
    yearPillar: {
      gan: String,
      zhi: String
    },
    monthPillar: {
      gan: String,
      zhi: String
    },
    dayPillar: {
      gan: String,
      zhi: String
    },
    hourPillar: {
      gan: String,
      zhi: String
    },
    // 藏干
    hiddenGan: {
      year: [String],
      month: [String],
      day: [String],
      hour: [String]
    },
    // 五行
    wuxing: {
      jin: Number,
      mu: Number,
      shui: Number,
      huo: Number,
      tu: Number
    },
    // 大运
    dayun: [{
      age: Number,
      gan: String,
      zhi: String,
      startYear: Number
    }],
    // 起运时间
    qiyunAge: {
      years: Number,
      months: Number,
      days: Number
    },
    // 神煞
    shensha: [String],
    // 流年（可选，保存最近10年）
    liunian: [{
      year: Number,
      gan: String,
      zhi: String
    }],
    // 流月（可选）
    liuyue: [{
      month: Number,
      gan: String,
      zhi: String
    }]
  },
  addToCommunity: {
    type: Boolean,
    default: false
  },
  // 分享设置：public-所有人可看；restricted-部分人可看
  shareSettings: {
    type: {
      type: String,
      enum: ['public', 'restricted'],
      default: 'public'
    },
    allowedUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 更新时间中间件
BaziRecordSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('BaziRecord', BaziRecordSchema);

