<script setup>
import { ref, computed, onUnmounted } from 'vue';

const props = defineProps({
  file: {
    type: [File, String],
    required: true
  },
  type: {
    type: String,
    required: true,
    validator: (value) => ['foto', 'video'].includes(value)
  },
  removable: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  }
});

const emit = defineEmits(['remove', 'click']);

const previewUrl = ref(null);
const isLoading = ref(true);
const hasError = ref(false);

const isFile = computed(() => props.file instanceof File);
const isUrl = computed(() => typeof props.file === 'string');

const sizeClasses = computed(() => {
  const sizes = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };
  return sizes[props.size];
});

const generatePreview = async () => {
  if (isUrl.value) {
    previewUrl.value = props.file;
    isLoading.value = false;
    return;
  }

  if (isFile.value) {
    try {
      previewUrl.value = URL.createObjectURL(props.file);
      isLoading.value = false;
    } catch (error) {
      console.error('Error generating preview:', error);
      hasError.value = true;
      isLoading.value = false;
    }
  }
};

const handleRemove = (event) => {
  event.stopPropagation();
  emit('remove');
};

const handleClick = () => {
  emit('click', previewUrl.value);
};

onUnmounted(() => {
  if (previewUrl.value && isFile.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
});

generatePreview();
</script>

<template>
  <div class="media-preview" :class="[sizeClasses, { 'removable': removable }]">
    <!-- Loading State -->
    <div v-if="isLoading" class="preview-loading">
      <div class="loading-spinner"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="hasError" class="preview-error">
      <span class="error-icon">⚠️</span>
    </div>

    <!-- Image Preview -->
    <div v-else-if="type === 'foto'" class="preview-container" @click="handleClick">
      <img 
        :src="previewUrl" 
        alt="Preview" 
        class="preview-image"
        loading="lazy"
      />
      <button v-if="removable" @click="handleRemove" class="remove-btn">
        ×
      </button>
    </div>

    <!-- Video Preview -->
    <div v-else-if="type === 'video'" class="preview-container" @click="handleClick">
      <video 
        :src="previewUrl" 
        class="preview-video"
        muted
        preload="metadata"
      />
      <div class="video-overlay">
        <span class="play-icon">▶️</span>
      </div>
      <button v-if="removable" @click="handleRemove" class="remove-btn">
        ×
      </button>
    </div>
  </div>
</template>

<style scoped>
.media-preview {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #f3f4f6;
  border: 2px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s ease;
}

.media-preview:hover {
  border-color: #6366f1;
  transform: scale(1.02);
}

.preview-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.preview-image,
.preview-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.preview-container:hover .video-overlay {
  opacity: 1;
}

.play-icon {
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ef4444;
  color: white;
  border: none;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.remove-btn:hover {
  background: #dc2626;
}

.preview-loading,
.preview-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-icon {
  font-size: 1.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Size variations - Base */
.w-16 { width: 4rem; }
.h-16 { height: 4rem; }

.w-24 { width: 6rem; }
.h-24 { height: 6rem; }

.w-32 { width: 8rem; }
.h-32 { height: 8rem; }

/* ⭐ RESPONSIVE - Adaptación para móviles pequeños */
@media (max-width: 480px) {
  .media-preview {
    border-radius: 6px;
  }
  
  /* En móvil, los tamaños medium y large se reducen */
  .w-24 { width: 4.5rem; }
  .h-24 { height: 4.5rem; }
  
  .w-32 { width: 6rem; }
  .h-32 { height: 6rem; }
  
  /* Small se mantiene igual para no ser muy pequeño */
  
  .remove-btn {
    width: 18px;
    height: 18px;
    font-size: 10px;
    top: 2px;
    right: 2px;
  }
  
  .play-icon {
    font-size: 1.5rem;
  }
}

/* ⭐ RESPONSIVE - Tablets */
@media (min-width: 481px) and (max-width: 768px) {
  .w-32 { width: 7rem; }
  .h-32 { height: 7rem; }
}

/* ⭐ Tocar para prevenir zoom en iOS Safari */
@media (pointer: coarse) {
  .media-preview:active {
    transform: scale(0.95);
  }
}
</style>
