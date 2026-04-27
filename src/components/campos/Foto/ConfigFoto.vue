<script setup>
const props = defineProps(['campo']);
</script>

<template>
  <div class="foto-config">
    <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 8px;">
      📸 Permite al usuario capturar una fotografía en tiempo real o subir una desde la galería.
    </p>
    <div class="mini-settings">
      <label style="color: #cbd5e1; font-size: 0.8rem;">
        <input type="checkbox" v-model="campo.soloCamara"> Forzar solo uso de cámara
      </label>
    </div>
  </div>
</template>