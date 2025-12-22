<script setup>
import { computed } from 'vue'
import { Odometer, Monitor, Files, Coin, Connection, Setting, Expand, Fold } from '@element-plus/icons-vue'
import { t } from '@/languages'

const props = defineProps({
  activeMenu: {
    type: String,
    default: 'dashboard'
  },
  isCollapse: {
    type: Boolean,
    default: false
  },
  translate: {
    type: Function,
    default: null
  }
})

// 翻译函数，优先使用传入的translate，否则使用默认的t
const $t = (text) => {
  return props.translate ? props.translate(text) : t(text)
}

const emit = defineEmits(['select', 'toggle-collapse'])

const handleMenuSelect = (index) => {
  emit('select', index)
}

const toggleCollapse = () => {
  emit('toggle-collapse')
}
</script>

<template>
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
        <template #title>{{ $t('仪表盘') }}</template>
      </el-menu-item>
      
      <el-menu-item index="containers">
        <el-icon><Monitor /></el-icon>
        <template #title>{{ $t('容器') }}</template>
      </el-menu-item>
      
      <el-menu-item index="images">
        <el-icon><Files /></el-icon>
        <template #title>{{ $t('镜像') }}</template>
      </el-menu-item>
      
      <el-menu-item index="volumes">
        <el-icon><Coin /></el-icon>
        <template #title>{{ $t('数据卷') }}</template>
      </el-menu-item>
      
      <el-menu-item index="networks">
        <el-icon><Connection /></el-icon>
        <template #title>{{ $t('网络') }}</template>
      </el-menu-item>

      <el-menu-item index="settings">
        <el-icon><Setting /></el-icon>
        <template #title>{{ $t('设置') }}</template>
      </el-menu-item>
    </el-menu>

    <!-- 折叠按钮 -->
    <div class="collapse-btn" @click="toggleCollapse">
      <el-icon v-if="isCollapse"><Expand /></el-icon>
      <el-icon v-else><Fold /></el-icon>
    </div>
  </el-aside>
</template>

<style scoped lang="less">
.app-aside {
  background-color: var(--color-bg-sidebar, #fff);
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid var(--color-border, #e4e7ed);
  box-shadow: 2px 0 8px var(--color-shadow, rgba(0, 0, 0, 0.05));
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  border-bottom: 1px solid var(--color-border, #e4e7ed);
  
  .logo-img {
    width: 28px;
    height: 28px;
  }
  
  .logo-text {
    margin-left: 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-primary, #303133);
    white-space: nowrap;
  }
}

.app-menu {
  flex: 1;
  border-right: none;
  background: transparent;
  
  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    color: var(--color-text-regular, #606266);
    
    &:hover {
      background-color: rgba(64, 158, 255, 0.1);
      color: #409eff;
    }
  }
  
  :deep(.el-menu-item.is-active) {
    background-color: rgba(64, 158, 255, 0.15);
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
  color: var(--color-text-secondary, #909399);
  border-top: 1px solid var(--color-border, #e4e7ed);
  
  &:hover {
    color: #409eff;
    background-color: rgba(64, 158, 255, 0.1);
  }
}
</style>
