import { createApp } from 'vue'
import { createPinia } from 'pinia'
// Element Plus 样式 - 只导入基础样式，组件样式由 unplugin-vue-components 按需导入
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

// 使用插件
app.use(pinia)
app.use(i18nPlugin, { i18nScope })

// 挂载应用
app.mount('#app')
