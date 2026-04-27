<script setup>
const props = defineProps(['valor']); // valor es un objeto { "Fila 1": "Columna A", ... }
</script>

<template>
  <div class="reporte-grid-wrapper">
    <div v-if="valor && Object.keys(valor).length > 0">
      <div v-for="(val, key) in valor" :key="key" class="reporte-grid-item">
        <span class="reporte-grid-key">{{ key }}:</span>
        <span class="reporte-grid-val">{{ val }}</span>
      </div>
    </div>
    <span v-else style="color: #64748b; font-style: italic;">Sin respuestas</span>
  </div>
</template>

<style scoped>
@import './CuadriculaUnica.css';
</style>