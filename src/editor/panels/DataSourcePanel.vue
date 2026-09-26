<script setup lang="ts">
/**
 * 属性面板「数据源」Tab。
 * - 数据样例：编辑样例 JSON，下方默认展示格式
 * - HTTP / SQL / WebSocket：切换类型后展示对应接入配置
 * - 底部数据处理脚本：return 的值即为组件最终数据
 */
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { NButton } from 'naive-ui'
import { useScreenStore } from '@/store/screen'
import type { DataSourceType } from '@/shared/types/schema'
import { resolveComponentData } from '@/shared/dataSource/resolveData'
import { DEFAULT_TRANSFORM_SCRIPT } from '@/shared/dataSource/runTransformScript'

const screenStore = useScreenStore()
const { selectedComponent } = storeToRefs(screenStore)

const previewJson = ref('{}')
const previewMode = ref<'sample' | 'live'>('sample')
const testStatus = ref('')

const ds = computed(() => selectedComponent.value?.dataSource)
const dsType = computed<DataSourceType>(() => ds.value?.type ?? 'static')

const typeOptions: { label: string; value: DataSourceType }[] = [
  { label: '数据样例', value: 'static' },
  { label: 'HTTP 接口', value: 'http' },
  { label: 'SQL（后端代理）', value: 'sql' },
  { label: 'WebSocket', value: 'websocket' },
]

const previewTitle = computed(() =>
  previewMode.value === 'live' ? '当前数据（处理后）' : '数据样例（格式参考）',
)

function componentCtx() {
  const c = selectedComponent.value
  if (!c) return undefined
  return { type: c.type, props: c.props }
}

function formatJson(value: unknown): string {
  try {
    return JSON.stringify(value ?? {}, null, 2)
  } catch {
    return '{}'
  }
}

function showSamplePreview() {
  previewMode.value = 'sample'
  previewJson.value = formatJson(selectedComponent.value?.dataSource?.data ?? {})
  testStatus.value = ''
}

function patchDs(patch: Record<string, unknown>) {
  if (!selectedComponent.value) return
  screenStore.updateComponentDataSource(selectedComponent.value.id, patch)
}

function onTypeChange(value: string) {
  patchDs({ type: value })
  if (value === 'static') {
    showSamplePreview()
  }
}

function commitSampleData(raw: string) {
  if (!selectedComponent.value) return
  try {
    const parsed = JSON.parse(raw) as unknown
    screenStore.updateComponentDataSource(selectedComponent.value.id, {
      type: 'static',
      data: parsed,
    })
    if (previewMode.value === 'sample') {
      previewJson.value = formatJson(parsed)
    }
    testStatus.value = ''
  } catch {
    testStatus.value = '样例 JSON 格式无效'
  }
}

async function testFetch() {
  if (!selectedComponent.value?.dataSource) return
  const config = selectedComponent.value.dataSource

  if (config.type === 'websocket') {
    testStatus.value = 'WebSocket 请在画布上观察推送效果'
    return
  }

  testStatus.value = config.type === 'static' ? '处理中…' : '请求中…'
  try {
    const data = await resolveComponentData(config, componentCtx())
    previewMode.value = 'live'
    previewJson.value = formatJson(data)
    testStatus.value =
      config.type === 'static' ? '样例处理完成' : '拉取并处理成功，已更新下方显示'
    screenStore.refreshComponentData(selectedComponent.value.id)
  } catch (e) {
    testStatus.value = e instanceof Error ? e.message : '处理失败'
  }
}

function parseJsonField(raw: string, label: string): Record<string, string> | undefined {
  const text = raw.trim()
  if (!text) return {}
  try {
    return JSON.parse(text) as Record<string, string>
  } catch {
    testStatus.value = `${label} JSON 无效`
    return undefined
  }
}

watch(
  () => selectedComponent.value?.id,
  () => showSamplePreview(),
  { immediate: true },
)

watch(
  () => selectedComponent.value?.dataSource?.data,
  () => {
    if (previewMode.value === 'sample') {
      previewJson.value = formatJson(selectedComponent.value?.dataSource?.data ?? {})
    }
  },
  { deep: true },
)
</script>

