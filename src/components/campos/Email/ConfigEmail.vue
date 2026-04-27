<script setup>
const props = defineProps(['campo']);
</script>

<template>
  <div class="config-email">
    <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 10px;">
      📧 Valida automáticamente que la respuesta sea un correo electrónico válido.
    </p>
    <div class="mini-settings">
      <label style="color: #cbd5e1; font-size: 0.75rem; display: block; margin-bottom: 5px;">
        Sugerencia interna:
      </label>
      <input 
        v-model="campo.placeholder" 
        placeholder="ejemplo@empresa.com" 
        style="width: 100%; padding: 6px; background: #0f172a; border: 1px solid #475569; color: white; border-radius: 4px;"
      >
    </div>
  </div>
</template>