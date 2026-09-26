<script setup lang="ts">
/**
 * 右侧固定属性面板（与左侧组件栏对称）。
 *
 * Tab「基础配置」：名称、分组、锁定/可见、位置尺寸层级。
 * Tab「组件配置」：按 type 查 propSchemas 的专属表单。
 * Tab「数据源」：static / http / sql / websocket 动态取数。
 */
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { NTabPane, NTabs } from 'naive-ui'
import { useScreenStore } from '@/store/screen'
import {
  getPropFieldsForType,
  type PropFieldDef,
} from '@/components/propSchemas'
import { getComponentMeta } from '@/components/registry'
import DataSourcePanel from '@/editor/panels/DataSourcePanel.vue'
import { colors } from '@/shared/theme/colors'

const screenStore = useScreenStore()
const { selectedComponent, selectedComponents, schema } = storeToRefs(screenStore)

const activeTab = ref<'basic' | 'specific' | 'data'>('basic')

watch(
  () => selectedComponent.value?.id,
  () => {
    activeTab.value = 'basic'
  },
)

const typeLabel = computed(() => {
  const comp = selectedComponent.value
  if (!comp) return ''
  return getComponentMeta(comp.type)?.label ?? comp.type
})

const groupOptions = computed(() => [
  { label: '未分组', value: '' },
  ...schema.value.groups.map((g) => ({ label: g.name, value: g.id })),
])

const specificFields = computed(() => {
  if (!selectedComponent.value) return [] as PropFieldDef[]
  return getPropFieldsForType(selectedComponent.value.type)
})

const layoutFields = computed(() => {
  if (!selectedComponent.value) return []
  const layout = selectedComponent.value.layout
  return [
    { key: 'x' as const, label: 'X', value: layout.x },
    { key: 'y' as const, label: 'Y', value: layout.y },
    { key: 'width' as const, label: '宽', value: layout.width },
    { key: 'height' as const, label: '高', value: layout.height },
    { key: 'zIndex' as const, label: '层级', value: layout.zIndex },
  ]
})

function updateLayout(key: 'x' | 'y' | 'width' | 'height' | 'zIndex', value: number) {
  if (!selectedComponent.value) return
  if (Number.isNaN(value)) return
  screenStore.updateComponentLayout(selectedComponent.value.id, { [key]: value })
}

function setGroup(groupId: string) {
  if (!selectedComponent.value) return
  screenStore.setComponentGroup(selectedComponent.value.id, groupId || null)
}

function readFieldValue(field: PropFieldDef): unknown {
  const comp = selectedComponent.value
  if (!comp) return ''
  return comp.props[field.key]
}

/** select 缺省值：未写入过的 props 显示选项默认值，避免空白 */
function selectDisplayValue(field: PropFieldDef): string {
  const value = readFieldValue(field)
  if (value !== undefined && value !== null && value !== '') return String(value)
  if (field.options?.length) return String(field.options[0].value)
  return ''
}

function displayValue(field: PropFieldDef): string {
  const value = readFieldValue(field)
  if (field.type === 'json') {
    try {
      return JSON.stringify(value ?? (field.key === 'series' ? [] : value), null, 2)
    } catch {
      return ''
    }
  }
  if (field.type === 'boolean') return String(Boolean(value))
  if (value === undefined || value === null) return ''
  return String(value)
}

function coercePropValue(field: PropFieldDef, raw: string): unknown {
  if (field.type === 'number') {
    const n = Number(raw)
    return Number.isNaN(n) ? 0 : n
  }
  if (field.type === 'boolean') {
    const text = raw.trim().toLowerCase()
    return text === 'true' || text === '1' || text === 'yes'
  }
  if (field.type === 'json') {
    return JSON.parse(raw)
  }
  if (field.type === 'select') {
    const opt = field.options?.find((o) => String(o.value) === raw)
    return opt ? opt.value : raw
  }
  return raw
}

function commitField(field: PropFieldDef, raw: string) {
  if (!selectedComponent.value) return
  try {
    const value = coercePropValue(field, raw)
    screenStore.updateComponentProps(selectedComponent.value.id, { [field.key]: value })
  } catch {
    // JSON 非法时不写入，保持原值
  }
}

