#!/bin/sh

# ========================================
# 黄金看盘 Docker 入口脚本
# ========================================

echo "========================================"
echo "  黄金看盘 - Gold Monitor"
echo "  Version: ${VERSION:-unknown}"
echo "  Environment: ${APP_ENV:-prod}"
echo "  Time: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"

# 启动应用
exec /app/gold-monitor