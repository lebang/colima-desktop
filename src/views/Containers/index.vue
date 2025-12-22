<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, VideoPlay, VideoPause, RefreshRight, Delete, Document } from '@element-plus/icons-vue'
import { useDockerStore } from '@/stores/docker'
import { ElMessage, ElMessageBox } from 'element-plus'
import { PageHeader, SearchBar, DataTable } from '@/components/common'

const dockerStore = useDockerStore()

const searchQuery = ref('')
const statusFilter = ref('')
const loading = ref(false)
const logsDialogVisible = ref(false)
const currentLogs = ref('')
const currentContainerName = ref('')

// 过滤后的容器列表
const filteredContainers = computed(() => {
  let result = dockerStore.containers
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.id.toLowerCase().includes(query)
    )
  }
  
  if (statusFilter.value) {
    result = result.filter(c => c.state === statusFilter.value)
  }
  
  return result
})

// 获取状态标签类型
const getStatusType = (state) => {
  const types = {
    'running': 'success',
    'exited': 'danger',
    'paused': 'warning',
    'created': 'info',
    'restarting': 'warning',
    'removing': 'danger',
    'dead': 'danger'
  }
  return types[state] || 'info'
}

// 获取状态显示文本
const getStatusText = (state) => {
  const texts = {
    'running': '运行中',
    'exited': '已停止',
    'paused': '已暂停',
    'created': '已创建',
    'restarting': '重启中',
    'removing': '删除中',
    'dead': '已死亡'
  }
  return texts[state] || state
}

// 刷新容器列表
const handleRefresh = async () => {
  loading.value = true
  try {
    await dockerStore.fetchContainers()
  } finally {
    loading.value = false
  }
}

// 启动容器
const handleStart = async (row) => {
  loading.value = true
  try {
    const result = await dockerStore.startContainer(row.id)
    ElMessage[result.success ? 'success' : 'error'](result.message)
  } finally {
    loading.value = false
  }
}

// 停止容器
const handleStop = async (row) => {
  loading.value = true
  try {
    const result = await dockerStore.stopContainer(row.id)
    ElMessage[result.success ? 'success' : 'error'](result.message)
  } finally {
    loading.value = false
  }
}

// 重启容器
const handleRestart = async (row) => {
  loading.value = true
  try {
    const result = await dockerStore.restartContainer(row.id)
    ElMessage[result.success ? 'success' : 'error'](result.message)
  } finally {
    loading.value = false
  }
}

// 删除容器
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除容器 "${row.name}" 吗？`, '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    loading.value = true
    const result = await dockerStore.removeContainer(row.id, row.state === 'running')
    ElMessage[result.success ? 'success' : 'error'](result.message)
  } catch {
    // 用户取消
  } finally {
    loading.value = false
  }
}

// 查看日志
const handleViewLogs = async (row) => {
  currentContainerName.value = row.name
  logsDialogVisible.value = true
  currentLogs.value = '加载中...'
  
  const result = await dockerStore.getContainerLogs(row.id, 200)
  currentLogs.value = result.success ? (result.logs || '暂无日志') : '获取日志失败'
}

onMounted(() => handleRefresh())
</script>

<template>
  <div class="page-container">
    <PageHeader title="容器管理">
      <el-button type="primary" :icon="Plus">创建容器</el-button>
    </PageHeader>

    <SearchBar 
      v-model="searchQuery" 
      placeholder="搜索容器名称或ID..." 
      :loading="loading"
      @refresh="handleRefresh"
    >
      <template #filter>
        <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 100%">
          <el-option label="运行中" value="running" />
          <el-option label="已停止" value="exited" />
          <el-option label="已暂停" value="paused" />
        </el-select>
      </template>
    </SearchBar>

    <DataTable :data="filteredContainers" :loading="loading" empty-text="暂无容器">
      <el-table-column prop="id" label="容器 ID" width="140">
        <template #default="{ row }">
          <el-tooltip :content="row.id" placement="top">
            <span class="cell-id-link">{{ row.id.substring(0, 12) }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称" min-width="150">
        <template #default="{ row }">
          <span class="cell-name">{{ row.name.replace(/^\//, '') }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="image" label="镜像" min-width="150" />
      <el-table-column prop="state" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.state)" size="small">
            {{ getStatusText(row.state) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="ports" label="端口" width="150">
        <template #default="{ row }">
          <span class="cell-code">{{ row.ports || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="运行时间" width="140">
        <template #default="{ row }">
          <span class="cell-secondary">{{ row.status }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="300" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button 
              v-if="row.state !== 'running'"
              type="success" size="small" :icon="VideoPlay"
              @click="handleStart(row)"
            >启动</el-button>
            <el-button 
              v-if="row.state === 'running'"
              type="warning" size="small" :icon="VideoPause"
              @click="handleStop(row)"
            >停止</el-button>
            <el-button 
              type="primary" size="small" :icon="RefreshRight"
              @click="handleRestart(row)"
            >重启</el-button>
            <el-button 
              type="info" size="small" :icon="Document"
              @click="handleViewLogs(row)"
            >日志</el-button>
            <el-button 
              type="danger" size="small" :icon="Delete"
              @click="handleDelete(row)"
            >删除</el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </DataTable>

    <!-- 日志对话框 -->
    <el-dialog 
      v-model="logsDialogVisible" 
      :title="`容器日志 - ${currentContainerName}`" 
      width="800px"
      top="5vh"
    >
      <div class="logs-container">
        <pre class="logs-content">{{ currentLogs }}</pre>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="less">
.page-container {
  padding: 20px;
}

.logs-container {
  max-height: 60vh;
  overflow: auto;
  background: #1e1e1e;
  border-radius: 4px;
  padding: 12px;
}

.logs-content {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 12px;
  line-height: 1.6;
  color: #d4d4d4;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
