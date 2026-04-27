<script setup>
const props = defineProps(['campo']);

// Inicializar escalaConfig si no existe
if (!props.campo.escalaConfig) {
  props.campo.escalaConfig = { min: 1, max: 5 };
}
</script>

<template>
  <div class="config-escala">
    <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 12px;">
      📈 Define un rango numérico para que el usuario califique.
    </p>
    
    <div style="display: flex; align-items: center; gap: 15px; background: #0f172a; padding: 10px; border-radius: 8px;">
      <div style="flex: 1;">
        <label style="color: #cbd5e1; font-size: 0.75rem; display: block;">Mínimo (0 o 1):</label>
        <select v-model="campo.escalaConfig.min" style="width: 100%; padding: 5px; background: #1e293b; color: white; border: 1px solid #475569;">
          <option :value="0">0</option>
          <option :value="1">1</option>
        </select>
      </div>
      <span style="color: #475569; margin-top: 15px;">hasta</span>
      <div style="flex: 1;">
        <label style="color: #cbd5e1; font-size: 0.75rem; display: block;">Máximo (2 al 10):</label>
        <select v-model="campo.escalaConfig.max" style="width: 100%; padding: 5px; background: #1e293b; color: white; border: 1px solid #475569;">
          <option v-for="n in 9" :key="n" :value="n + 1">{{ n + 1 }}</option>
        </select>
      </div>
    </div>
  </div>
</template>