# ========================================
# 黄金看盘 - 预编译版本
# 直接使用已编译好的文件
# ========================================

FROM alpine:latest

ENV TZ=Asia/Shanghai
ENV GIN_MODE=release

WORKDIR /app

# 使用国内镜像加速
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories \
    && apk add --no-cache ca-certificates tzdata wget \
    && ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

# 复制已编译好的二进制文件（前端已内嵌）
COPY build/gold-monitor-linux-amd64 /app/gold-monitor

# 创建非 root 用户
RUN addgroup -g 1000 appgroup \
    && adduser -u 1000 -G appgroup -D appuser \
    && chmod +x /app/gold-monitor \
    && chown -R appuser:appgroup /app

USER appuser

EXPOSE 8081

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --output-document=/dev/null http://localhost:8081/api/health || exit 1

CMD ["/app/gold-monitor"]