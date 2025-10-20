const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const BaziRecord = require('../models/BaziRecord');
const { solarToLunar, lunarToSolar } = require('../utils/lunar-converter');
const { calculateBazi, calculateFromSizhu } = require('../utils/bazi-calculator');

/**
 * @route   POST /api/bazi
 * @desc    计算八字并保存
 * @access  Private
 */
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('请输入姓名'),
    body('gender').isIn(['男', '女']).withMessage('请选择性别'),
    body('inputType').isIn(['gregorian', 'lunar', 'sizhu']).withMessage('输入类型无效')
  ],
  async (req, res) => {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, gender, inputType, gregorianDate, lunarDate, sizhu, addToCommunity } = req.body;

    try {
      let baziResult;
      let finalGregorianDate = {};
      let finalLunarDate = {};

      if (inputType === 'gregorian') {
        // 公历输入
        if (!gregorianDate || !gregorianDate.year || !gregorianDate.month || !gregorianDate.day) {
          return res.status(400).json({
            success: false,
            message: '请输入完整的公历日期'
          });
        }

        finalGregorianDate = gregorianDate;
        
        // 转换为农历
        const lunarInfo = solarToLunar(
          gregorianDate.year,
          gregorianDate.month,
          gregorianDate.day,
          gregorianDate.hour || 0,
          gregorianDate.minute || 0
        );

        finalLunarDate = {
          year: lunarInfo.year,
          month: lunarInfo.month,
          day: lunarInfo.day,
          hour: gregorianDate.hour || 0,
          minute: gregorianDate.minute || 0,
          isLeapMonth: lunarInfo.isLeapMonth
        };

        // 计算八字
        baziResult = calculateBazi(gregorianDate, gender);

      } else if (inputType === 'lunar') {
        // 农历输入
        if (!lunarDate || !lunarDate.year || !lunarDate.month || !lunarDate.day) {
          return res.status(400).json({
            success: false,
            message: '请输入完整的农历日期'
          });
        }

        finalLunarDate = lunarDate;

        // 转换为公历
        const solarInfo = lunarToSolar(
          lunarDate.year,
          lunarDate.month,
          lunarDate.day,
          lunarDate.hour || 0,
          lunarDate.minute || 0,
          lunarDate.isLeapMonth || false
        );

        finalGregorianDate = solarInfo;

        // 计算八字
        baziResult = calculateBazi(solarInfo, gender);

      } else if (inputType === 'sizhu') {
        // 四柱直接输入
        if (!sizhu || !sizhu.year || !sizhu.month || !sizhu.day || !sizhu.hour) {
          return res.status(400).json({
            success: false,
            message: '请输入完整的四柱信息'
          });
        }

        // 如果前端提供了对应的公农历日期，保存它们并用于计算大运
        let dateTimeForDayun = null;
        
        if (gregorianDate && gregorianDate.year && gregorianDate.month && gregorianDate.day) {
          finalGregorianDate = gregorianDate;
          // 使用公历日期计算大运
          dateTimeForDayun = {
            year: gregorianDate.year,
            month: gregorianDate.month,
            day: gregorianDate.day,
            hour: gregorianDate.hour || 0,
            minute: gregorianDate.minute || 0
          };
        }
        
        if (lunarDate && lunarDate.year && lunarDate.month && lunarDate.day) {
          finalLunarDate = lunarDate;
        }

        // 计算八字，如果有日期则同时计算大运
        baziResult = calculateFromSizhu(
          sizhu.year,
          sizhu.month,
          sizhu.day,
          sizhu.hour,
          gender,
          dateTimeForDayun  // 传递日期时间用于计算大运
        );
      }

      // 创建八字记录
      const baziRecord = await BaziRecord.create({
        userId: req.user._id,
        name,
        gender,
        inputType,
        gregorianDate: finalGregorianDate,
        lunarDate: finalLunarDate,
        baziResult,
        addToCommunity: addToCommunity || false
      });

      res.status(201).json({
        success: true,
        message: '八字计算成功',
        data: baziRecord
      });

    } catch (error) {
      console.error('八字计算错误:', error);
      res.status(500).json({
        success: false,
        message: `计算失败: ${error.message}`
      });
    }
  }
);

