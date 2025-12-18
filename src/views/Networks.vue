<script setup>
import { ref } from 'vue'
import { Plus, Search, Refresh, Delete, Connection, View } from '@element-plus/icons-vue'

// 模拟网络数据
const networks = ref([
  { id: 'abc123', name: 'bridge', driver: 'bridge', scope: 'local', subnet: '172.17.0.0/16', gateway: '172.17.0.1' },
  { id: 'def456', name: 'host', driver: 'host', scope: 'local', subnet: '-', gateway: '-' },
  { id: 'ghi789', name: 'none', driver: 'null', scope: 'local', subnet: '-', gateway: '-' },
  { id: 'jkl012', name: 'app-network', driver: 'bridge', scope: 'local', subnet: '172.18.0.0/16', gateway: '172.18.0.1' },
])

const searchQuery = ref('')
const createDialogVisible = ref(false)
const newNetwork = ref({
  name: '',
  driver: 'bridge',
  subnet: '',
  gateway: ''
})

// 创建网络
const handleCreate = () => {
  createDialogVisible.value = true
}

const confirmCreate = () => {
  if (newNetwork.value.name) {
    networks.value.push({
      id: 'new' + Date.now(),
      name: newNetwork.value.name,
      driver: newNetwork.value.driver,
      scope: 'local',
      subnet: newNetwork.value.subnet || '-',
      gateway: newNetwork.value.gateway || '-'
    })
    createDialogVisible.value = false
    newNetwork.value = { name: '', driver: 'bridge', subnet: '', gateway: '' }
  }
}

// 删除网络
const handleDelete = (row) => {
  if (['bridge', 'host', 'none'].includes(row.name)) {
    return // 系统网络不能删除
  }
  const index = networks.value.findIndex(n => n.id === row.id)
  if (index > -1) {
    networks.value.splice(index, 1)
  }
}

// 获取驱动类型标签
const getDriverType = (driver) => {
  const types = {
    'bridge': 'primary',
    'host': 'success',
    'null': 'info',
    'overlay': 'warning'
  }
  return types[driver] || 'info'
}
</script>

<template>
  <div class="networks-page">
    <div class="page-header">
      <h2>网络管理</h2>
      <el-button type="primary" :icon="Plus" @click="handleCreate">创建网络</el-button>
    </div>

    <!-- 搜索 -->
    <el-card shadow="never" class="filter-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input 
            v-model="searchQuery" 
            placeholder="搜索网络名称..." 
            :prefix-icon="Search"
            clearable
          />
        </el-col>
        <el-col :span="16" style="text-align: right">
          <el-button :icon="Refresh">刷新</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 网络列表 -->
    <el-card shadow="never" class="table-card">
      <el-table :data="networks" stripe style="width: 100%">
        <el-table-column prop="id" label="网络 ID" width="140">
          <template #default="{ row }">
            <span class="network-id">{{ row.id.substring(0, 12) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" min-width="150">
          <template #default="{ row }">
            <span class="network-name">
              <el-icon><Connection /></el-icon>
              {{ row.name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="driver" label="驱动" width="100">
          <template #default="{ row }">
            <el-tag :type="getDriverType(row.driver)" size="small">{{ row.driver }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="scope" label="作用域" width="100" />
        <el-table-column prop="subnet" label="子网" width="150" />
        <el-table-column prop="gateway" label="网关" width="130" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              size="small" 
              :icon="View"
            >
              查看
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              :icon="Delete"
              :disabled="['bridge', 'host', 'none'].includes(row.name)"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建网络对话框 -->
    <el-dialog v-model="createDialogVisible" title="创建网络" width="500px">
      <el-form :model="newNetwork" label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="newNetwork.name" placeholder="请输入网络名称" />
        </el-form-item>
        <el-form-item label="驱动">
          <el-select v-model="newNetwork.driver" style="width: 100%">
            <el-option label="bridge" value="bridge" />
            <el-option label="host" value="host" />
            <el-option label="overlay" value="overlay" />
          </el-select>
        </el-form-item>
        <el-form-item label="子网">
          <el-input v-model="newNetwork.subnet" placeholder="例如: 172.20.0.0/16" />
        </el-form-item>
        <el-form-item label="网关">
          <el-input v-model="newNetwork.gateway" placeholder="例如: 172.20.0.1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCreate">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>



<style scoped lang="less">
.networks-page {
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
  .network-id {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 12px;
    color: #909399;
  }
  
  .network-name {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    color: #303133;
    
    .el-icon {
      color: #409eff;
    }
  }
}
</style>
