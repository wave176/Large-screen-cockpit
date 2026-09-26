/**
 * 大屏常用图标 SVG path（viewBox 0 0 24 24，stroke 描边）。
 * 路径按 24×24 几何居中绘制，四周约留 2px 边距。
 * 新增图标：在此追加 key + paths，并在 registry 增加对应 meta。
 */
export type IconName =
  | 'park'
  | 'person'
  | 'people'
  | 'warning'
  | 'building'
  | 'camera'
  | 'car'
  | 'device'
  | 'location'
  | 'energy'
  | 'shield'
  | 'fire'
  | 'network'
  | 'server'

export interface IconDef {
  label: string
  /** SVG path d 列表；默认 stroke 渲染 */
  paths: string[]
  /** 部分图标用填充更清晰 */
  fill?: boolean
}

/**
 * 路径均以 (12,12) 为视觉中心，参考 Lucide 24×24 坐标系微调。
 */
export const screenIcons: Record<IconName, IconDef> = {
  park: {
    label: '园区',
    // 房屋：顶 y=3，底 y=21，水平对称
    paths: [
      'M4 10.2 12 3.5l8 6.7V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V10.2z',
      'M9.5 21v-7h5v7',
    ],
  },
  person: {
    label: '人物',
    // 头圆心 (12,7.5)，身体底部 y=20.5
    paths: [
      'M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
      'M6 20.5v-.7A5.5 5.5 0 0 1 11.5 14h1A5.5 5.5 0 0 1 18 19.8v.7',
    ],
  },
  people: {
    label: '人群',
    paths: [
      'M15.5 10.5a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5z',
      'M8.5 10.5a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5z',
      'M3.5 20.5v-.6A4 4 0 0 1 7.5 16h2',
      'M13.2 16h2.3a4 4 0 0 1 4 3.9v.6',
    ],
  },
  warning: {
    label: '警告',
    // 等腰三角，顶点 (12,3.5)，底边 y=20.5
    paths: [
      'M12 3.5 3.2 20.5h17.6L12 3.5z',
      'M12 10v4.5',
      'M12 17.8h.01',
    ],
  },
  building: {
    label: '建筑',
    // 主楼+副楼，整体水平中心约 12
    paths: [
      'M4.5 20.5V5.5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v15',
      'M14.5 10.5h4a1 1 0 0 1 1 1v9',
      'M7.5 8.5h2M7.5 12h2M7.5 15.5h2M17 13.5h1.2M17 16.5h1.2',
    ],
  },
  camera: {
    label: '监控',
    // 机身+镜头整体居中（约 x=3.5~20.5, y=6.5~17.5）
    paths: [
      'M3.5 8.5a1.5 1.5 0 0 1 1.5-1.5h8a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5h-8a1.5 1.5 0 0 1-1.5-1.5v-7z',
      'M14.5 10.8 20.5 7.5v9l-6-3.3',
    ],
  },
  car: {
    label: '车辆',
    // 车身约 y=8.5~19，水平对称
    paths: [
      'M5 16.5h14v2.2a.8.8 0 0 1-.8.8h-1.2a.8.8 0 0 1-.8-.8v-.7H7.8v.7a.8.8 0 0 1-.8.8H5.8a.8.8 0 0 1-.8-.8v-2.2z',
      'M5 16.5 6.6 10.2A1.8 1.8 0 0 1 8.3 9h7.4a1.8 1.8 0 0 1 1.7 1.2L19 16.5',
      'M7.8 13.8h.01M16.2 13.8h.01',
    ],
  },
  device: {
    label: '设备',
    // 平板：顶 y=3.5，底支架 y=20.5
    paths: [
      'M7 3.5h10a1.5 1.5 0 0 1 1.5 1.5v11A1.5 1.5 0 0 1 17 17.5H7A1.5 1.5 0 0 1 5.5 16V5A1.5 1.5 0 0 1 7 3.5z',
      'M9.5 20.5h5',
      'M12 17.5v3',
    ],
  },
  location: {
    label: '位置',
    // 针尖 y=20.5，圆中心 (12,9.2)，整体视觉中心贴近 12
    paths: [
      'M12 20.5s-6.2-5-6.2-10a6.2 6.2 0 1 1 12.4 0c0 5-6.2 10-6.2 10z',
      'M12 11.2a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    ],
  },
  energy: {
    label: '能源',
    // 闪电：外包络约居中
    paths: ['M13 2.5 5 13.5h6.2L10 21.5 19 10.5h-6.2L13 2.5z'],
  },
  shield: {
    label: '安防',
    paths: [
      'M12 3.2 4.5 6.2v5.8c0 4.6 3.1 7.8 7.5 8.8 4.4-1 7.5-4.2 7.5-8.8V6.2L12 3.2z',
      'M9.2 12.2 11.2 14.2 15 10.2',
    ],
  },
  fire: {
    label: '消防',
    paths: [
      'M12 3.5c1.6 2.6.9 4.4.9 4.4s2.6-.8 3.5 1.8c1.1 2.9-.4 6.3-4.4 7.7-3.5-1.1-5.7-4-4.8-7.4.5-2 2.6-3.2 2.6-3.2S9 9 10.4 10.8',
    ],
  },
  network: {
    label: '网络',
    // WiFi：弧线中心 (12,13)，底座贴近底部但整体上移居中
    paths: [
      'M5.2 11.2a8 8 0 0 1 13.6 0',
      'M8.2 14.2a4.5 4.5 0 0 1 7.6 0',
      'M12 18.2a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2z',
    ],
  },
  server: {
    label: '服务器',
    // 三层机架垂直居中：约 y=4.5~19.5
    paths: [
      'M4.5 4.5h15v4h-15z',
      'M4.5 10h15v4h-15z',
      'M4.5 15.5h15v4h-15z',
      'M7.5 6.5h.01M7.5 12h.01M7.5 17.5h.01',
    ],
  },
}

export const iconNameList = Object.keys(screenIcons) as IconName[]

export function getIconDef(name: string): IconDef {
  return screenIcons[name as IconName] ?? screenIcons.warning
}
