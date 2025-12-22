<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { i18nScope, change } from '@/languages'

// 当前语言（响应式）
const currentLang = ref(i18nScope.activeLanguage)

// 监听语言变化
let offChange
onMounted(() => {
  offChange = i18nScope.on('change', () => {
    currentLang.value = i18nScope.activeLanguage
  })
})
onUnmounted(() => {
  offChange && offChange.off()
})

// 语言选项
const languages = [
  { code: 'zh-CN', label: '🇨🇳 中文', short: '中' },
  { code: 'en-US', label: '🇺🇸 English', short: 'EN' }
]

// 切换语言（使用绑定好this的change函数）
const changeLanguage = async (lang) => {
  if (lang === currentLang.value) return
  
  try {
    await change(lang)
    // 语言包已预加载，无需刷新页面，i18nScope.on('change') 会自动触发更新
  } catch (error) {
    console.error('Failed to change language:', error)
  }
}
// 获取当前语言的短标签
const getCurrentLabel = () => {
  const lang = languages.find(l => l.code === currentLang.value)
  return lang ? lang.short : '中'
}
</script>

<template>
  <el-dropdown trigger="click" @command="changeLanguage">
    <el-button size="small" text>
      <span class="lang-label">{{ getCurrentLabel() }}</span>
      <el-icon class="el-icon--right"><arrow-down /></el-icon>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item 
          v-for="lang in languages" 
          :key="lang.code"
          :command="lang.code"
          :class="{ 'is-active': currentLang === lang.code }"
        >
          {{ lang.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style scoped lang="less">
.lang-label {
  font-size: 13px;
  font-weight: 500;
}

:deep(.el-dropdown-menu__item.is-active) {
  color: #409eff;
  background-color: #ecf5ff;
}
</style>
