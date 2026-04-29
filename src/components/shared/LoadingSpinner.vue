<script setup>
import { computed } from 'vue';

const props = defineProps({
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  color: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'white', 'black'].includes(value)
  },
  text: {
    type: String,
    default: ''
  }
});

const sizeClasses = computed(() => {
  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };
  return sizes[props.size];
});

const colorClasses = computed(() => {
  const colors = {
    primary: 'border-blue-600 border-t-transparent',
    secondary: 'border-gray-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    black: 'border-black border-t-transparent'
  };
  return colors[props.color];
});
</script>

<template>
  <div class="loading-spinner-container">
    <div 
      class="loading-spinner"
      :class="[sizeClasses, colorClasses]"
    ></div>
    <div v-if="text" class="loading-text">{{ text }}</div>
  </div>
</template>

<style scoped>
.loading-spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.loading-spinner {
  border: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
