<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Delete, Connection } from '@element-plus/icons-vue'
import { useDockerStore } from '@/stores/docker'
import { ElMessage, ElMessageBox } from 'element-plus'
import { PageHeader, SearchBar, DataTable, FormDialog } from '@/components/common'

const dockerStore = useDockerStore()

const searchQuery = ref('')
const loading = ref(false)
const createDialogVisible = ref(false)
const newNetwork = ref({ name: '', driver: 'bridge' })
const creating = ref(false)

// 系统内置网络，不能删除
const systemNetworks = ['bridge', 'host', 'none']

// 过滤后的网络列表
const filteredNetworks = computed(() => {
  let result = dockerStore.networks
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(n => 
      n.name.toLowerCase().includes(query) ||
      n.driver.toLowerCase().includes(query)
    )
  }
  
  return result
})

// 获取驱动类型标签
const getDriverType = (driver) => {
  const types = {
    'bridge': 'primary',
    'host': 'success',
    'null': 'info',
    'overlay': 'warning',
    'macvlan': 'danger'
  }
  return types[driver] || 'info'
}

// 判断是否为系统网络
const isSystemNetwork = (name) => systemNetworks.includes(name)

// 刷新网络列表
const handleRefresh = async () => {
  loading.value = true
  try {
    await dockerStore.fetchNetworks()
  } finally {
    loading.value = false
  }
}

// 打开创建对话框
const handleCreate = () => {
  newNetwork.value = { name: '', driver: 'bridge' }
  createDialogVisible.value = true
}

// 确认创建网络
const confirmCreate = async () => {
  if (!newNetwork.value.name.trim()) {
    ElMessage.warning('请输入网络名称')
    return
  }
  
  creating.value = true
  try {
    const result = await dockerStore.createNetwork(
      newNetwork.value.name.trim(), 
      newNetwork.value.driver
    )
    if (result.success) {
      ElMessage.success(result.message)
      createDialogVisible.value = false
      newNetwork.value = { name: '', driver: 'bridge' }
    } else {
      ElMessage.error(result.message)
    }
  } finally {
    creating.value = false
  }
}

// 删除网络
const handleDelete = async (row) => {
  if (isSystemNetwork(row.name)) {
    ElMessage.warning('系统内置网络不能删除')
    return
  }
  
  try {
    await ElMessageBox.confirm(`确定要删除网络 "${row.name}" 吗？`, '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    loading.value = true
    const result = await dockerStore.removeNetwork(row.name)
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
    <PageHeader title="网络管理">
      <el-button type="primary" :icon="Plus" @click="handleCreate">创建网络</el-button>
    </PageHeader>

    <SearchBar 
      v-model="searchQuery" 
      placeholder="搜索网络名称..." 
      :loading="loading"
      @refresh="handleRefresh"
    />

    <DataTable :data="filteredNetworks" :loading="loading" empty-text="暂无网络">
      <el-table-column prop="id" label="网络 ID" width="180">
        <template #default="{ row }">
          <el-tooltip :content="row.id" placement="top">
            <span class="cell-id">{{ row.id.substring(0, 12) }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称" min-width="200">
        <template #default="{ row }">
          <span class="cell-name">
            <el-icon><Connection /></el-icon>
            {{ row.name }}
            <el-tag v-if="isSystemNetwork(row.name)" type="info" size="small" style="margin-left: 4px">
              系统
            </el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="driver" label="驱动" width="120">
        <template #default="{ row }">
          <el-tag :type="getDriverType(row.driver)" size="small">{{ row.driver }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="scope" label="作用域" width="120">
        <template #default="{ row }">
          <span class="cell-secondary">{{ row.scope }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button 
            type="danger" 
            size="small" 
            :icon="Delete"
            :disabled="isSystemNetwork(row.name)"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </DataTable>

    <!-- 创建网络对话框 -->
    <FormDialog
      v-model="createDialogVisible"
      title="创建网络"
      confirm-text="创建"
      :loading="creating"
      tip="提示：bridge 是最常用的网络类型，适合大多数场景"
      @confirm="confirmCreate"
    >
      <el-form-item label="名称" required>
        <el-input 
          v-model="newNetwork.name" 
          placeholder="请输入网络名称"
          @keyup.enter="confirmCreate"
        />
      </el-form-item>
      <el-form-item label="驱动">
        <el-select v-model="newNetwork.driver" style="width: 100%">
          <el-option label="bridge (桥接网络)" value="bridge" />
          <el-option label="host (主机网络)" value="host" />
          <el-option label="overlay (覆盖网络)" value="overlay" />
          <el-option label="macvlan (MAC VLAN)" value="macvlan" />
        </el-select>
      </el-form-item>
    </FormDialog>
  </div>
</template>

<style scoped lang="less">
.page-container {
  padding: 20px;
}
</style>
