<script setup lang="ts">
/**
 * 根组件：Naive UI 暗色主题 + 路由出口。
 * 业务页面由 RouterView 渲染，本文件不承载业务状态。
 */
import { NConfigProvider, darkTheme } from 'naive-ui'
</script>

<template>
  <NConfigProvider :theme="darkTheme">
    <RouterView />
  </NConfigProvider>
</template>
