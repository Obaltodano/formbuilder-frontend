<script setup>
import { ref, computed } from 'vue';

const props = defineProps(['modelValue', 'campo']);
const emit = defineEmits(['update:modelValue']);

const dirty = ref(false);

// Solo permite números, un solo punto decimal y signos negativos si el mínimo lo permite
const validarTecla = (e) => {
  const charCode = e.which ? e.which : e.keyCode;
  const charStr = String.fromCharCode(charCode);

  // Permitir teclas de control (Backspace, Delete, flechas) - la mayoría de navegadores lo hacen por defecto
  // Bloquear si no es número ni punto
  if (!/[\d.]/.test(charStr)) {
    e.preventDefault();
  }

  // Evitar más de un punto decimal
  if (charStr === '.' && props.modelValue?.toString().includes('.')) {
    e.preventDefault();
  }
};

// Validación de rango para el feedback visual
const error = computed(() => {
  if (!dirty.value) return null;
  const val = parseFloat(props.modelValue);
  
  if (props.campo?.requerido && (props.modelValue === '' || props.modelValue === null)) {
    return 'Campo obligatorio';
  }
  
  if (!isNaN(val)) {
    if (props.campo?.min !== undefined && val < props.campo.min) return `Mínimo: ${props.campo.min}`;
    if (props.campo?.max !== undefined && val > props.campo.max) return `Máximo: ${props.campo.max}`;
  }
  return null;
});

const handleInput = (e) => {
  dirty.value = true;
  emit('update:modelValue', e.target.value);
};
</script>

<template>
  <div class="numero-field-wrapper">
    <input 
      type="number"
      :value="modelValue"
      @input="handleInput"
      @keypress="validarTecla"
      @blur="dirty = true"
      class="input-numero"
      :class="{ 'input-error': error }"
      :placeholder="campo?.placeholder || '0.00'"
      :min="campo?.min"
      :max="campo?.max"
      :step="campo?.paso || 'any'"
      inputmode="decimal" 
    >
    <transition name="fade">
      <span v-if="error" class="error-text">{{ error }}</span>
    </transition>
  </div>
</template>

<style scoped>
@import './Numero.css';
</style>