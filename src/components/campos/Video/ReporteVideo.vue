<script setup>
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
    <div v-if="valor" class="report-video-wrapper">
      <video 
        :src="valor" 
        controls 
        class="report-video-player"
        preload="metadata"
      >
        Tu navegador no soporta la reproducción de video.
      </video>
      <div class="report-actions" style="margin-top: 5px;">
         <button @click="ampliarVideo" style="font-size: 0.7rem; background: none; border: none; color: #6366f1; cursor: pointer;">
           🔗 Abrir en nueva pestaña
         </button>
      </div>
    </div>
    <span v-else class="no-video-text">Sin video grabado</span>
  </div>
</template>

<style scoped>
@import './Video.css';
</style>