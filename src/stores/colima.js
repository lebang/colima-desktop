/**
 * Colima 虚拟机状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import colimaApi from '@/api/colima'
import { useDockerStore } from './docker'

export const useColimaStore = defineStore('colima', () => {
  // ========== 状态 ==========
  const vmStatus = ref('stopped') // 'running' | 'stopped' | 'starting' | 'stopping' | 'restarting'
  const vmInfo = ref({
    name: 'default',
    arch: '',
    cpu: 0,
    memory: 0,
    disk: 0,
    runtime: 'docker',
    address: ''
  })
  const loading = ref(false)
  const lastError = ref('')

  // ========== 计算属性 ==========
  const isRunning = computed(() => vmStatus.value === 'running')
  const isStopped = computed(() => vmStatus.value === 'stopped')
  const isLoading = computed(() => ['starting', 'stopping', 'restarting'].includes(vmStatus.value))

  // ========== 获取状态 ==========
  
  /**
   * 获取 Colima 状态
   */
  async function fetchStatus() {
    try {
      const status = await colimaApi.getStatus()
      vmStatus.value = status.status
      vmInfo.value = {
        name: status.name,
        arch: status.arch,
        cpu: status.cpu,
        memory: status.memory,
        disk: status.disk,
        runtime: status.runtime,
        address: status.address
      }
      lastError.value = ''
    } catch (error) {
      console.error('获取 Colima 状态失败:', error)
      lastError.value = error.toString()
    }
  }

  /**
   * 刷新所有数据（包括 Docker 资源）
   */
  async function refreshAll() {
    loading.value = true
    try {
      fetchStatus().finally(() => {
        // 如果 Colima 运行中，同时刷新 Docker 资源
        if (vmStatus.value === 'running') {
          const dockerStore = useDockerStore()
          dockerStore.fetchAll()
        }
      })
    } finally {
      loading.value = false
    }
  }

  // ========== 操作方法 ==========
  
  /**
   * 启动 Colima
   * @param {Object} options - 启动参数
   */
  async function start(options = {}) {
    if (vmStatus.value !== 'stopped') {
      return { success: false, message: 'Colima 不在停止状态' }
    }
    
    vmStatus.value = 'starting'
    lastError.value = ''
    
    try {
      const result = await colimaApi.start(options)
      if (result.success) {
        vmStatus.value = 'running'
        fetchStatus().then(() => {
          const dockerStore = useDockerStore()
          dockerStore.fetchAll()
        })
      } else {
        vmStatus.value = 'stopped'
        lastError.value = result.message
      }
      return result
    } catch (error) {
      vmStatus.value = 'stopped'
      lastError.value = error.toString()
      return { success: false, message: error.toString() }
    }
  }

  /**
   * 停止 Colima
   */
  async function stop() {
    if (vmStatus.value !== 'running') {
      return { success: false, message: 'Colima 不在运行状态' }
    }
    
    vmStatus.value = 'stopping'
    lastError.value = ''
    
    try {
      const result = await colimaApi.stop()
      if (result.success) {
        vmStatus.value = 'stopped'
        // 停止后清空 Docker 资源
        const dockerStore = useDockerStore()
        dockerStore.clear()
      } else {
        vmStatus.value = 'running'
        lastError.value = result.message
      }
      return result
    } catch (error) {
      vmStatus.value = 'running'
      lastError.value = error.toString()
      return { success: false, message: error.toString() }
    }
  }

  /**
   * 重启 Colima (先停止再启动)
   */
  async function restart() {
    if (vmStatus.value !== 'running') {
      return { success: false, message: 'Colima 不在运行状态' }
    }
    
    vmStatus.value = 'restarting'
    lastError.value = ''
    
    try {
      // 先停止
      const stopResult = await colimaApi.stop()
      if (!stopResult.success) {
        vmStatus.value = 'running'
        lastError.value = stopResult.message
        return { success: false, message: '停止失败: ' + stopResult.message }
      }
      
      // 等待一下再启动
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 再启动
      const startResult = await colimaApi.start()
      if (startResult.success) {
        vmStatus.value = 'running'
        fetchStatus().finally(() => {
          const dockerStore = useDockerStore()
          dockerStore.fetchAll()
        })
        return { success: true, message: 'Colima 重启成功' }
      } else {
        vmStatus.value = 'stopped'
        lastError.value = startResult.message
        return { success: false, message: '启动失败: ' + startResult.message }
      }
    } catch (error) {
      vmStatus.value = 'stopped'
      lastError.value = error.toString()
      return { success: false, message: error.toString() }
    }
  }

  /**
   * 删除 Colima 实例
   * @param {boolean} force - 是否强制删除
   */
  async function remove(force = false) {
    if (vmStatus.value === 'running') {
      return { success: false, message: '请先停止 Colima' }
    }
    
    try {
      const result = await colimaApi.remove(force)
      if (result.success) {
        // 重置状态
        vmInfo.value = {
          name: 'default',
          arch: '',
          cpu: 0,
          memory: 0,
          disk: 0,
          runtime: 'docker',
          address: ''
        }
      }
      return result
    } catch (error) {
      return { success: false, message: error.toString() }
    }
  }

  // ========== 手动设置方法 ==========
  function setStatus(status) {
    vmStatus.value = status
  }

  function setInfo(info) {
    vmInfo.value = { ...vmInfo.value, ...info }
  }

  function setLoading(value) {
    loading.value = value
  }

  return {
    // 状态
    vmStatus,
    vmInfo,
    loading,
    lastError,
    // 计算属性
    isRunning,
    isStopped,
    isLoading,
    // 方法
    fetchStatus,
    refreshAll,
    start,
    stop,
    restart,
    remove,
    // 兼容方法
    setStatus,
    setInfo,
    setLoading
  }
})
