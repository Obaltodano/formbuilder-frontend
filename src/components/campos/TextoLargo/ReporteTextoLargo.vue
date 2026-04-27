<script setup>
const props = defineProps(['valor']);
</script>

<template>
  <div class="reporte-largo-wrapper">
    <div v-if="valor && valor.trim() !== ''" class="reporte-parrafo">
      {{ valor }}
    </div>
    <span v-else style="color: #64748b; font-style: italic;">
      (Sin observaciones)
    </span>
  </div>
</template>

<style scoped>
@import './TextoLargo.css';
</style>