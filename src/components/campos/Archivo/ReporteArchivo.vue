<script setup>
const props = defineProps(['valor']);

// Función para obtener un nombre legible si el valor es una URL
const nombreArchivo = () => {
  if (!props.valor) return '';
  return props.valor.split('/').pop();
};
</script>

<template>
  <div class="reporte-archivo-box">
    <div v-if="valor" class="file-content">
      <a :href="valor" target="_blank" class="report-file-link" download>
        <span>📂 Descargar Archivo</span>
      </a>
      <p style="font-size: 0.7rem; color: #64748b; margin-top: 4px;">
        {{ nombreArchivo() }}
      </p>
    </div>
    <span v-else style="color: #64748b; font-style: italic;">Sin adjunto</span>
  </div>
</template>

<style scoped>
@import './Archivo.css';
</style>