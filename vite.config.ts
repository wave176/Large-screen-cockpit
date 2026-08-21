/**
 * Vite 工程配置
 *
 * - @vitejs/plugin-vue：SFC 支持
 * - mockScreenApiPlugin：开发态把 /api/screens* 落到 data/screens/*.json（见 vite/mock-screen-api.ts）
 * - resolve.alias '@' → src/
 * - scss modern-compiler：与 Dart Sass 新 API 对齐
 * - server.port 5173，启动时自动打开浏览器
 */

import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { mockScreenApiPlugin } from './vite/mock-screen-api'

export default defineConfig({
  plugins: [vue(), mockScreenApiPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
})
