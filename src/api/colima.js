/**
 * Colima API 封装
 * 调用 Tauri 后端命令管理 Colima 虚拟机
 */
import { invoke } from '@tauri-apps/api/core'
import { parseJson, parseJsonLines, getSystemArch, buildResult } from './utils'

/**
 * 获取 Colima 状态
 * @returns {Promise<{status: string, name: string, arch: string, cpu: number, memory: number, disk: number, runtime: string, address: string}>}
 */
export async function getStatus() {
  const result = await invoke('colima_status')
  
  // 默认返回值（Colima 未运行时）
  const defaultStatus = {
    status: 'stopped',
    name: 'default',
    arch: getSystemArch(),
    cpu: 0,
    memory: 0,
    disk: 0,
    runtime: 'docker',
    address: ''
  }
  
  // 检查是否执行成功
  if (!result.success || result.stderr.includes('not running') || result.stdout.includes('not running')) {
    return defaultStatus
  }
  
  // 解析 JSON 输出
  const data = parseJson(result.stdout)
  if (!data) {
    return defaultStatus
  }
  
  // 单位转换：colima 返回的 memory 和 disk 是字节，需要转换为 GB
  const bytesToGB = (bytes) => {
    if (!bytes) return 0
    const num = Number(bytes)
    // 1 GB = 1073741824 bytes
    const GB = 1073741824
    // 如果值大于 1GB，认为是字节单位，转换为 GB
    if (num >= GB) {
      return Math.round(num / GB)
    }
    // 如果值小于 1GB 但大于 1MB，可能已经是 GB 单位
    return num
  }
  
  // 处理 arch 字段：aarch64 -> arm64
  const normalizeArch = (arch) => {
    if (arch === 'aarch64') return 'arm64'
    if (arch === 'x86_64') return 'amd64'
    return arch || getSystemArch()
  }
  
  return {
    status: 'running',
    name: data.name || 'default',
    arch: normalizeArch(data.arch),
    cpu: data.cpu || 0,
    memory: bytesToGB(data.memory),
    disk: bytesToGB(data.disk),
    runtime: data.runtime || 'docker',
    address: data.address || ''
  }
}

/**
 * 获取 Colima 实例列表
 * @returns {Promise<Array>}
 */
export async function list() {
  const result = await invoke('colima_list')
  if (!result.success) return []
  return parseJsonLines(result.stdout)
}

/**
 * 启动 Colima
 * @param {Object} options - 启动参数
 * @param {number} options.cpu - CPU 核心数
 * @param {number} options.memory - 内存大小 (GB)
 * @param {number} options.disk - 磁盘大小 (GB)
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function start(options = {}) {
  const result = await invoke('colima_start', {
    cpu: options.cpu,
    memory: options.memory,
    disk: options.disk
  })
  return buildResult(result, 'Colima 启动成功', '启动失败')
}

/**
 * 停止 Colima
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function stop() {
  const result = await invoke('colima_stop')
  return buildResult(result, 'Colima 停止成功', '停止失败')
}

/**
 * 删除 Colima 实例
 * @param {boolean} force - 是否强制删除
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function remove(force = false) {
  const result = await invoke('colima_delete', { force })
  return buildResult(result, 'Colima 删除成功', '删除失败')
}

// 默认导出所有方法
export default {
  getStatus,
  list,
  start,
  stop,
  remove
}
