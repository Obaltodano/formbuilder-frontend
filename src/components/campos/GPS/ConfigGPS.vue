<script setup>
const props = defineProps(['campo']);
</script>

<template>
  <div class="gps-config">
    <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 8px;">
      📍 Este campo capturará automáticamente la ubicación geográfica del usuario mediante el sensor GPS del dispositivo.
    </p>
    <div class="mini-settings">
      <label style="color: #cbd5e1; font-size: 0.8rem;">
        <input type="checkbox" v-model="campo.requerido"> Requerir precisión alta
      </label>
    </div>
  </div>
</template>