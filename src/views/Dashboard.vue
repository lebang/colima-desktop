<script setup>
import { useColimaStore } from '../stores'
import { Monitor, Box, Files, Coin, Setting, DataAnalysis, Promotion, VideoPlay, VideoPause, RefreshRight, Plus, Download, FolderAdd, Connection } from '@element-plus/icons-vue'

const colimaStore = useColimaStore()

// 模拟数据
const systemStats = {
  cpuUsage: 35,
  memoryUsage: 62,
  diskUsage: 48
}

// 获取进度条颜色
const getProgressColor = (percentage) => {
  if (percentage < 50) return '#67c23a'
  if (percentage < 80) return '#e6a23c'
  return '#f56c6c'
}
</script>

<template>
  <div class="dashboard">
    <!-- 顶部状态卡片 -->
    <el-row :gutter="20" class="status-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="status-card">
          <div class="status-card-content">
            <div class="status-icon colima">
              <el-icon :size="32"><Monitor /></el-icon>
            </div>
            <div class="status-info">
              <div class="status-label">Colima 状态</div>
              <el-tag :type="colimaStore.isRunning ? 'success' : 'danger'" size="large">
                {{ colimaStore.isRunning ? '运行中' : '已停止' }}
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="status-card">
          <div class="status-card-content">
            <div class="status-icon containers">
              <el-icon :size="32"><Box /></el-icon>
            </div>
            <div class="status-info">
              <div class="status-label">容器</div>
              <div class="status-value">{{ colimaStore.containerCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="status-card">
          <div class="status-card-content">
            <div class="status-icon images">
              <el-icon :size="32"><Files /></el-icon>
            </div>
            <div class="status-info">
              <div class="status-label">镜像</div>
              <div class="status-value">12</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="status-card">
          <div class="status-card-content">
            <div class="status-icon volumes">
              <el-icon :size="32"><Coin /></el-icon>
            </div>
            <div class="status-info">
              <div class="status-label">数据卷</div>
              <div class="status-value">5</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Colima 控制面板 -->
    <el-row :gutter="20" class="control-panel">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span><el-icon><Setting /></el-icon> Colima 控制</span>
            </div>
          </template>
          <div class="colima-control">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="虚拟机名称">
                {{ colimaStore.vmInfo.name }}
              </el-descriptions-item>
              <el-descriptions-item label="运行时">
                {{ colimaStore.vmInfo.runtime }}
              </el-descriptions-item>
              <el-descriptions-item label="CPU">
                {{ colimaStore.vmInfo.cpu || '-' }} 核
              </el-descriptions-item>
              <el-descriptions-item label="内存">
                {{ colimaStore.vmInfo.memory || '-' }} GB
              </el-descriptions-item>
              <el-descriptions-item label="磁盘">
                {{ colimaStore.vmInfo.disk || '-' }} GB
              </el-descriptions-item>
              <el-descriptions-item label="架构">
                {{ colimaStore.vmInfo.arch || '-' }}
              </el-descriptions-item>
            </el-descriptions>
            <div class="control-buttons">
              <el-button 
                type="success" 
                :icon="VideoPlay" 
                :disabled="colimaStore.isRunning"
                :loading="colimaStore.vmStatus === 'starting'"
                @click="colimaStore.setVmStatus('running')"
              >
                启动
              </el-button>
              <el-button 
                type="danger" 
                :icon="VideoPause"
                :disabled="!colimaStore.isRunning"
                :loading="colimaStore.vmStatus === 'stopping'"
                @click="colimaStore.setVmStatus('stopped')"
              >
                停止
              </el-button>
              <el-button 
                type="warning" 
                :icon="RefreshRight"
                :disabled="!colimaStore.isRunning"
              >
                重启
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span><el-icon><DataAnalysis /></el-icon> 资源监控</span>
            </div>
          </template>
          <div class="resource-monitor">
            <div class="resource-item">
              <span class="resource-label">CPU 使用率</span>
              <el-progress 
                :percentage="systemStats.cpuUsage" 
                :color="getProgressColor(systemStats.cpuUsage)"
              />
            </div>
            <div class="resource-item">
              <span class="resource-label">内存使用率</span>
              <el-progress 
                :percentage="systemStats.memoryUsage" 
                :color="getProgressColor(systemStats.memoryUsage)"
              />
            </div>
            <div class="resource-item">
              <span class="resource-label">磁盘使用率</span>
              <el-progress 
                :percentage="systemStats.diskUsage" 
                :color="getProgressColor(systemStats.diskUsage)"
              />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-row :gutter="20" class="quick-actions">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span><el-icon><Promotion /></el-icon> 快捷操作</span>
            </div>
          </template>
          <div class="action-buttons">
            <el-button type="primary" :icon="Plus">创建容器</el-button>
            <el-button type="primary" :icon="Download">拉取镜像</el-button>
            <el-button type="primary" :icon="FolderAdd">创建数据卷</el-button>
            <el-button type="primary" :icon="Connection">创建网络</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>



<style scoped lang="less">
.dashboard {
  padding: 20px;
}

.status-cards {
  margin-bottom: 20px;
}

.status-card {
  .status-card-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
  }

  .status-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;

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
    .status-label {
      font-size: 13px;
      color: #909399;
      margin-bottom: 6px;
      white-space: nowrap;
    }
    .status-value {
      font-size: 26px;
      font-weight: 600;
      color: #303133;
    }
  }
}

.control-panel {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  
  .el-icon {
    color: #409eff;
  }
}

.colima-control {
  .control-buttons {
    margin-top: 20px;
    display: flex;
    gap: 12px;
  }
}

.resource-monitor {
  .resource-item {
    margin-bottom: 20px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .resource-label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      color: #606266;
    }
  }
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