/**
 * @route   GET /api/bazi
 * @desc    获取当前用户的所有八字记录
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const records = await BaziRecord.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error('获取八字记录错误:', error);
    res.status(500).json({
      success: false,
      message: '获取记录失败'
    });
  }
});

/**
 * @route   GET /api/bazi/current-lunar
 * @desc    获取当前的农历信息
 * @access  Private
 */
router.get('/current-lunar', async (req, res) => {
  try {
    const { Solar } = require('lunar-javascript');
    const now = new Date();
    
    const solar = Solar.fromDate(now);
    const lunar = solar.getLunar();
    
    res.json({
      success: true,
      data: {
        year: lunar.getYear(),
        month: lunar.getMonth(),
        day: lunar.getDay(),
        isLeapMonth: lunar.getMonth() < 0,
        yearInGanZhi: lunar.getYearInGanZhi(),
        monthInGanZhi: lunar.getMonthInGanZhi()
      }
    });
  } catch (error) {
    console.error('获取当前农历信息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取失败'
    });
  }
});

/**
 * @route   GET /api/bazi/:id
 * @desc    获取指定八字记录的详细信息
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const record = await BaziRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: '记录不存在'
      });
    }

    // 权限判断：
    // 1) 非社区记录：仅创建者或管理员可见
    // 2) 社区记录：管理员可见；public可见；restricted仅允许名单内可见
    if(record.userId.toString() !== req.user._id.toString() && req.user.admin !== 1) {
      if (!record.addToCommunity) {
        return res.status(403).json({ success: false, message: '无权访问此记录' });
      } else {
        const type = record.shareSettings?.type || 'public';
        const allowed = record.shareSettings?.allowedUserIds || [];
        if (type === 'restricted' && !allowed.map(id => id.toString()).includes(req.user._id.toString())) {
          return res.status(403).json({ success: false, message: '无权访问此记录' });
        }
      }
    }

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('获取八字详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取详情失败'
    });
  }
});

/**
 * @route   PATCH /api/bazi/:id
 * @desc    编辑八字记录（分享设置、基本信息等）
 * @access  Private
 */
router.patch('/:id', async (req, res) => {
  try {
    const record = await BaziRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: '记录不存在' });
    if (record.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: '无权编辑此记录' });
    }

    const allowedFields = ['name', 'gender', 'addToCommunity', 'shareSettings'];
    const update = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }

    // 规范 shareSettings
    if (update.shareSettings) {
      const s = update.shareSettings;
      update.shareSettings = {
        type: s.type === 'restricted' ? 'restricted' : 'public',
        allowedUserIds: Array.isArray(s.allowedUserIds) ? s.allowedUserIds : []
      };
    }

    const updated = await BaziRecord.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('编辑八字错误:', error);
    res.status(500).json({ success: false, message: '编辑失败' });
  }
});

/**
 * @route   GET /api/bazi/community
 * @desc    获取社区中的所有八字记录（按分享权限过滤）
 * @access  Private
 */
router.get('/community/list', async (req, res) => {
  try {
    const { search } = req.query;

    const baseQuery = { addToCommunity: true };
    if (search) baseQuery.name = { $regex: search, $options: 'i' };

    // 管理员可查看全部
    if (req.user.admin === 1) {
      const records = await BaziRecord.find(baseQuery)
        .populate('userId', 'username')
        .sort({ name: 1 })
        .select('-__v');
      return res.json({ success: true, count: records.length, data: records });
    }

    // 非管理员：只看 public 或 restricted 且包含当前用户
    const records = await BaziRecord.find({
      ...baseQuery,
      $or: [
        { 'shareSettings.type': { $in: [null, 'public'] } },
        { 'shareSettings.type': 'restricted', 'shareSettings.allowedUserIds': req.user._id }
      ]
    })
      .populate('userId', 'username')
      .sort({ name: 1 })
      .select('-__v');

    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    console.error('获取社区八字错误:', error);
    res.status(500).json({ success: false, message: '获取社区记录失败' });
  }
});

