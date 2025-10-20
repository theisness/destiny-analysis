const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 白名单
const whitelist = [
  '/api/files/default-avatar.png',
  '/api/auth/register',
  '/api/auth/login',
];

// JWT 验证中间件
const protect = async (req, res, next) => {
  let token;
  // 检查白名单
  console.log(req.path);
  if (whitelist.includes(req.path)) {
    return next();
  }
  // 检查 Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 确保 token 存在
  if (!token) {
    return res.status(401).json({
      success: false,
      message: '未授权访问，请先登录'
    });
  }

  try {
    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 将用户信息添加到请求对象
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token无效或已过期'
    });
  }
};

module.exports = { protect };

