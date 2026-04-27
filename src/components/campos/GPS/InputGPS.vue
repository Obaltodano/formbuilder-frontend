<script setup>
import { ref } from 'vue';

const props = defineProps(['modelValue', 'id']);
const emit = defineEmits(['update:modelValue']);
const cargando = ref(false);

const obtenerUbicacion = () => {
  if (!("geolocation" in navigator)) {
    return alert("Tu navegador no soporta geolocalización");
  }

  cargando.value = true;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const coords = `${pos.coords.latitude}, ${pos.coords.longitude}`;
      emit('update:modelValue', coords);
      cargando.value = false;
    },
    (err) => {
      alert("Error al obtener ubicación. Asegúrate de dar permisos de GPS.");
      cargando.value = false;
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
};
</script>

<template>
  <div class="gps-field-wrapper">
    <button 
      @click="obtenerUbicacion"
      type="button"
      class="btn-gps"
      :class="{ 'success': modelValue }"
      :disabled="cargando"
    >
      <span v-if="cargando">⌛ LOCALIZANDO...</span>
      <span v-else-if="modelValue">📍 UBICACIÓN CAPTURADA</span>
      <span v-else>📍 CAPTURAR UBICACIÓN</span>
    </button>

    <div v-if="modelValue && !cargando" class="gps-display">
      <span class="gps-value">{{ modelValue }}</span>
    </div>
  </div>
</template>

<style scoped>
@import './GPS.css';
</style>