const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// 生成 JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    注册新用户
 * @access  Public
 */
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 2, max: 30 }).withMessage('用户名需要2-30个字符'),
    body('email').isEmail().normalizeEmail().withMessage('请输入有效的邮箱地址'),
    body('password').isLength({ min: 6 }).withMessage('密码至少需要6个字符')
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

    const { username, email, password } = req.body;

    try {
      // 检查用户是否已存在
      let user = await User.findOne({ $or: [{ email }, { username }] });
      if (user) {
        return res.status(400).json({
          success: false,
          message: '用户名或邮箱已被使用'
        });
      }

      // 创建新用户
      user = await User.create({
        username,
        email,
        password
      });

      // 生成 Token
      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        message: '注册成功',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      console.error('注册错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误，注册失败'
      });
    }
  }
);

/**
 * @route   POST /api/auth/login
 * @desc    用户登录
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('请输入有效的邮箱地址'),
    body('password').notEmpty().withMessage('请输入密码')
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

    const { email, password } = req.body;

    try {
      // 查找用户（包含密码字段）
      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: '邮箱或密码错误'
        });
      }

      // 验证密码
      const isMatch = await user.matchPassword(password);
      
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: '邮箱或密码错误'
        });
      }

      // 生成 Token
      const token = generateToken(user._id);

      res.json({
        success: true,
        message: '登录成功',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      console.error('登录错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误，登录失败'
      });
    }
  }
);

/**
 * @route   GET /api/auth/current
 * @desc    获取当前登录用户信息
 * @access  Private
 */
router.get('/current', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

module.exports = router;

