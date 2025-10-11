# MongoDB Docker 容器使用说明

## 🎯 概述

本项目在**本地开发模式**下使用 Docker 容器运行 MongoDB，启动脚本会自动管理容器的创建和启动。

---

## ✅ 自动管理功能

当您运行启动脚本并选择"本地开发模式"（选项 2）时，脚本会自动：

1. **检查容器是否存在**
   - 不存在 → 自动创建并启动
   - 存在但未运行 → 自动启动
   - 已经运行 → 直接使用

2. **容器配置**
   - 容器名称：`destiny-mongo`
   - 端口映射：`27017:27017`
   - 数据卷：`destiny-mongo-data`（持久化存储）
   - MongoDB 版本：`7.0`

---

## 📋 容器信息

### 连接信息
```
连接地址: mongodb://localhost:27017
数据库名: destiny-analysis
```

### 容器名称
```
destiny-mongo
```

### 数据持久化
数据存储在 Docker 数据卷 `destiny-mongo-data` 中，即使删除容器，数据也会保留。

---

## 🔧 手动管理命令

### 查看容器状态
```bash
# 查看所有容器（包括未运行的）
docker ps -a | grep destiny-mongo

# 查看运行中的容器
docker ps | grep destiny-mongo
```

### 查看日志
```bash
# 查看所有日志
docker logs destiny-mongo

# 实时查看日志
docker logs -f destiny-mongo

# 查看最近100行
docker logs --tail 100 destiny-mongo
```

### 启动和停止
```bash
# 启动容器
docker start destiny-mongo

# 停止容器
docker stop destiny-mongo

# 重启容器
docker restart destiny-mongo
```

### 进入容器
```bash
# 进入 MongoDB Shell
docker exec -it destiny-mongo mongosh

# 进入容器命令行
docker exec -it destiny-mongo bash
```

### 删除容器和数据
```bash
# 停止容器
docker stop destiny-mongo

# 删除容器（保留数据）
docker rm destiny-mongo

# 删除数据卷（⚠️ 会永久删除所有数据）
docker volume rm destiny-mongo-data

# 一键删除容器和数据
docker stop destiny-mongo && docker rm destiny-mongo && docker volume rm destiny-mongo-data
```

---

## 📊 数据管理

### 备份数据库
```bash
# 导出整个数据库
docker exec destiny-mongo mongodump --db destiny-analysis --out /tmp/backup

# 从容器复制到本地
docker cp destiny-mongo:/tmp/backup ./mongodb-backup
```

### 恢复数据库
```bash
# 复制备份文件到容器
docker cp ./mongodb-backup destiny-mongo:/tmp/backup

# 恢复数据
docker exec destiny-mongo mongorestore --db destiny-analysis /tmp/backup/destiny-analysis
```

### 查看数据库
```bash
# 进入 MongoDB Shell
docker exec -it destiny-mongo mongosh

# 在 mongosh 中执行
use destiny-analysis
db.users.find()           # 查看用户
db.bazirecords.find()     # 查看八字记录
```

---

## 🔍 故障排除

### 问题1：端口被占用
**现象：**
```
Error starting userland proxy: listen tcp4 0.0.0.0:27017: bind: address already in used
```

**解决方案：**
```bash
# Windows - 查找占用端口的进程
netstat -ano | findstr :27017
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:27017 | xargs kill

# 或修改端口映射
docker run -d -p 27018:27017 --name destiny-mongo -v destiny-mongo-data:/data/db mongo:7.0
# 然后修改 backend/.env 中的 MONGODB_URI
```

### 问题2：容器无法启动
**解决方案：**
```bash
# 查看详细错误日志
docker logs destiny-mongo

# 删除并重新创建
docker stop destiny-mongo
docker rm destiny-mongo
docker run -d -p 27017:27017 --name destiny-mongo -v destiny-mongo-data:/data/db mongo:7.0
```

### 问题3：连接超时
**解决方案：**
```bash
# 检查容器是否运行
docker ps | grep destiny-mongo

# 检查日志
docker logs destiny-mongo

# 等待容器完全启动（约3-5秒）
# 如果还是失败，重启容器
docker restart destiny-mongo
```

