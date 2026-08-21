/**
 * 应用入口：创建 Vue 实例并挂载全局插件。
 *
 * 插件顺序：Pinia（store）→ Router → Naive UI。
 * 全局样式见 ./styles/global.scss。
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import naive from 'naive-ui'
import App from './App.vue'
import router from './router'
import './styles/global.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(naive)

app.mount('#app')
