<script setup>
const props = defineProps(['valor']);
</script>

<template>
  <div class="reporte-radio-wrapper">
    <div v-if="valor" class="reporte-radio-badge">
      <span>●</span> {{ valor }}
    </div>
    <span v-else style="color: #64748b; font-style: italic;">
      Sin selección
    </span>
  </div>
</template>

<style scoped>
@import './Radio.css';
</style>