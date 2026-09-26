<!--
  大屏图标：真实 SVG + 配置驱动（见 iconCatalog.ts / assets/icons）。

  Props（经 component: ScreenComponent）：
  - props.icon: string     对应 iconCatalog.id
  - props.color?: string   tintable 时生效
  - props.showBg?: boolean 圆形底
-->
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useScreenStore } from '@/store/screen'
import type { ScreenComponent } from '@/shared/types/schema'
import { colors } from '@/shared/theme/colors'
import { getIconCatalogItem } from '@/components/icons/iconCatalog'
import { resolveIcon, svgToDataUrl } from '@/components/icons/resolveIcon'

const props = defineProps<{ component: ScreenComponent }>()

const screenStore = useScreenStore()
const { schema } = storeToRefs(screenStore)

const liveProps = computed(() => {
  const found = schema.value.components.find((item) => item.id === props.component.id)
  return found?.props ?? props.component.props
})

const iconId = computed(() => String(liveProps.value.icon ?? 'park'))
const catalogItem = computed(() => getIconCatalogItem(iconId.value))
const color = computed(() =>
  String(liveProps.value.color ?? catalogItem.value?.defaultColor ?? colors.primary),
)
const showBg = computed(() => {
  const v = liveProps.value.showBg
  if (v === undefined || v === null || v === '') {
    return catalogItem.value?.showBg !== false
  }
  return Boolean(v)
})

const resolved = computed(() => resolveIcon(iconId.value))
const remoteSvg = ref('')

async function loadRemoteSvg(url: string) {
  remoteSvg.value = ''
  try {
    const res = await fetch(url)
    if (!res.ok) return
    const text = await res.text()
    if (text.includes('<svg')) remoteSvg.value = text
  } catch {
    remoteSvg.value = ''
  }
}

watch(
  () => [resolved.value?.url, resolved.value?.svg] as const,
  ([url, svg]) => {
    if (svg) {
      remoteSvg.value = ''
      return
    }
    if (url) void loadRemoteSvg(url)
    else remoteSvg.value = ''
  },
  { immediate: true },
)

onMounted(() => {
  if (!resolved.value?.svg && resolved.value?.url) {
    void loadRemoteSvg(resolved.value.url)
  }
})

/** 统一走 <img + data URL>，避免 v-html 解析 SVG 时丢掉 rect/circle */
const imgSrc = computed(() => {
  const r = resolved.value
  if (!r) return ''
  const raw = r.svg || remoteSvg.value
  if (raw) {
    return svgToDataUrl(raw, r.tintable ? color.value : undefined)
  }
  // 不可内联时退回原始 URL（多色图）
  return r.url ?? ''
})
</script>

<template>
  <div class="icon-widget" :style="{ '--icon-color': color }">
    <div class="icon-widget__glyph" :class="{ 'icon-widget__glyph--bg': showBg }">
      <img
        v-if="imgSrc"
        class="icon-widget__img"
        :src="imgSrc"
        :alt="catalogItem?.label ?? iconId"
        draggable="false"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.icon-widget {
  box-sizing: border-box;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  color: var(--icon-color, var(--dp-color-primary));
  overflow: hidden;
  user-select: none;

  &__glyph {
    box-sizing: border-box;
    display: grid;
    place-items: center;
    width: min(100%, 120px);
    aspect-ratio: 1 / 1;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    min-width: 0;
    min-height: 0;

    &--bg {
      border-radius: 50%;
      background: color-mix(in srgb, var(--icon-color) 14%, transparent);
      border: 1px solid color-mix(in srgb, var(--icon-color) 40%, transparent);
      box-shadow: inset 0 0 16px color-mix(in srgb, var(--icon-color) 18%, transparent);
    }
  }

  &__img {
    display: block;
    width: 54%;
    height: 54%;
    object-fit: contain;
    object-position: center;
  }
}
</style>
