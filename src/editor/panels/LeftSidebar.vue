<script setup lang="ts">
/**
 * 编辑器左侧栏：Tabs 切换「组件库」与「图层」两个子面板。
 * 本身无业务状态，仅作布局容器。
 */
import { NTabs, NTabPane } from 'naive-ui'
import ComponentPanel from '@/editor/panels/ComponentPanel.vue'
import LayerPanel from '@/editor/panels/LayerPanel.vue'
</script>

<template>
  <div class="left-sidebar">
    <NTabs type="line" animated class="left-sidebar__tabs">
      <NTabPane name="components" tab="组件">
        <ComponentPanel />
      </NTabPane>
      <NTabPane name="layers" tab="图层">
        <LayerPanel />
      </NTabPane>
    </NTabs>
  </div>
</template>

<style scoped lang="scss">
.left-sidebar {
  height: 100%;
  border-right: 1px solid var(--dp-border);
  background: var(--dp-bg-panel);

  &__tabs {
    height: 100%;
    display: flex;
    flex-direction: column;

    :deep(.n-tabs-nav) {
      padding: 0 12px;
    }

    :deep(.n-tab-pane) {
      height: calc(100vh - 112px);
      padding: 0 !important;
    }
  }
}
</style>
