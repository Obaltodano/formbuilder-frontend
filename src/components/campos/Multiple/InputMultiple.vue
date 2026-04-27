<script setup>
const props = defineProps(['modelValue', 'campo']); // modelValue debe ser un Array []
const emit = defineEmits(['update:modelValue']);

const toggleOpcion = (opc) => {
  let nuevaLista = [...props.modelValue];
  if (nuevaLista.includes(opc)) {
    nuevaLista = nuevaLista.filter(item => item !== opc);
  } else {
    nuevaLista.push(opc);
  }
  emit('update:modelValue', nuevaLista);
};
</script>

<template>
  <div class="multiple-field-wrapper">
    <label 
      v-for="opc in campo.opciones" 
      :key="opc" 
      class="check-item"
      :class="{ 'active': modelValue.includes(opc) }"
    >
      <input 
        type="checkbox" 
        :checked="modelValue.includes(opc)"
        @change="toggleOpcion(opc)"
      >
      <span class="check-label">{{ opc }}</span>
    </label>
  </div>
</template>

<style scoped>
@import './Multiple.css';
</style>