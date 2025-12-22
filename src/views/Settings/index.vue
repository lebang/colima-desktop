<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Monitor, Connection, Setting, Plus, Check, Warning, InfoFilled } from '@element-plus/icons-vue'
import { useColimaStore } from '@/stores/colima'
import { i18nScope, t, change } from '@/languages'
import { ElMessage, ElMessageBox } from 'element-plus'

// Store
const colimaStore = useColimaStore()

// 响应式语言触发器
const langTrigger = ref(0)
let offChange
onMounted(() => {
  offChange = i18nScope.on('change', () => {
    langTrigger.value++
  })
  // 初始化主题
  applyTheme(themeConfig.value.theme)
})
onUnmounted(() => {
  offChange && offChange.off()
})

// 翻译函数
const $t = (text) => {
  // 使用 langTrigger 确保响应式
  langTrigger.value
  return t(text)
}

// ========== Colima 配置 ==========
const colimaConfig = ref({
  cpu: 4,
  memory: 8,
  disk: 60,
  runtime: 'docker',
  arch: 'aarch64',
  autoStart: false
})

// 原始配置（用于比较是否修改）
const originalConfig = ref({})

// 从 Store 同步配置
const syncConfigFromStore = () => {
  const info = colimaStore.vmInfo
  if (info.cpu > 0) {
    colimaConfig.value = {
      cpu: info.cpu,
      memory: Math.round(info.memory / 1024 / 1024 / 1024), // bytes -> GB
      disk: Math.round(info.disk / 1024 / 1024 / 1024), // bytes -> GB
      runtime: info.runtime || 'docker',
      arch: info.arch || 'aarch64',
      autoStart: localStorage.getItem('colima-autostart') === 'true'
    }
    originalConfig.value = { ...colimaConfig.value }
  }
}

// 监听 store 变化
watch(() => colimaStore.vmInfo, syncConfigFromStore, { immediate: true, deep: true })

// 配置是否已修改
const configModified = computed(() => {
  return JSON.stringify(colimaConfig.value) !== JSON.stringify(originalConfig.value)
})

// 应用 Colima 配置（需要重启）
const applyColimaConfig = async () => {
  if (!colimaStore.isRunning) {
    ElMessage.warning($t('Colima 未运行，无法应用配置'))
    return
  }

  try {
    await ElMessageBox.confirm(
      $t('修改配置需要重启 Colima 虚拟机，确定要继续吗？'),
      $t('提示'),
      {
        confirmButtonText: $t('确定'),
        cancelButtonText: $t('取消'),
        type: 'warning'
      }
    )

    // 保存开机自启设置到 localStorage
    localStorage.setItem('colima-autostart', colimaConfig.value.autoStart)

    // TODO: 调用后端 API 重启 Colima 并应用新配置
    // 目前 Colima 不支持热修改配置，需要删除重建
    ElMessage.info($t('配置已保存，重启后生效'))
    originalConfig.value = { ...colimaConfig.value }
  } catch {
    // 取消操作
  }
}

// ========== 镜像加速器配置 ==========
const registryMirrors = ref([])
const newMirror = ref('')

// 从 localStorage 加载镜像加速器配置
onMounted(() => {
  const saved = localStorage.getItem('registry-mirrors')
  if (saved) {
    try {
      registryMirrors.value = JSON.parse(saved)
    } catch {
      registryMirrors.value = []
    }
  }
})

// 添加镜像加速器
const addMirror = () => {
  const url = newMirror.value.trim()
  if (!url) {
    ElMessage.warning($t('请输入镜像加速器地址'))
    return
  }
  if (!/^https?:\/\//.test(url)) {
    ElMessage.warning($t('请输入有效的 URL 地址'))
    return
  }
  if (registryMirrors.value.includes(url)) {
    ElMessage.warning($t('该地址已存在'))
    return
  }
  registryMirrors.value.push(url)
  newMirror.value = ''
  saveMirrors()
  ElMessage.success($t('添加成功'))
}

