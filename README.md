# 八字命理排盘与用户管理系统

一个现代化的、前后端分离的 Web 应用程序，核心功能是根据用户输入的出生日期时间计算并显示八字命盘。系统支持用户注册、登录，并能保存已登录用户的八字信息。

## 技术栈

### 后端
- **Node.js** + **Express** - 服务器框架
- **MongoDB** - 数据库
- **JWT** - 身份认证
- **lunar-javascript** - 农历计算库

### 前端
- **React** - UI 框架
- **React Router** - 路由管理
- **Axios** - HTTP 客户端

### 部署
- **Docker** + **Docker Compose** - 容器化部署
- **Nginx** - 前端静态文件服务

## 功能特性

### 用户管理
- ✅ 用户注册/登录
- ✅ JWT 身份认证
- ✅ 个人信息管理

### 八字排盘
- ✅ **公历输入** - 输入公历日期时间计算八字
- ✅ **农历输入** - 输入农历日期时间计算八字
- ✅ **四柱直接输入** - 直接输入四柱进行分析
- ✅ **四柱展示** - 年柱、月柱、日柱、时柱
- ✅ **藏干计算** - 地支藏干分析
- ✅ **五行分布** - 金木水火土的强弱分析（可视化）
- ✅ **大运计算** - 人生各阶段大运
- ✅ **起运时间** - 精确到年月日
- ✅ **流年分析** - 展示近10年流年
- ✅ **流月分析** - 展示12个月流月
- ✅ **神煞分析** - 天乙贵人、文昌、桃花等

### 社区功能
- ✅ 分享八字到社区
- ✅ 按姓名拼音字母排序
- ✅ A-Z 快速索引导航
- ✅ 实时搜索功能

## 项目结构

```
destiny-analysis/
├── backend/                    # 后端服务
│   ├── config/                # 配置文件
│   │   └── db.js             # 数据库连接
│   ├── controllers/           # 控制器（可选）
│   ├── middleware/            # 中间件
│   │   └── auth.js           # JWT 验证中间件
│   ├── models/                # 数据模型
│   │   ├── User.js           # 用户模型
│   │   └── BaziRecord.js     # 八字记录模型
│   ├── routes/                # 路由
│   │   ├── auth.js           # 认证路由
│   │   └── bazi.js           # 八字路由
│   ├── utils/                 # 工具函数
│   │   ├── lunar-converter.js  # 公历农历转换
│   │   └── bazi-calculator.js  # 八字计算核心算法
│   ├── server.js              # 服务器入口
│   ├── package.json
│   └── .env                   # 环境变量
├── frontend/                  # 前端应用
│   ├── public/               # 静态资源
│   │   └── index.html
│   ├── src/
│   │   ├── api/              # API 封装
│   │   │   └── api.js
│   │   ├── components/       # 通用组件
│   │   │   ├── Navbar.js
│   │   │   └── WuxingDisplay.js
│   │   ├── context/          # 状态管理
│   │   │   └── AuthContext.js
│   │   ├── pages/            # 页面组件
│   │   │   ├── Auth/         # 登录注册页
│   │   │   ├── Dashboard/    # 仪表盘
│   │   │   ├── BaziInput/    # 八字输入页
│   │   │   ├── BaziDetail/   # 八字详情页
│   │   │   └── Community/    # 社区页
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── docker-compose.yml         # Docker Compose 配置
├── Dockerfile.backend         # 后端 Dockerfile
├── Dockerfile.frontend        # 前端 Dockerfile
├── nginx.conf                # Nginx 配置
├── package.json              # 根项目配置
└── README.md

```

## 快速开始

### 方式一：使用 Docker Compose（推荐）

1. **克隆项目**
```bash
git clone <repository-url>
cd destiny-analysis
```

2. **启动所有服务**
```bash
docker-compose up -d
```

3. **访问应用**
- 前端：http://localhost:3000
- 后端API：http://localhost:5000

4. **停止服务**
```bash
docker-compose down
```

### 方式二：本地开发

#### 前置要求
- Node.js 18+
- Docker Desktop

#### 1. 运行启动脚本（推荐）

**Windows：**
```bash
双击 start.bat，选择选项 2
```

**Mac/Linux：**
```bash
chmod +x start.sh
./start.sh  # 选择选项 2
```

启动脚本会自动完成：
- ✅ 检查并启动 MongoDB Docker 容器
- ✅ 自动配置后端环境变量（backend/.env）
- ✅ 自动配置前端环境变量（frontend/.env，可选）
- ✅ 安装所有依赖
- ✅ 启动前后端开发服务器

MongoDB 容器信息：
- 容器名称：`destiny-mongo`
- 连接地址：`mongodb://localhost:27017/destiny-analysis`
- 数据卷：`destiny-mongo-data`（数据持久化）

#### 2. 手动启动（可选）

如果不使用启动脚本：

