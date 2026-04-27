<script setup>
const props = defineProps(['modelValue', 'campo']);
const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div class="dropdown-field-wrapper">
    <select 
      :value="modelValue"
      @change="emit('update:modelValue', $event.target.value)"
      class="input-select"
      :required="campo?.requerido"
    >
      <option value="" disabled selected>{{ campo?.placeholder || 'Seleccione una opción...' }}</option>
      <option v-for="opc in campo.opciones" :key="opc" :value="opc">
        {{ opc }}
      </option>
    </select>
  </div>
</template>

<style scoped>
@import './Dropdown.css';
</style>