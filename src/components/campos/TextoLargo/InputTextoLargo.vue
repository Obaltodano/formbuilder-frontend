<script setup>
const props = defineProps(['modelValue', 'campo']);
const emit = defineEmits(['update:modelValue']);

const handleInput = (e) => {
  emit('update:modelValue', e.target.value);
};
</script>

<template>
  <div class="texto-largo-wrapper">
    <textarea 
      :value="modelValue"
      @input="handleInput"
      class="input-area"
      :placeholder="campo?.placeholder || 'Escriba aquí sus observaciones...'"
      :required="campo?.requerido"
    ></textarea>
  </div>
</template>

<style scoped>
@import './TextoLargo.css';
</style>