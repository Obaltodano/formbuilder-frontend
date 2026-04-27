<script setup>
import { computed } from 'vue';
// Importamos todos los componentes de configuración desde el índice
import {
  ConfigArchivo,
  ConfigCuadriculaMultiple,
  ConfigCuadriculaUnica,
  ConfigDropdown,
  ConfigEmail,
  ConfigEscala,
  ConfigFoto,
  ConfigGPS,
  ConfigMultiple,
  ConfigNumero,
  ConfigRadio,
  ConfigTextoCorto,
  ConfigTextoLargo,
  ConfigVideo
} from './index.js';

const props = defineProps({
  campo: {
    type: Object,
    required: true
  }
});

/**
 * Mapeo para el Constructor (Settings)
 */
const componenteConfig = computed(() => {
  const mapa = {
    'video': ConfigVideo,
    'foto': ConfigFoto,
    'gps': ConfigGPS,
    'adjunto': ConfigArchivo,
    'texto_corto': ConfigTextoCorto,
    'texto_largo': ConfigTextoLargo,
    'numero': ConfigNumero,
    'email': ConfigEmail,
    'radio': ConfigRadio,
    'multiple': ConfigMultiple,
    'dropdown': ConfigDropdown,
    'escala': ConfigEscala,
    'cuadricula_unica': ConfigCuadriculaUnica,
    'cuadricula_multiple': ConfigCuadriculaMultiple
  };

  return mapa[props.campo.tipo] || null;
});
</script>

<template>
  <div class="config-render-container">
    <div v-if="componenteConfig">
      <h4 class="config-title">Configuración de {{ campo.tipo.replace('_', ' ') }}</h4>
      
      <component 
        :is="componenteConfig" 
        :campo="campo" 
      />
    </div>
    
    <div v-else class="no-config-msg">
      Selecciona un campo para ver sus ajustes específicos.
    </div>
  </div>
</template>

<style scoped>
.config-render-container {
  width: 100%;
  padding: 10px;
  background: #1e293b;
  border-radius: 8px;
}

.config-title {
  color: #38bdf8;
  font-size: 0.9rem;
  text-transform: uppercase;
  margin-bottom: 15px;
  border-bottom: 1px solid #334155;
  padding-bottom: 8px;
}

.no-config-msg {
  color: #64748b;
  text-align: center;
  font-size: 0.85rem;
  padding: 20px;
}
</style>