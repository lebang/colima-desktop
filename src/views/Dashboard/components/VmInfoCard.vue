<script setup>
import { Setting, Refresh, VideoPlay, VideoPause, RefreshRight } from '@element-plus/icons-vue'
import { t } from '@/languages'

const props = defineProps({
  vmInfo: {
    type: Object,
    default: () => ({})
  },
  isRunning: {
    type: Boolean,
    default: false
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  vmStatus: {
    type: String,
    default: ''
  },
  isRefreshing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['refresh', 'start', 'stop', 'restart'])

const handleRefresh = () => emit('refresh')
const handleStart = () => emit('start')
const handleStop = () => emit('stop')
const handleRestart = () => emit('restart')
</script>

<template>
  <el-card shadow="hover" class="vm-info-card">
    <template #header>
      <div class="card-header">
        <span><el-icon><Setting /></el-icon> {{ t('虚拟机信息') }}</span>
        <el-button 
          :icon="Refresh" 
          circle 
          size="small" 
          :loading="isRefreshing"
          @click="handleRefresh"
        />
      </div>
    </template>
    <div class="vm-content">
      <div class="vm-info-grid">
        <div class="vm-info-item">
          <span class="vm-info-label">{{ t('名称') }}</span>
          <span class="vm-info-value">{{ vmInfo.name || '-' }}</span>
        </div>
        <div class="vm-info-item">
          <span class="vm-info-label">{{ t('运行时') }}</span>
          <span class="vm-info-value">{{ vmInfo.runtime || '-' }}</span>
        </div>
        <div class="vm-info-item">
          <span class="vm-info-label">{{ t('架构') }}</span>
          <span class="vm-info-value">{{ vmInfo.arch || '-' }}</span>
        </div>
        <div class="vm-info-item">
          <span class="vm-info-label">{{ t('CPU') }}</span>
          <span class="vm-info-value">{{ vmInfo.cpu || '-' }} {{ t('核') }}</span>
        </div>
        <div class="vm-info-item">
          <span class="vm-info-label">{{ t('内存') }}</span>
          <span class="vm-info-value">{{ vmInfo.memory || '-' }} GB</span>
        </div>
        <div class="vm-info-item">
          <span class="vm-info-label">{{ t('磁盘') }}</span>
          <span class="vm-info-value">{{ vmInfo.disk || '-' }} GB</span>
        </div>
      </div>
      <div class="control-buttons">
        <el-button 
          type="success" 
          :icon="VideoPlay" 
          :disabled="isRunning || isLoading"
          :loading="vmStatus === 'starting'"
          @click="handleStart"
        >
          {{ t('启动') }}
        </el-button>
        <el-button 
          type="danger" 
          :icon="VideoPause"
          :disabled="!isRunning || isLoading"
          :loading="vmStatus === 'stopping'"
          @click="handleStop"
        >
          {{ t('停止') }}
        </el-button>
        <el-button 
          type="warning" 
          :icon="RefreshRight"
          :disabled="!isRunning || isLoading"
          :loading="vmStatus === 'restarting'"
          @click="handleRestart"
        >
          {{ t('重启') }}
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<style scoped lang="less">
.vm-info-card {
  flex: 1;
  min-width: 0;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  font-size: 14px;
  min-height: 24px;
  color: var(--color-text-primary, #303133);
  
  > span {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .el-icon {
    color: #409eff;
  }
}

.vm-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  
  .vm-info-item {
    .vm-info-label {
      display: block;
      font-size: 12px;
      color: var(--color-text-secondary, #909399);
      margin-bottom: 4px;
    }
    .vm-info-value {
      font-size: 14px;
      font-weight: 500;
      color: var(--color-text-primary, #303133);
    }
  }
}

.control-buttons {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}
</style>
