import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// 开发与预览通过同源 /api 转发公开查询，Java 端接口保留 /web 路径。
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'ACGBOX_')
  const proxy = {
    '/api/web': {
      target: env.ACGBOX_API_TARGET || 'http://localhost:8080',
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/api/, ''),
    },
  }
  return {
    plugins: [vue(), vueDevTools()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    // 用户端开发服务使用独立端口，便于与管理端同时运行。
    server: { port: 5175, strictPort: true, proxy },
    preview: { port: 4174, strictPort: true, proxy },
  }
})
