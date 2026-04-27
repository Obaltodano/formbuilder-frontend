<script setup>
const props = defineProps(['valor']); // valor es un Array de strings
</script>

<template>
  <div class="reporte-multiple-wrapper">
    <div v-if="valor && valor.length > 0" class="reporte-multiple-container">
      <span v-for="item in valor" :key="item" class="reporte-multiple-tag">
        {{ item }}
      </span>
    </div>
    <span v-else style="color: #64748b; font-style: italic;">
      Ninguna seleccionada
    </span>
  </div>
</template>

<style scoped>
@import './Multiple.css';
</style>