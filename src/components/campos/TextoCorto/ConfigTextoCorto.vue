<script setup>
const props = defineProps(['campo']);
</script>

<template>
  <div class="config-texto-corto">
    <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 10px;">
      🔡 Campo ideal para nombres, apellidos o respuestas breves.
    </p>
    <div class="mini-settings">
      <div style="margin-bottom: 8px;">
        <label style="color: #cbd5e1; font-size: 0.8rem; display: block;">Texto de sugerencia (Placeholder):</label>
        <input 
          v-model="campo.placeholder" 
          placeholder="Ej: Escriba aquí..." 
          style="width: 100%; padding: 6px; background: #0f172a; border: 1px solid #475569; color: white; border-radius: 4px;"
        >
      </div>
    </div>
  </div>
</template>