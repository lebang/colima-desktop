<script setup>
defineProps({
  title: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="page-header">
    <h2>{{ title }}</h2>
    <div class="header-actions">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="less">
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }
  
  .header-actions {
    display: flex;
    gap: 12px;
  }
}
</style>
