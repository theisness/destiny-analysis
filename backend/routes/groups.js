const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const UserGroup = require('../models/UserGroup');
const User = require('../models/User');

// 管理员鉴权（与 admin.js / labels.js 保持一致）
function requireAdmin(req, res, next) {
  if (!req.user || req.user.admin !== 1) {
    return res.status(403).json({ success: false, message: '只有管理员可以访问此路由' });
  }
  next();
}

/**
 * @route   GET /api/groups
 * @desc    获取分组列表（支持搜索）
 * @access  Private/Admin
 */
router.get('/', requireAdmin, async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const filter = q ? { name: { $regex: q, $options: 'i' } } : {};
    const groups = await UserGroup.find(filter).sort({ name: 1 }).select('_id name');
    res.json({ success: true, groups });
  } catch (err) {
    console.error('获取分组失败:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

/**
 * @route   POST /api/groups
 * @desc    新增分组（管理员）
 * @access  Private/Admin
 */
router.post(
  '/',
  requireAdmin,
  [body('name').trim().notEmpty().withMessage('分组名不能为空')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const name = req.body.name.trim();
    try {
      const exists = await UserGroup.findOne({ name });
      if (exists) return res.status(400).json({ success: false, message: '分组已存在' });
      const created = await UserGroup.create({ name });
      res.status(201).json({ success: true, group: { _id: created._id, name: created.name } });
    } catch (err) {
      console.error('新增分组错误:', err);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }
);

/**
 * @route   PATCH /api/groups/:id
 * @desc    修改分组名称（管理员）
 * @access  Private/Admin
 */
router.patch(
  '/:id',
  requireAdmin,
  [body('name').trim().notEmpty().withMessage('分组名不能为空')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const id = req.params.id;
    const name = req.body.name.trim();
    try {
      const conflict = await UserGroup.findOne({ name });
      if (conflict && String(conflict._id) !== String(id)) {
        return res.status(400).json({ success: false, message: '分组名已存在' });
      }
      const updated = await UserGroup.findByIdAndUpdate(id, { name }, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: '分组不存在' });
      res.json({ success: true, group: { _id: updated._id, name: updated.name } });
    } catch (err) {
      console.error('修改分组错误:', err);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }
);

/**
 * @route   DELETE /api/groups/:id
 * @desc    删除分组（管理员）- 删除前检查是否还有成员在该分组内
 * @access  Private/Admin
 */
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const memberCount = await User.countDocuments({ groupIds: id });
    if (memberCount > 0) {
      return res.status(400).json({ success: false, message: '请先将所有成员移出该分组再删除' });
    }
    const deleted = await UserGroup.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: '分组不存在' });
    res.json({ success: true });
  } catch (err) {
    console.error('删除分组错误:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

/**
 * @route   GET /api/groups/:id/users
 * @desc    查看分组内成员列表（管理员）
 * @access  Private/Admin
 */
router.get('/:id/users', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const users = await User.find({ groupIds: id }).select('_id username nickname avatarUrl');
    res.json({ success: true, users });
  } catch (err) {
    console.error('获取分组成员错误:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

module.exports = router;