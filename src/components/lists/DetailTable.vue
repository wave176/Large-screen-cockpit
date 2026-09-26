<!--
  明细表：名称 / 状态灯 / 进度条 / 结果文案。

  Props：
  - props.title: string

  dataSource.static.data：
  - rows: {
      name?: string
      status?: 'normal' | 'warn' | 'error'
      progress?: number   0–100，进度条宽度
      value?: string | number
    }[]
-->
<script setup lang="ts">
import { computed } from 'vue'
import type { ScreenComponent } from '@/shared/types/schema'
import { useComponentData } from '@/shared/composables/useComponentData'
import { getPropString } from '@/shared/utils/chartData'

interface DetailRow {
  name?: string
  status?: 'normal' | 'warn' | 'error'
  progress?: number
  value?: string | number
}

const props = defineProps<{ component: ScreenComponent }>()
const { data: liveData } = useComponentData(() => props.component)

const title = computed(() => getPropString(props.component, 'title', '明细表'))
const rows = computed(() => {
  const data = liveData.value as { rows?: DetailRow[] }
  return (
    data.rows ?? [
      { name: '设备-01', status: 'normal', progress: 86, value: '在线' },
      { name: '设备-02', status: 'warn', progress: 62, value: '延迟' },
      { name: '设备-03', status: 'error', progress: 28, value: '告警' },
      { name: '设备-04', status: 'normal', progress: 91, value: '在线' },
    ]
  )
})
</script>

<template>
  <div class="detail-table">
    <div class="detail-table__title">{{ title }}</div>
    <div class="detail-table__head">
      <span>名称</span>
      <span>状态</span>
      <span>进度</span>
      <span>结果</span>
    </div>
    <div v-for="(row, idx) in rows" :key="idx" class="detail-table__row">
      <span>{{ row.name }}</span>
      <span class="status" :class="row.status">
        <i />
        {{ row.status === 'normal' ? '正常' : row.status === 'warn' ? '预警' : '异常' }}
      </span>
      <span class="progress">
        <i :style="{ width: `${row.progress ?? 0}%` }" />
      </span>
      <span>{{ row.value }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.detail-table {
  width: 100%;
  height: 100%;
  padding: 10px 12px;
  overflow: auto;
  border: 1px solid var(--dp-border-strong);
  background: var(--dp-panel-a70);

  &__title {
    font-size: 13px;
    color: var(--dp-text-muted);
    margin-bottom: 8px;
  }

  &__head,
  &__row {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr 1.2fr 0.7fr;
    gap: 8px;
    align-items: center;
    font-size: 12px;
  }

  &__head {
    color: var(--dp-text-dim);
    padding-bottom: 6px;
    border-bottom: 1px solid var(--dp-border);
  }

  &__row {
    padding: 10px 0;
    color: var(--dp-text-secondary);
    border-bottom: 1px dashed rgba(51, 65, 85, 0.7);
  }

  .status {
    display: inline-flex;
    align-items: center;
    gap: 6px;

    i {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--dp-color-success);
    }

    &.warn i {
      background: var(--dp-color-warning);
    }

    &.error i {
      background: var(--dp-color-danger);
    }
  }

  .progress {
    height: 6px;
    border-radius: 999px;
    background: var(--dp-bg-elevated);
    overflow: hidden;

    i {
      display: block;
      height: 100%;
      background: linear-gradient(90deg, var(--dp-color-primary), var(--dp-color-success));
    }
  }
}
</style>
