/**
 * ECharts 按需注册入口（图表组件公共依赖）
 *
 * 用途：集中 use() 渲染器与图表/组件模块，各 Chart* / ProgressGauge 在挂载前调用一次即可。
 * 约定：新增图表类型（如 Scatter）时，在此补充对应 Chart 与所需 Component，再在业务组件里拼 option。
 * 无 props / dataSource：本文件仅为副作用注册，不参与 Schema。
 */

import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart, RadarChart, GaugeChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  RadarComponent,
} from 'echarts/components'

let ready = false

/** 统一注册 ECharts 模块，避免各组件分散 use 导致漏注册；可重复调用，仅首次生效 */
export function setupEcharts() {
  if (ready) return
  use([
    CanvasRenderer,
    BarChart,
    LineChart,
    PieChart,
    RadarChart,
    GaugeChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    TitleComponent,
    RadarComponent,
  ])
  ready = true
}
