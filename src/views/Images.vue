<script setup>
import { ref } from 'vue'
import { Download, Search, Refresh, Delete, Box } from '@element-plus/icons-vue'

// 模拟镜像数据
const images = ref([
  { id: 'sha256:abc123', name: 'nginx', tag: 'latest', size: '142 MB', created: '2周前' },
  { id: 'sha256:def456', name: 'mysql', tag: '8.0', size: '516 MB', created: '1个月前' },
  { id: 'sha256:ghi789', name: 'redis', tag: 'alpine', size: '32 MB', created: '3周前' },
  { id: 'sha256:jkl012', name: 'node', tag: '18', size: '998 MB', created: '5天前' },
  { id: 'sha256:mno345', name: 'postgres', tag: '15', size: '379 MB', created: '2周前' },
])

const searchQuery = ref('')
const pullDialogVisible = ref(false)
const pullImageName = ref('')

// 拉取镜像
const handlePull = () => {
  pullDialogVisible.value = true
}

const confirmPull = () => {
  if (pullImageName.value) {
    // 模拟拉取
    const [name, tag = 'latest'] = pullImageName.value.split(':')
    images.value.unshift({
      id: 'sha256:new' + Date.now(),
      name,
      tag,
      size: '-- MB',
      created: '刚刚'
    })
    pullDialogVisible.value = false
    pullImageName.value = ''
  }
}

// 删除镜像
const handleDelete = (row) => {
  const index = images.value.findIndex(i => i.id === row.id)
  if (index > -1) {
    images.value.splice(index, 1)
  }
}

// 创建容器
const handleCreateContainer = (row) => {
  console.log('创建容器:', row)
}
</script>

<template>
  <div class="images-page">
    <div class="page-header">
      <h2>镜像管理</h2>
      <el-button type="primary" :icon="Download" @click="handlePull">拉取镜像</el-button>
    </div>

    <!-- 搜索 -->
    <el-card shadow="never" class="filter-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input 
            v-model="searchQuery" 
            placeholder="搜索镜像名称..." 
            :prefix-icon="Search"
            clearable
          />
        </el-col>
        <el-col :span="16" style="text-align: right">
          <el-button :icon="Refresh">刷新</el-button>
          <el-button type="danger" :icon="Delete">清理未使用镜像</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 镜像列表 -->
    <el-card shadow="never" class="table-card">
      <el-table :data="images" stripe style="width: 100%">
        <el-table-column prop="id" label="镜像 ID" width="180">
          <template #default="{ row }">
            <el-tooltip :content="row.id" placement="top">
              <span class="image-id">{{ row.id.substring(7, 19) }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" min-width="150">
          <template #default="{ row }">
            <span class="image-name">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="tag" label="标签" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ row.tag }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="大小" width="120" />
        <el-table-column prop="created" label="创建时间" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              size="small" 
              :icon="Box"
              @click="handleCreateContainer(row)"
            >
              创建容器
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

    <!-- 拉取镜像对话框 -->
    <el-dialog v-model="pullDialogVisible" title="拉取镜像" width="500px">
      <el-form label-width="80px">
        <el-form-item label="镜像名称">
          <el-input 
            v-model="pullImageName" 
            placeholder="例如: nginx:latest"
          />
        </el-form-item>
        <el-alert 
          title="提示：可以输入完整的镜像地址，如 docker.io/library/nginx:latest" 
          type="info" 
          :closable="false"
          show-icon
        />
      </el-form>
      <template #footer>
        <el-button @click="pullDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmPull">拉取</el-button>
      </template>
    </el-dialog>
  </div>
</template>



<style scoped lang="less">
.images-page {
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
  .image-id {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 12px;
    color: #909399;
  }
  
  .image-name {
    font-weight: 500;
    color: #303133;
  }
}
</style>
