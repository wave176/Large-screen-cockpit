/**
 * 前端路由表。
 *
 * 页面：
 * - /        首页（大屏列表）
 * - /editor  编辑器
 * - /runtime 运行时预览
 *
 * 使用 history 模式；各页懒加载以减小首包。
 */

import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/editor',
      name: 'editor',
      component: () => import('@/views/EditorView.vue'),
    },
    {
      path: '/runtime',
      name: 'runtime',
      component: () => import('@/views/RuntimeView.vue'),
    },
  ],
})

export default router
