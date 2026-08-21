import type { Component } from 'vue'
import type { ComponentMeta, DataSourceConfig } from '@/shared/types/schema'

import ChartBar from '@/components/charts/ChartBar.vue'
import ChartLine from '@/components/charts/ChartLine.vue'
import ChartPie from '@/components/charts/ChartPie.vue'
import ChartRadar from '@/components/charts/ChartRadar.vue'
import ChartSparkline from '@/components/charts/ChartSparkline.vue'

import MetricFlipper from '@/components/metrics/MetricFlipper.vue'
import MetricCard from '@/components/metrics/MetricCard.vue'
import ProgressGauge from '@/components/metrics/ProgressGauge.vue'

import ScrollTable from '@/components/lists/ScrollTable.vue'
import DetailTable from '@/components/lists/DetailTable.vue'
import TimelineWidget from '@/components/lists/TimelineWidget.vue'
import CardList from '@/components/lists/CardList.vue'

import BorderBox from '@/components/decorations/BorderBox.vue'
import DecorLine from '@/components/decorations/DecorLine.vue'

import TitleBar from '@/components/layout/TitleBar.vue'
import LegendControl from '@/components/layout/LegendControl.vue'
import FullscreenContainer from '@/components/layout/FullscreenContainer.vue'

import TextBlock from '@/components/infos/TextBlock.vue'
import ClockWidget from '@/components/controls/ClockWidget.vue'
import Map3D from '@/components/map3d/Map3DPlaceholder.vue'
import VideoPanel from '@/components/video/VideoPanelPlaceholder.vue'

export const componentViews: Record<string, Component> = {
  ChartBar,
  ChartLine,
  ChartPie,
  ChartRadar,
  ChartSparkline,
  MetricFlipper,
  MetricCard,
  ProgressGauge,
  ScrollTable,
  DetailTable,
  TimelineWidget,
  CardList,
  BorderBox,
  DecorLine,
  TitleBar,
  LegendControl,
  FullscreenContainer,
  TextBlock,
  ClockWidget,
  Map3D,
  VideoPanel,
}

