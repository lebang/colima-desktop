<script setup>
import { ref } from 'vue'
import { Plus, Search, Refresh, VideoPlay, VideoPause, RefreshRight, Delete } from '@element-plus/icons-vue'

// 模拟容器数据
const containers = ref([
  { id: 'abc123def456', name: 'nginx-web', image: 'nginx:latest', status: 'running', ports: '80:80', created: '2天前' },
  { id: 'def456ghi789', name: 'mysql-db', image: 'mysql:8.0', status: 'running', ports: '3306:3306', created: '5天前' },
  { id: 'ghi789jkl012', name: 'redis-cache', image: 'redis:alpine', status: 'exited', ports: '6379:6379', created: '1周前' },
  { id: 'jkl012mno345', name: 'node-app', image: 'node:18', status: 'running', ports: '3000:3000', created: '3天前' },
])

const searchQuery = ref('')
const statusFilter = ref('')

// 获取状态标签类型
const getStatusType = (status) => {
  const types = {
    'running': 'success',
    'exited': 'danger',
    'paused': 'warning',
    'created': 'info'
  }
  return types[status] || 'info'
}

// 操作方法
const handleStart = (row) => {
  row.status = 'running'
}

const handleStop = (row) => {
  row.status = 'exited'
}

const handleRestart = (row) => {
  row.status = 'running'
}

const handleDelete = (row) => {
  const index = containers.value.findIndex(c => c.id === row.id)
  if (index > -1) {
    containers.value.splice(index, 1)
  }
}
</script>

<template>
  <div class="containers-page">
    <div class="page-header">
      <h2>容器管理</h2>
      <el-button type="primary" :icon="Plus">创建容器</el-button>
    </div>

    <!-- 搜索和筛选 -->
    <el-card shadow="never" class="filter-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input 
            v-model="searchQuery" 
            placeholder="搜索容器名称或ID..." 
            :prefix-icon="Search"
            clearable
          />
        </el-col>
        <el-col :span="6">
          <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 100%">
            <el-option label="运行中" value="running" />
            <el-option label="已停止" value="exited" />
            <el-option label="已暂停" value="paused" />
          </el-select>
        </el-col>
        <el-col :span="10" style="text-align: right">
          <el-button :icon="Refresh">刷新</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 容器列表 -->
    <el-card shadow="never" class="table-card">
      <el-table :data="containers" stripe style="width: 100%">
        <el-table-column prop="id" label="容器 ID" width="140">
          <template #default="{ row }">
            <el-tooltip :content="row.id" placement="top">
              <span class="container-id">{{ row.id.substring(0, 12) }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" min-width="150" />
        <el-table-column prop="image" label="镜像" min-width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ row.status === 'running' ? '运行中' : row.status === 'exited' ? '已停止' : row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ports" label="端口" width="120" />
        <el-table-column prop="created" label="创建时间" width="100" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button 
                v-if="row.status !== 'running'"
                type="success" 
                size="small" 
                :icon="VideoPlay"
                @click="handleStart(row)"
              >
                启动
              </el-button>
              <el-button 
                v-if="row.status === 'running'"
                type="warning" 
                size="small" 
                :icon="VideoPause"
                @click="handleStop(row)"
              >
                停止
              </el-button>
              <el-button 
                type="primary" 
                size="small" 
                :icon="RefreshRight"
                @click="handleRestart(row)"
              >
                重启
              </el-button>
              <el-button 
                type="danger" 
                size="small" 
                :icon="Delete"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>



<style scoped lang="less">
.containers-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }
}

.filter-card {
  margin-bottom: 20px;
}

.table-card {
  .container-id {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 12px;
    color: #409eff;
    cursor: pointer;
    
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
