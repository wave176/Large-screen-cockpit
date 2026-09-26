/**
 * 组件专属属性表单字段定义。
 *
 * PropertyPanel「组件配置」Tab 按 component.type 查本表渲染表单；
 * 未登记的类型回退为通用 props 键值编辑。
 *
 * 数据字段（categories、values 等）统一在属性面板「数据源」Tab 配置，不在此登记。
 */

import { getIconSelectOptions } from '@/components/icons/iconCatalog'
import { clockFormatOptions } from '@/components/controls/clockFormats'

export type PropFieldType = 'string' | 'number' | 'boolean' | 'color' | 'select' | 'textarea' | 'json'

export interface PropFieldOption {
  label: string
  value: string | number | boolean
}

export interface PropFieldDef {
  key: string
  label: string
  type: PropFieldType
  /** 下拉选项（type=select） */
  options?: PropFieldOption[]
  tip?: string
  rows?: number
}

/** 按组件 type 的专属字段表 */
export const componentPropSchemas: Record<string, PropFieldDef[]> = {
  TextBlock: [
    { key: 'text', label: '文本内容', type: 'textarea', rows: 3 },
    { key: 'fontSize', label: '字体大小', type: 'number' },
    { key: 'fontWeight', label: '字重', type: 'number', tip: '如 400 / 600 / 700' },
    { key: 'color', label: '文字颜色', type: 'color' },
    {
      key: 'align',
      label: '对齐',
      type: 'select',
      options: [
        { label: '左对齐', value: 'left' },
        { label: '居中', value: 'center' },
        { label: '右对齐', value: 'right' },
      ],
    },
  ],

  ChartBar: [
    { key: 'title', label: '图表标题', type: 'string' },
    {
      key: 'mode',
      label: '柱图模式',
      type: 'select',
      options: [
        { label: '纵向', value: 'vertical' },
        { label: '横向', value: 'horizontal' },
        { label: '堆叠', value: 'stack' },
      ],
    },
  ],

  ChartLine: [
    { key: 'title', label: '图表标题', type: 'string' },
  ],

  ChartPie: [
    { key: 'title', label: '图表标题', type: 'string' },
    { key: 'ring', label: '环形图', type: 'boolean' },
  ],

  ChartRadar: [
    { key: 'title', label: '图表标题', type: 'string' },
  ],

  ChartSparkline: [
    { key: 'title', label: '标题（可选）', type: 'string' },
    { key: 'color', label: '线条颜色', type: 'color' },
  ],

  MetricFlipper: [
    { key: 'digits', label: '位数', type: 'number' },
    { key: 'fontSize', label: '字体大小', type: 'number', tip: '单位 px，默认 28；框会随字号自动缩放' },
    { key: 'prefix', label: '前缀', type: 'string' },
    { key: 'suffix', label: '后缀', type: 'string' },
  ],

  MetricCard: [
    { key: 'title', label: '标题', type: 'string' },
    { key: 'value', label: '指标值', type: 'number' },
    { key: 'unit', label: '单位', type: 'string' },
    { key: 'fontSize', label: '字体大小', type: 'number', tip: '主数值字号，默认 36；框会随字号自动缩放' },
    { key: 'showYoy', label: '显示同比', type: 'boolean' },
    { key: 'yoy', label: '同比 %', type: 'number' },
    { key: 'showMom', label: '显示环比', type: 'boolean' },
    { key: 'mom', label: '环比 %', type: 'number' },
  ],

  ProgressGauge: [
    { key: 'title', label: '标题', type: 'string' },
    { key: 'value', label: '进度值', type: 'number', tip: '0–100' },
    {
      key: 'mode',
      label: '样式',
      type: 'select',
      options: [
        { label: '进度环', value: 'ring' },
        { label: '水位/半环', value: 'water' },
      ],
    },
  ],

  ScrollTable: [
    { key: 'title', label: '标题', type: 'string' },
  ],

  DetailTable: [
    { key: 'title', label: '标题', type: 'string' },
  ],

  TimelineWidget: [
    { key: 'title', label: '标题', type: 'string' },
  ],

  CardList: [
    { key: 'title', label: '标题', type: 'string' },
  ],

  BorderBox: [
    { key: 'title', label: '面板标题', type: 'string' },
    {
      key: 'variant',
      label: '边框样式',
      type: 'select',
      options: [
        { label: '蓝边', value: 1 },
        { label: '绿边', value: 2 },
        { label: '切角金边', value: 3 },
      ],
    },
  ],

  DecorLine: [
    {
      key: 'mode',
      label: '装饰模式',
      type: 'select',
      options: [
        { label: '线条', value: 'line' },
        { label: '网格', value: 'grid' },
        { label: '光晕', value: 'glow' },
      ],
    },
    { key: 'color', label: '主题色', type: 'color' },
  ],

  IconWidget: [
    {
      key: 'icon',
      label: '图标',
      type: 'select',
      tip: '选项来自 iconCatalog；新增 SVG 后在配置中登记即可',
      options: getIconSelectOptions(),
    },
    { key: 'color', label: '颜色', type: 'color' },
    { key: 'showBg', label: '圆形底', type: 'boolean' },
  ],

  TitleBar: [
    { key: 'title', label: '主标题', type: 'string' },
    { key: 'subtitle', label: '副标题', type: 'string' },
  ],

  LegendControl: [],

  FullscreenContainer: [
    { key: 'title', label: '提示文字', type: 'string' },
    { key: 'background', label: '背景色', type: 'string' },
  ],

  ClockWidget: [
    {
      key: 'format',
      label: '显示格式',
      type: 'select',
      options: clockFormatOptions.map((item) => ({
        label: item.label,
        value: item.value,
      })),
    },
    { key: 'fontSize', label: '字体大小', type: 'number', tip: '单位 px，默认 24' },
  ],

  Map3D: [
    { key: 'title', label: '标题', type: 'string' },
    { key: 'hint', label: '占位说明', type: 'textarea', rows: 2 },
  ],

  VideoPanel: [
    { key: 'title', label: '标题', type: 'string' },
    {
      key: 'layout',
      label: '分屏',
      type: 'select',
      options: [
        { label: '1×1', value: '1x1' },
        { label: '2×2', value: '2x2' },
      ],
    },
    { key: 'placeholder', label: '占位文案', type: 'string' },
  ],
}

export function getPropFieldsForType(type: string): PropFieldDef[] {
  return componentPropSchemas[type] ?? []
}
