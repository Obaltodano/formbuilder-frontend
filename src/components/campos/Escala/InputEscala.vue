<script setup>
import { computed } from 'vue';
const props = defineProps(['modelValue', 'campo', 'id']);
const emit = defineEmits(['update:modelValue']);

const opcionesEscala = computed(() => {
  const min = props.campo.escalaConfig?.min ?? 1;
  const max = props.campo.escalaConfig?.max ?? 5;
  const lista = [];
  for (let i = min; i <= max; i++) {
    lista.push(i);
  }
  return lista;
});
</script>

<template>
  <div class="escala-field-wrapper">
    <span class="escala-num-label">{{ campo.escalaConfig?.min }}</span>
    
    <div class="escala-options">
      <label v-for="n in opcionesEscala" :key="n" class="escala-item">
        <input 
          type="radio" 
          :name="'escala-' + id" 
          :value="n" 
          :checked="modelValue == n"
          @change="emit('update:modelValue', n)"
        >
        <div class="escala-dot">{{ n }}</div>
      </label>
    </div>

    <span class="escala-num-label">{{ campo.escalaConfig?.max }}</span>
  </div>
</template>

<style scoped>
@import './Escala.css';
</style>