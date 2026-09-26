/**
 * 内置示例大屏 Schema（智慧园区演示）。
 *
 * 依赖：`ScreenSchema` 类型。
 * 用途：
 * - store 初始值 / hydrate 失败时的回退文档
 * - 首次无 JSON 文件时由 API 写入 data/screens/
 *
 * 注意：改这里会影响「重置大屏」与无文件冷启动内容；正式业务数据以 data/screens/*.json 为准。
 */

import type { ScreenSchema } from '@/shared/types/schema'
import { colors } from '@/shared/theme/colors'

/** 演示用默认大屏：含左右分组、图表、地图占位与视频占位 */
export const defaultScreenSchema: ScreenSchema = {
  id: 'screen-demo',
  name: '智慧园区大屏（示例）',
  canvas: {
    width: 1920,
    height: 1080,
    background: colors.bgDeep,
    backgroundImage: '',
    scaleMode: 'fit',
  },
  groups: [
    { id: 'group-left', name: '左侧面板', collapsed: false },
    { id: 'group-right', name: '右侧面板', collapsed: false },
  ],
  components: [
    {
      id: 'title-1',
      type: 'TextBlock',
      name: '主标题',
      groupId: null,
      locked: false,
      visible: true,
      layout: { x: 660, y: 24, width: 600, height: 56, zIndex: 10 },
      props: {
        text: '智慧园区可视化大屏',
        fontSize: 36,
        color: colors.textHighlight,
        align: 'center',
        fontWeight: 700,
      },
    },
    {
      id: 'border-1',
      type: 'BorderBox',
      name: '左侧边框',
      groupId: 'group-left',
      locked: false,
      visible: true,
      layout: { x: 40, y: 100, width: 420, height: 320, zIndex: 1 },
      props: {
        title: '设备在线率',
        variant: 1,
      },
    },
    {
      id: 'chart-bar-1',
      type: 'ChartBar',
      name: '区域设备统计',
      groupId: 'group-left',
      locked: false,
      visible: true,
      layout: { x: 56, y: 160, width: 388, height: 240, zIndex: 2 },
      props: {
        title: '区域设备统计',
        theme: 'dark',
      },
      dataSource: {
        type: 'static',
        data: {
          categories: ['A区', 'B区', 'C区', 'D区'],
          values: [128, 96, 152, 88],
        },
      },
    },
    {
      id: 'map3d-1',
      type: 'Map3D',
      name: '园区三维地图',
      groupId: null,
      locked: false,
      visible: true,
      layout: { x: 480, y: 100, width: 960, height: 720, zIndex: 1 },
      props: {
        title: '园区三维地图',
        hint: 'Cesium 组件占位，P3 阶段接入',
      },
    },
    {
      id: 'border-2',
      type: 'BorderBox',
      name: '右侧边框',
      groupId: 'group-right',
      locked: false,
      visible: true,
      layout: { x: 1460, y: 100, width: 420, height: 320, zIndex: 1 },
      props: {
        title: '告警趋势',
        variant: 2,
      },
    },
    {
      id: 'chart-line-1',
      type: 'ChartLine',
      name: '告警趋势图',
      groupId: 'group-right',
      locked: false,
      visible: true,
      layout: { x: 1476, y: 160, width: 388, height: 240, zIndex: 2 },
      props: {
        title: '近7日告警',
        theme: 'dark',
      },
      dataSource: {
        type: 'static',
        data: {
          categories: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
          values: [12, 8, 15, 6, 10, 4, 7],
        },
      },
    },
    {
      id: 'clock-1',
      type: 'ClockWidget',
      name: '时钟',
      groupId: 'group-left',
      locked: false,
      visible: true,
      layout: { x: 40, y: 440, width: 420, height: 80, zIndex: 2 },
      props: {
        format: 'YYYY-MM-DD HH:mm:ss',
      },
    },
    {
      id: 'video-1',
      type: 'VideoPanel',
      name: '监控窗口',
      groupId: 'group-right',
      locked: false,
      visible: true,
      layout: { x: 1460, y: 440, width: 420, height: 280, zIndex: 2 },
      props: {
        title: '监控窗口',
        layout: '1x1',
        placeholder: '视频流占位，P4 阶段接入 HLS/WebRTC',
      },
    },
  ],
}
