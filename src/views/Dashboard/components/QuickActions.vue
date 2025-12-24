<script setup>
import { Promotion, Plus, Download, FolderAdd, Connection } from '@element-plus/icons-vue'
import { t } from '@/languages'

const props = defineProps({
  isRunning: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['action'])

const handleAction = (action) => {
  emit('action', action)
}
</script>

<template>
  <el-card class="quick-actions-card">
    <template #header>
      <div class="card-header">
        <span><el-icon><Promotion /></el-icon> {{ t('快捷操作') }}</span>
      </div>
    </template>
    <div class="action-buttons">
      <el-button 
        :icon="Plus" 
        :disabled="!isRunning"
        @click="handleAction('createContainer')"
      >
        {{ t('创建容器') }}
      </el-button>
      <el-button 
        :icon="Download"
        :disabled="!isRunning"
        @click="handleAction('pullImage')"
      >
        {{ t('拉取镜像') }}
      </el-button>
      <el-button 
        :icon="FolderAdd"
        :disabled="!isRunning"
        @click="handleAction('createVolume')"
      >
        {{ t('创建数据卷') }}
      </el-button>
      <el-button 
        :icon="Connection"
        :disabled="!isRunning"
        @click="handleAction('createNetwork')"
      >
        {{ t('创建网络') }}
      </el-button>
    </div>
  </el-card>
</template>

<style scoped lang="less">
.quick-actions-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  font-size: 14px;
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

.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
