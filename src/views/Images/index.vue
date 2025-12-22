<script setup>
import { ref, computed, onMounted } from 'vue'
import { Download, Delete, Box } from '@element-plus/icons-vue'
import { useDockerStore } from '@/stores/docker'
import { ElMessage, ElMessageBox } from 'element-plus'
import { PageHeader, SearchBar, DataTable, FormDialog } from '@/components/common'

const dockerStore = useDockerStore()

const searchQuery = ref('')
const loading = ref(false)
const pullDialogVisible = ref(false)
const pullImageName = ref('')
const pulling = ref(false)

// 过滤后的镜像列表
const filteredImages = computed(() => {
  let result = dockerStore.images
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(img => 
      img.repository.toLowerCase().includes(query) || 
      img.tag.toLowerCase().includes(query) ||
      img.id.toLowerCase().includes(query)
    )
  }
  
  return result
})

// 刷新镜像列表
const handleRefresh = async () => {
  loading.value = true
  try {
    await dockerStore.fetchImages()
  } finally {
    loading.value = false
  }
}

// 打开拉取对话框
const handlePull = () => {
  pullImageName.value = ''
  pullDialogVisible.value = true
}

// 确认拉取镜像
const confirmPull = async () => {
  if (!pullImageName.value.trim()) {
    ElMessage.warning('请输入镜像名称')
    return
  }
  
  pulling.value = true
  try {
    const result = await dockerStore.pullImage(pullImageName.value.trim())
    if (result.success) {
      ElMessage.success(result.message)
      pullDialogVisible.value = false
      pullImageName.value = ''
    } else {
      ElMessage.error(result.message)
    }
  } finally {
    pulling.value = false
  }
}

// 删除镜像
const handleDelete = async (row) => {
  const imageName = row.repository === '<none>' ? row.id.substring(7, 19) : `${row.repository}:${row.tag}`
  
  try {
    await ElMessageBox.confirm(`确定要删除镜像 "${imageName}" 吗？`, '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    loading.value = true
    const result = await dockerStore.removeImage(row.id)
    ElMessage[result.success ? 'success' : 'error'](result.message)
  } catch {
    // 用户取消
  } finally {
    loading.value = false
  }
}

// 创建容器（待实现）
const handleCreateContainer = () => {
  ElMessage.info('创建容器功能开发中...')
}

onMounted(() => handleRefresh())
</script>

<template>
  <div class="page-container">
    <PageHeader title="镜像管理">
      <el-button type="primary" :icon="Download" @click="handlePull">拉取镜像</el-button>
    </PageHeader>

    <SearchBar 
      v-model="searchQuery" 
      placeholder="搜索镜像名称..." 
      :loading="loading"
      @refresh="handleRefresh"
    />

    <DataTable :data="filteredImages" :loading="loading" empty-text="暂无镜像">
      <el-table-column prop="id" label="镜像 ID" width="180">
        <template #default="{ row }">
          <el-tooltip :content="row.id" placement="top">
            <span class="cell-id">{{ row.id.substring(7, 19) }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="repository" label="名称" min-width="200">
        <template #default="{ row }">
          <span class="cell-name">{{ row.repository }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="tag" label="标签" width="120">
        <template #default="{ row }">
          <el-tag size="small" v-if="row.tag !== '<none>'">{{ row.tag }}</el-tag>
          <span v-else class="cell-secondary">{{ row.tag }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="size" label="大小" width="120" />
      <el-table-column prop="created" label="创建时间" width="180">
        <template #default="{ row }">
          <span class="cell-secondary">{{ row.created }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" :icon="Box" @click="handleCreateContainer(row)">
            创建容器
          </el-button>
          <el-button type="danger" size="small" :icon="Delete" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </DataTable>

    <!-- 拉取镜像对话框 -->
    <FormDialog
      v-model="pullDialogVisible"
      title="拉取镜像"
      confirm-text="拉取"
      :loading="pulling"
      tip="提示：可以输入完整的镜像地址，如 docker.io/library/nginx:latest"
      @confirm="confirmPull"
    >
      <el-form-item label="镜像名称">
        <el-input 
          v-model="pullImageName" 
          placeholder="例如: nginx:latest"
          @keyup.enter="confirmPull"
        />
      </el-form-item>
    </FormDialog>
  </div>
</template>

<style scoped lang="less">
.page-container {
  padding: 20px;
}
</style>
