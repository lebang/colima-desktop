/**
 * API 工具函数
 */

/**
 * 解析多行 JSON 输出 (docker --format json 输出每行一个 JSON)
 * @param {string} stdout - 命令输出
 * @returns {Array} 解析后的数组
 */
export function parseJsonLines(stdout) {
  if (!stdout || !stdout.trim()) return []
  
  return stdout
    .trim()
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      try {
        return JSON.parse(line)
      } catch (e) {
        console.warn('JSON 解析失败:', line)
        return null
      }
    })
    .filter(item => item !== null)
}

/**
 * 解析单个 JSON 对象
 * @param {string} stdout - 命令输出
 * @returns {Object|null} 解析后的对象
 */
export function parseJson(stdout) {
  if (!stdout || !stdout.trim()) return null
  try {
    return JSON.parse(stdout.trim())
  } catch (e) {
    console.warn('JSON 解析失败:', stdout)
    return null
  }
}

/**
 * 获取系统架构
 */
export function getSystemArch() {
  const platform = navigator.platform || ''
  if (platform.includes('arm') || platform.includes('aarch')) {
    return 'aarch64'
  }
  return 'x86_64'
}

/**
 * 构建操作结果
 * @param {Object} result - 命令执行结果
 * @param {string} successMsg - 成功消息
 * @param {string} failMsg - 失败消息
 */
export function buildResult(result, successMsg, failMsg = '操作失败') {
  return {
    success: result.success,
    message: result.success ? successMsg : (result.stderr || failMsg)
  }
}
