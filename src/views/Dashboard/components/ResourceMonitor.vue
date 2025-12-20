<script setup>
import { DataAnalysis } from '@element-plus/icons-vue'

const props = defineProps({
  cpuUsage: {
    type: Number,
    default: 0
  },
  memoryUsage: {
    type: Number,
    default: 0
  },
  diskUsage: {
    type: Number,
    default: 0
  },
  isRunning: {
    type: Boolean,
    default: false
  }
})

// 获取进度条颜色
const getProgressColor = (percentage) => {
  if (percentage < 50) return '#67c23a'
  if (percentage < 80) return '#e6a23c'
  return '#f56c6c'
}
</script>

<template>
  <el-card shadow="hover" class="resource-card">
    <template #header>
      <div class="card-header">
        <span><el-icon><DataAnalysis /></el-icon> 资源监控</span>
        <el-tag v-if="!isRunning" type="info" size="small">未运行</el-tag>
      </div>
    </template>
    <div class="resource-monitor">
      <div class="resource-item">
        <div class="resource-header">
          <span class="resource-label">CPU</span>
          <span class="resource-value">{{ cpuUsage }}%</span>
        </div>
        <el-progress 
          :percentage="cpuUsage" 
          :color="getProgressColor(cpuUsage)"
          :show-text="false"
          :stroke-width="8"
        />
      </div>
      <div class="resource-item">
        <div class="resource-header">
          <span class="resource-label">内存</span>
          <span class="resource-value">{{ memoryUsage }}%</span>
        </div>
        <el-progress 
          :percentage="memoryUsage" 
          :color="getProgressColor(memoryUsage)"
          :show-text="false"
          :stroke-width="8"
        />
      </div>
      <div class="resource-item">
        <div class="resource-header">
          <span class="resource-label">磁盘</span>
          <span class="resource-value">{{ diskUsage }}%</span>
        </div>
        <el-progress 
          :percentage="diskUsage" 
          :color="getProgressColor(diskUsage)"
          :show-text="false"
          :stroke-width="8"
        />
      </div>
    </div>
  </el-card>
</template>

<style scoped lang="less">
.resource-card {
  flex: 1;
  min-width: 0;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  font-size: 14px;
  
  > span {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .el-icon {
    color: #409eff;
  }
}

.resource-monitor {
  .resource-item {
    margin-bottom: 16px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .resource-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    
    .resource-label {
      font-size: 13px;
      color: #606266;
    }
    
    .resource-value {
      font-size: 13px;
      font-weight: 600;
      color: #303133;
    }
  }
}
</style>
