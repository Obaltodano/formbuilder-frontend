<script setup>
import { ref, onUnmounted } from 'vue';
import CameraModal from '../CameraModal.vue';
import MediaPreview from '../../shared/MediaPreview.vue';

const props = defineProps({
  modelValue: { type: String, default: '' },
  id: { type: String, required: true }
});

const emit = defineEmits(['update:modelValue', 'archivoCapturado']);

const localFile = ref(null);
const showCamera = ref(false);

// Recibe la foto desde CameraModal
const alCapturarFoto = (file) => {
  localFile.value = file;
  
  // Notificamos texto al v-model
  emit('update:modelValue', `Foto capturada: ${file.name}`);
  
  // Notificamos archivo real al padre
  emit('archivoCapturado', { id: props.id, file });
  
  showCamera.value = false;
};

const handleRemovePhoto = () => {
  localFile.value = null;
  emit('update:modelValue', '');
  emit('archivoCapturado', { id: props.id, file: null });
};

const handlePreviewClick = (url) => {
  window.open(url, '_blank');
};

onUnmounted(() => {
  if (localFile.value) URL.revokeObjectURL(localFile.value);
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

    <MediaPreview 
      v-if="localFile"
      :file="localFile"
      type="foto"
      size="medium"
      removable
      @remove="handleRemovePhoto"
      @click="handlePreviewClick"
    />

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