export const componentMetas: ComponentMeta[] = [
  // —— 基础图表 ——
  {
    type: 'ChartBar',
    label: '柱状图',
    category: 'charts',
    defaultLayout: { x: 520, y: 140, width: 420, height: 280 },
    defaultProps: { title: '柱状图', mode: 'vertical' },
  },
  {
    type: 'ChartBar',
    label: '堆叠柱图',
    category: 'charts',
    defaultLayout: { x: 560, y: 180, width: 420, height: 280 },
    defaultProps: { title: '堆叠柱图', mode: 'stack' },
  },
  {
    type: 'ChartBar',
    label: '横向柱图',
    category: 'charts',
    defaultLayout: { x: 600, y: 220, width: 420, height: 280 },
    defaultProps: { title: '横向柱图', mode: 'horizontal' },
  },
  {
    type: 'ChartLine',
    label: '折线图',
    category: 'charts',
    defaultLayout: { x: 520, y: 460, width: 420, height: 280 },
    defaultProps: { title: '趋势分析' },
  },
  {
    type: 'ChartPie',
    label: '饼图',
    category: 'charts',
    defaultLayout: { x: 980, y: 140, width: 380, height: 320 },
    defaultProps: { title: '占比分布', ring: false },
  },
  {
    type: 'ChartPie',
    label: '环形图',
    category: 'charts',
    defaultLayout: { x: 1020, y: 180, width: 380, height: 320 },
    defaultProps: { title: '环形占比', ring: true },
  },
  {
    type: 'ChartRadar',
    label: '雷达图',
    category: 'charts',
    defaultLayout: { x: 980, y: 480, width: 400, height: 340 },
    defaultProps: { title: '多维对比' },
  },

  // —— 关键指标 ——
  {
    type: 'MetricFlipper',
    label: '数字翻牌器',
    category: 'metrics',
    defaultLayout: { x: 80, y: 120, width: 360, height: 120 },
    defaultProps: { title: '实时计数', value: 12860, digits: 5, prefix: '', suffix: '' },
  },
  {
    type: 'MetricCard',
    label: '指标卡',
    category: 'metrics',
    defaultLayout: { x: 80, y: 120, width: 240, height: 140 },
    defaultProps: { title: '关键指标', value: 86.5, unit: '%', yoy: 12.3, mom: -3.1 },
  },
  {
    type: 'ProgressGauge',
    label: '进度环',
    category: 'metrics',
    defaultLayout: { x: 80, y: 120, width: 220, height: 220 },
    defaultProps: { title: '完成率', value: 72, mode: 'ring' },
  },
  {
    type: 'ProgressGauge',
    label: '水位图',
    category: 'metrics',
    defaultLayout: { x: 80, y: 120, width: 260, height: 180 },
    defaultProps: { title: '水位进度', value: 68, mode: 'water' },
  },
  {
    type: 'ChartSparkline',
    label: '迷你图',
    category: 'metrics',
    defaultLayout: { x: 80, y: 120, width: 280, height: 80 },
    defaultProps: { color: '#38bdf8' },
  },

  // —— 列表与表格 ——
  {
    type: 'ScrollTable',
    label: '滚动表格',
    category: 'lists',
    defaultLayout: { x: 80, y: 120, width: 360, height: 280 },
    defaultProps: { title: '滚动排行' },
  },
  {
    type: 'DetailTable',
    label: '明细表',
    category: 'lists',
    defaultLayout: { x: 80, y: 120, width: 420, height: 260 },
    defaultProps: { title: '明细表' },
  },
  {
    type: 'TimelineWidget',
    label: '时间轴',
    category: 'lists',
    defaultLayout: { x: 80, y: 120, width: 320, height: 320 },
    defaultProps: { title: '事件时间轴' },
  },
  {
    type: 'CardList',
    label: '卡片列表',
    category: 'lists',
    defaultLayout: { x: 80, y: 120, width: 380, height: 260 },
    defaultProps: { title: '卡片列表' },
  },

  // —— 视觉与布局 ——
  {
    type: 'BorderBox',
    label: '科技边框',
    category: 'decorations',
    defaultLayout: { x: 80, y: 80, width: 420, height: 280 },
    defaultProps: { title: '面板标题', variant: 1, animated: true },
  },
  {
    type: 'BorderBox',
    label: '科技边框·绿',
    category: 'decorations',
    defaultLayout: { x: 80, y: 80, width: 420, height: 280 },
    defaultProps: { title: '面板标题', variant: 2, animated: true },
  },
  {
    type: 'BorderBox',
    label: '科技边框·切角',
    category: 'decorations',
    defaultLayout: { x: 80, y: 80, width: 420, height: 280 },
    defaultProps: { title: '面板标题', variant: 3, animated: true },
  },
  {
    type: 'DecorLine',
    label: '装饰线条',
    category: 'decorations',
    defaultLayout: { x: 80, y: 200, width: 480, height: 24 },
    defaultProps: { mode: 'line', color: '#38bdf8' },
  },
  {
    type: 'DecorLine',
    label: '网格背景',
    category: 'decorations',
    defaultLayout: { x: 80, y: 80, width: 480, height: 280 },
    defaultProps: { mode: 'grid', color: '#38bdf8' },
  },
  {
    type: 'DecorLine',
    label: '光晕背景',
    category: 'decorations',
    defaultLayout: { x: 80, y: 80, width: 360, height: 240 },
    defaultProps: { mode: 'glow', color: '#38bdf8' },
  },
  {
    type: 'TitleBar',
    label: '标题栏',
    category: 'layout',
    defaultLayout: { x: 200, y: 24, width: 1520, height: 64 },
    defaultProps: { title: '数据可视化大屏', subtitle: '' },
  },
  {
    type: 'LegendControl',
    label: '图例控制',
    category: 'layout',
    defaultLayout: { x: 80, y: 80, width: 360, height: 48 },
    defaultProps: {},
  },
  {
    type: 'FullscreenContainer',
    label: '全屏容器',
    category: 'layout',
    defaultLayout: { x: 40, y: 40, width: 1840, height: 1000 },
    defaultProps: { title: '全屏容器', background: 'rgba(15,23,42,0.35)' },
  },
  {
    type: 'ClockWidget',
    label: '时间显示',
    category: 'controls',
    defaultLayout: { x: 80, y: 40, width: 320, height: 72 },
    defaultProps: { format: 'YYYY-MM-DD HH:mm:ss' },
  },
  {
    type: 'TextBlock',
    label: '文本',
    category: 'infos',
    defaultLayout: { x: 100, y: 40, width: 400, height: 48 },
    defaultProps: {
      text: '标题文本',
      fontSize: 28,
      color: '#e0f2fe',
      align: 'center',
      fontWeight: 600,
    },
  },
  {
    type: 'Map3D',
    label: '3D 地图',
    category: 'map3d',
    defaultLayout: { x: 480, y: 100, width: 960, height: 720 },
    defaultProps: { title: '3D 地图', hint: 'Cesium 占位' },
  },
  {
    type: 'VideoPanel',
    label: '视频面板',
    category: 'video',
    defaultLayout: { x: 1460, y: 440, width: 420, height: 280 },
    defaultProps: {
      title: '监控窗口',
      layout: '1x1',
      placeholder: '视频流占位',
    },
  },
]

