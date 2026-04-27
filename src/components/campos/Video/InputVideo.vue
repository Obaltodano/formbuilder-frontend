<script setup>
import { ref } from 'vue';
import CameraModal from '../CameraModal.vue';

const props = defineProps(['modelValue', 'id']);
const emit = defineEmits(['update:modelValue', 'archivoCapturado']);
const showCam = ref(false);
const previewUrl = ref(null);

const finalizar = (file) => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = URL.createObjectURL(file);
  emit('update:modelValue', `Video: ${file.name}`);
  emit('archivoCapturado', { id: props.id, file });
  showCam.value = false;
};
</script>

<template>
  <div class="field-box">
    <button @click="showCam = true" type="button" class="btn-action" :class="{ 'has-file': modelValue }">
      {{ modelValue ? '🎥 CAMBIAR VIDEO' : '📹 GRABAR VIDEO' }}
    </button>
    
    <video v-if="previewUrl" :src="previewUrl" controls class="mini-preview"></video>

    <CameraModal v-if="showCam" tipo="video" @close="showCam = false" @capture="finalizar" />
  </div>
</template>

<style scoped>
@import './Video.css';
</style>