// 删除镜像加速器
const removeMirror = (index) => {
  registryMirrors.value.splice(index, 1)
  saveMirrors()
  ElMessage.success($t('删除成功'))
}

// 保存镜像加速器配置
const saveMirrors = () => {
  localStorage.setItem('registry-mirrors', JSON.stringify(registryMirrors.value))
}

// ========== 界面设置 ==========
const themeConfig = ref({
  theme: localStorage.getItem('app-theme') || 'auto',
  language: i18nScope.activeLanguage || 'zh-CN'
})

// 监听语言变化
watch(() => themeConfig.value.language, async (newLang) => {
  if (newLang !== i18nScope.activeLanguage) {
    try {
      await change(newLang)
      ElMessage.success($t('语言切换成功'))
    } catch (error) {
      console.error('Failed to change language:', error)
      ElMessage.error($t('语言切换失败'))
    }
  }
})

// 监听主题变化
watch(() => themeConfig.value.theme, (newTheme) => {
  applyTheme(newTheme)
  localStorage.setItem('app-theme', newTheme)
  ElMessage.success($t('主题切换成功'))
})

// 应用主题
const applyTheme = (theme) => {
  const html = document.documentElement
  html.classList.remove('light', 'dark')

  if (theme === 'auto') {
    // 跟随系统
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    html.classList.add(prefersDark ? 'dark' : 'light')
  } else {
    html.classList.add(theme)
  }
}

// 语言选项
const languageOptions = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' }
]

// 主题选项
const themeOptions = computed(() => [
  { label: $t('跟随系统'), value: 'auto' },
  { label: $t('浅色'), value: 'light' },
  { label: $t('深色'), value: 'dark' }
])

// 运行时选项
const runtimeOptions = [
  { label: 'Docker', value: 'docker' },
  { label: 'Containerd', value: 'containerd' }
]

// 架构选项
const archOptions = [
  { label: 'aarch64 (Apple Silicon)', value: 'aarch64' },
  { label: 'x86_64 (Intel)', value: 'x86_64' }
]
</script>

