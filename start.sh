#!/bin/bash

echo "🔮 八字命理排盘系统 - 启动脚本"
echo "================================"

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

echo "✅ Docker 环境检查通过"
echo ""

# 询问用户启动方式
echo "请选择启动方式："
echo "1. 使用 Docker Compose（推荐）"
echo "2. 本地开发模式"
read -p "请输入选项 (1 或 2): " choice

if [ "$choice" = "1" ]; then
    echo ""
    echo "📦 使用 Docker Compose 启动服务..."
    echo ""
    
    # 构建并启动容器
    docker-compose up -d --build
    
    echo ""
    echo "✅ 服务启动成功！"
    echo ""
    echo "🌐 访问地址："
    echo "   前端: http://localhost:3000"
    echo "   后端API: http://localhost:5000"
    echo ""
    echo "📋 查看日志: docker-compose logs -f"
    echo "🛑 停止服务: docker-compose down"
    echo ""
    
elif [ "$choice" = "2" ]; then
    echo ""
    echo "🚀 启动本地开发模式..."
    echo ""
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js 未安装，请先安装 Node.js 18+"
        exit 1
    fi
    
    # 检查并启动 MongoDB Docker 容器
    echo "🔍 检查 MongoDB 容器..."
    
    if ! docker ps -a --format "{{.Names}}" | grep -q "^destiny-mongo$"; then
        echo "📦 MongoDB 容器不存在，正在创建..."
        docker run -d -p 27017:27017 --name destiny-mongo -v destiny-mongo-data:/data/db mongo:7.0
        
        if [ $? -ne 0 ]; then
            echo "❌ MongoDB 容器创建失败"
            exit 1
        fi
        
        echo "✅ MongoDB 容器创建成功"
        sleep 3
    else
        # 容器存在，检查是否在运行
        if ! docker ps --format "{{.Names}}" | grep -q "^destiny-mongo$"; then
            echo "🔄 启动已存在的 MongoDB 容器..."
            docker start destiny-mongo
            
            if [ $? -ne 0 ]; then
                echo "❌ MongoDB 容器启动失败"
                exit 1
            fi
            
            echo "✅ MongoDB 容器启动成功"
            sleep 3
        else
            echo "✅ MongoDB 容器已在运行"
        fi
    fi
    
    echo ""
    echo "💾 MongoDB 信息："
    echo "   连接地址: mongodb://localhost:27017/destiny-analysis"
    echo "   容器名称: destiny-mongo"
    echo "   数据卷: destiny-mongo-data"
    echo ""
    echo "💡 提示："
    echo "   - 查看容器日志: docker logs destiny-mongo"
    echo "   - 停止容器: docker stop destiny-mongo"
    echo "   - 删除容器: docker rm destiny-mongo"
    echo "   - 删除数据: docker volume rm destiny-mongo-data"
    echo ""
    
    # 配置后端环境变量
    if [ ! -f "backend/.env" ]; then
        echo "🔧 配置后端环境变量..."
        if [ -f "backend/.env.example" ]; then
            cp "backend/.env.example" "backend/.env"
            echo "✅ 已从 .env.example 创建后端 .env 文件"
        else
            echo "📝 创建默认后端 .env 配置..."
            cat > "backend/.env" << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/destiny-analysis
JWT_SECRET=destiny_analysis_jwt_secret_2024_change_in_production
JWT_EXPIRE=30d
NODE_ENV=development
EOF
            echo "✅ 已创建后端默认 .env 文件"
        fi
    fi
    
    # 配置前端环境变量（可选）
    if [ ! -f "frontend/.env" ]; then
        echo "🔧 配置前端环境变量..."
        if [ -f "frontend/.env.example" ]; then
            cp "frontend/.env.example" "frontend/.env"
            echo "✅ 已从 .env.example 创建前端 .env 文件"
        else
            echo "📝 创建默认前端 .env 配置..."
            cat > "frontend/.env" << EOF
# 前端环境变量配置

# 后端 API 地址
REACT_APP_API_URL=http://localhost:5000/api

# 前端开发服务器端口（默认3000）
PORT=3000

# 如果端口被占用，是否自动选择其他端口
# BROWSER=none  # 不自动打开浏览器
EOF
            echo "✅ 已创建前端默认 .env 文件"
        fi
    fi
    
    # 安装依赖
    if [ ! -d "node_modules" ]; then
        echo "📦 安装根目录依赖..."
        npm install
    fi
    
    if [ ! -d "backend/node_modules" ]; then
        echo "📦 安装后端依赖..."
        cd backend
        npm install
        cd ..
    fi
    
    if [ ! -d "frontend/node_modules" ]; then
        echo "📦 安装前端依赖..."
        cd frontend
        npm install
        cd ..
    fi
    
    echo ""
    echo "✅ 准备就绪，启动开发服务器..."
    echo ""
    echo "🌐 访问地址："
    echo "   前端: http://localhost:3000"
    echo "   后端API: http://localhost:5000"
    echo ""
    
    # 启动开发服务器
    npm run dev
    
else
    echo "❌ 无效的选项"
    exit 1
fi

