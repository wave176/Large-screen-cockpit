<!--
  指标卡：主数值 + 单位 + 同比/环比。

  Props（经 component: ScreenComponent，无 dataSource）：
  - props.title: string
  - props.value: number
  - props.unit: string
  - props.yoy / mom: number  同比、环比百分比（正负决定涨跌色）
-->
<script setup lang="ts">
import { computed } from 'vue'
import type { ScreenComponent } from '@/shared/types/schema'
import { getPropNumber, getPropString } from '@/shared/utils/chartData'

const props = defineProps<{ component: ScreenComponent }>()

const title = computed(() => getPropString(props.component, 'title', '关键指标'))
const value = computed(() => getPropNumber(props.component, 'value', 86.5))
const unit = computed(() => getPropString(props.component, 'unit', '%'))
const yoy = computed(() => getPropNumber(props.component, 'yoy', 12.3))
const mom = computed(() => getPropNumber(props.component, 'mom', -3.1))
</script>

<template>
  <div class="metric-card">
    <div class="metric-card__title">{{ title }}</div>
    <div class="metric-card__value">
      {{ value }}<small>{{ unit }}</small>
    </div>
    <div class="metric-card__trends">
      <span :class="yoy >= 0 ? 'up' : 'down'">同比 {{ yoy >= 0 ? '+' : '' }}{{ yoy }}%</span>
      <span :class="mom >= 0 ? 'up' : 'down'">环比 {{ mom >= 0 ? '+' : '' }}{{ mom }}%</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.metric-card {
  width: 100%;
  height: 100%;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  border: 1px solid var(--dp-primary-a25);
  border-radius: 10px;
  background: linear-gradient(135deg, var(--dp-panel-a90), var(--dp-elevated-a55));

  &__title {
    font-size: 13px;
    color: var(--dp-text-muted);
  }

  &__value {
    font-size: 36px;
    font-weight: 700;
    color: var(--dp-text-primary);
    line-height: 1.1;

    small {
      margin-left: 4px;
      font-size: 14px;
      color: var(--dp-color-primary);
    }
  }

  &__trends {
    display: flex;
    gap: 16px;
    font-size: 12px;

    .up {
      color: var(--dp-color-success);
    }

    .down {
      color: var(--dp-color-danger);
    }
  }
}
</style>
