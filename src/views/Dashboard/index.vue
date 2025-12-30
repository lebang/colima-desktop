<script setup>
import { onMounted, onUnmounted, ref, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { useColimaStore, useDockerStore } from '@/stores'
import { t } from '@/languages'

// 导入子组件
import StatusCards from './components/StatusCards.vue'
import VmInfoCard from './components/VmInfoCard.vue'
import ResourceMonitor from './components/ResourceMonitor.vue'
import QuickActions from './components/QuickActions.vue'

const colimaStore = useColimaStore()
const dockerStore = useDockerStore()

// 刷新定时器
let refreshTimer = null
const isRefreshing = ref(false)

// 资源监控数据（从 docker store 获取）
const systemStats = computed(() => ({
  cpuUsage: Math.round(dockerStore.resourceUsage.cpu),
  memoryUsage: Math.round(dockerStore.resourceUsage.memory),
  diskUsage: Math.round(dockerStore.resourceUsage.disk)
}))

// 手动刷新数据
const handleRefresh = async () => {
  isRefreshing.value = true
  try {
    await colimaStore.refreshAll()
    ElMessage.success(t('数据已刷新'))
  } catch (error) {
    ElMessage.error(t('刷新失败') + ': ' + error.message)
  } finally {
    isRefreshing.value = false
  }
}

// 启动 Colima
const handleStart = async () => {
  try {
    const result = await colimaStore.start()
    if (result.success) {
      ElMessage.success(t('Colima 启动成功'))
    } else {
      ElMessage.error(t('启动失败') + ': ' + result.message)
    }
  } catch (error) {
    ElMessage.error(t('启动失败') + ': ' + error.message)
  }
}

// 停止 Colima
const handleStop = async () => {
  try {
    await ElMessageBox.confirm(
      t('确定要停止 Colima 吗？所有容器将会停止运行。'), 
      t('确认停止'), 
      {
        confirmButtonText: t('确定'),
        cancelButtonText: t('取消'),
        type: 'warning'
      }
    )
    
    const result = await colimaStore.stop()
    if (result.success) {
      ElMessage.success(t('Colima 已停止'))
    } else {
      ElMessage.error(t('停止失败') + ': ' + result.message)
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(t('停止失败') + ': ' + error.message)
    }
  }
}

// 重启 Colima
const handleRestart = async () => {
  try {
    await ElMessageBox.confirm(
      t('确定要重启 Colima 吗？所有容器将会重启。'), 
      t('确认重启'), 
      {
        confirmButtonText: t('确定'),
        cancelButtonText: t('取消'),
        type: 'warning'
      }
    )
    
    const result = await colimaStore.restart()
    if (result.success) {
      ElMessage.success(t('Colima 重启成功'))
    } else {
      ElMessage.error(t('重启失败') + ': ' + result.message)
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(t('重启失败') + ': ' + error.message)
    }
  }
}

// 数据刷新逻辑
const refreshData = async () => {
  // 仅在未加载中时刷新
  if (colimaStore.isLoading) return
  
  await colimaStore.fetchStatus()
  if (colimaStore.isRunning) {
    await dockerStore.fetchAll()
  }
}

// 启动定时刷新（递归调度）
const startAutoRefresh = () => {
  stopAutoRefresh() // 先清理已有定时器
  
  const scheduleNextRefresh = () => {
    refreshTimer = setTimeout(async () => {
      await refreshData()
      scheduleNextRefresh() // 完成后调度下一次
    }, 10000)
  }
  
  // 启动调度
  scheduleNextRefresh()
}

// 停止定时刷新
const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearTimeout(refreshTimer)
    refreshTimer = null
  }
}

// 初始化数据（首次加载）
const initData = async () => {
  const loadData = async () => {
    await refreshData()
    startAutoRefresh()
  }
  
  if (window.requestIdleCallback) {
    // 使用 requestIdleCallback 在浏览器空闲时执行，最多等待 1 秒
    requestIdleCallback(loadData, { timeout: 1000 })
  } else {
    // 降级方案：Safari 等不支持的浏览器
    setTimeout(loadData, 0)
  }
}

// 组件挂载时获取数据
onMounted(() => {
  initData()
})

// 组件卸载时清理定时器和事件监听
onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<template>
  <div class="dashboard" v-loading.fullscreen.lock="colimaStore.isLoading">
    <!-- 顶部状态卡片 -->
    <StatusCards
      :is-running="colimaStore.isRunning"
      :is-loading="colimaStore.isLoading"
      :vm-status="colimaStore.vmStatus"
      :container-count="dockerStore.containerCount"
      :running-container-count="dockerStore.runningContainerCount"
      :image-count="dockerStore.imageCount"
      :volume-count="dockerStore.volumeCount"
    />

    <!-- 控制面板 -->
    <div class="control-panel">
      <VmInfoCard
        :vm-info="colimaStore.vmInfo"
        :is-running="colimaStore.isRunning"
        :is-loading="colimaStore.isLoading"
        :vm-status="colimaStore.vmStatus"
        :is-refreshing="isRefreshing"
        @refresh="handleRefresh"
        @start="handleStart"
        @stop="handleStop"
        @restart="handleRestart"
      />
      
      <ResourceMonitor
        :cpu-usage="systemStats.cpuUsage"
        :memory-usage="systemStats.memoryUsage"
        :disk-usage="systemStats.diskUsage"
        :is-running="colimaStore.isRunning"
      />
    </div>

    <!-- 快捷操作 -->
    <QuickActions :is-running="colimaStore.isRunning" />

    <!-- 错误提示 -->
    <el-alert 
      v-if="colimaStore.lastError" 
      :title="colimaStore.lastError" 
      type="error" 
      show-icon 
      closable
      class="error-alert"
    />
  </div>
</template>

<style scoped lang="less">
.dashboard {
  padding: 20px;
}

.control-panel {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.error-alert {
  margin-top: 20px;
}
</style>
