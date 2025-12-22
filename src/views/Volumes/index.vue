<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Delete, Coin } from '@element-plus/icons-vue'
import { useDockerStore } from '@/stores/docker'
import { ElMessage, ElMessageBox } from 'element-plus'
import { PageHeader, SearchBar, DataTable, FormDialog } from '@/components/common'

const dockerStore = useDockerStore()

const searchQuery = ref('')
const loading = ref(false)
const createDialogVisible = ref(false)
const newVolumeName = ref('')
const creating = ref(false)

// 过滤后的数据卷列表
const filteredVolumes = computed(() => {
  let result = dockerStore.volumes
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(v => v.name.toLowerCase().includes(query))
  }
  
  return result
})

// 刷新数据卷列表
const handleRefresh = async () => {
  loading.value = true
  try {
    await dockerStore.fetchVolumes()
  } finally {
    loading.value = false
  }
}

// 打开创建对话框
const handleCreate = () => {
  newVolumeName.value = ''
  createDialogVisible.value = true
}

// 确认创建数据卷
const confirmCreate = async () => {
  if (!newVolumeName.value.trim()) {
    ElMessage.warning('请输入数据卷名称')
    return
  }
  
  creating.value = true
  try {
    const result = await dockerStore.createVolume(newVolumeName.value.trim())
    if (result.success) {
      ElMessage.success(result.message)
      createDialogVisible.value = false
      newVolumeName.value = ''
    } else {
      ElMessage.error(result.message)
    }
  } finally {
    creating.value = false
  }
}

// 删除数据卷
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除数据卷 "${row.name}" 吗？删除后数据将无法恢复！`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    loading.value = true
    const result = await dockerStore.removeVolume(row.name)
    ElMessage[result.success ? 'success' : 'error'](result.message)
  } catch {
    // 用户取消
  } finally {
    loading.value = false
  }
}

onMounted(() => handleRefresh())
</script>

<template>
  <div class="page-container">
    <PageHeader title="数据卷管理">
      <el-button type="primary" :icon="Plus" @click="handleCreate">创建数据卷</el-button>
    </PageHeader>

    <SearchBar 
      v-model="searchQuery" 
      placeholder="搜索数据卷名称..." 
      :loading="loading"
      @refresh="handleRefresh"
    />

    <DataTable :data="filteredVolumes" :loading="loading" empty-text="暂无数据卷">
      <el-table-column prop="name" label="名称" min-width="200">
        <template #default="{ row }">
          <span class="cell-name">
            <el-icon><Coin /></el-icon>
            {{ row.name }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="driver" label="驱动" width="120">
        <template #default="{ row }">
          <el-tag type="info" size="small">{{ row.driver }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="mountpoint" label="挂载点" min-width="350">
        <template #default="{ row }">
          <el-tooltip :content="row.mountpoint" placement="top">
            <span class="cell-code mountpoint">{{ row.mountpoint }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button type="danger" size="small" :icon="Delete" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </DataTable>

    <!-- 创建数据卷对话框 -->
    <FormDialog
      v-model="createDialogVisible"
      title="创建数据卷"
      confirm-text="创建"
      :loading="creating"
      tip="提示：数据卷名称只能包含字母、数字、下划线和连字符"
      @confirm="confirmCreate"
    >
      <el-form-item label="名称">
        <el-input 
          v-model="newVolumeName" 
          placeholder="请输入数据卷名称"
          @keyup.enter="confirmCreate"
        />
      </el-form-item>
    </FormDialog>
  </div>
</template>

<style scoped lang="less">
.page-container {
  padding: 20px;
}

.mountpoint {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  max-width: 100%;
}
</style>
