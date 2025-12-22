<script setup>
defineProps({
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  emptyText: {
    type: String,
    default: '暂无数据'
  }
})
</script>

<template>
  <el-card shadow="never" class="data-table-card">
    <el-table :data="data" stripe style="width: 100%" v-loading="loading">
      <slot />
    </el-table>
    
    <!-- 空状态 -->
    <el-empty v-if="!loading && data.length === 0" :description="emptyText" />
  </el-card>
</template>

<style scoped lang="less">
.data-table-card {
  // ID列样式
  :deep(.cell-id) {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 12px;
    color: #909399;
  }
  
  // 可点击ID样式
  :deep(.cell-id-link) {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 12px;
    color: #409eff;
    cursor: pointer;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  // 名称列样式
  :deep(.cell-name) {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    color: #303133;
    
    .el-icon {
      color: #409eff;
    }
  }
  
  // 次要文本样式
  :deep(.cell-secondary) {
    font-size: 12px;
    color: #909399;
  }
  
  // 代码样式
  :deep(.cell-code) {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 12px;
    color: #606266;
  }
}
</style>
