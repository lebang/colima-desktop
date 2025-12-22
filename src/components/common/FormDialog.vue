<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: '500px'
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  loading: {
    type: Boolean,
    default: false
  },
  tip: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const handleClose = () => {
  emit('update:modelValue', false)
  emit('cancel')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<template>
  <el-dialog 
    :model-value="modelValue" 
    :title="title" 
    :width="width"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <el-form label-width="80px">
      <slot />
      <el-alert 
        v-if="tip"
        :title="tip" 
        type="info" 
        :closable="false"
        show-icon
        style="margin-top: 12px"
      />
    </el-form>
    <template #footer>
      <el-button @click="handleClose">{{ cancelText }}</el-button>
      <el-button type="primary" :loading="loading" @click="handleConfirm">{{ confirmText }}</el-button>
    </template>
  </el-dialog>
</template>
