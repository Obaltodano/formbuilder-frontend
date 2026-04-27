<script setup>
const props = defineProps(['campo']);
</script>

<template>
  <div class="archivo-config">
    <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 8px;">
      📎 Permite al usuario adjuntar documentos (PDF, DOCX, XLSX, etc).
    </p>
    <div class="mini-settings">
      <label style="color: #cbd5e1; font-size: 0.8rem; display: block; margin-bottom: 5px;">
        Extensiones permitidas (separadas por coma):
      </label>
      <input 
        v-model="campo.accept" 
        placeholder=".pdf, .docx, .xlsx" 
        style="width: 100%; padding: 5px; background: #0f172a; border: 1px solid #334155; color: white; border-radius: 4px;"
      >
    </div>
  </div>
</template>