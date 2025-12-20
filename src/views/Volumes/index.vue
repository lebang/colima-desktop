<script setup>
import { ref } from 'vue'
import { Plus, Search, Refresh, Delete, Coin, View } from '@element-plus/icons-vue'

// 模拟数据卷数据
const volumes = ref([
  { name: 'mysql-data', driver: 'local', mountpoint: '/var/lib/docker/volumes/mysql-data/_data', created: '1周前' },
  { name: 'redis-data', driver: 'local', mountpoint: '/var/lib/docker/volumes/redis-data/_data', created: '2周前' },
  { name: 'nginx-config', driver: 'local', mountpoint: '/var/lib/docker/volumes/nginx-config/_data', created: '3天前' },
  { name: 'app-logs', driver: 'local', mountpoint: '/var/lib/docker/volumes/app-logs/_data', created: '5天前' },
])

const searchQuery = ref('')
const createDialogVisible = ref(false)
const newVolumeName = ref('')

// 创建数据卷
const handleCreate = () => {
  createDialogVisible.value = true
}

const confirmCreate = () => {
  if (newVolumeName.value) {
    volumes.value.unshift({
      name: newVolumeName.value,
      driver: 'local',
      mountpoint: `/var/lib/docker/volumes/${newVolumeName.value}/_data`,
      created: '刚刚'
    })
    createDialogVisible.value = false
    newVolumeName.value = ''
  }
}

// 删除数据卷
const handleDelete = (row) => {
  const index = volumes.value.findIndex(v => v.name === row.name)
  if (index > -1) {
    volumes.value.splice(index, 1)
  }
}
</script>

<template>
  <div class="volumes-page">
    <div class="page-header">
      <h2>数据卷管理</h2>
      <el-button type="primary" :icon="Plus" @click="handleCreate">创建数据卷</el-button>
    </div>

    <!-- 搜索 -->
    <el-card shadow="never" class="filter-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input 
            v-model="searchQuery" 
            placeholder="搜索数据卷名称..." 
            :prefix-icon="Search"
            clearable
          />
        </el-col>
        <el-col :span="16" style="text-align: right">
          <el-button :icon="Refresh">刷新</el-button>
          <el-button type="danger" :icon="Delete">清理未使用数据卷</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 数据卷列表 -->
    <el-card shadow="never" class="table-card">
      <el-table :data="volumes" stripe style="width: 100%">
        <el-table-column prop="name" label="名称" min-width="150">
          <template #default="{ row }">
            <span class="volume-name">
              <el-icon><Coin /></el-icon>
              {{ row.name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="driver" label="驱动" width="100">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.driver }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="mountpoint" label="挂载点" min-width="300">
          <template #default="{ row }">
            <el-tooltip :content="row.mountpoint" placement="top">
              <span class="mountpoint">{{ row.mountpoint }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="created" label="创建时间" width="120" />
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
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建数据卷对话框 -->
    <el-dialog v-model="createDialogVisible" title="创建数据卷" width="500px">
      <el-form label-width="80px">
        <el-form-item label="名称">
          <el-input 
            v-model="newVolumeName" 
            placeholder="请输入数据卷名称"
          />
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
.volumes-page {
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
  .volume-name {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    color: #303133;
    
    .el-icon {
      color: #409eff;
    }
  }
  
  .mountpoint {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 12px;
    color: #909399;
  }
}
</style>
