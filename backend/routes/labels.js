const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Label = require('../models/Label');

// 管理员鉴权（与 admin.js 保持一致）
function requireAdmin(req, res, next) {
  if (!req.user || req.user.admin !== 1) {
    return res.status(403).json({ success: false, message: '只有管理员可以访问此路由' });
  }
  next();
}

/**
 * @route   GET /api/labels
 * @desc    获取标签列表（支持搜索）
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const filter = q ? { name: { $regex: q, $options: 'i' } } : {};
    const labels = await Label.find(filter).sort({ name: 1 }).select('_id name');
    res.json({ success: true, labels });
  } catch (err) {
    console.error('获取标签失败:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

/**
 * @route   POST /api/labels
 * @desc    新增标签（管理员）
 * @access  Private/Admin
 */
router.post(
  '/',
  requireAdmin,
  [body('name').trim().notEmpty().withMessage('标签名不能为空')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const name = req.body.name.trim();
    try {
      // 避免重复
      const exists = await Label.findOne({ name });
      if (exists) return res.status(400).json({ success: false, message: '标签已存在' });
      const created = await Label.create({ name });
      res.status(201).json({ success: true, label: { _id: created._id, name: created.name } });
    } catch (err) {
      console.error('新增标签错误:', err);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }
);

/**
 * @route   DELETE /api/labels/:id
 * @desc    删除标签（管理员）
 * @access  Private/Admin
 */
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Label.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: '标签不存在' });
    res.json({ success: true });
  } catch (err) {
    console.error('删除标签错误:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

module.exports = router;