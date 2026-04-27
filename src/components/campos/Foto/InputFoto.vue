<script setup>
import { ref, onUnmounted } from 'vue';
// Importamos el mismo modal compartido
import CameraModal from '../CameraModal.vue'; 

const props = defineProps({
  modelValue: { type: String, default: '' },
  id: { type: String, required: true }
});

const emit = defineEmits(['update:modelValue', 'archivoCapturado']);

const localPreview = ref(null);
const showCamera = ref(false);

// Recibe la foto desde CameraModal
const alCapturarFoto = (file) => {
  if (localPreview.value) URL.revokeObjectURL(localPreview.value);
  
  localPreview.value = URL.createObjectURL(file);
  
  // Notificamos texto al v-model
  emit('update:modelValue', `Foto capturada: ${file.name}`);
  
  // Notificamos archivo real al padre
  emit('archivoCapturado', { id: props.id, file });
  
  showCamera.value = false;
};

onUnmounted(() => {
  if (localPreview.value) URL.revokeObjectURL(localPreview.value);
});
</script>

<template>
  <div class="foto-field-wrapper">
    <button 
      @click="showCamera = true"
      type="button"
      class="btn-foto"
      :class="{ 'success': modelValue }"
    >
      <div class="btn-content">
        <span class="icon">{{ modelValue ? '📸' : '📷' }}</span>
        <span class="text">{{ modelValue ? 'CAMBIAR FOTO' : 'TOMAR FOTO' }}</span>
      </div>
    </button>

    <transition name="fade-preview">
      <div v-if="localPreview" class="preview-container">
        <div class="preview-badge">FOTO CAPTURADA</div>
        <img :src="localPreview" class="img-preview" />
      </div>
    </transition>

    <CameraModal 
      v-if="showCamera"
      tipo="foto"
      @close="showCamera = false"
      @capture="alCapturarFoto"
    />
  </div>
</template>



<style scoped>
@import './Foto.css';
</style>