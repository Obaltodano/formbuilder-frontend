<script setup>
const props = defineProps(['valor']);
</script>

<template>
  <div class="reporte-dropdown-wrapper">
    <div v-if="valor" class="reporte-dropdown-value">
      {{ valor }}
    </div>
    <span v-else style="color: #64748b; font-style: italic;">
      Sin selección
    </span>
  </div>
</template>

<style scoped>
@import './Dropdown.css';
</style>