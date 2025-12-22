<script setup>
import { VideoPlay, VideoPause } from '@element-plus/icons-vue'
import { useColimaStore } from '@/stores'
import { t } from '@/languages'
import LangSwitch from '@/components/LangSwitch.vue'

const colimaStore = useColimaStore()

const props = defineProps({
  pageTitle: {
    type: String,
    default: ''
  },
  translate: {
    type: Function,
    default: null
  }
})

// 翻译函数，优先使用传入的translate，否则使用默认的t
const $t = (text) => {
  return props.translate ? props.translate(text) : t(text)
}

const handleToggleStatus = () => {
  if (colimaStore.isRunning) {
    colimaStore.setVmStatus('stopped')
  } else {
    colimaStore.setVmStatus('running')
  }
}
</script>

<template>
  <el-header class="app-header">
    <div class="header-left">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>{{ $t('首页') }}</el-breadcrumb-item>
        <el-breadcrumb-item>{{ pageTitle }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="header-right">
      <!-- Colima 状态指示器 -->
      <el-tooltip :content="colimaStore.isRunning ? $t('Colima 运行中') : $t('Colima 已停止')" placement="bottom">
        <div class="status-indicator">
          <span :class="['status-dot', colimaStore.isRunning ? 'running' : 'stopped']"></span>
          <span class="status-text">{{ colimaStore.isRunning ? $t('运行中') : $t('已停止') }}</span>
        </div>
      </el-tooltip>
      
      <!-- 快捷操作 -->
      <el-button-group class="quick-buttons">
        <el-button 
          :type="colimaStore.isRunning ? 'danger' : 'success'" 
          size="small"
          @click="handleToggleStatus"
        >
          <el-icon>
            <VideoPause v-if="colimaStore.isRunning" />
            <VideoPlay v-else />
          </el-icon>
          {{ colimaStore.isRunning ? $t('停止') : $t('启动') }}
        </el-button>
      </el-button-group>
      <!-- 语言切换 -->
      <LangSwitch />
    </div>
  </el-header>
</template>

<style scoped lang="less">
.app-header {
  height: 60px;
  background-color: var(--color-bg-card, #fff);
  border-bottom: 1px solid var(--color-border, #e4e7ed);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px var(--color-shadow, rgba(0, 0, 0, 0.08));
}

.header-left {
  display: flex;
  align-items: center;
  
  :deep(.el-breadcrumb__inner) {
    color: var(--color-text-regular, #606266);
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  background-color: var(--color-bg-page, #f5f7fa);
  
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    
    &.running {
      background-color: #67c23a;
      box-shadow: 0 0 8px #67c23a;
    }
    
    &.stopped {
      background-color: #f56c6c;
    }
  }
  
  .status-text {
    font-size: 13px;
    color: var(--color-text-regular, #606266);
  }
}
</style>
