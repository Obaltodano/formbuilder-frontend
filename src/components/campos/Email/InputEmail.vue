<script setup>
import { ref, computed } from 'vue';

const props = defineProps(['modelValue', 'campo']);
const emit = defineEmits(['update:modelValue']);

// Controla si el usuario ya interactuó con el input
const dirty = ref(false);

// Validación mediante Expresión Regular
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Computed para determinar validez
const isValid = computed(() => {
  if (!props.modelValue) return !props.campo?.requerido;
  return emailRegex.test(props.modelValue);
});

// Solo muestra error si el campo fue tocado y es inválido
const showError = computed(() => dirty.value && !isValid.value);

const handleInput = (e) => {
  if (!dirty.value) dirty.value = true;
  emit('update:modelValue', e.target.value);
};

const handleBlur = () => {
  dirty.value = true;
};
</script>

<template>
  <div class="email-field-wrapper">
    <input 
      type="email"
      :value="modelValue"
      @input="handleInput"
      @blur="handleBlur"
      class="input-email"
      :class="{ 
        'input-error': showError, 
        'input-success': dirty && isValid && modelValue 
      }"
      :placeholder="campo?.placeholder || 'correo@ejemplo.com'"
      :required="campo?.requerido"
    >
    <transition name="fade">
      <span v-if="showError" class="error-message">
        Formato de correo no válido
      </span>
    </transition>
  </div>
</template>

<style scoped>
/* Importamos el CSS externo si lo prefieres así, 
   o simplemente asegúrate de que el archivo Email.css esté cargado */
@import "./Email.css";
</style>