### 问题4：数据丢失
**预防措施：**
- ✅ 使用数据卷 `destiny-mongo-data` 持久化存储
- ✅ 定期备份数据库
- ✅ 不要删除数据卷

**恢复方法：**
- 如果数据卷还在，重新创建容器即可恢复
- 如果数据卷被删除，需要从备份恢复

---

## 🔐 安全建议

### 生产环境
如果部署到生产环境，建议：

1. **启用认证**
```bash
docker run -d \
  -p 27017:27017 \
  --name destiny-mongo \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=your_password \
  -v destiny-mongo-data:/data/db \
  mongo:7.0
```

2. **修改连接字符串**
```env
MONGODB_URI=mongodb://admin:your_password@localhost:27017/destiny-analysis?authSource=admin
```

3. **不暴露端口**
```bash
# 不使用 -p，让 MongoDB 只在 Docker 网络内可访问
docker run -d \
  --name destiny-mongo \
  --network app-network \
  -v destiny-mongo-data:/data/db \
  mongo:7.0
```

---

## 📈 性能优化

### 增加内存限制
```bash
docker run -d \
  -p 27017:27017 \
  --name destiny-mongo \
  --memory="2g" \
  -v destiny-mongo-data:/data/db \
  mongo:7.0
```

### 查看资源使用
```bash
docker stats destiny-mongo
```

---

## 🎓 MongoDB 基础命令

### 常用操作
```javascript
// 进入 MongoDB Shell
docker exec -it destiny-mongo mongosh

// 切换数据库
use destiny-analysis

// 查看集合
show collections

// 查看用户数量
db.users.countDocuments()

// 查看八字记录数量
db.bazirecords.countDocuments()

// 查询最新的10条记录
db.bazirecords.find().sort({createdAt: -1}).limit(10)

// 删除所有数据（⚠️ 谨慎使用）
db.users.deleteMany({})
db.bazirecords.deleteMany({})

// 创建索引（优化查询性能）
db.users.createIndex({email: 1})
db.bazirecords.createIndex({userId: 1})

// 查看索引
db.users.getIndexes()
db.bazirecords.getIndexes()
```

---

## 🔄 迁移到本地 MongoDB

如果您想使用本地安装的 MongoDB 而不是 Docker：

1. **安装 MongoDB 7.0+**
   - Windows: https://www.mongodb.com/try/download/community
   - Mac: `brew install mongodb-community@7.0`
   - Linux: 查看官方文档

2. **启动 MongoDB 服务**
   ```bash
   # Windows
   net start MongoDB
   
   # Mac/Linux
   brew services start mongodb-community@7.0
   # 或
   mongod --config /usr/local/etc/mongod.conf
   ```

3. **修改启动脚本**
   - 注释掉 Docker 容器创建部分
   - 或者直接使用 Docker Compose 模式

4. **连接字符串保持不变**
   ```
   mongodb://localhost:27017/destiny-analysis
   ```

---

## 💡 最佳实践

1. **开发环境**
   - ✅ 使用 Docker 容器（推荐）
   - ✅ 启用数据卷持久化
   - ✅ 定期备份重要数据

2. **生产环境**
   - ✅ 使用 Docker Compose 或云数据库
   - ✅ 启用认证
   - ✅ 限制网络访问
   - ✅ 配置自动备份
   - ✅ 监控性能和日志

3. **数据安全**
   - ✅ 不要在代码中硬编码连接字符串
   - ✅ 使用环境变量
   - ✅ 定期备份
   - ✅ 测试恢复流程

---

## 📞 获取帮助

如遇到 MongoDB 相关问题：

1. **查看日志** - `docker logs destiny-mongo`
2. **检查容器状态** - `docker ps -a`
3. **查看文档** - [MongoDB 官方文档](https://docs.mongodb.com/)
4. **提交 Issue** - 在项目仓库提交问题

---

**提示：** 启动脚本已经自动处理了大部分 MongoDB 管理任务，通常情况下您不需要手动操作！

---

*最后更新：2024年*

