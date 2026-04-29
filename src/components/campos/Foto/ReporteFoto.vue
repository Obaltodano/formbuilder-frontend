<script setup>
import LazyMediaPreview from '../../shared/LazyMediaPreview.vue';

// 'valor' suele ser la URL que viene de la base de datos (S3, Cloudinary, o tu servidor)
const props = defineProps(['valor']);

const verImagenGrande = () => {
  window.open(props.valor, '_blank');
};
</script>

<template>
  <div class="reporte-foto-box">
    <LazyMediaPreview 
      v-if="valor"
      :src="valor"
      type="foto"
      size="large"
      alt="Evidencia"
      @click="verImagenGrande"
    />
    <span v-else class="no-media-text">Sin imagen</span>
  </div>
</template>

<style scoped>
@import './Foto.css';
</style>