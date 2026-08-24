/**
 * 执行数据源「数据处理脚本」。
 *
 * 支持两种写法：
 * 1. 函数体（推荐）：return raw.data
 * 2. 函数表达式：function(raw) { return raw.data } 或 (raw) => raw.data
 *
 * 可用变量：raw、component
 */

export interface TransformComponentContext {
  type: string
  props: Record<string, unknown>
}

/** 将用户脚本编译为可执行的 Function 体 */
function compileTransformBody(script: string): string {
  const t = script.trim()

  // 匿名函数表达式 function(raw) { ... }
  if (/^function\s*\(/.test(t)) {
    return `return (${t})(raw, component)`
  }

  // 箭头函数表达式 (raw) => ... / (raw, component) => ...
  if (/^\([^)]*\)\s*=>/.test(t)) {
    return `return (${t})(raw, component)`
  }

  // 具名函数声明 function transform(raw) { ... }，自动补 return transform(raw)
  const named = t.match(/^function\s+(\w+)\s*\(/)
  if (named && !/^\s*return\b/m.test(t)) {
    return `${t}\nreturn ${named[1]}(raw, component)`
  }

  return t
}

export function runTransformScript(
  script: string | undefined,
  raw: unknown,
  component?: TransformComponentContext,
): unknown {
  const text = script?.trim()
  if (!text) return raw

  try {
    const body = compileTransformBody(text)
    // eslint-disable-next-line no-new-func
    const fn = new Function('raw', 'component', body) as (
      raw: unknown,
      component?: TransformComponentContext,
    ) => unknown
    const result = fn(raw, component)
    return result !== undefined ? result : raw
  } catch (e) {
    throw new Error(`数据处理脚本错误: ${e instanceof Error ? e.message : String(e)}`)
  }
}

export const DEFAULT_TRANSFORM_SCRIPT = `// 推荐：直接 return（函数体写法）
// 接口返回值为JSON时可能需要转换 (JSON.parse) 
// const body = typeof raw === 'string' ? JSON.parse(raw) : raw
// return body.data

// 多步示例：
// if (raw.code !== 200) return { categories: [], values: [] }
// return raw.data

// 默认返回原数据
// return raw
`