<template>
  <div v-if="selectedComponent" class="ds-panel">
    <p class="ds-panel__hint">
      默认使用「数据样例」。切换接入方式后配置对应参数；底部脚本可对拉取结果做转换，脚本
      <code>return</code> 的值即组件最终数据。
    </p>

    <label class="ds-panel__field">
      <span>数据源类型</span>
      <select
        :value="dsType"
        @change="onTypeChange(($event.target as HTMLSelectElement).value)"
      >
        <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </label>

    <!-- 数据样例 -->
    <section v-if="dsType === 'static'" class="ds-panel__section">
      <div class="ds-panel__section-title">数据样例</div>
      <label class="ds-panel__field">
        <span>样例 JSON</span>
        <textarea
          rows="10"
          spellcheck="false"
          :value="formatJson(ds?.data ?? {})"
          @change="commitSampleData(($event.target as HTMLTextAreaElement).value)"
        />
        <em class="ds-panel__tip">编辑后保存到 Schema，作为默认展示与动态源失败时的兜底</em>
      </label>
    </section>

    <!-- HTTP -->
    <section v-if="dsType === 'http'" class="ds-panel__section">
      <div class="ds-panel__section-title">HTTP 接入</div>
      <label class="ds-panel__field">
        <span>接口 URL</span>
        <input
          :value="ds?.url ?? ''"
          placeholder="https://api.example.com/data"
          @change="patchDs({ url: ($event.target as HTMLInputElement).value })"
        />
      </label>
      <label class="ds-panel__field">
        <span>请求方法</span>
        <select
          :value="ds?.method ?? 'GET'"
          @change="patchDs({ method: ($event.target as HTMLSelectElement).value })"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
        </select>
      </label>
      <label class="ds-panel__field">
        <span>请求头 JSON</span>
        <textarea
          rows="3"
          spellcheck="false"
          :value="JSON.stringify(ds?.headers ?? {}, null, 2)"
          @change="
            (() => {
              const v = parseJsonField(($event.target as HTMLTextAreaElement).value, 'headers')
              if (v) patchDs({ headers: v })
            })()
          "
        />
      </label>
      <label v-if="(ds?.method ?? 'GET') === 'POST'" class="ds-panel__field">
        <span>请求 Body</span>
        <textarea
          rows="4"
          spellcheck="false"
          :value="ds?.body ?? ''"
          @change="patchDs({ body: ($event.target as HTMLTextAreaElement).value })"
        />
      </label>
      <label class="ds-panel__field">
        <span>数据路径 dataPath</span>
        <input
          :value="ds?.dataPath ?? ''"
          placeholder="data 或 result.list"
          @change="patchDs({ dataPath: ($event.target as HTMLInputElement).value })"
        />
      </label>
      <label class="ds-panel__field">
        <span>轮询间隔 (ms)</span>
        <input
          type="number"
          :value="ds?.interval ?? 0"
          placeholder="0 = 只请求一次"
          @change="
            patchDs({ interval: Number(($event.target as HTMLInputElement).value) || 0 })
          "
        />
      </label>
      <label class="ds-panel__field">
        <span>字段映射 JSON（可选）</span>
        <textarea
          rows="3"
          spellcheck="false"
          :value="JSON.stringify(ds?.mapping ?? {}, null, 2)"
          placeholder='{"categories":"labels","values":"nums"}'
          @change="
            (() => {
              const v = parseJsonField(($event.target as HTMLTextAreaElement).value, 'mapping')
              if (v !== undefined) patchDs({ mapping: v })
            })()
          "
        />
        <em class="ds-panel__tip">组件字段名 → 远端字段名，在脚本执行前生效</em>
      </label>
    </section>

    <!-- SQL -->
    <section v-if="dsType === 'sql'" class="ds-panel__section">
      <div class="ds-panel__section-title">SQL 接入（后端代理）</div>
      <label class="ds-panel__field">
        <span>命名查询 sqlId（推荐）</span>
        <input
          :value="ds?.sqlId ?? ''"
          placeholder="device_stat_by_region"
          @change="patchDs({ sqlId: ($event.target as HTMLInputElement).value })"
        />
      </label>
      <label class="ds-panel__field">
        <span>SQL 语句</span>
        <textarea
          rows="4"
          spellcheck="false"
          :value="ds?.sql ?? ''"
          placeholder="SELECT region, cnt FROM device_stat"
          @change="patchDs({ sql: ($event.target as HTMLTextAreaElement).value })"
        />
        <em class="ds-panel__tip">浏览器不直连数据库，由 POST /api/data/sql 代理执行</em>
      </label>
      <label class="ds-panel__field">
        <span>数据路径 dataPath</span>
        <input
          :value="ds?.dataPath ?? ''"
          placeholder="data"
          @change="patchDs({ dataPath: ($event.target as HTMLInputElement).value })"
        />
      </label>
      <label class="ds-panel__field">
        <span>轮询间隔 (ms)</span>
        <input
          type="number"
          :value="ds?.interval ?? 0"
          @change="
            patchDs({ interval: Number(($event.target as HTMLInputElement).value) || 0 })
          "
        />
      </label>
      <label class="ds-panel__field">
        <span>字段映射 JSON（可选）</span>
        <textarea
          rows="3"
          spellcheck="false"
          :value="JSON.stringify(ds?.mapping ?? {}, null, 2)"
          @change="
            (() => {
              const v = parseJsonField(($event.target as HTMLTextAreaElement).value, 'mapping')
              if (v !== undefined) patchDs({ mapping: v })
            })()
          "
        />
      </label>
    </section>

    <!-- WebSocket -->
    <section v-if="dsType === 'websocket'" class="ds-panel__section">
      <div class="ds-panel__section-title">WebSocket 接入</div>
      <label class="ds-panel__field">
        <span>WebSocket URL</span>
        <input
          :value="ds?.url ?? ''"
          placeholder="wss://api.example.com/stream"
          @change="patchDs({ url: ($event.target as HTMLInputElement).value })"
        />
      </label>
      <label class="ds-panel__field">
        <span>数据路径 dataPath</span>
        <input
          :value="ds?.dataPath ?? ''"
          placeholder="payload"
          @change="patchDs({ dataPath: ($event.target as HTMLInputElement).value })"
        />
      </label>
      <label class="ds-panel__field">
        <span>字段映射 JSON（可选）</span>
        <textarea
          rows="3"
          spellcheck="false"
          :value="JSON.stringify(ds?.mapping ?? {}, null, 2)"
          @change="
            (() => {
              const v = parseJsonField(($event.target as HTMLTextAreaElement).value, 'mapping')
              if (v !== undefined) patchDs({ mapping: v })
            })()
          "
        />
      </label>
    </section>

    <!-- 数据处理脚本（所有类型共用，置于接入配置之下） -->
    <section class="ds-panel__section ds-panel__section--script">
      <div class="ds-panel__section-title">数据处理脚本</div>
      <label class="ds-panel__field">
        <span>JavaScript（函数体）</span>
        <textarea
          class="ds-panel__script"
          rows="12"
          spellcheck="false"
          :value="ds?.transformScript ?? ''"
          :placeholder="DEFAULT_TRANSFORM_SCRIPT"
          @change="
            patchDs({ transformScript: ($event.target as HTMLTextAreaElement).value })
          "
        />
        <em class="ds-panel__tip">
          支持 <code>return raw.data</code>，或函数表达式
          <code>function(raw) &#123; return raw.data &#125;</code>。可用
          <code>raw</code>、<code>component</code>。
        </em>
      </label>
    </section>

    <div class="ds-panel__actions">
      <NButton size="small" type="primary" @click="testFetch">
        {{ dsType === 'static' ? '预览处理结果' : '测试拉取' }}
      </NButton>
      <NButton
        v-if="previewMode === 'live'"
        size="small"
        quaternary
        @click="showSamplePreview"
      >
        恢复样例预览
      </NButton>
    </div>
    <p v-if="testStatus" class="ds-panel__status">{{ testStatus }}</p>

    <div class="ds-panel__preview-block">
      <div class="ds-panel__preview-head">
        <span>{{ previewTitle }}</span>
        <em :class="previewMode === 'live' ? 'is-live' : 'is-sample'">
          {{ previewMode === 'live' ? '处理后' : '样例' }}
        </em>
      </div>
      <pre class="ds-panel__preview">{{ previewJson }}</pre>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ds-panel {
  &__hint {
    margin: 0 0 14px;
    font-size: 12px;
    color: var(--dp-text-dim);
    line-height: 1.5;

    code {
      font-family: Consolas, Monaco, monospace;
      color: var(--dp-text-muted);
    }
  }

  &__section {
    margin-bottom: 16px;
    padding-bottom: 4px;
    border-bottom: 1px solid var(--dp-border-soft);

    &--script {
      border-bottom: none;
      padding-bottom: 0;
    }
  }

  &__section-title {
    margin-bottom: 10px;
    font-size: 12px;
    font-weight: 600;
    color: var(--dp-text-secondary);
    letter-spacing: 0.04em;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 12px;
    font-size: 12px;
    color: var(--dp-text-muted);

    input,
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
    }

    textarea {
      resize: vertical;
      font-family: Consolas, Monaco, monospace;
      font-size: 12px;
    }

    code {
      font-family: Consolas, Monaco, monospace;
      color: var(--dp-color-primary-strong);
    }
  }

  &__script {
    min-height: 160px;
    line-height: 1.5;
  }

  &__tip {
    font-style: normal;
    font-size: 11px;
    color: var(--dp-text-faint);
    line-height: 1.45;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
  }

  &__status {
    margin: 10px 0 0;
    font-size: 12px;
    color: var(--dp-color-primary-strong);
  }

  &__preview-block {
    margin-top: 14px;
  }

  &__preview-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
    font-size: 12px;
    color: var(--dp-text-muted);

    em {
      font-style: normal;
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 999px;

      &.is-sample {
        color: var(--dp-text-muted);
        background: var(--dp-muted-a12);
      }

      &.is-live {
        color: var(--dp-color-primary-bright);
        background: var(--dp-primary-a15);
      }
    }
  }

  &__preview {
    margin: 0;
    padding: 10px;
    min-height: 120px;
    max-height: 280px;
    overflow: auto;
    border-radius: 6px;
    background: var(--dp-bg-page);
    border: 1px solid var(--dp-border);
    color: var(--dp-text-secondary);
    font-size: 11px;
    line-height: 1.45;
    white-space: pre-wrap;
    word-break: break-word;
  }
}
</style>
