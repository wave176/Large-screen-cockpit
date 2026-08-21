<script setup lang="ts">
/**
 * 首页入口：介绍工程能力，并跳转到设计器 / Runtime。
 * 无 schema 读写，纯导航页。
 */
import { NButton, NCard, NSpace } from 'naive-ui'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="home-view">
    <NCard class="home-view__card" title="大屏可视化平台" size="large">
      <p>基于 Vue 3 + 固定分辨率画布 + ECharts 的静态基础工程。</p>
      <ul>
        <li>设计器：固定分辨率、Moveable 拖拽、组件库、属性面板</li>
        <li>运行时：Schema 驱动渲染、scale 屏幕适配</li>
        <li>示例组件：ECharts 图表、边框、文本、时钟、3D/视频占位</li>
      </ul>

      <NSpace>
        <NButton type="primary" size="large" @click="router.push('/editor')">
          进入设计器
        </NButton>
        <NButton size="large" @click="router.push('/runtime')">
          进入 Runtime 预览
        </NButton>
      </NSpace>
    </NCard>
  </div>
</template>

<style scoped lang="scss">
.home-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    radial-gradient(circle at top, rgba(56, 189, 248, 0.12), transparent 35%),
    #020617;

  &__card {
    width: min(720px, 100%);
    background: rgba(15, 23, 42, 0.92);

    p {
      color: #94a3b8;
      line-height: 1.7;
    }

    ul {
      margin: 16px 0 24px;
      padding-left: 20px;
      color: #cbd5e1;
      line-height: 1.8;
    }
  }
}
</style>
