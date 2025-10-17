/**
 * 接口日志中间件
 * 记录所有接口的请求输入和响应输出
 */

const logger = (req, res, next) => {
  const startTime = Date.now();
  
  // 记录请求信息
  const requestLog = {
    时间: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
    方法: req.method,
    路径: req.url,
    IP: req.ip || req.connection.remoteAddress,
    请求头: {
      'Content-Type': req.headers['content-type'],
      'Authorization': req.headers['authorization'] ? '已提供' : '未提供',
      'User-Agent': req.headers['user-agent']
    },
    查询参数: req.query,
    路由参数: req.params,
    请求体: req.body
  };

  console.log('\n' + '='.repeat(80));
  console.log('📥 接口请求:');
  console.log(JSON.stringify(requestLog, null, 2));
  console.log('-'.repeat(80));

  // 保存原始的 res.json 和 res.send 方法
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  // 重写 res.json 方法以捕获响应
  res.json = function(data) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    const responseLog = {
      状态码: res.statusCode,
      响应时间: `${duration}ms`,
      响应数据: data
    };

    console.log('📤 接口响应:');
    console.log(JSON.stringify(responseLog, null, 2));
    console.log('='.repeat(80) + '\n');

    return originalJson(data);
  };

  // 重写 res.send 方法以捕获文本响应
  res.send = function(data) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    const responseLog = {
      状态码: res.statusCode,
      响应时间: `${duration}ms`,
      响应数据: data
    };

    console.log('📤 接口响应:');
    console.log(JSON.stringify(responseLog, null, 2));
    console.log('='.repeat(80) + '\n');

    return originalSend(data);
  };

  next();
};

module.exports = logger;

