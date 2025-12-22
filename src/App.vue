<script setup>
import { ref, shallowRef, computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import { useColimaStore } from '@/stores'
import { t, i18nScope } from '@/languages'
import { AppSidebar, AppHeader } from '@/components/layout'

const colimaStore = useColimaStore()

// 语言变化触发器，用于强制更新计算属性
const langTrigger = ref(0)
let unsubscribe = null

// 初始化主题
const initTheme = () => {
  const theme = localStorage.getItem('app-theme') || 'auto'
  const html = document.documentElement
  html.classList.remove('light', 'dark')

  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    html.classList.add(prefersDark ? 'dark' : 'light')
  } else {
    html.classList.add(theme)
  }
}

onMounted(() => {
  // 初始化主题
  initTheme()
  
  // 监听语言变化事件
  unsubscribe = i18nScope.on('change', () => {
    langTrigger.value++
  })
  
  // 监听系统主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const theme = localStorage.getItem('app-theme')
    if (theme === 'auto' || !theme) {
      initTheme()
    }
  })
})

onUnmounted(() => {
  // 取消监听
  if (unsubscribe) unsubscribe()
})

// 当前激活的菜单
const activeMenu = ref('dashboard')

// 侧边栏折叠状态
const isCollapse = ref(false)

// 页面组件映射 - 使用动态导入实现懒加载
const pageComponents = {
  dashboard: defineAsyncComponent(() => import('@/views/Dashboard/index.vue')),
  containers: defineAsyncComponent(() => import('@/views/Containers/index.vue')),
  images: defineAsyncComponent(() => import('@/views/Images/index.vue')),
  volumes: defineAsyncComponent(() => import('@/views/Volumes/index.vue')),
  networks: defineAsyncComponent(() => import('@/views/Networks/index.vue')),
  settings: defineAsyncComponent(() => import('@/views/Settings/index.vue'))
}

// 响应式翻译函数，依赖 langTrigger 实现响应式更新
const $t = (text) => {
  langTrigger.value // 触发响应式依赖
  return t(text)
}

// 页面标题映射
const pageTitles = computed(() => ({
  dashboard: $t('仪表盘'),
  containers: $t('容器管理'),
  images: $t('镜像管理'),
  volumes: $t('数据卷管理'),
  networks: $t('网络管理'),
  settings: $t('设置')
}))

// 获取当前页面标题
const pageTitle = computed(() => pageTitles.value[activeMenu.value] || $t('仪表盘'))

// 当前显示的组件
const currentComponent = shallowRef(pageComponents.dashboard)

// 菜单点击处理
const handleMenuSelect = (index) => {
  activeMenu.value = index
  currentComponent.value = pageComponents[index]
}

// 切换侧边栏折叠
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}
</script>

<template>
  <el-container class="app-layout">
    <!-- 侧边栏 -->
    <AppSidebar
      :active-menu="activeMenu"
      :is-collapse="isCollapse"
      :translate="$t"
      @select="handleMenuSelect"
      @toggle-collapse="toggleCollapse"
    />

    <!-- 主内容区 -->
    <el-container class="main-container">
      <!-- 顶部栏 -->
      <AppHeader :page-title="pageTitle" :translate="$t" />

      <!-- 内容区 -->
      <el-main class="app-main">
        <component :is="currentComponent" />
      </el-main>
    </el-container>
  </el-container>
</template>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>

<style scoped lang="less">
.app-layout {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.main-container {
  flex: 1;
  flex-direction: column;
  background-color: var(--color-bg-page, #f5f7fa);
  overflow: hidden;
}

.app-main {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: var(--color-bg-page, #f5f7fa);
}
</style>
