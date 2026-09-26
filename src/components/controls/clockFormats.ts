/**
 * 时间显示组件的常见格式配置。
 * 新增格式：在 clockFormatOptions 追加即可。
 */

export interface ClockFormatOption {
  label: string
  value: string
}

/** 属性面板下拉选项 */
export const clockFormatOptions: ClockFormatOption[] = [
  { label: '年-月-日 时:分:秒', value: 'YYYY-MM-DD HH:mm:ss' },
  { label: '年-月-日 时:分', value: 'YYYY-MM-DD HH:mm' },
  { label: '年/月/日 时:分:秒', value: 'YYYY/MM/DD HH:mm:ss' },
  { label: '年.月.日 时:分:秒', value: 'YYYY.MM.DD HH:mm:ss' },
  { label: '中文日期时间', value: 'YYYY年MM月DD日 HH:mm:ss' },
  { label: '中文日期', value: 'YYYY年MM月DD日' },
  { label: '仅日期', value: 'YYYY-MM-DD' },
  { label: '月-日 时:分:秒', value: 'MM-DD HH:mm:ss' },
  { label: '时:分:秒', value: 'HH:mm:ss' },
  { label: '时:分', value: 'HH:mm' },
  { label: '星期 + 时间', value: 'dddd HH:mm:ss' },
  { label: '完整中文', value: 'YYYY年MM月DD日 dddd HH:mm:ss' },
]

export const DEFAULT_CLOCK_FORMAT = 'YYYY-MM-DD HH:mm:ss'

const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

function pad(value: number): string {
  return value.toString().padStart(2, '0')
}

export function normalizeClockFormat(format?: string): string {
  const text = format?.trim()
  if (!text) return DEFAULT_CLOCK_FORMAT
  if (clockFormatOptions.some((item) => item.value === text)) return text
  return text
}

/** 按 pattern 格式化时间（支持常见 token） */
export function formatClock(date: Date, pattern: string): string {
  const map: Record<string, string> = {
    YYYY: String(date.getFullYear()),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
    dddd: WEEKDAYS[date.getDay()] ?? '',
  }

  return pattern.replace(/YYYY|MM|DD|HH|mm|ss|dddd/g, (token) => map[token] ?? token)
}
