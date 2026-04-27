<script setup>
const props = defineProps(['modelValue', 'campo', 'id']);
const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div class="radio-field-wrapper">
    <label 
      v-for="opc in campo.opciones" 
      :key="opc" 
      class="radio-item"
      :class="{ 'active': modelValue === opc }"
    >
      <input 
        type="radio" 
        :name="'radio-' + id" 
        :value="opc" 
        :checked="modelValue === opc"
        @change="emit('update:modelValue', opc)"
      >
      <span class="radio-label">{{ opc }}</span>
    </label>
  </div>
</template>

<style scoped>
@import './Radio.css';
</style>