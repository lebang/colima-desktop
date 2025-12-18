<script setup>
import { ref, shallowRef, markRaw, computed } from 'vue'
import { useColimaStore } from '../stores'
import { Odometer, Box, Monitor, Files, Coin, Connection, Setting, Expand, Fold, VideoPlay, VideoPause } from '@element-plus/icons-vue'
import Dashboard from '../views/Dashboard.vue'
import Containers from '../views/Containers.vue'
import Images from '../views/Images.vue'
import Volumes from '../views/Volumes.vue'
import Networks from '../views/Networks.vue'
import Settings from '../views/Settings.vue'

const colimaStore = useColimaStore()

// 当前激活的菜单
const activeMenu = ref('dashboard')

// 侧边栏折叠状态
const isCollapse = ref(false)

// 页面组件映射
const pageComponents = {
  dashboard: markRaw(Dashboard),
  containers: markRaw(Containers),
  images: markRaw(Images),
  volumes: markRaw(Volumes),
  networks: markRaw(Networks),
  settings: markRaw(Settings)
}

// 页面标题映射
const pageTitles = {
  dashboard: '仪表盘',
  containers: '容器管理',
  images: '镜像管理',
  volumes: '数据卷管理',
  networks: '网络管理',
  settings: '设置'
}

// 获取当前页面标题
const pageTitle = computed(() => pageTitles[activeMenu.value] || '仪表盘')

// 当前显示的组件
const currentComponent = shallowRef(pageComponents.dashboard)

// 菜单点击处理
const handleMenuSelect = (index) => {
  activeMenu.value = index
  currentComponent.value = pageComponents[index]
}

// 切换侧边栏折叠
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}
</script>

<template>
  <el-container class="app-layout">
    <!-- 侧边栏 -->
<el-aside :width="isCollapse ? '64px' : '180px'" class="app-aside">
      <!-- Logo 区域 -->
      <div class="logo-container">
        <img src="/colima-logo.svg" alt="Colima" class="logo-img" />
        <span v-show="!isCollapse" class="logo-text">Colima Desktop</span>
      </div>

      <!-- 导航菜单 -->
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        class="app-menu"
        @select="handleMenuSelect"
      >
        <el-menu-item index="dashboard">
          <el-icon><Odometer /></el-icon>
          <template #title>仪表盘</template>
        </el-menu-item>
        
        <el-sub-menu index="docker">
          <template #title>
            <el-icon><Box /></el-icon>
            <span>Docker 管理</span>
          </template>
          <el-menu-item index="containers">
            <el-icon><Monitor /></el-icon>
            <template #title>容器</template>
          </el-menu-item>
          <el-menu-item index="images">
            <el-icon><Files /></el-icon>
            <template #title>镜像</template>
          </el-menu-item>
          <el-menu-item index="volumes">
            <el-icon><Coin /></el-icon>
            <template #title>数据卷</template>
          </el-menu-item>
          <el-menu-item index="networks">
            <el-icon><Connection /></el-icon>
            <template #title>网络</template>
          </el-menu-item>
        </el-sub-menu>

        <el-menu-item index="settings">
          <el-icon><Setting /></el-icon>
          <template #title>设置</template>
        </el-menu-item>
      </el-menu>

      <!-- 折叠按钮 -->
      <div class="collapse-btn" @click="toggleCollapse">
        <el-icon v-if="isCollapse"><Expand /></el-icon>
        <el-icon v-else><Fold /></el-icon>
      </div>
    </el-aside>

    <!-- 主内容区 -->
    <el-container class="main-container">
      <!-- 顶部栏 -->
      <el-header class="app-header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>首页</el-breadcrumb-item>
<el-breadcrumb-item>{{ pageTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <!-- Colima 状态指示器 -->
          <el-tooltip :content="colimaStore.isRunning ? 'Colima 运行中' : 'Colima 已停止'" placement="bottom">
            <div class="status-indicator">
              <span :class="['status-dot', colimaStore.isRunning ? 'running' : 'stopped']"></span>
              <span class="status-text">{{ colimaStore.isRunning ? '运行中' : '已停止' }}</span>
            </div>
          </el-tooltip>
          
          <!-- 快捷操作 -->
          <el-button-group class="quick-buttons">
            <el-button 
              :type="colimaStore.isRunning ? 'danger' : 'success'" 
              size="small"
              @click="colimaStore.isRunning ? colimaStore.setVmStatus('stopped') : colimaStore.setVmStatus('running')"
            >
              <el-icon>
                <VideoPause v-if="colimaStore.isRunning" />
                <VideoPlay v-else />
              </el-icon>
              {{ colimaStore.isRunning ? '停止' : '启动' }}
            </el-button>
          </el-button-group>
        </div>
      </el-header>

      <!-- 内容区 -->
      <el-main class="app-main">
        <component :is="currentComponent" />
      </el-main>
    </el-container>
  </el-container>
</template>



<style scoped lang="less">
.app-layout {
  height: 100vh;
  width: 100vw;
}

.app-aside {
  background-color: #fff;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid #e4e7ed;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  border-bottom: 1px solid #e4e7ed;
  
  .logo-img {
    width: 28px;
    height: 28px;
  }
  
  .logo-text {
    margin-left: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    white-space: nowrap;
  }
}

.app-menu {
  flex: 1;
  border-right: none;
  background: transparent;
  
  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    color: #606266;
    
    &:hover {
      background-color: #ecf5ff;
      color: #409eff;
    }
  }
  
  :deep(.el-menu-item.is-active) {
    background-color: #ecf5ff;
    color: #409eff;
    border-right: 3px solid #409eff;
  }
  
  :deep(.el-sub-menu.is-opened > .el-sub-menu__title) {
    color: #409eff;
  }
}

.collapse-btn {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #909399;
  border-top: 1px solid #e4e7ed;
  
  &:hover {
    color: #409eff;
    background-color: #ecf5ff;
  }
}

.main-container {
  background-color: #f5f7fa;
}

.app-header {
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  background-color: #f5f7fa;
  
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    
    &.running {
      background-color: #67c23a;
      box-shadow: 0 0 8px #67c23a;
    }
    
    &.stopped {
      background-color: #f56c6c;
    }
  }
  
  .status-text {
    font-size: 13px;
    color: #606266;
  }
}

.app-main {
  padding: 0;
  overflow-y: auto;
  background-color: #f5f7fa;
}
</style>
