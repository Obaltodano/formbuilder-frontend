<script setup>
const props = defineProps(['campo']);

const agregarOpcion = () => {
  props.campo.opciones.push(`Opción ${props.campo.opciones.length + 1}`);
};

const eliminarOpcion = (index) => {
  if (props.campo.opciones.length > 1) {
    props.campo.opciones.splice(index, 1);
  }
};
</script>

<template>
  <div class="config-radio">
    <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 12px;">
      🔘 Opciones de selección única. El usuario solo puede marcar una.
    </p>
    
    <div class="options-manager">
      <div v-for="(opc, i) in campo.opciones" :key="i" 
           style="display: flex; gap: 8px; margin-bottom: 8px;">
        <input 
          v-model="campo.opciones[i]" 
          class="opt-input"
          style="flex: 1; padding: 6px; background: #0f172a; border: 1px solid #475569; color: white; border-radius: 4px;"
        >
        <button @click="eliminarOpcion(i)" style="background: none; border: none; cursor: pointer;">❌</button>
      </div>
      <button @click="agregarOpcion" 
              style="width: 100%; padding: 8px; background: #334155; color: #38bdf8; border: 1px dashed #38bdf8; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: bold; margin-top: 5px;">
        + AÑADIR OPCIÓN
      </button>
    </div>
  </div>
</template>