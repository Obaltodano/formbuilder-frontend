<script setup>
import { ref } from 'vue';

const props = defineProps(['modelValue', 'campo']);
const emit = defineEmits(['update:modelValue']);

const handleInput = (e) => {
  emit('update:modelValue', e.target.value);
};
</script>

<template>
  <div class="texto-corto-wrapper">
    <input 
      type="text"
      :value="modelValue"
      @input="handleInput"
      class="input-corto"
      :placeholder="campo?.placeholder || 'Escriba su respuesta...'"
      :required="campo?.requerido"
    >
  </div>
</template>

<style scoped>
@import './TextoCorto.css';
</style>