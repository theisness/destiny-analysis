const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// 管理员鉴权
function requireAdmin(req, res, next) {
  if (!req.user || req.user.admin !== 1) {
    return res.status(403).json({ success: false, message: '只有管理员可以访问此路由' });
  }
  next();
}

// 成员列表（管理员可见）
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select('_id username nickname avatarUrl email admin isBanned createdAt');
    res.json({ success: true, users });
  } catch (err) {
    console.error('获取成员列表错误:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 设置/取消成员为管理员
router.patch(
  '/users/:id/admin',
  requireAdmin,
  [body('admin').isInt({ min: 0, max: 1 }).withMessage('admin 必须为 0 或 1')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const targetId = req.params.id;
    if (String(targetId) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: '不能操作自己' });
    }
    try {
      const updated = await User.findByIdAndUpdate(targetId, { admin: req.body.admin }, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: '用户不存在' });
      res.json({ success: true, user: { id: updated._id, admin: updated.admin } });
    } catch (err) {
      console.error('设置管理员错误:', err);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }
);

// 禁用/启用成员
router.patch(
  '/users/:id/ban',
  requireAdmin,
  [body('isBanned').isBoolean().withMessage('isBanned 必须为布尔类型')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const targetId = req.params.id;
    if (String(targetId) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: '不能操作自己' });
    }
    try {
      const updated = await User.findByIdAndUpdate(targetId, { isBanned: req.body.isBanned }, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: '用户不存在' });
      res.json({ success: true, user: { id: updated._id, isBanned: updated.isBanned } });
    } catch (err) {
      console.error('禁用/启用成员错误:', err);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }
);

// 删除成员（不可删除自己）
router.delete('/users/:id', requireAdmin, async (req, res) => {
  const targetId = req.params.id;
  if (String(targetId) === String(req.user._id)) {
    return res.status(400).json({ success: false, message: '不能删除自己' });
  }
  try {
    const deleted = await User.findByIdAndDelete(targetId);
    if (!deleted) return res.status(404).json({ success: false, message: '用户不存在' });
    res.json({ success: true });
  } catch (err) {
    console.error('删除成员错误:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

module.exports = router;