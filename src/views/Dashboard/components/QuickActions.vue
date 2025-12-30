<script setup>
import { Promotion, Plus, Download, FolderAdd, Connection } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useColimaStore } from '@/stores'
import { t } from '@/languages'

const props = defineProps({
  isRunning: {
    type: Boolean,
    default: false
  }
})

const colimaStore = useColimaStore()

// 快捷操作处理
const handleAction = (action) => {
  if (!colimaStore.isRunning) {
    ElMessage.warning(t('请先启动 Colima'))
    return
  }
  
  switch (action) {
    case 'createContainer':
      ElMessage.info(t('创建容器功能开发中...'))
      break
    case 'pullImage':
      ElMessageBox.prompt(t('请输入镜像名称'), t('拉取镜像'), {
        confirmButtonText: t('确定'),
        cancelButtonText: t('取消'),
        inputPlaceholder: t('例如: nginx:latest')
      }).then(({ value }) => {
        if (value) {
          ElMessage.info(t('正在拉取镜像: {}', value))
          // TODO: 实现镜像拉取
        }
      }).catch(() => {})
      break
    case 'createVolume':
      ElMessageBox.prompt(t('请输入数据卷名称'), t('创建数据卷'), {
        confirmButtonText: t('确定'),
        cancelButtonText: t('取消'),
        inputPlaceholder: t('例如: my-volume')
      }).then(({ value }) => {
        if (value) {
          ElMessage.info(t('正在创建数据卷: {}', value))
          // TODO: 实现数据卷创建
        }
      }).catch(() => {})
      break
    case 'createNetwork':
      ElMessageBox.prompt(t('请输入网络名称'), t('创建网络'), {
        confirmButtonText: t('确定'),
        cancelButtonText: t('取消'),
        inputPlaceholder: t('例如: my-network')
      }).then(({ value }) => {
        if (value) {
          ElMessage.info(t('正在创建网络: {}', value))
          // TODO: 实现网络创建
        }
      }).catch(() => {})
      break
  }
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
