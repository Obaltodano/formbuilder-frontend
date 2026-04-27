<script setup>
const props = defineProps(['valor']);
</script>

<template>
  <div class="reporte-texto-wrapper">
    <span v-if="valor && valor.trim() !== ''" class="reporte-texto">
      {{ valor }}
    </span>
    <span v-else class="reporte-vacio">
      (Sin respuesta)
    </span>
  </div>
</template>

<style scoped>
@import './TextoCorto.css';
</style>