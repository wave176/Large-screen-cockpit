<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { NButton } from 'naive-ui'
import { useScreenStore } from '@/store/screen'

defineProps<{
  floating?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const screenStore = useScreenStore()
const { selectedComponent, selectedComponents, selectedGroupId, schema } = storeToRefs(screenStore)

const layoutFields = computed(() => {
  if (!selectedComponent.value) return []
  const layout = selectedComponent.value.layout
  return [
    { key: 'x', label: 'X', value: layout.x },
    { key: 'y', label: 'Y', value: layout.y },
    { key: 'width', label: '宽', value: layout.width },
    { key: 'height', label: '高', value: layout.height },
    { key: 'zIndex', label: '层级', value: layout.zIndex },
  ] as const
})

const selectedGroupName = computed(() => {
  if (!selectedGroupId.value) return null
  return schema.value.groups.find((item) => item.id === selectedGroupId.value)?.name ?? null
})

function updateLayout(key: 'x' | 'y' | 'width' | 'height' | 'zIndex', value: number) {
  if (!selectedComponent.value) return
  screenStore.updateComponentLayout(selectedComponent.value.id, { [key]: value })
}

function updateProp(key: string, value: string | number) {
  if (!selectedComponent.value) return
  screenStore.updateComponentProps(selectedComponent.value.id, { [key]: value })
}
</script>

<template>
  <div class="property-panel" :class="{ 'property-panel--floating': floating }">
    <div class="property-panel__header">
      <div>
        <h3>属性</h3>
        <p v-if="selectedComponents.length > 1">已选 {{ selectedComponents.length }} 个组件</p>
        <p v-else-if="selectedGroupName">组：{{ selectedGroupName }}</p>
      </div>
      <NButton v-if="floating" quaternary size="tiny" @click="emit('close')">收起</NButton>
    </div>

    <div v-if="!selectedComponent" class="property-panel__empty">
      选中画布或图层中的组件以编辑属性
    </div>

    <template v-else>
      <section class="property-panel__section">
        <div class="property-panel__title">基础信息</div>
        <label class="property-panel__field">
          <span>图层名称</span>
          <input
            :value="selectedComponent.name"
            @change="screenStore.updateComponentName(selectedComponent.id, ($event.target as HTMLInputElement).value)"
          />
        </label>
        <div class="property-panel__row">
          <span>类型</span>
          <strong>{{ selectedComponent.type }}</strong>
        </div>
        <div class="property-panel__row">
          <span>所属组</span>
          <strong>{{ selectedComponent.groupId ?? '未分组' }}</strong>
        </div>
      </section>

      <section class="property-panel__section">
        <div class="property-panel__title">布局</div>
        <label
          v-for="field in layoutFields"
          :key="field.key"
          class="property-panel__field"
        >
          <span>{{ field.label }}</span>
          <input
            type="number"
            :value="field.value"
            :disabled="selectedComponent.locked"
            @change="updateLayout(field.key, Number(($event.target as HTMLInputElement).value))"
          />
        </label>
      </section>

      <section class="property-panel__section">
        <div class="property-panel__title">组件属性</div>
        <label
          v-for="(value, key) in selectedComponent.props"
          :key="key"
          class="property-panel__field"
        >
          <span>{{ key }}</span>
          <input
            :value="String(value)"
            @change="updateProp(String(key), ($event.target as HTMLInputElement).value)"
          />
        </label>
      </section>
    </template>
  </div>
</template>

<style scoped lang="scss">
.property-panel {
  height: 100%;
  padding: 16px;
  overflow: auto;
  background: #0f172a;

  &--floating {
    height: auto;
    max-height: calc(100% - 24px);
    padding: 14px;
    border: 1px solid rgba(148, 163, 184, 0.18);
    border-radius: 12px;
    background: rgba(15, 23, 42, 0.92);
    backdrop-filter: blur(12px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
  }

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 16px;

    h3 {
      margin: 0;
      font-size: 14px;
      color: #e2e8f0;
    }

    p {
      margin: 4px 0 0;
      font-size: 11px;
      color: #64748b;
    }
  }

  &__empty {
    font-size: 13px;
    color: #64748b;
    line-height: 1.6;
  }

  &__section + &__section {
    margin-top: 20px;
  }

  &__title {
    margin-bottom: 10px;
    font-size: 12px;
    color: #64748b;
  }

  &__row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
    font-size: 12px;
    color: #94a3b8;
    word-break: break-all;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 10px;
    font-size: 12px;
    color: #94a3b8;

    input {
      padding: 8px 10px;
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 6px;
      background: #020617;
      color: #e2e8f0;
      outline: none;

      &:focus {
        border-color: rgba(56, 189, 248, 0.45);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}
</style>
