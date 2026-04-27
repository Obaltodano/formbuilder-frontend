<script setup>
import { computed } from 'vue';
// Importamos todos los inputs desde nuestro índice
import {
  InputVideo,
  InputFoto,
  InputGPS,
  InputArchivo,
  InputTextoCorto,
  InputTextoLargo,
  InputNumero,
  InputEmail,
  InputRadio,
  InputMultiple,
  InputDropdown,
  InputEscala,
  InputCuadriculaUnica,
  InputCuadriculaMultiple
} from './index.js';

const props = defineProps({
  campo: Object,      // El objeto del campo que viene de la DB
  modelValue: [String, Number, Array, Object], // La respuesta vinculada con v-model
  id: String          // ID único del campo
});

const emit = defineEmits(['update:modelValue', 'archivoCapturado', 'solicitarCamara']);

/**
 * Mapeo de tipos de la base de datos a componentes Vue.
 * Asegúrate de que los strings coincidan con el "tipo" que guardas en el constructor.
 */
const componenteDinamico = computed(() => {
  const mapa = {
    'video': InputVideo,
    'foto': InputFoto,
    'gps': InputGPS,
    'adjunto': InputArchivo,
    'texto_corto': InputTextoCorto,
    'texto_largo': InputTextoLargo,
    'numero': InputNumero,
    'email': InputEmail,
    'radio': InputRadio,
    'multiple': InputMultiple,
    'dropdown': InputDropdown,
    'escala': InputEscala,
    'cuadricula_unica': InputCuadriculaUnica,
    'cuadricula_multiple': InputCuadriculaMultiple
  };

  return mapa[props.campo.tipo] || null;
});

// Manejador para archivos (Fotos, Videos, Adjuntos)
const alCapturarArchivo = (payload) => {
  emit('archivoCapturado', payload);
};
</script>

<template>
  <div class="campo-render-container">
    <component
      :is="componenteDinamico"
      v-if="componenteDinamico"
      :campo="campo"
      :id="id"
      :modelValue="modelValue"
      @update:modelValue="val => emit('update:modelValue', val)"
      @archivoCapturado="alCapturarArchivo"
      @archivoSeleccionado="alCapturarArchivo"
      @solicitarCamara="val => emit('solicitarCamara', val)"
    />
    
    <div v-else class="error-render">
      ⚠️ Tipo de campo no soportado: {{ campo.tipo }}
    </div>
  </div>
</template>

<style scoped>
.campo-render-container {
  width: 100%;
}
.error-render {
  padding: 10px;
  background: #fef2f2;
  color: #991b1b;
  border: 1px dashed #ef4444;
  border-radius: 8px;
  font-size: 0.8rem;
}
</style>