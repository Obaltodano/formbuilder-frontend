<script setup>
const props = defineProps(['valor']); // { "Fila": ["A", "B"] }
</script>

<template>
  <div class="reporte-grid-multiple-wrapper">
    <div v-if="valor && Object.keys(valor).length > 0">
      <div v-for="(lista, fila) in valor" :key="fila" class="reporte-grid-multiple-row">
        <div style="font-weight: 600; font-size: 0.85rem; color: #f1f5f9;">{{ fila }}</div>
        <div class="tags-container">
          <span v-for="item in lista" :key="item" class="tag-multiple">
            {{ item }}
          </span>
          <span v-if="lista.length === 0" style="color:#64748b; font-size: 0.7rem;">(Sin selección)</span>
        </div>
      </div>
    </div>
    <span v-else style="color: #64748b; font-style: italic;">Sin respuestas capturadas</span>
  </div>
</template>

<style scoped>
@import './CuadriculaMultiple.css';
</style>