/**
 * @route   POST /api/bazi/reverse-calculate
 * @desc    根据四柱反推可能的日期
 * @access  Private
 */
router.post('/reverse-calculate', async (req, res) => {
  try {
    const { sizhu } = req.body;

    if (!sizhu || !sizhu.year || !sizhu.month || !sizhu.day || !sizhu.hour) {
      return res.status(400).json({
        success: false,
        message: '请提供完整的四柱信息'
      });
    }

    const { Solar } = require('lunar-javascript');
    const dates = [];
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 60; // 往前60年
    const endYear = currentYear + 20;   // 往后20年

    // 遍历日期范围，查找匹配的四柱
    for (let year = startYear; year <= endYear; year++) {
      for (let month = 1; month <= 12; month++) {
        const daysInMonth = new Date(year, month, 0).getDate();
        
        // 日柱60天一循环，所以每60天采样一次，然后检查前后
        for (let startDay = 1; startDay <= daysInMonth; startDay += 60) {
          for (let dayOffset = 0; dayOffset < 60 && startDay + dayOffset <= daysInMonth; dayOffset++) {
            const day = startDay + dayOffset;
            
            try {
              // 根据时柱地支推算可能的时辰
              const hourZhi = sizhu.hour[1];
              const zhiList = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
              const hourIndex = zhiList.indexOf(hourZhi);
              if (hourIndex === -1) continue;
              
              const hour = hourIndex * 2; // 每个地支对应2小时
              
              // 创建Solar对象并获取四柱
              const solar = Solar.fromYmdHms(year, month, day, hour, 0, 0);
              const lunar = solar.getLunar();
              
              const yearGanZhi = lunar.getYearInGanZhi();
              const monthGanZhi = lunar.getMonthInGanZhi();
              const dayGanZhi = lunar.getDayInGanZhi();
              const timeGanZhi = lunar.getTimeInGanZhi();
              
              // 检查是否匹配
              if (yearGanZhi === sizhu.year && 
                  monthGanZhi === sizhu.month && 
                  dayGanZhi === sizhu.day && 
                  timeGanZhi === sizhu.hour) {
                
                dates.push({
                  year: year,
                  month: month,
                  day: day,
                  hour: hour,
                  minute: 0,
                  lunarYear: lunar.getYear(),
                  lunarMonth: lunar.getMonth(),
                  lunarDay: lunar.getDay(),
                  isLeapMonth: lunar.getMonth() < 0
                });
                
                // 限制结果数量
                if (dates.length >= 20) {
                  return res.json({
                    success: true,
                    dates: dates
                  });
                }
              }
            } catch (error) {
              // 跳过无效日期
              continue;
            }
          }
        }
      }
    }

    res.json({
      success: true,
      dates: dates
    });

  } catch (error) {
    console.error('反推日期错误:', error);
    res.status(500).json({
      success: false,
      message: `反推失败: ${error.message}`
    });
  }
});

/**
 * @route   DELETE /api/bazi/:id
 * @desc    删除八字记录
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const record = await BaziRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: '记录不存在'
      });
    }

    // 确保只有创建者可以删除
    if (record.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: '无权删除此记录'
      });
    }

    await record.deleteOne();

    res.json({
      success: true,
      message: '记录已删除'
    });
  } catch (error) {
    console.error('删除八字记录错误:', error);
    res.status(500).json({
      success: false,
      message: '删除失败'
    });
  }
});

module.exports = router;

