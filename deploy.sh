#!/bin/bash

# ========================================
# 黄金看盘部署脚本
# ========================================

set -e

APP_NAME="gold-monitor"
IMAGE_NAME="gold-monitor:latest"
CONTAINER_NAME="gold-monitor"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 构建
build() {
    log_info "Building Docker image..."
    docker-compose build --no-cache
    log_info "Build completed!"
}

# 启动
start() {
    log_info "Starting ${APP_NAME}..."
    docker-compose up -d
    sleep 2
    log_info "Service started at http://localhost:8081"
}

# 停止
stop() {
    log_info "Stopping ${APP_NAME}..."
    docker-compose down
    log_info "Service stopped."
}

# 重启
restart() {
    stop
    sleep 2
    start
}

# 日志
logs() {
    docker-compose logs -f --tail=100
}

# 状态
status() {
    docker-compose ps
    echo ""
    log_info "Health check:"
    curl -s http://localhost:8081/api/health 2>/dev/null || echo "Service not responding"
}

# 清理
clean() {
    log_warn "Cleaning up..."
    docker-compose down -v --rmi local
    docker image prune -f
    log_info "Cleanup completed!"
}

# 完整部署
deploy() {
    build
    start
    status
}

# 帮助
case "$1" in
    build)   build ;;
    start)   start ;;
    stop)    stop ;;
    restart) restart ;;
    logs)    logs ;;
    status)  status ;;
    clean)   clean ;;
    deploy)  deploy ;;
    *)
        echo "Usage: $0 {build|start|stop|restart|logs|status|deploy|clean}"
        ;;
esac