/**
 * 组件运行时数据：static / http / sql / websocket + JS 脚本转换。
 */

import {
  computed,
  onUnmounted,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue'
import { storeToRefs } from 'pinia'
import { useScreenStore } from '@/store/screen'
import type { DataSourceConfig, ScreenComponent } from '@/shared/types/schema'
import {
  applyDataPipeline,
  normalizeComponentData,
  resolveComponentData,
} from '@/shared/dataSource/resolveData'

export type DataLoadStatus = 'idle' | 'loading' | 'ok' | 'error'

function componentContext(comp: ScreenComponent) {
  return { type: comp.type, props: comp.props }
}

function dataSourceSignature(ds: DataSourceConfig | undefined): string {
  if (!ds) return 'none'
  return JSON.stringify({
    type: ds.type,
    url: ds.url,
    method: ds.method,
    interval: ds.interval,
    dataPath: ds.dataPath,
    headers: ds.headers,
    body: ds.body,
    mapping: ds.mapping,
    sql: ds.sql,
    sqlId: ds.sqlId,
    transformScript: ds.transformScript,
    data: ds.type === 'static' ? ds.data : undefined,
  })
}

export function useComponentData(componentSource: MaybeRefOrGetter<ScreenComponent>) {
  const screenStore = useScreenStore()
  const { dataSourceRefreshKeys } = storeToRefs(screenStore)

  const data = ref<Record<string, unknown>>({})
  const status = ref<DataLoadStatus>('idle')
  const error = ref<string | null>(null)

  let timer: ReturnType<typeof setInterval> | undefined
  let socket: WebSocket | null = null
  let seq = 0

  const componentId = computed(() => toValue(componentSource).id)

  /** 从 Store 读取，保证 Schema 变更能触发画布重拉取 */
  const liveComponent = computed(() =>
    screenStore.schema.components.find((item) => item.id === componentId.value),
  )

  const dataSource = computed(() => liveComponent.value?.dataSource)

  function clearTimer() {
    if (timer) {
      clearInterval(timer)
      timer = undefined
    }
  }

  function clearSocket() {
    if (socket) {
      socket.close()
      socket = null
    }
  }

  function applyFallback(ds?: DataSourceConfig) {
    try {
      const comp = liveComponent.value ?? toValue(componentSource)
      const resolved = applyDataPipeline(
        ds?.data ?? {},
        ds ?? { type: 'static' },
        componentContext(comp),
      )
      data.value = normalizeComponentData(resolved)
    } catch (e) {
      data.value = normalizeComponentData(ds?.data ?? {})
      error.value = e instanceof Error ? e.message : String(e)
    }
  }

  async function loadOnce(currentSeq: number) {
    const comp = liveComponent.value ?? toValue(componentSource)
    const ds = comp.dataSource
    if (!ds || ds.type === 'static') {
      try {
        const resolved = await resolveComponentData(ds ?? { type: 'static' }, componentContext(comp))
        if (currentSeq !== seq) return
        data.value = normalizeComponentData(resolved)
        status.value = 'ok'
        error.value = null
      } catch (e) {
        if (currentSeq !== seq) return
        applyFallback(ds)
        status.value = 'error'
        error.value = e instanceof Error ? e.message : String(e)
      }
      return
    }

    status.value = 'loading'
    try {
      const resolved = await resolveComponentData(ds, componentContext(comp))
      if (currentSeq !== seq) return
      data.value = normalizeComponentData(resolved)
      status.value = 'ok'
      error.value = null
    } catch (e) {
      if (currentSeq !== seq) return
      applyFallback(ds)
      status.value = 'error'
      error.value = e instanceof Error ? e.message : String(e)
    }
  }

  function subscribeWebsocket(ds: DataSourceConfig, currentSeq: number) {
    clearSocket()
    if (!ds.url) {
      error.value = 'WebSocket 未配置 url'
      status.value = 'error'
      applyFallback(ds)
      return
    }
    status.value = 'loading'
    try {
      socket = new WebSocket(ds.url)
    } catch (e) {
      status.value = 'error'
      error.value = e instanceof Error ? e.message : String(e)
      applyFallback(ds)
      return
    }
    socket.onopen = () => {
      if (currentSeq !== seq) return
      status.value = 'ok'
      error.value = null
    }
    socket.onmessage = (event) => {
      if (currentSeq !== seq) return
      try {
        const raw = JSON.parse(String(event.data))
        const comp = liveComponent.value ?? toValue(componentSource)
        const resolved = applyDataPipeline(raw, ds, componentContext(comp))
        data.value = normalizeComponentData(resolved)
        status.value = 'ok'
        error.value = null
      } catch (e) {
        error.value = e instanceof Error ? e.message : 'WebSocket 消息或脚本处理失败'
        status.value = 'error'
      }
    }
    socket.onerror = () => {
      if (currentSeq !== seq) return
      error.value = 'WebSocket 连接错误'
      status.value = 'error'
      applyFallback(ds)
    }
  }

  function restart() {
    clearTimer()
    clearSocket()
    seq += 1
    const currentSeq = seq
    const ds = liveComponent.value?.dataSource ?? toValue(componentSource).dataSource

    if (!ds || ds.type === 'static') {
      void loadOnce(currentSeq)
      return
    }

    if (ds.type === 'websocket') {
      subscribeWebsocket(ds, currentSeq)
      return
    }

    void loadOnce(currentSeq)
    const interval = Number(ds.interval ?? 0)
    if (interval > 0) {
      timer = setInterval(() => {
        void loadOnce(currentSeq)
      }, interval)
    }
  }

  function refresh() {
    restart()
  }

  watch(
    () => [
      componentId.value,
      dataSourceSignature(dataSource.value),
      dataSourceRefreshKeys.value[componentId.value] ?? 0,
    ],
    () => restart(),
    { immediate: true },
  )

  onUnmounted(() => {
    seq += 1
    clearTimer()
    clearSocket()
  })

  return { data, status, error, refresh }
}
