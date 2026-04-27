<script setup>
const props = defineProps(['valor']);
</script>

<template>
  <div class="reporte-numero-wrapper">
    <span v-if="valor !== null && valor !== undefined && valor !== ''" class="reporte-numero-badge">
      {{ valor }}
    </span>
    <span v-else style="color: #64748b; font-style: italic;">0</span>
  </div>
</template>

<style scoped>
@import './Numero.css';
</style>