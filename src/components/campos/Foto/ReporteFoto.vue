<script setup>
// 'valor' suele ser la URL que viene de la base de datos (S3, Cloudinary, o tu servidor)
const props = defineProps(['valor']);

const verImagenGrande = () => {
  window.open(props.valor, '_blank');
};
</script>

<template>
  <div class="reporte-foto-box">
    <div v-if="valor" class="image-wrapper">
      <img 
        :src="valor" 
        alt="Evidencia" 
        class="report-image"
        @click="verImagenGrande"
        title="Click para ampliar"
      />
    </div>
    <span v-else style="color: #64748b; font-style: italic;">Sin imagen</span>
  </div>
</template>

<style scoped>
@import './Foto.css';
</style>