<script setup>
import { ref } from 'vue'
import { Monitor, Connection, Setting, Plus, Check } from '@element-plus/icons-vue'

// Colima 配置
const colimaConfig = ref({
  cpu: 4,
  memory: 8,
  disk: 60,
  runtime: 'docker',
  arch: 'aarch64',
  autoStart: false
})

// 镜像加速器配置
const registryMirrors = ref([
  'https://registry.docker-cn.com',
  'https://mirror.ccs.tencentyun.com'
])

const newMirror = ref('')

// 主题设置
const themeConfig = ref({
  theme: 'auto',
  language: 'zh-CN'
})

// 添加镜像加速器
const addMirror = () => {
  if (newMirror.value && !registryMirrors.value.includes(newMirror.value)) {
    registryMirrors.value.push(newMirror.value)
    newMirror.value = ''
  }
}

// 删除镜像加速器
const removeMirror = (index) => {
  registryMirrors.value.splice(index, 1)
}

// 保存配置
const saveConfig = () => {
  console.log('保存配置:', colimaConfig.value)
}
</script>

<template>
  <div class="settings-page">
    <div class="page-header">
      <h2>设置</h2>
    </div>

    <!-- Colima 配置 -->
    <el-card shadow="never" class="settings-card">
      <template #header>
        <div class="card-header">
          <el-icon><Monitor /></el-icon>
          <span>Colima 虚拟机配置</span>
        </div>
      </template>
      
      <el-form :model="colimaConfig" label-width="120px">
        <el-row :gutter="40">
          <el-col :span="12">
            <el-form-item label="CPU 核心数">
              <el-input-number v-model="colimaConfig.cpu" :min="1" :max="16" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="内存 (GB)">
              <el-input-number v-model="colimaConfig.memory" :min="2" :max="64" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="40">
          <el-col :span="12">
            <el-form-item label="磁盘空间 (GB)">
              <el-input-number v-model="colimaConfig.disk" :min="10" :max="500" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="容器运行时">
              <el-select v-model="colimaConfig.runtime" style="width: 100%">
                <el-option label="Docker" value="docker" />
                <el-option label="Containerd" value="containerd" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="40">
          <el-col :span="12">
            <el-form-item label="架构">
              <el-select v-model="colimaConfig.arch" style="width: 100%">
                <el-option label="aarch64 (Apple Silicon)" value="aarch64" />
                <el-option label="x86_64" value="x86_64" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开机自启">
              <el-switch v-model="colimaConfig.autoStart" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 镜像加速器配置 -->
    <el-card shadow="never" class="settings-card">
      <template #header>
        <div class="card-header">
          <el-icon><Connection /></el-icon>
          <span>镜像加速器</span>
        </div>
      </template>
      
      <div class="mirror-list">
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
      
      <div class="add-mirror">
        <el-input 
          v-model="newMirror" 
          placeholder="输入镜像加速器地址，如 https://mirror.example.com"
          style="width: 400px; margin-right: 12px"
        />
        <el-button type="primary" :icon="Plus" @click="addMirror">添加</el-button>
      </div>
    </el-card>

    <!-- 界面设置 -->
    <el-card shadow="never" class="settings-card">
      <template #header>
        <div class="card-header">
          <el-icon><Setting /></el-icon>
          <span>界面设置</span>
        </div>
      </template>
      
      <el-form :model="themeConfig" label-width="120px">
        <el-row :gutter="40">
          <el-col :span="12">
            <el-form-item label="主题">
              <el-select v-model="themeConfig.theme" style="width: 100%">
                <el-option label="跟随系统" value="auto" />
                <el-option label="浅色" value="light" />
                <el-option label="深色" value="dark" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="语言">
              <el-select v-model="themeConfig.language" style="width: 100%">
                <el-option label="简体中文" value="zh-CN" />
                <el-option label="English" value="en-US" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 保存按钮 -->
    <div class="save-actions">
      <el-button type="primary" size="large" @click="saveConfig">
        <el-icon><Check /></el-icon>
        保存配置
      </el-button>
    </div>
  </div>
</template>

<style scoped lang="less">
.settings-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
  
  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }
}

.settings-card {
  margin-bottom: 20px;
  
  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    
    .el-icon {
      color: #409eff;
    }
  }
}

.mirror-list {
  margin-bottom: 16px;
  
  .mirror-tag {
    margin-right: 8px;
    margin-bottom: 8px;
  }
}

.add-mirror {
  display: flex;
  align-items: center;
}

.save-actions {
  text-align: center;
  padding: 20px 0;
}
</style>
