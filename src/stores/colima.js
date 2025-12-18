import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * Colima 状态管理
 */
export const useColimaStore = defineStore('colima', () => {
  // ========== Colima VM 状态 ==========
  const vmStatus = ref('stopped') // 'running' | 'stopped' | 'starting' | 'stopping'
  const vmInfo = ref({
    name: 'default',
    arch: 'aarch64',
    cpu: 4,
    memory: 8,
    disk: 60,
    runtime: 'docker'
  })

  // ========== Docker 资源 ==========
  const containers = ref([])
  const images = ref([])
  const volumes = ref([])
  const networks = ref([])

  // ========== 系统状态 ==========
  const loading = ref(false)
  const resourceUsage = ref({
    cpu: 0,
    memory: 0,
    disk: 0
  })

  // ========== 计算属性 ==========
  const isRunning = computed(() => vmStatus.value === 'running')
  const isStopped = computed(() => vmStatus.value === 'stopped')
  const isLoading = computed(() => ['starting', 'stopping'].includes(vmStatus.value))
  const containerCount = computed(() => containers.value.length)
  const runningContainerCount = computed(() => 
    containers.value.filter(c => c.status === 'running').length
  )
  const imageCount = computed(() => images.value.length)
  const volumeCount = computed(() => volumes.value.length)
  const networkCount = computed(() => networks.value.length)

  // ========== Colima 操作 ==========
  function setVmStatus(status) {
    vmStatus.value = status
  }

  function setVmInfo(info) {
    vmInfo.value = { ...vmInfo.value, ...info }
  }

  async function startColima() {
    if (vmStatus.value !== 'stopped') return
    vmStatus.value = 'starting'
    // TODO: 调用 Tauri 后端启动 Colima
    // 模拟启动过程
    setTimeout(() => {
      vmStatus.value = 'running'
    }, 2000)
  }

  async function stopColima() {
    if (vmStatus.value !== 'running') return
    vmStatus.value = 'stopping'
    // TODO: 调用 Tauri 后端停止 Colima
    // 模拟停止过程
    setTimeout(() => {
      vmStatus.value = 'stopped'
    }, 2000)
  }

  async function restartColima() {
    await stopColima()
    setTimeout(() => {
      startColima()
    }, 1000)
  }

  // ========== Docker 资源操作 ==========
  function setContainers(list) {
    containers.value = list
  }

  function setImages(list) {
    images.value = list
  }

  function setVolumes(list) {
    volumes.value = list
  }

  function setNetworks(list) {
    networks.value = list
  }

  function setResourceUsage(usage) {
    resourceUsage.value = { ...resourceUsage.value, ...usage }
  }

  function setLoading(value) {
    loading.value = value
  }

  return {
    // 状态
    vmStatus,
    vmInfo,
    containers,
    images,
    volumes,
    networks,
    loading,
    resourceUsage,
    // 计算属性
    isRunning,
    isStopped,
    isLoading,
    containerCount,
    runningContainerCount,
    imageCount,
    volumeCount,
    networkCount,
    // 方法
    setVmStatus,
    setVmInfo,
    startColima,
    stopColima,
    restartColima,
    setContainers,
    setImages,
    setVolumes,
    setNetworks,
    setResourceUsage,
    setLoading
  }
})
