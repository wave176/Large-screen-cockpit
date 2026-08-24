<!--
  事件时间轴：左侧圆点+连线，右侧时间/标题/描述。

  Props：
  - props.title: string

  dataSource.static.data：
  - items: { time?: string, title?: string, desc?: string }[]
-->
<script setup lang="ts">
import { computed } from 'vue'
import type { ScreenComponent } from '@/shared/types/schema'
import { useComponentData } from '@/shared/composables/useComponentData'
import { getPropString } from '@/shared/utils/chartData'

interface TimelineItem {
  time?: string
  title?: string
  desc?: string
}

const props = defineProps<{ component: ScreenComponent }>()
const { data: liveData } = useComponentData(() => props.component)

const title = computed(() => getPropString(props.component, 'title', '事件时间轴'))
const items = computed(() => {
  const data = liveData.value as { items?: TimelineItem[] }
  return (
    data.items ?? [
      { time: '09:12', title: '告警恢复', desc: '东门摄像头恢复在线' },
      { time: '10:05', title: '巡检完成', desc: 'B区巡检任务已完成' },
      { time: '11:30', title: '新增告警', desc: '温度传感器超阈值' },
      { time: '13:18', title: '工单派发', desc: '已派发运维工单 #1024' },
    ]
  )
})
</script>

<template>
  <div class="timeline">
    <div class="timeline__title">{{ title }}</div>
    <div v-for="(item, idx) in items" :key="idx" class="timeline__item">
      <div class="timeline__axis">
        <i />
        <em v-if="idx < items.length - 1" />
      </div>
      <div class="timeline__content">
        <div class="timeline__time">{{ item.time }}</div>
        <div class="timeline__name">{{ item.title }}</div>
        <div class="timeline__desc">{{ item.desc }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.timeline {
  width: 100%;
  height: 100%;
  padding: 12px 14px;
  overflow: auto;

  &__title {
    font-size: 13px;
    color: #94a3b8;
    margin-bottom: 12px;
  }

  &__item {
    display: grid;
    grid-template-columns: 20px 1fr;
    gap: 10px;
  }

  &__axis {
    position: relative;
    display: flex;
    justify-content: center;

    i {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #38bdf8;
      box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.2);
      z-index: 1;
    }

    em {
      position: absolute;
      top: 12px;
      bottom: -8px;
      width: 2px;
      background: rgba(56, 189, 248, 0.25);
    }
  }

  &__content {
    padding-bottom: 16px;
  }

  &__time {
    font-size: 11px;
    color: #64748b;
  }

  &__name {
    margin-top: 2px;
    font-size: 13px;
    color: #e2e8f0;
  }

  &__desc {
    margin-top: 2px;
    font-size: 12px;
    color: #94a3b8;
  }
}
</style>
