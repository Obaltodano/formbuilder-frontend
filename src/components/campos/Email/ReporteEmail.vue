<script setup>
const props = defineProps(['valor']);
</script>

<template>
  <div class="reporte-email-wrapper">
    <div v-if="valor && valor.includes('@')">
      <a :href="`mailto:${valor}`" class="reporte-email-link">
        <span>✉️</span> {{ valor }}
      </a>
    </div>
    <span v-else style="color: #64748b; font-style: italic;">
      {{ valor || 'No proporcionado' }}
    </span>
  </div>
</template>

<style scoped>
@import './Email.css';
</style>