function commitFallbackProp(key: string, raw: string) {
  if (!selectedComponent.value) return
  const prev = selectedComponent.value.props[key]
  let value: unknown = raw
  if (typeof prev === 'number') {
    const n = Number(raw)
    value = Number.isNaN(n) ? prev : n
  } else if (typeof prev === 'boolean') {
    value = raw === 'true' || raw === '1'
  }
  screenStore.updateComponentProps(selectedComponent.value.id, { [key]: value })
}

function handlePanelFocusIn(event: FocusEvent) {
  const target = event.target as HTMLElement | null
  if (!target) return
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
    screenStore.hideSelectionChrome()
  }
}
</script>

<template>
  <div class="property-panel" @focusin="handlePanelFocusIn">
    <div class="property-panel__header">
      <h3>属性</h3>
      <p v-if="selectedComponents.length > 1">已选 {{ selectedComponents.length }} 个（编辑主选）</p>
      <p v-else-if="selectedComponent">{{ typeLabel }} · {{ selectedComponent.name }}</p>
      <p v-else>未选中组件</p>
    </div>

    <div v-if="!selectedComponent" class="property-panel__empty">
      在画布或左侧「图层」中选中组件后，可在此编辑基础布局与组件专属配置。
    </div>

    <NTabs
      v-else
      v-model:value="activeTab"
      type="line"
      animated
      class="property-panel__tabs"
    >
      <NTabPane name="basic" tab="基础配置">
        <div class="property-panel__scroll">
          <section class="property-panel__section">
            <div class="property-panel__title">标识</div>
            <label class="property-panel__field">
              <span>图层名称</span>
              <input
                :value="selectedComponent.name"
                @change="
                  screenStore.updateComponentName(
                    selectedComponent.id,
                    ($event.target as HTMLInputElement).value,
                  )
                "
              />
            </label>
            <div class="property-panel__row">
              <span>组件类型</span>
              <strong>{{ typeLabel }}</strong>
            </div>
            <div class="property-panel__row">
              <span>类型标识</span>
              <strong>{{ selectedComponent.type }}</strong>
            </div>
            <label class="property-panel__field">
              <span>所属分组</span>
              <select
                :value="selectedComponent.groupId ?? ''"
                @change="setGroup(($event.target as HTMLSelectElement).value)"
              >
                <option v-for="opt in groupOptions" :key="opt.value || 'none'" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </label>
            <label class="property-panel__check">
              <input
                type="checkbox"
                :checked="selectedComponent.locked"
                @change="screenStore.toggleComponentLocked(selectedComponent.id)"
              />
              <span>锁定（不可拖拽）</span>
            </label>
            <label class="property-panel__check">
              <input
                type="checkbox"
                :checked="selectedComponent.visible"
                @change="screenStore.toggleComponentVisible(selectedComponent.id)"
              />
              <span>可见</span>
            </label>
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
                @change="
                  updateLayout(field.key, Number(($event.target as HTMLInputElement).value))
                "
              />
            </label>
          </section>
        </div>
      </NTabPane>

      <NTabPane name="specific" tab="组件配置">
        <div class="property-panel__scroll">
          <template v-if="specificFields.length">
            <section class="property-panel__section">
              <div class="property-panel__title">{{ typeLabel }} 专属</div>
              <label
                v-for="field in specificFields"
                :key="field.key"
                class="property-panel__field"
              >
                <span>{{ field.label }}</span>
                <select
                  v-if="field.type === 'select'"
                  :value="selectDisplayValue(field)"
                  @change="commitField(field, ($event.target as HTMLSelectElement).value)"
                >
                  <option
                    v-for="opt in field.options"
                    :key="String(opt.value)"
                    :value="String(opt.value)"
                  >
                    {{ opt.label }}
                  </option>
                </select>
                <textarea
                  v-else-if="field.type === 'textarea' || field.type === 'json'"
                  :rows="field.rows ?? 4"
                  :value="displayValue(field)"
                  spellcheck="false"
                  @change="commitField(field, ($event.target as HTMLTextAreaElement).value)"
                />
                <input
                  v-else-if="field.type === 'boolean'"
                  type="checkbox"
                  :checked="Boolean(readFieldValue(field))"
                  @change="
                    commitField(
                      field,
                      String(($event.target as HTMLInputElement).checked),
                    )
                  "
                />
                <input
                  v-else-if="field.type === 'color'"
                  type="color"
                  :value="String(readFieldValue(field) || colors.primary)"
                  @change="commitField(field, ($event.target as HTMLInputElement).value)"
                />
                <input
                  v-else
                  :type="field.type === 'number' ? 'number' : 'text'"
                  :value="displayValue(field)"
                  @change="commitField(field, ($event.target as HTMLInputElement).value)"
                />
                <em v-if="field.tip" class="property-panel__tip">{{ field.tip }}</em>
              </label>
            </section>
          </template>

          <template v-else>
            <section class="property-panel__section">
              <div class="property-panel__title">样式与行为</div>
              <p
                v-if="selectedComponent.dataSource"
                class="property-panel__hint"
              >
                该组件的数据请在「数据源」Tab 中配置；此处仅保留样式相关属性。
              </p>
              <p v-else class="property-panel__hint">该类型尚未登记专属表单，以下为 props 原始键值。</p>
              <label
                v-for="(value, key) in selectedComponent.props"
                :key="String(key)"
                class="property-panel__field"
              >
                <span>{{ key }}</span>
                <input
                  :value="String(value)"
                  @change="
                    commitFallbackProp(String(key), ($event.target as HTMLInputElement).value)
                  "
                />
              </label>
            </section>
          </template>
        </div>
      </NTabPane>

      <NTabPane name="data" tab="数据源">
        <div class="property-panel__scroll">
          <DataSourcePanel />
        </div>
      </NTabPane>
    </NTabs>
  </div>
