<script setup>
import { ref } from 'vue';

const props = defineProps(['modelValue', 'id', 'accept']);
const emit = defineEmits(['update:modelValue', 'archivoSeleccionado']);

const inputRef = ref(null);

const triggerClick = () => {
  inputRef.value.click();
};

const manejarCambio = (event) => {
  const archivo = event.target.files[0];
  if (archivo) {
    // Emitimos el nombre para el v-model (vista)
    emit('update:modelValue', archivo.name);
    // Emitimos el objeto File real para el envío al servidor
    emit('archivoSeleccionado', { id: props.id, file: archivo });
  }
};
</script>

<template>
  <div class="archivo-field-wrapper">
    <input 
      type="file" 
      ref="inputRef"
      class="input-file-hidden"
      :accept="accept || '*'"
      @change="manejarCambio"
    >
    
    <button 
      @click="triggerClick"
      type="button"
      class="btn-file"
      :class="{ 'has-file': modelValue }"
    >
      <span v-if="!modelValue">📁 ADJUNTAR ARCHIVO</span>
      <span v-else>📄 CAMBIAR ARCHIVO</span>
    </button>

    <div v-if="modelValue" class="file-info-badge">
      <span>📎 {{ modelValue }}</span>
    </div>
  </div>
</template>

<style scoped>
@import './Archivo.css';
</style>