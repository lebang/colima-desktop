/**
 * Docker 资源状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dockerApi from '@/api/docker'

export const useDockerStore = defineStore('docker', () => {
  // ========== 状态 ==========
  const containers = ref([])
  const images = ref([])
  const volumes = ref([])
  const networks = ref([])
  const resourceUsage = ref({
    cpu: 0,
    memory: 0,
    disk: 0
  })
  const loading = ref(false)
  const lastError = ref('')

  // ========== 计算属性 ==========
  const containerCount = computed(() => containers.value.length)
  const runningContainerCount = computed(() => 
    containers.value.filter(c => c.state === 'running').length
  )
  const imageCount = computed(() => images.value.length)
  const volumeCount = computed(() => volumes.value.length)
  const networkCount = computed(() => networks.value.length)

  // ========== 获取数据 ==========

  /**
   * 获取容器列表
   */
  async function fetchContainers() {
    try {
      containers.value = await dockerApi.listContainers()
    } catch (error) {
      console.error('获取容器列表失败:', error)
      lastError.value = error.toString()
    }
  }

  /**
   * 获取镜像列表
   */
  async function fetchImages() {
    try {
      images.value = await dockerApi.listImages()
    } catch (error) {
      console.error('获取镜像列表失败:', error)
      lastError.value = error.toString()
    }
  }

  /**
   * 获取数据卷列表
   */
  async function fetchVolumes() {
    try {
      volumes.value = await dockerApi.listVolumes()
    } catch (error) {
      console.error('获取数据卷列表失败:', error)
      lastError.value = error.toString()
    }
  }

  /**
   * 获取网络列表
   */
  async function fetchNetworks() {
    try {
      networks.value = await dockerApi.listNetworks()
    } catch (error) {
      console.error('获取网络列表失败:', error)
      lastError.value = error.toString()
    }
  }

  /**
   * 获取资源使用统计
   */
  async function fetchStats() {
    try {
      resourceUsage.value = await dockerApi.getStats()
    } catch (error) {
      console.error('获取资源统计失败:', error)
      lastError.value = error.toString()
    }
  }

  /**
   * 获取所有 Docker 资源
   */
  async function fetchAll() {
    loading.value = true
    lastError.value = ''
    
    try {
      await Promise.all([
        fetchContainers(),
        fetchImages(),
        fetchVolumes(),
        fetchNetworks(),
        fetchStats()
      ])
    } catch (error) {
      console.error('获取 Docker 资源失败:', error)
      lastError.value = error.toString()
    } finally {
      loading.value = false
    }
  }

  /**
   * 清空所有数据
   */
  function clear() {
    containers.value = []
    images.value = []
    volumes.value = []
    networks.value = []
    resourceUsage.value = { cpu: 0, memory: 0, disk: 0 }
  }

  // ========== 容器操作 ==========

  /**
   * 启动容器
   * @param {string} containerId - 容器 ID 或名称
   */
  async function startContainer(containerId) {
    const result = await dockerApi.startContainer(containerId)
    if (result.success) {
      await fetchContainers()
    }
    return result
  }

  /**
   * 停止容器
   * @param {string} containerId - 容器 ID 或名称
   */
  async function stopContainer(containerId) {
    const result = await dockerApi.stopContainer(containerId)
    if (result.success) {
      await fetchContainers()
    }
    return result
  }

  /**
   * 重启容器
   * @param {string} containerId - 容器 ID 或名称
   */
  async function restartContainer(containerId) {
    const result = await dockerApi.restartContainer(containerId)
    if (result.success) {
      await fetchContainers()
    }
    return result
  }

  /**
   * 删除容器
   * @param {string} containerId - 容器 ID 或名称
   * @param {boolean} force - 是否强制删除
   */
  async function removeContainer(containerId, force = false) {
    const result = await dockerApi.removeContainer(containerId, force)
    if (result.success) {
      await fetchContainers()
    }
    return result
  }

  /**
   * 获取容器日志
   * @param {string} containerId - 容器 ID 或名称
   * @param {number} tail - 日志行数
   */
  async function getContainerLogs(containerId, tail = 100) {
    return await dockerApi.getContainerLogs(containerId, tail)
  }

  // ========== 镜像操作 ==========

  /**
   * 拉取镜像
   * @param {string} image - 镜像名称
   */
  async function pullImage(image) {
    const result = await dockerApi.pullImage(image)
    if (result.success) {
      await fetchImages()
    }
    return result
  }

  /**
   * 删除镜像
   * @param {string} imageId - 镜像 ID 或名称
   * @param {boolean} force - 是否强制删除
   */
  async function removeImage(imageId, force = false) {
    const result = await dockerApi.removeImage(imageId, force)
    if (result.success) {
      await fetchImages()
    }
    return result
  }

  // ========== 数据卷操作 ==========

  /**
   * 创建数据卷
   * @param {string} name - 数据卷名称
   */
  async function createVolume(name) {
    const result = await dockerApi.createVolume(name)
    if (result.success) {
      await fetchVolumes()
    }
    return result
  }

  /**
   * 删除数据卷
   * @param {string} name - 数据卷名称
   * @param {boolean} force - 是否强制删除
   */
  async function removeVolume(name, force = false) {
    const result = await dockerApi.removeVolume(name, force)
    if (result.success) {
      await fetchVolumes()
    }
    return result
  }

  // ========== 网络操作 ==========

  /**
   * 创建网络
   * @param {string} name - 网络名称
   * @param {string} driver - 网络驱动
   */
  async function createNetwork(name, driver = 'bridge') {
    const result = await dockerApi.createNetwork(name, driver)
    if (result.success) {
      await fetchNetworks()
    }
    return result
  }

  /**
   * 删除网络
   * @param {string} name - 网络名称
   */
  async function removeNetwork(name) {
    const result = await dockerApi.removeNetwork(name)
    if (result.success) {
      await fetchNetworks()
    }
    return result
  }

  // ========== 手动设置方法 ==========
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
    containers,
    images,
    volumes,
    networks,
    resourceUsage,
    loading,
    lastError,
    // 计算属性
    containerCount,
    runningContainerCount,
    imageCount,
    volumeCount,
    networkCount,
    // 获取数据
    fetchContainers,
    fetchImages,
    fetchVolumes,
    fetchNetworks,
    fetchStats,
    fetchAll,
    clear,
    // 容器操作
    startContainer,
    stopContainer,
    restartContainer,
    removeContainer,
    getContainerLogs,
    // 镜像操作
    pullImage,
    removeImage,
    // 数据卷操作
    createVolume,
    removeVolume,
    // 网络操作
    createNetwork,
    removeNetwork,
    // 兼容方法
    setContainers,
    setImages,
    setVolumes,
    setNetworks,
    setResourceUsage,
    setLoading
  }
})
