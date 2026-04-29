<script setup>
import LazyMediaPreview from '../../shared/LazyMediaPreview.vue';

/**
 * @param {string} valor - URL completa del video (ej. https://api.tu-servidor.com/uploads/video.mp4)
 */
const props = defineProps(['valor']);

// Función opcional para abrir el video en pantalla completa o nueva pestaña
const ampliarVideo = () => {
  if (props.valor) {
    window.open(props.valor, '_blank');
  }
};
</script>

<template>
  <div class="reporte-video-box">
    <LazyMediaPreview 
      v-if="valor"
      :src="valor"
      type="video"
      size="large"
      alt="Video evidencia"
      @click="ampliarVideo"
    />
    <span v-else class="no-media-text">Sin video grabado</span>
  </div>
</template>

<style scoped>
@import './Video.css';
</style>