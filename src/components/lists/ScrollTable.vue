<!--
  滚动排行表：行列表无缝向上滚动（CSS 动画，内容复制一份以实现循环）。

  Props：
  - props.title: string

  dataSource.static.data：
  - rows: { rank?: number, name?: string, value?: string | number }[]
-->
<script setup lang="ts">
import { computed } from 'vue'
import type { ScreenComponent } from '@/shared/types/schema'
import { useComponentData } from '@/shared/composables/useComponentData'
import { getPropString } from '@/shared/utils/chartData'

interface RowItem {
  name?: string
  value?: string | number
  rank?: number
}

const props = defineProps<{ component: ScreenComponent }>()
const { data: liveData } = useComponentData(() => props.component)

const title = computed(() => getPropString(props.component, 'title', '滚动排行'))
const rows = computed(() => {
  const data = liveData.value as { rows?: RowItem[] }
  return (
    data.rows ?? [
      { rank: 1, name: 'A区域', value: 1280 },
      { rank: 2, name: 'B区域', value: 1120 },
      { rank: 3, name: 'C区域', value: 980 },
      { rank: 4, name: 'D区域', value: 860 },
      { rank: 5, name: 'E区域', value: 740 },
      { rank: 6, name: 'F区域', value: 690 },
    ]
  )
})
</script>

<template>
  <div class="scroll-table">
    <div class="scroll-table__title">{{ title }}</div>
    <div class="scroll-table__head">
      <span>排名</span>
      <span>名称</span>
      <span>数值</span>
    </div>
    <div class="scroll-table__body">
      <div class="scroll-table__track">
        <div v-for="(row, idx) in [...rows, ...rows]" :key="`${idx}-${row.name}`" class="scroll-table__row">
          <span class="rank">{{ row.rank ?? (idx % rows.length) + 1 }}</span>
          <span>{{ row.name }}</span>
          <span class="value">{{ row.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.scroll-table {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px 12px;
  border: 1px solid rgba(56, 189, 248, 0.2);
  background: rgba(15, 23, 42, 0.65);

  &__title {
    font-size: 13px;
    color: #94a3b8;
    margin-bottom: 8px;
  }

  &__head,
  &__row {
    display: grid;
    grid-template-columns: 56px 1fr 80px;
    gap: 8px;
    font-size: 12px;
  }

  &__head {
    color: #64748b;
    padding-bottom: 6px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.15);
  }

  &__body {
    flex: 1;
    overflow: hidden;
    margin-top: 6px;
  }

  &__track {
    animation: scroll-up 14s linear infinite;
  }

  &__row {
    padding: 8px 0;
    color: #cbd5e1;
    border-bottom: 1px dashed rgba(51, 65, 85, 0.8);

    .rank {
      color: #38bdf8;
    }

    .value {
      text-align: right;
      color: #63e2b7;
    }
  }
}

@keyframes scroll-up {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-50%);
  }
}
</style>
