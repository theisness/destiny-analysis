const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const BaziRecord = require('../models/BaziRecord');
const { protect } = require('../middleware/auth');
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
    protect,
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

        baziResult = calculateFromSizhu(
          sizhu.year,
          sizhu.month,
          sizhu.day,
          sizhu.hour,
          gender
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
router.get('/', protect, async (req, res) => {
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
 * @route   GET /api/bazi/:id
 * @desc    获取指定八字记录的详细信息
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const record = await BaziRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: '记录不存在'
      });
    }

    // 确保只有创建者可以查看（除非是社区记录）
    if (record.userId.toString() !== req.user._id.toString() && !record.addToCommunity) {
      return res.status(403).json({
        success: false,
        message: '无权访问此记录'
      });
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
 * @route   GET /api/bazi/community
 * @desc    获取社区中的所有八字记录
 * @access  Private
 */
router.get('/community/list', protect, async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = { addToCommunity: true };
    
    // 如果有搜索关键词
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const records = await BaziRecord.find(query)
      .populate('userId', 'username')
      .sort({ name: 1 })
      .select('-__v');

    res.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error('获取社区八字错误:', error);
    res.status(500).json({
      success: false,
      message: '获取社区记录失败'
    });
  }
});

/**
 * @route   DELETE /api/bazi/:id
 * @desc    删除八字记录
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
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

