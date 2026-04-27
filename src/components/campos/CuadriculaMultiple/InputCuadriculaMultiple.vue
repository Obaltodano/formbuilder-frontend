<script setup>
const props = defineProps(['modelValue', 'campo', 'id']);
const emit = defineEmits(['update:modelValue']);

const toggleSeleccion = (fila, columna) => {
    const respuestas = { ...props.modelValue };
    
    if (!respuestas[fila]) {
        respuestas[fila] = [];
    }

    if (respuestas[fila].includes(columna)) {
        respuestas[fila] = respuestas[fila].filter(c => c !== columna);
    } else {
        respuestas[fila].push(columna);
    }
    
    emit('update:modelValue', respuestas);
};
</script>

<template>
  <div class="grid-multiple-container">
    <table class="grid-multiple-table">
      <thead>
        <tr>
          <th></th>
          <th v-for="col in campo.columnas" :key="col">{{ col }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="fila in campo.filas" :key="fila">
          <td class="fila-label">{{ fila }}</td>
          <td v-for="col in campo.columnas" :key="col">
            <input 
              type="checkbox" 
              :checked="modelValue[fila]?.includes(col)"
              @change="toggleSeleccion(fila, col)"
              class="grid-checkbox"
            >
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
@import './CuadriculaMultiple.css';
</style>