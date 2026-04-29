<script setup>
import { ref, onUnmounted } from 'vue';
import CameraModal from '../CameraModal.vue';
import MediaPreview from '../../shared/MediaPreview.vue';

const props = defineProps(['modelValue', 'id']);
const emit = defineEmits(['update:modelValue', 'archivoCapturado']);
const showCam = ref(false);
const localFile = ref(null);

const finalizar = (file) => {
  localFile.value = file;
  emit('update:modelValue', `Video: ${file.name}`);
  emit('archivoCapturado', { id: props.id, file });
  showCam.value = false;
};

const handleRemoveVideo = () => {
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
  <div class="field-box">
    <button @click="showCam = true" type="button" class="btn-action" :class="{ 'has-file': modelValue }">
      {{ modelValue ? ' CAMBIAR VIDEO' : ' GRABAR VIDEO' }}
    </button>
    
    <MediaPreview 
      v-if="localFile"
      :file="localFile"
      type="video"
      size="medium"
      removable
      @remove="handleRemoveVideo"
      @click="handlePreviewClick"
    />

    <CameraModal v-if="showCam" tipo="video" @close="showCam = false" @capture="finalizar" />
  </div>
</template>

<style scoped>
@import './Video.css';
</style>