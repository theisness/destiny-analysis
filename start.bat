@echo off
chcp 65001 >nul
echo 🔮 八字命理排盘系统 - 启动脚本
echo ================================
echo.

REM 检查 Docker 是否安装
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Docker 未安装，请先安装 Docker Desktop
    pause
    exit /b 1
)

REM 检查 Docker Compose 是否安装
where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Docker Compose 未安装，请先安装 Docker Desktop
    pause
    exit /b 1
)

echo ✅ Docker 环境检查通过
echo.

echo 请选择启动方式：
echo 1. 使用 Docker Compose（推荐）
echo 2. 本地开发模式
set /p choice="请输入选项 (1 或 2): "

if "%choice%"=="1" (
    echo.
    echo 📦 使用 Docker Compose 启动服务...
    echo.
    
    REM 读取 MongoDB 根用户与密码（优先使用 backend\.env 中的配置）
    setlocal EnableDelayedExpansion
    set "MONGO_ROOT_USER_DEFAULT=root"
    set "MONGO_ROOT_PASSWORD_DEFAULT=destiny123"
    set "MONGO_ROOT_USER="
    set "MONGO_ROOT_PASSWORD="
    if exist "backend\.env" (
        for /f "tokens=1,* delims==" %%A in (backend\.env) do (
            if /I "%%A"=="MONGO_ROOT_USER" set "MONGO_ROOT_USER=%%B"
            if /I "%%A"=="MONGO_ROOT_PASSWORD" set "MONGO_ROOT_PASSWORD=%%B"
        )
    )
    if "!MONGO_ROOT_USER!"=="" set "MONGO_ROOT_USER=!MONGO_ROOT_USER_DEFAULT!"
    if "!MONGO_ROOT_PASSWORD!"=="" set "MONGO_ROOT_PASSWORD=!MONGO_ROOT_PASSWORD_DEFAULT!"

    REM 生成 docker-compose.override.yml 以启用 Mongo 密码验证
    (
        echo version: '3.8'
        echo services:
        echo   mongo:
        echo     environment:
        echo       MONGO_INITDB_ROOT_USERNAME: !MONGO_ROOT_USER!
        echo       MONGO_INITDB_ROOT_PASSWORD: !MONGO_ROOT_PASSWORD!
        echo   backend:
        echo     environment:
        echo       - MONGODB_URI=mongodb://!MONGO_ROOT_USER!:!MONGO_ROOT_PASSWORD!@mongo:27017/destiny-analysis^?authSource=admin
    ) > docker-compose.override.yml

    docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d --build
    
    echo.
    echo ✅ 服务启动成功！
    echo.
    echo 🌐 访问地址：
    echo    前端: http://localhost:3000
    echo    后端API: http://localhost:5000
    echo.
    echo 📋 查看日志: docker-compose logs -f
    echo 🛑 停止服务: docker-compose down
    echo.
    pause
    
) else if "%choice%"=="2" (
    echo.
    echo 🚀 启动本地开发模式...
    echo.
    
    REM 检查 Node.js
    where node >nul 2>nul
    if %errorlevel% neq 0 (
        echo ❌ Node.js 未安装，请先安装 Node.js 18+
        pause
        exit /b 1
    )
    
    REM 读取 MongoDB 根用户和密码（从 backend\.env 读取，若未设置则使用默认）
    setlocal EnableDelayedExpansion
    set "MONGO_ROOT_USER_DEFAULT=root"
    set "MONGO_ROOT_PASSWORD_DEFAULT=destiny123"
    set "MONGO_ROOT_USER="
    set "MONGO_ROOT_PASSWORD="
    if exist "backend\.env" (
        for /f "tokens=1,* delims==" %%A in (backend\.env) do (
            if /I "%%A"=="MONGO_ROOT_USER" set "MONGO_ROOT_USER=%%B"
            if /I "%%A"=="MONGO_ROOT_PASSWORD" set "MONGO_ROOT_PASSWORD=%%B"
        )
    )
    if "!MONGO_ROOT_USER!"=="" set "MONGO_ROOT_USER=!MONGO_ROOT_USER_DEFAULT!"
    if "!MONGO_ROOT_PASSWORD!"=="" set "MONGO_ROOT_PASSWORD=!MONGO_ROOT_PASSWORD_DEFAULT!"

    REM 检查并启动 MongoDB Docker 容器
    echo 🔍 检查 MongoDB 容器...
    docker ps -a --format "{{.Names}}" | findstr /C:"destiny-mongo" >nul 2>nul
    
    if %errorlevel% neq 0 (
        echo 📦 MongoDB 容器不存在，正在创建...
        docker run -d -p 27017:27017 --name destiny-mongo -v destiny-mongo-data:/data/db -e MONGO_INITDB_ROOT_USERNAME=!MONGO_ROOT_USER! -e MONGO_INITDB_ROOT_PASSWORD=!MONGO_ROOT_PASSWORD! -e MONGO_INITDB_DATABASE=destiny-analysis mongo:7.0 --auth
        if %errorlevel% neq 0 (
            echo ❌ MongoDB 容器创建失败
            pause
            exit /b 1
        )
        echo ✅ MongoDB 容器创建成功
        timeout /t 3 >nul
    ) else (
        REM 容器存在，检查是否在运行
        docker ps --format "{{.Names}}" | findstr /C:"destiny-mongo" >nul 2>nul
        if %errorlevel% neq 0 (
            echo 🔄 启动已存在的 MongoDB 容器...
            docker start destiny-mongo
            if %errorlevel% neq 0 (
                echo ❌ MongoDB 容器启动失败
                pause
                exit /b 1
            )
            echo ✅ MongoDB 容器启动成功
            timeout /t 3 >nul
        ) else (
            echo ✅ MongoDB 容器已在运行
        )
    )
    
    echo.
    echo 💾 MongoDB 信息：
    echo    连接地址: mongodb://!MONGO_ROOT_USER!:***@localhost:27017/destiny-analysis?authSource=admin
    echo    容器名称: destiny-mongo
    echo    数据卷: destiny-mongo-data
    echo.
    echo 💡 提示：
    echo    - 查看容器日志: docker logs destiny-mongo
    echo    - 停止容器: docker stop destiny-mongo
    echo    - 删除容器: docker rm destiny-mongo
    echo    - 删除数据: docker volume rm destiny-mongo-data
    echo.
    
    REM 检查并启动 Redis Docker 容器（从 backend\.env 读取密码与端口）
    setlocal EnableDelayedExpansion
    set "REDIS_PASSWORD_DEFAULT=destiny123"
    set "REDIS_PORT_DEFAULT=6379"
    set "REDIS_PASSWORD="
    set "REDIS_PORT="
    if exist "backend\.env" (
        for /f "tokens=1,* delims==" %%A in (backend\.env) do (
            if /I "%%A"=="REDIS_PASSWORD" set "REDIS_PASSWORD=%%B"
            if /I "%%A"=="REDIS_PORT" set "REDIS_PORT=%%B"
        )
    )
    if "!REDIS_PASSWORD!"=="" set "REDIS_PASSWORD=!REDIS_PASSWORD_DEFAULT!"
    if "!REDIS_PORT!"=="" set "REDIS_PORT=!REDIS_PORT_DEFAULT!"

    echo 🔍 检查 Redis 容器...
    docker ps -a --format "{{.Names}}" | findstr /C:"destiny-redis" >nul 2>nul
    if %errorlevel% neq 0 (
        echo 📦 Redis 容器不存在，正在创建...
        docker run -d -p !REDIS_PORT!:6379 --name destiny-redis redis:7 redis-server --requirepass !REDIS_PASSWORD! --appendonly yes
        if %errorlevel% neq 0 (
            echo ❌ Redis 容器创建失败
            pause
            exit /b 1
        )
        echo ✅ Redis 容器创建成功
        timeout /t 2 >nul
    ) else (
        docker ps --format "{{.Names}}" | findstr /C:"destiny-redis" >nul 2>nul
        if %errorlevel% neq 0 (
            echo 🔄 启动已存在的 Redis 容器...
            docker start destiny-redis
            if %errorlevel% neq 0 (
                echo ❌ Redis 容器启动失败
                pause
                exit /b 1
            )
            echo ✅ Redis 容器启动成功
            timeout /t 2 >nul
        ) else (
            echo ✅ Redis 容器已在运行
        )
    )

    echo.
    echo 💾 Redis 信息：
    echo    连接地址: redis://:***@localhost:!REDIS_PORT!
    echo    容器名称: destiny-redis
    echo.
    
    REM 配置后端环境变量
    if not exist "backend\.env" (
        echo 🔧 配置后端环境变量...
        if exist "backend\.env.example" (
            copy "backend\.env.example" "backend\.env" >nul
            echo ✅ 已从 .env.example 创建后端 .env 文件
        ) else (
            echo 📝 创建默认后端 .env 配置...
            (
                echo PORT=5000
                echo MONGODB_URI=mongodb://!MONGO_ROOT_USER!:!MONGO_ROOT_PASSWORD!@localhost:27017/destiny-analysis?authSource=admin
                echo JWT_SECRET=destiny_analysis_jwt_secret_2024_change_in_production
                echo JWT_EXPIRE=30d
                echo NODE_ENV=development
            ) > "backend\.env"
            echo ✅ 已创建后端默认 .env 文件
        )
    )
    
    REM 使用认证信息更新后端 .env 的 MONGODB_URI
    powershell -NoProfile -Command "(Get-Content 'backend\.env') -replace '^MONGODB_URI=.*$', 'MONGODB_URI=mongodb://!MONGO_ROOT_USER!:!MONGO_ROOT_PASSWORD!@localhost:27017/destiny-analysis?authSource=admin' ^| Set-Content 'backend\.env'"
    
    REM 配置前端环境变量（可选）
    if not exist "frontend\.env" (
        echo 🔧 配置前端环境变量...
        if exist "frontend\.env.example" (
            copy "frontend\.env.example" "frontend\.env" >nul
            echo ✅ 已从 .env.example 创建前端 .env 文件
        ) else (
            echo 📝 创建默认前端 .env 配置...
            (
                echo # 前端环境变量配置
                echo.
                echo # 后端 API 地址
                echo REACT_APP_API_URL=http://localhost:5000/api
                echo.
                echo # 前端开发服务器端口（默认3000）
                echo PORT=3000
                echo.
                echo # 如果端口被占用，是否自动选择其他端口
                echo # BROWSER=none  # 不自动打开浏览器
            ) > "frontend\.env"
            echo ✅ 已创建前端默认 .env 文件
        )
    )
    
    REM 安装依赖
    if not exist "node_modules" (
        echo 📦 安装根目录依赖...
        call npm install
    )
    
    if not exist "backend\node_modules" (
        echo 📦 安装后端依赖...
        cd backend
        call npm install
        cd ..
    )
    
    if not exist "frontend\node_modules" (
        echo 📦 安装前端依赖...
        cd frontend
        call npm install
        cd ..
    )
    
    echo.
    echo ✅ 准备就绪，启动开发服务器...
    echo.
    echo 🌐 访问地址：
    echo    前端: http://localhost:3000
    echo    后端API: http://localhost:5000
    echo.
    
    call npm run dev
    
) else (
    echo ❌ 无效的选项
    pause
    exit /b 1
)

