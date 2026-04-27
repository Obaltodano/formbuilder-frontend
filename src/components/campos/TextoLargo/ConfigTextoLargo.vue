<script setup>
const props = defineProps(['campo']);
</script>

<template>
  <div class="config-texto-largo">
    <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 10px;">
      📄 Úsalo para párrafos, observaciones o descripciones detalladas.
    </p>
    <div class="mini-settings">
      <label style="color: #cbd5e1; font-size: 0.8rem; display: block; margin-bottom: 5px;">
        Instrucciones de llenado (Placeholder):
      </label>
      <textarea 
        v-model="campo.placeholder" 
        placeholder="Ej: Describa detalladamente el hallazgo..." 
        style="width: 100%; padding: 8px; background: #0f172a; border: 1px solid #475569; color: white; border-radius: 4px; min-height: 60px;"
      ></textarea>
    </div>
  </div>
</template>