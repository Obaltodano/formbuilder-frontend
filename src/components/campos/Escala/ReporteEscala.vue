<script setup>
import { computed } from 'vue';
const props = defineProps(['valor', 'campo']);

const porcentaje = computed(() => {
  const min = props.campo?.escalaConfig?.min ?? 1;
  const max = props.campo?.escalaConfig?.max ?? 5;
  const val = props.valor ?? 0;
  return ((val - min) / (max - min)) * 100;
});
</script>

<template>
  <div class="reporte-escala-container">
    <strong style="color: #818cf8; font-size: 1.1rem;">{{ valor || 0 }}</strong>
    
    <div class="reporte-escala-fill">
      <div class="fill-bar" :style="{ width: porcentaje + '%' }"></div>
    </div>
    
    <small style="color: #64748b;">/ {{ campo?.escalaConfig?.max }}</small>
  </div>
</template>

<style scoped>
@import './Escala.css';
</style>