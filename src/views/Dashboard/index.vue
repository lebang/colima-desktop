<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
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

// 快捷操作处理
const handleQuickAction = (action) => {
  if (!colimaStore.isRunning) {
    ElMessage.warning(t('请先启动 Colima'))
    return
  }
  
  switch (action) {
    case 'createContainer':
      ElMessage.info(t('创建容器功能开发中...'))
      break
    case 'pullImage':
      ElMessageBox.prompt(t('请输入镜像名称'), t('拉取镜像'), {
        confirmButtonText: t('确定'),
        cancelButtonText: t('取消'),
        inputPlaceholder: t('例如: nginx:latest')
      }).then(({ value }) => {
        if (value) {
          ElMessage.info(t('正在拉取镜像: {}', value))
          // TODO: 实现镜像拉取
        }
      }).catch(() => {})
      break
    case 'createVolume':
      ElMessageBox.prompt(t('请输入数据卷名称'), t('创建数据卷'), {
        confirmButtonText: t('确定'),
        cancelButtonText: t('取消'),
        inputPlaceholder: t('例如: my-volume')
      }).then(({ value }) => {
        if (value) {
          ElMessage.info(t('正在创建数据卷: {}', value))
          // TODO: 实现数据卷创建
        }
      }).catch(() => {})
      break
    case 'createNetwork':
      ElMessageBox.prompt(t('请输入网络名称'), t('创建网络'), {
        confirmButtonText: t('确定'),
        cancelButtonText: t('取消'),
        inputPlaceholder: t('例如: my-network')
      }).then(({ value }) => {
        if (value) {
          ElMessage.info(t('正在创建网络: {}', value))
          // TODO: 实现网络创建
        }
      }).catch(() => {})
      break
  }
}

// 启动定时刷新
const startAutoRefresh = () => {
  // 每 10 秒刷新一次
  refreshTimer = setInterval(async () => {
    if (!colimaStore.isLoading) {
      await colimaStore.fetchStatus()
      if (colimaStore.isRunning) {
        await dockerStore.fetchAll()
      }
    }
  }, 10000)
}

// 停止定时刷新
const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// 组件挂载时获取数据
onMounted(async () => {
  await colimaStore.refreshAll()
  startAutoRefresh()
})

// 组件卸载时清理定时器
onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<template>
  <div class="dashboard">
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
    <QuickActions
      :is-running="colimaStore.isRunning"
      @action="handleQuickAction"
    />

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
