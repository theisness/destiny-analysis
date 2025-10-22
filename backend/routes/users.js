const express = require('express');
const router = express.Router();
const User = require('../models/User');
const UserGroup = require('../models/UserGroup');

// 管理员鉴权（复用与 admin.js 一致的策略）
function requireAdmin(req, res, next) {
  if (!req.user || req.user.admin !== 1) {
    return res.status(403).json({ success: false, message: '只有管理员可以访问此路由' });
  }
  next();
}

/**
 * @route   GET /api/users/search
 * @desc    搜索用户（用于分享设置）
 * @access  Private
 */
router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ success: true, users: [] });
    const users = await User.find({ username: new RegExp(q, 'i') })
      .select('_id username nickname avatarUrl');
    res.json({ success: true, users });
  } catch (error) {
    console.error('搜索用户错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    获取用户公开信息
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('_id username nickname avatarUrl gender bio birthday birthdayPrivate');
    // 判断生日是否公开
    if (user.birthdayPrivate) {
      user.birthday = null;
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('获取用户错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

/**
 * @route   GET /api/users/:id/groups
 * @desc    获取用户的分组（管理员）
 * @access  Private/Admin
 */
router.get('/:id/groups', requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('_id groupIds');
    if (!user) return res.status(404).json({ success: false, message: '用户不存在' });
    const groups = await UserGroup.find({ _id: { $in: user.groupIds || [] } }).select('_id name');
    res.json({ success: true, groups });
  } catch (error) {
    console.error('获取用户分组错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

/**
 * @route   PATCH /api/users/:id/groups/join
 * @desc    将用户加入分组（管理员）
 * @access  Private/Admin
 */
router.patch('/:id/groups/join', requireAdmin, async (req, res) => {
  try {
    const { groupId } = req.body;
    if (!groupId) return res.status(400).json({ success: false, message: '缺少 groupId' });
    const group = await UserGroup.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: '分组不存在' });
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { groupIds: groupId } },
      { new: true }
    ).select('_id groupIds');
    if (!updated) return res.status(404).json({ success: false, message: '用户不存在' });
    res.json({ success: true, groupIds: updated.groupIds });
  } catch (error) {
    console.error('加入分组错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

/**
 * @route   PATCH /api/users/:id/groups/leave
 * @desc    将用户移出分组（管理员）
 * @access  Private/Admin
 */
router.patch('/:id/groups/leave', requireAdmin, async (req, res) => {
  try {
    const { groupId } = req.body;
    if (!groupId) return res.status(400).json({ success: false, message: '缺少 groupId' });
    const group = await UserGroup.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: '分组不存在' });
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { $pull: { groupIds: groupId } },
      { new: true }
    ).select('_id groupIds');
    if (!updated) return res.status(404).json({ success: false, message: '用户不存在' });
    res.json({ success: true, groupIds: updated.groupIds });
  } catch (error) {
    console.error('移出分组错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

module.exports = router;