<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    validator: (value) => ['foto', 'video'].includes(value)
  },
  alt: {
    type: String,
    default: 'Media preview'
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  }
});

const emit = defineEmits(['click', 'load', 'error']);

const isLoaded = ref(false);
const hasError = ref(false);
const shouldLoad = ref(false);
const elementRef = ref(null);

const sizeClasses = computed(() => {
  const sizes = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };
  return sizes[props.size];
});

const handleClick = () => {
  emit('click', props.src);
};

const handleLoad = () => {
  isLoaded.value = true;
  emit('load');
};

const handleError = () => {
  hasError.value = true;
  emit('error');
};

// Intersection Observer para lazy loading
const setupIntersectionObserver = () => {
  if (!('IntersectionObserver' in window)) {
    shouldLoad.value = true;
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          shouldLoad.value = true;
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: '50px' // Cargar 50px antes de que sea visible
    }
  );

  if (elementRef.value) {
    observer.observe(elementRef.value);
  }

  return observer;
};

onMounted(() => {
  const observer = setupIntersectionObserver();
  
  onUnmounted(() => {
    if (observer) {
      observer.disconnect();
    }
  });
});
</script>

<template>
  <div 
    ref="elementRef"
    class="lazy-media-preview"
    :class="[sizeClasses]"
    @click="handleClick"
  >
    <!-- Placeholder mientras carga -->
    <div v-if="!shouldLoad || (!isLoaded && !hasError)" class="media-placeholder">
      <div class="placeholder-spinner"></div>
      <span class="placeholder-text">Cargando...</span>
    </div>

    <!-- Error state -->
    <div v-else-if="hasError" class="media-error">
      <span class="error-icon">⚠️</span>
      <span class="error-text">Error al cargar</span>
    </div>

    <!-- Image -->
    <img
      v-else-if="type === 'foto' && shouldLoad"
      :src="src"
      :alt="alt"
      class="media-image"
      @load="handleLoad"
      @error="handleError"
      loading="lazy"
    />

    <!-- Video -->
    <video
      v-else-if="type === 'video' && shouldLoad"
      :src="src"
      class="media-video"
      controls
      preload="metadata"
      @loadstart="handleLoad"
      @error="handleError"
    />
  </div>
</template>

<style scoped>
.lazy-media-preview {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #f3f4f6;
  border: 2px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lazy-media-preview:hover {
  border-color: #6366f1;
  transform: scale(1.02);
}

.media-placeholder,
.media-error {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.placeholder-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.placeholder-text,
.error-text {
  font-size: 0.75rem;
  color: #6b7280;
}

.error-icon {
  font-size: 1.5rem;
}

.media-image,
.media-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  .lazy-media-preview {
    border-radius: 6px;
  }
  
  /* En móvil, los tamaños medium y large se reducen */
  .w-24 { width: 4.5rem; }
  .h-24 { height: 4.5rem; }
  
  .w-32 { width: 6rem; }
  .h-32 { height: 6rem; }
  
  .placeholder-text,
  .error-text {
    font-size: 0.65rem;
  }
}

/* ⭐ RESPONSIVE - Tablets */
@media (min-width: 481px) and (max-width: 768px) {
  .w-32 { width: 7rem; }
  .h-32 { height: 7rem; }
}

/* ⭐ Tocar para feedback táctil en dispositivos móviles */
@media (pointer: coarse) {
  .lazy-media-preview:active {
    transform: scale(0.95);
  }
}
</style>
