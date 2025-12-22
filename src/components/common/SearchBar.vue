<script setup>
import { Search, Refresh } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '搜索...'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'refresh'])

const handleInput = (val) => {
  emit('update:modelValue', val)
}

const handleRefresh = () => {
  emit('refresh')
}
</script>

<template>
  <el-card shadow="never" class="search-bar">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-input 
          :model-value="modelValue"
          :placeholder="placeholder" 
          :prefix-icon="Search"
          clearable
          @update:model-value="handleInput"
        />
      </el-col>
      <el-col :span="6">
        <!-- 筛选插槽 -->
        <slot name="filter" />
      </el-col>
      <el-col :span="10" style="text-align: right">
        <slot name="extra" />
        <el-button :icon="Refresh" :loading="loading" @click="handleRefresh">刷新</el-button>
      </el-col>
    </el-row>
  </el-card>
</template>

<style scoped lang="less">
.search-bar {
  margin-bottom: 20px;
}
</style>
