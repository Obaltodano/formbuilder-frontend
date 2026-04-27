<script setup>
const props = defineProps(['valor']);

// Genera el link de Google Maps basado en las coordenadas guardadas
const googleMapsUrl = () => {
  if (!props.valor) return '#';
  return `https://www.google.com/maps?q=${props.valor.replace(/\s/g, '')}`;
};
</script>

<template>
  <div class="reporte-gps-box">
    <div v-if="valor" class="gps-content">
      <a :href="googleMapsUrl()" target="_blank" class="report-gps-link">
        <span>📍 Ver en Mapa</span>
        <small style="font-size: 0.7rem;">({{ valor }})</small>
      </a>
    </div>
    <span v-else style="color: #64748b; font-style: italic;">Sin coordenadas</span>
  </div>
</template>

<style scoped>
@import './GPS.css';
</style>