const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// 加载环境变量
dotenv.config();

// 连接数据库
connectDB();

// 创建 Express 应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 日志中间件 - 记录所有接口的输入输出
const logger = require('./middleware/logger');
app.use(logger);
// 经过protect中间件的路由
const { protect } = require('./middleware/auth');
app.use('/', protect);
// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bazi', require('./routes/bazi'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/users', require('./routes/users'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/captcha', require('./routes/captcha'));
app.use('/api/admin', require('./routes/admin'));
// 静态文件
app.use('/api/files', express.static(path.join(__dirname, 'public', 'files')));


// 根路由
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '八字命理排盘系统 API',
    version: '1.0.0'
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`环境: ${process.env.NODE_ENV}`);
});

