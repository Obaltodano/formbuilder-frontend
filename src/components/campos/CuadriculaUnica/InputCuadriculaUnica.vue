<script setup>
const props = defineProps(['modelValue', 'campo', 'id']); // modelValue debe ser un objeto {}
const emit = defineEmits(['update:modelValue']);

const actualizar = (fila, columna) => {
    const nuevoValor = { ...props.modelValue };
    nuevoValor[fila] = columna;
    emit('update:modelValue', nuevoValor);
};
</script>

<template>
  <div class="grid-container">
    <table class="grid-table">
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
              type="radio" 
              :name="id + '-' + fila" 
              :checked="modelValue[fila] === col"
              @change="actualizar(fila, col)"
              class="grid-radio"
            >
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
@import './CuadriculaUnica.css';
</style>