/**
 * Docker API 封装
 * 调用 Tauri 后端命令管理 Docker 资源
 */
import { invoke } from '@tauri-apps/api/core'
import { parseJson, parseJsonLines, buildResult } from './utils'

// ========== 查询类 API ==========

/**
 * 获取容器列表
 * @param {boolean} all - 是否包含停止的容器
 * @returns {Promise<Array<{id: string, name: string, image: string, status: string, state: string, ports: string, created: string}>>}
 */
export async function listContainers(all = true) {
  const result = await invoke('docker_container_list', { all })
  if (!result.success) return []
  
  const containers = parseJsonLines(result.stdout)
  return containers.map(c => ({
    id: c.ID || c.Id || '',
    name: c.Names || c.Name || '',
    image: c.Image || '',
    status: c.Status || '',
    state: c.State || '',
    ports: c.Ports || '',
    created: c.CreatedAt || c.Created || ''
  }))
}

/**
 * 获取镜像列表
 * @returns {Promise<Array<{id: string, repository: string, tag: string, size: string, created: string}>>}
 */
export async function listImages() {
  const result = await invoke('docker_image_list')
  if (!result.success) return []
  
  const images = parseJsonLines(result.stdout)
  return images.map(img => ({
    id: img.ID || img.Id || '',
    repository: img.Repository || '',
    tag: img.Tag || '',
    size: img.Size || '',
    created: img.CreatedAt || img.Created || ''
  }))
}

/**
 * 获取数据卷列表
 * @returns {Promise<Array<{name: string, driver: string, mountpoint: string}>>}
 */
export async function listVolumes() {
  const result = await invoke('docker_volume_list')
  if (!result.success) return []
  
  const volumes = parseJsonLines(result.stdout)
  return volumes.map(v => ({
    name: v.Name || '',
    driver: v.Driver || '',
    mountpoint: v.Mountpoint || ''
  }))
}

/**
 * 获取网络列表
 * @returns {Promise<Array<{id: string, name: string, driver: string, scope: string}>>}
 */
export async function listNetworks() {
  const result = await invoke('docker_network_list')
  if (!result.success) return []
  
  const networks = parseJsonLines(result.stdout)
  return networks.map(n => ({
    id: n.ID || n.Id || '',
    name: n.Name || '',
    driver: n.Driver || '',
    scope: n.Scope || ''
  }))
}

/**
 * 获取 Docker 系统信息
 * @returns {Promise<Object|null>}
 */
export async function getInfo() {
  const result = await invoke('docker_info')
  if (!result.success) return null
  return parseJson(result.stdout)
}

/**
 * 获取 Docker 磁盘使用情况
 * @returns {Promise<Array>}
 */
export async function getDiskUsage() {
  const result = await invoke('docker_disk_usage')
  if (!result.success) return []
  return parseJsonLines(result.stdout)
}

/**
 * 获取资源使用统计
 * @returns {Promise<{cpu: number, memory: number, disk: number}>}
 */
export async function getStats() {
  const result = await invoke('docker_stats')
  
  const defaultStats = { cpu: 0, memory: 0, disk: 0 }
  if (!result.success) return defaultStats
  
  const stats = parseJsonLines(result.stdout)
  
  let totalCpu = 0
  let totalMem = 0
  
  for (const stat of stats) {
    // CPU 百分比可能是 "10.5%" 格式
    const cpuStr = (stat.CPUPerc || stat.cpu || '0').replace('%', '')
    const memStr = (stat.MemPerc || stat.memory || '0').replace('%', '')
    totalCpu += parseFloat(cpuStr) || 0
    totalMem += parseFloat(memStr) || 0
  }
  
  return {
    cpu: Math.min(totalCpu, 100),
    memory: Math.min(totalMem, 100),
    disk: 30 // 磁盘使用率需要从 docker system df 计算，暂时返回估算值
  }
}

// ========== 容器操作 API ==========

/**
 * 启动容器
 * @param {string} containerId - 容器 ID 或名称
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function startContainer(containerId) {
  const result = await invoke('docker_container_start', { containerId })
  return buildResult(result, '容器启动成功', '启动失败')
}

/**
 * 停止容器
 * @param {string} containerId - 容器 ID 或名称
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function stopContainer(containerId) {
  const result = await invoke('docker_container_stop', { containerId })
  return buildResult(result, '容器停止成功', '停止失败')
}

/**
 * 重启容器
 * @param {string} containerId - 容器 ID 或名称
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function restartContainer(containerId) {
  const result = await invoke('docker_container_restart', { containerId })
  return buildResult(result, '容器重启成功', '重启失败')
}

/**
 * 删除容器
 * @param {string} containerId - 容器 ID 或名称
 * @param {boolean} force - 是否强制删除
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function removeContainer(containerId, force = false) {
  const result = await invoke('docker_container_remove', { containerId, force })
  return buildResult(result, '容器删除成功', '删除失败')
}

/**
 * 获取容器日志
 * @param {string} containerId - 容器 ID 或名称
 * @param {number} tail - 日志行数
 * @returns {Promise<{success: boolean, logs: string}>}
 */
export async function getContainerLogs(containerId, tail = 100) {
  const result = await invoke('docker_container_logs', { containerId, tail })
  return {
    success: result.success,
    logs: result.stdout || result.stderr || ''
  }
}

// ========== 镜像操作 API ==========

/**
 * 拉取镜像
 * @param {string} image - 镜像名称
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function pullImage(image) {
  const result = await invoke('docker_image_pull', { image })
  return buildResult(result, '镜像拉取成功', '拉取失败')
}

/**
 * 删除镜像
 * @param {string} imageId - 镜像 ID 或名称
 * @param {boolean} force - 是否强制删除
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function removeImage(imageId, force = false) {
  const result = await invoke('docker_image_remove', { imageId, force })
  return buildResult(result, '镜像删除成功', '删除失败')
}

// ========== 数据卷操作 API ==========

/**
 * 创建数据卷
 * @param {string} name - 数据卷名称
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function createVolume(name) {
  const result = await invoke('docker_volume_create', { name })
  return buildResult(result, '数据卷创建成功', '创建失败')
}

/**
 * 删除数据卷
 * @param {string} name - 数据卷名称
 * @param {boolean} force - 是否强制删除
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function removeVolume(name, force = false) {
  const result = await invoke('docker_volume_remove', { name, force })
  return buildResult(result, '数据卷删除成功', '删除失败')
}

// ========== 网络操作 API ==========

/**
 * 创建网络
 * @param {string} name - 网络名称
 * @param {string} driver - 网络驱动 (bridge, host, none 等)
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function createNetwork(name, driver = 'bridge') {
  const result = await invoke('docker_network_create', { name, driver })
  return buildResult(result, '网络创建成功', '创建失败')
}

/**
 * 删除网络
 * @param {string} name - 网络名称
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function removeNetwork(name) {
  const result = await invoke('docker_network_remove', { name })
  return buildResult(result, '网络删除成功', '删除失败')
}

// 默认导出所有方法
export default {
  // 查询
  listContainers,
  listImages,
  listVolumes,
  listNetworks,
  getInfo,
  getDiskUsage,
  getStats,
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
  removeNetwork
}
