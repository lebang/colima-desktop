<script setup>
import { Loading } from '@element-plus/icons-vue'
import { Monitor, Box, Files, Coin } from '@element-plus/icons-vue'

const props = defineProps({
  // Colima 状态
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
  // Docker 统计
  containerCount: {
    type: Number,
    default: 0
  },
  runningContainerCount: {
    type: Number,
    default: 0
  },
  imageCount: {
    type: Number,
    default: 0
  },
  volumeCount: {
    type: Number,
    default: 0
  }
})

// 计算状态文本
const getStatusText = () => {
  if (props.isLoading) {
    if (props.vmStatus === 'starting') return '启动中'
    if (props.vmStatus === 'stopping') return '停止中'
    return '重启中'
  }
  return props.isRunning ? '运行中' : '已停止'
}

// 计算状态类型
const getStatusType = () => {
  if (props.isRunning) return 'success'
  if (props.isLoading) return 'warning'
  return 'danger'
}
</script>

<template>
  <div class="status-cards">
    <el-card shadow="hover" class="status-card">
      <div class="status-card-content">
        <div class="status-icon colima">
          <el-icon :size="28"><Monitor /></el-icon>
        </div>
        <div class="status-info">
          <div class="status-label">Colima</div>
          <el-tag 
            :type="getStatusType()" 
            size="small"
            effect="light"
          >
            <el-icon v-if="isLoading" class="is-loading"><Loading /></el-icon>
            {{ getStatusText() }}
          </el-tag>
        </div>
      </div>
    </el-card>
    
    <el-card shadow="hover" class="status-card">
      <div class="status-card-content">
        <div class="status-icon containers">
          <el-icon :size="28"><Box /></el-icon>
        </div>
        <div class="status-info">
          <div class="status-label">容器</div>
          <div class="status-value">
            {{ containerCount }}
            <span v-if="runningContainerCount > 0" class="running-count">
              {{ runningContainerCount }} 运行
            </span>
          </div>
        </div>
      </div>
    </el-card>
    
    <el-card shadow="hover" class="status-card">
      <div class="status-card-content">
        <div class="status-icon images">
          <el-icon :size="28"><Files /></el-icon>
        </div>
        <div class="status-info">
          <div class="status-label">镜像</div>
          <div class="status-value">{{ imageCount }}</div>
        </div>
      </div>
    </el-card>
    
    <el-card shadow="hover" class="status-card">
      <div class="status-card-content">
        <div class="status-icon volumes">
          <el-icon :size="28"><Coin /></el-icon>
        </div>
        <div class="status-info">
          <div class="status-label">数据卷</div>
          <div class="status-value">{{ volumeCount }}</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="less">
.status-cards {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.status-card {
  flex: 1;
  min-width: 0;
  
  :deep(.el-card__body) {
    padding: 16px;
  }
  
  .status-card-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .status-icon {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    flex-shrink: 0;

    &.colima {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    &.containers {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    }
    &.images {
      background: linear-gradient(135deg, #ee0979 0%, #ff6a00 100%);
    }
    &.volumes {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }
  }

  .status-info {
    min-width: 0;
    
    .status-label {
      font-size: 12px;
      color: #909399;
      margin-bottom: 4px;
    }
    .status-value {
      font-size: 22px;
      font-weight: 600;
      color: #303133;
      display: flex;
      align-items: baseline;
      gap: 6px;
      
      .running-count {
        font-size: 11px;
        color: #67c23a;
        font-weight: normal;
      }
    }
  }
}

.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
