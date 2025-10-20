const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

/**
 * @route   GET /api/users/search
 * @desc    搜索用户（用于分享设置）
 * @access  Private
 */
router.get('/search', protect, async (req, res) => {
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
router.get('/:id', protect, async (req, res) => {
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

module.exports = router;