/** 面板里同 type 多条目时，按 label 取 meta；创建实例仍用 type */
export function getComponentMeta(type: string, label?: string): ComponentMeta | undefined {
  if (label) {
    const byLabel = componentMetas.find((item) => item.type === type && item.label === label)
    if (byLabel) return byLabel
  }
  return componentMetas.find((item) => item.type === type)
}

export function getComponentView(type: string): Component | undefined {
  return componentViews[type]
}

export const categoryLabels: Record<ComponentMeta['category'], string> = {
  charts: '基础图表',
  metrics: '关键指标',
  lists: '列表表格',
  decorations: '视觉装饰',
  layout: '布局',
  infos: '信息',
  controls: '控件',
  map3d: '3D 地图',
  video: '视频',
}

const categorySeries = {
  categories: ['A', 'B', 'C', 'D'],
  values: [12, 20, 15, 28],
}

const stackedSeries = {
  categories: ['周一', '周二', '周三', '周四'],
  series: [
    { name: '系列A', data: [12, 18, 14, 22] },
    { name: '系列B', data: [8, 10, 12, 9] },
  ],
}

/** 新建组件时的静态演示数据 */
export function getDefaultDataSource(type: string, props: Record<string, unknown>): DataSourceConfig | undefined {
  switch (type) {
    case 'ChartBar':
      return {
        type: 'static',
        data: props.mode === 'stack' ? stackedSeries : categorySeries,
      }
    case 'ChartLine':
      return { type: 'static', data: categorySeries }
    case 'ChartPie':
      return {
        type: 'static',
        data: {
          items: [
            { name: 'A类', value: 36 },
            { name: 'B类', value: 28 },
            { name: 'C类', value: 22 },
            { name: 'D类', value: 14 },
          ],
        },
      }
    case 'ChartRadar':
      return {
        type: 'static',
        data: {
          indicators: [
            { name: '性能', max: 100 },
            { name: '稳定', max: 100 },
            { name: '安全', max: 100 },
            { name: '体验', max: 100 },
            { name: '成本', max: 100 },
          ],
          series: [
            { name: '本期', value: [80, 72, 90, 68, 75] },
            { name: '上期', value: [65, 70, 78, 60, 80] },
          ],
        },
      }
    case 'ChartSparkline':
      return { type: 'static', data: { values: [3, 5, 4, 8, 6, 9, 7, 10, 8, 12] } }
    case 'ScrollTable':
      return {
        type: 'static',
        data: {
          rows: [
            { rank: 1, name: 'A区域', value: 1280 },
            { rank: 2, name: 'B区域', value: 1120 },
            { rank: 3, name: 'C区域', value: 980 },
            { rank: 4, name: 'D区域', value: 860 },
            { rank: 5, name: 'E区域', value: 740 },
          ],
        },
      }
    case 'DetailTable':
      return {
        type: 'static',
        data: {
          rows: [
            { name: '设备-01', status: 'normal', progress: 86, value: '在线' },
            { name: '设备-02', status: 'warn', progress: 62, value: '延迟' },
            { name: '设备-03', status: 'error', progress: 28, value: '告警' },
          ],
        },
      }
    case 'TimelineWidget':
      return {
        type: 'static',
        data: {
          items: [
            { time: '09:12', title: '告警恢复', desc: '东门摄像头恢复在线' },
            { time: '10:05', title: '巡检完成', desc: 'B区巡检任务已完成' },
            { time: '11:30', title: '新增告警', desc: '温度传感器超阈值' },
          ],
        },
      }
    case 'CardList':
      return {
        type: 'static',
        data: {
          items: [
            { title: '在线设备', value: 128, tag: '正常' },
            { title: '离线设备', value: 6, tag: '关注' },
            { title: '今日告警', value: 14, tag: '告警' },
            { title: '待处理工单', value: 9, tag: '处理中' },
          ],
        },
      }
    case 'LegendControl':
      return {
        type: 'static',
        data: {
          items: [
            { name: '在线', color: '#63e2b7' },
            { name: '离线', color: '#64748b' },
            { name: '告警', color: '#f87171' },
          ],
        },
      }
    default:
      return undefined
  }
}