```bash
# 1. 启动 MongoDB Docker 容器
docker run -d -p 27017:27017 --name destiny-mongo -v destiny-mongo-data:/data/db mongo:7.0

# 2. 安装依赖
npm run install-all

# 3. 启动开发服务器
npm run dev
```

#### 3. 访问应用
- 前端：http://localhost:3000
- 后端API：http://localhost:5000

## API 接口文档

### 认证接口

#### 用户注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

#### 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

#### 获取当前用户
```http
GET /api/auth/current
Authorization: Bearer <token>
```

### 八字接口

#### 创建八字记录
```http
POST /api/bazi
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "张三",
  "gender": "男",
  "inputType": "gregorian",
  "gregorianDate": {
    "year": 1990,
    "month": 5,
    "day": 15,
    "hour": 10,
    "minute": 30
  },
  "addToCommunity": false
}
```

#### 获取我的八字列表
```http
GET /api/bazi
Authorization: Bearer <token>
```

#### 获取八字详情
```http
GET /api/bazi/:id
Authorization: Bearer <token>
```

#### 获取社区八字
```http
GET /api/bazi/community/list?search=张
Authorization: Bearer <token>
```

#### 删除八字记录
```http
DELETE /api/bazi/:id
Authorization: Bearer <token>
```

## 核心算法说明

### 1. 公历转农历
使用 `lunar-javascript` 库进行高精度的公历农历转换。

### 2. 八字计算
- **年柱**：根据农历年份计算天干地支
- **月柱**：根据年干和月份推算
- **日柱**：使用万年历数据计算
- **时柱**：根据日干和时辰推算

### 3. 地支藏干
每个地支包含1-3个天干，影响五行分布。

### 4. 五行计算
- 天干权重：1.2
- 地支权重：1.0
- 藏干权重：0.3

### 5. 大运计算
- 阳年男性/阴年女性：顺排
- 阴年男性/阳年女性：逆排
- 每步大运10年

## 界面设计

### 主要页面
1. **登录/注册页** - 简洁的认证界面
2. **仪表盘** - 展示所有保存的八字记录
3. **八字输入页** - 三种输入方式（公历/农历/四柱）
4. **八字详情页** - 完整展示排盘结果
5. **社区页** - 浏览所有公开的八字记录

### UI 特性
- 🎨 现代化渐变设计
- 🎯 响应式布局（支持移动端）
- 🌈 五行颜色标识（金黄、木绿、水蓝、火红、土棕）
- ⚡ 流畅的动画效果
- 🔍 实时搜索和过滤

## 开发指南

### 添加新的神煞计算
在 `backend/utils/bazi-calculator.js` 的 `calculateShensha` 函数中添加新的神煞规则。

### 修改五行配色
在 `frontend/src/index.css` 中修改 `.wuxing-*` 类的颜色。

### 自定义主题
在 `frontend/src/App.css` 中修改渐变色和主色调。

## 安全性

- ✅ 密码使用 bcrypt 加密存储
- ✅ JWT Token 身份验证
- ✅ API 请求拦截器自动处理认证
- ✅ XSS 和 CSRF 防护
- ✅ HTTP 安全头配置

## 性能优化

- ✅ React 组件懒加载
- ✅ MongoDB 索引优化
- ✅ Nginx Gzip 压缩
- ✅ 静态资源缓存
- ✅ API 响应数据精简

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 常见问题

### Q: Docker 容器启动失败？
A: 检查端口是否被占用（3000, 5000, 27017），使用 `docker-compose logs` 查看日志。

### Q: 前端无法连接后端？
A: 检查 `frontend/package.json` 中的 `proxy` 配置，确保指向正确的后端地址。

### Q: 农历转换不准确？
A: 检查输入的日期是否在有效范围内（1900-2100年），lunar-javascript 库在此范围外可能不准确。

### Q: 如何修改 JWT 密钥？
A: 修改 `backend/.env` 文件中的 `JWT_SECRET`，生产环境务必使用强密钥。

### Q: 如何管理 MongoDB Docker 容器？
A: 查看 [MongoDB使用说明.md](./MongoDB使用说明.md) 了解详细的容器管理、备份和故障排除方法。

### Q: 前端需要配置环境变量吗？
A: 不是必需的，代码中有默认值。启动脚本会自动创建 `frontend/.env` 文件，但通常使用默认配置即可。详见 [前端配置说明.md](./前端配置说明.md)。

### Q: 如何修改前端或后端的端口？
A: 在对应的 `.env` 文件中修改 `PORT` 配置。详见 [端口配置快速参考.md](./端口配置快速参考.md)。

## 未来计划

- [ ] 添加更多神煞计算
- [ ] 实现八字合婚功能
- [ ] 添加命盘打印功能
- [ ] 支持多语言（英文）
- [ ] 添加命理解析AI助手
- [ ] 实现社区评论功能
- [ ] 添加数据导出功能（PDF）

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请通过 Issue 联系。

---

**注意**：本系统仅供学习和娱乐使用，八字命理结果仅供参考。

