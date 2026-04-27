<script setup>
const props = defineProps(['campo']);
</script>

<template>
  <div class="config-numero">
    <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 10px;">
      🔢 Campo numérico. Ideal para cantidades, medidas o folios.
    </p>
    <div class="mini-settings-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
      <div>
        <label style="color: #cbd5e1; font-size: 0.75rem; display: block;">Mínimo:</label>
        <input type="number" v-model="campo.min" style="width: 100%; padding: 5px; background: #0f172a; border: 1px solid #475569; color: white; border-radius: 4px;">
      </div>
      <div>
        <label style="color: #cbd5e1; font-size: 0.75rem; display: block;">Máximo:</label>
        <input type="number" v-model="campo.max" style="width: 100%; padding: 5px; background: #0f172a; border: 1px solid #475569; color: white; border-radius: 4px;">
      </div>
    </div>
  </div>
</template>