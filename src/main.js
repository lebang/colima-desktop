import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import App from './App.vue'
import './styles.less'

// 多语言支持
import { i18nPlugin } from '@voerkai18n/vue'
import { i18nScope } from '@/languages'

// 创建应用实例
const app = createApp(App)

// 创建 Pinia 实例
const pinia = createPinia()

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用插件
app.use(pinia)
app.use(ElementPlus)
app.use(i18nPlugin, { i18nScope })

// 挂载应用
app.mount('#app')