</template>

<style scoped lang="scss">
.property-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--dp-bg-panel);
  border-left: 1px solid var(--dp-border);

  &__header {
    flex: none;
    padding: 16px 16px 8px;

    h3 {
      margin: 0;
      font-size: 14px;
      color: var(--dp-text-primary);
    }

    p {
      margin: 4px 0 0;
      font-size: 11px;
      color: var(--dp-text-dim);
    }
  }

  &__empty {
    padding: 16px;
    font-size: 13px;
    color: var(--dp-text-dim);
    line-height: 1.6;
  }

  &__tabs {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;

    :deep(.n-tabs-nav) {
      padding: 0 12px;
    }

    :deep(.n-tabs-pane-wrapper) {
      flex: 1;
      min-height: 0;
    }

    :deep(.n-tab-pane) {
      height: calc(100vh - 148px);
      padding: 0 !important;
    }
  }

  &__scroll {
    height: 100%;
    padding: 12px 16px 24px;
    overflow: auto;
  }

  &__section + &__section {
    margin-top: 20px;
  }

  &__title {
    margin-bottom: 10px;
    font-size: 12px;
    color: var(--dp-text-dim);
  }

  &__hint {
    margin: 0 0 12px;
    font-size: 12px;
    color: var(--dp-text-dim);
    line-height: 1.5;
  }

  &__row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
    font-size: 12px;
    color: var(--dp-text-muted);
    word-break: break-all;
  }

  &__check {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    font-size: 12px;
    color: var(--dp-text-muted);
    cursor: pointer;

    input {
      accent-color: var(--dp-color-primary);
    }
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 12px;
    font-size: 12px;
    color: var(--dp-text-muted);

    input[type='text'],
    input[type='number'],
    input:not([type]),
    select,
    textarea {
      padding: 8px 10px;
      border: 1px solid var(--dp-border-strong);
      border-radius: 6px;
      background: var(--dp-bg-page);
      color: var(--dp-text-primary);
      outline: none;
      font: inherit;

      &:focus {
        border-color: var(--dp-primary-a45);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    textarea {
      resize: vertical;
      min-height: 72px;
      font-family: Consolas, Monaco, monospace;
      font-size: 12px;
      line-height: 1.45;
    }

    input[type='checkbox'] {
      width: 16px;
      height: 16px;
      accent-color: var(--dp-color-primary);
    }

    input[type='color'] {
      height: 36px;
      padding: 2px;
      border: 1px solid var(--dp-border-strong);
      border-radius: 6px;
      background: var(--dp-bg-page);
      cursor: pointer;
    }
  }

  &__tip {
    font-style: normal;
    font-size: 11px;
    color: var(--dp-text-faint);
    line-height: 1.4;
  }
}
</style>