<template>
  <div class="settings-page" :key="langTrigger">
    <div class="page-header">
      <h2>{{ $t('设置') }}</h2>
    </div>

    <!-- Colima 配置 -->
    <el-card shadow="never" class="settings-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon><Monitor /></el-icon>
            <span>{{ $t('Colima 虚拟机配置') }}</span>
          </div>
          <div class="header-right">
            <el-tag v-if="colimaStore.isRunning" type="success" size="small">
              {{ $t('运行中') }}
            </el-tag>
            <el-tag v-else type="info" size="small">
              {{ $t('已停止') }}
            </el-tag>
          </div>
        </div>
      </template>

      <!-- 配置修改警告 -->
      <el-alert
        v-if="configModified"
        :title="$t('配置已修改，需要重启 Colima 才能生效')"
        type="warning"
        :closable="false"
        show-icon
        style="margin-bottom: 20px"
      />

      <el-form :model="colimaConfig" label-width="120px">
        <el-row :gutter="40">
          <el-col :span="12">
            <el-form-item :label="$t('CPU 核心数')">
              <el-input-number v-model="colimaConfig.cpu" :min="1" :max="16" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('内存') + ' (GB)'">
              <el-input-number v-model="colimaConfig.memory" :min="2" :max="64" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="40">
          <el-col :span="12">
            <el-form-item :label="$t('磁盘空间') + ' (GB)'">
              <el-input-number v-model="colimaConfig.disk" :min="10" :max="500" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('容器运行时')">
              <el-select v-model="colimaConfig.runtime" style="width: 100%">
                <el-option 
                  v-for="opt in runtimeOptions" 
                  :key="opt.value" 
                  :label="opt.label" 
                  :value="opt.value" 
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="40">
          <el-col :span="12">
            <el-form-item :label="$t('架构')">
              <el-select v-model="colimaConfig.arch" style="width: 100%">
                <el-option 
                  v-for="opt in archOptions" 
                  :key="opt.value" 
                  :label="opt.label" 
                  :value="opt.value" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('开机自启')">
              <el-switch v-model="colimaConfig.autoStart" />
              <el-tooltip :content="$t('需要系统权限支持')" placement="top">
                <el-icon style="margin-left: 8px; color: #909399; cursor: help;">
                  <InfoFilled />
                </el-icon>
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>

        <div class="form-actions">
          <el-button 
            type="primary" 
            :disabled="!configModified"
            @click="applyColimaConfig"
          >
            <el-icon><Check /></el-icon>
            {{ $t('应用并重启') }}
          </el-button>
        </div>
      </el-form>
    </el-card>

    <!-- 镜像加速器配置 -->
    <el-card shadow="never" class="settings-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon><Connection /></el-icon>
            <span>{{ $t('镜像加速器') }}</span>
          </div>
        </div>
      </template>

      <el-alert
        :title="$t('镜像加速器配置保存在本地，需要手动配置到 Docker daemon.json 中')"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 16px"
      />

      <div class="mirror-list" v-if="registryMirrors.length > 0">
        <el-tag
          v-for="(mirror, index) in registryMirrors"
          :key="index"
          closable
          size="large"
          class="mirror-tag"
          @close="removeMirror(index)"
        >
          {{ mirror }}
        </el-tag>
      </div>
      <el-empty v-else :description="$t('暂无镜像加速器')" :image-size="60" />

      <div class="add-mirror">
        <el-input
          v-model="newMirror"
          :placeholder="$t('输入镜像加速器地址，如 https://mirror.example.com')"
          style="width: 400px; margin-right: 12px"
          @keyup.enter="addMirror"
        />
        <el-button type="primary" :icon="Plus" @click="addMirror">
          {{ $t('添加') }}
        </el-button>
      </div>
    </el-card>

    <!-- 界面设置 -->
    <el-card shadow="never" class="settings-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon><Setting /></el-icon>
            <span>{{ $t('界面设置') }}</span>
          </div>
        </div>
      </template>

      <el-form :model="themeConfig" label-width="120px">
        <el-row :gutter="40">
          <el-col :span="12">
            <el-form-item :label="$t('主题')">
              <el-select v-model="themeConfig.theme" style="width: 100%">
                <el-option
                  v-for="opt in themeOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('语言')">
              <el-select v-model="themeConfig.language" style="width: 100%">
                <el-option
                  v-for="opt in languageOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 关于 -->
    <el-card shadow="never" class="settings-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon><InfoFilled /></el-icon>
            <span>{{ $t('关于') }}</span>
          </div>
        </div>
      </template>

      <div class="about-info">
        <div class="about-item">
          <span class="label">{{ $t('应用名称') }}：</span>
          <span class="value">Colima Desktop</span>
        </div>
        <div class="about-item">
          <span class="label">{{ $t('版本') }}：</span>
          <span class="value">0.1.0</span>
        </div>
        <div class="about-item">
          <span class="label">{{ $t('描述') }}：</span>
          <span class="value">{{ $t('Colima 的图形化管理工具，让 Docker 管理更简单') }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="less">
.settings-page {
  padding: 20px;
  max-width: 900px;
}

.page-header {
  margin-bottom: 20px;

  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--color-text-primary, #303133);
  }
}

.settings-card {
  margin-bottom: 20px;

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;

      .el-icon {
        color: #409eff;
      }
    }
  }
}

.form-actions {
  padding-top: 12px;
  border-top: 1px solid var(--color-border, #ebeef5);
  margin-top: 12px;
}

.mirror-list {
  margin-bottom: 16px;
  min-height: 40px;

  .mirror-tag {
    margin-right: 8px;
    margin-bottom: 8px;
  }
}

.add-mirror {
  display: flex;
  align-items: center;
  margin-top: 16px;
}

.about-info {
  .about-item {
    padding: 8px 0;
    display: flex;
    
    .label {
      color: var(--color-text-secondary, #909399);
      width: 100px;
    }
    
    .value {
      color: var(--color-text-primary, #303133);
    }
  }
}
</style>
