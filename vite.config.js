import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },

  // 构建优化
  build: {
    // 代码分割策略
    rollupOptions: {
      output: {
        // 分包配置
        manualChunks(id) {
          // Vue 核心
          if (id.includes('node_modules/vue/') || id.includes('node_modules/pinia/')) {
            return 'vue-vendor'
          }
          // 图表库
          if (id.includes('node_modules/echarts') ) {
            return 'charts'
          }
          // 工具库
          if (id.includes('node_modules/axios')) {
            return 'utils'
          }
        },
        // 文件命名
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()
            : 'chunk'
          return `assets/js/${chunkInfo.name || facadeModuleId}-[hash].js`
        },
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return 'assets/[name]-[hash][extname]'
          const info = assetInfo.name.split('.')
          let extType = info[info.length - 1]
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash][extname]`
          } else if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash][extname]`
          } else if (/\.css$/i.test(assetInfo.name)) {
            return `assets/css/[name]-[hash][extname]`
          }
          return `assets/[ext]/[name]-[hash][extname]`
        }
      }
    },
    // 压缩配置 (关闭压缩以加快构建速度)
    minify: false,
    // 分块大小警告阈值
    chunkSizeWarningLimit: 1000,
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 启用 source map（生产环境可关闭）
    sourcemap: false,
    // 清空输出目录
    emptyOutDir: true
  },

  // 开发服务器配置
  server: {
    port: 5173,
    host: true,
    open: false,
    // 代理配置（如果需要）
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true
      }
    }
  },

  // 依赖预构建
  optimizeDeps: {
    include: ['vue', 'pinia', 'axios'],
    exclude: []
  },

  // 性能提示
  performance: {
    maxAssetSize: 500000, // 500KB
    maxEntrypointSize: 500000,
    hints: 'warning'
  }
})
