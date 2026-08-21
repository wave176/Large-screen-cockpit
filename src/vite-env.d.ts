/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module 'vue3-moveable' {
  import type { DefineComponent } from 'vue'
  const Moveable: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default Moveable
}
