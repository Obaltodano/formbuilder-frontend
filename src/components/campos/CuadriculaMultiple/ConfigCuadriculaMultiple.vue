<script setup>
const props = defineProps(['campo']);

const agregar = (tipo) => {
    if (tipo === 'fila') props.campo.filas.push(`Pregunta ${props.campo.filas.length + 1}`);
    else props.campo.columnas.push(`Opción ${props.campo.columnas.length + 1}`);
};
</script>

<template>
  <div class="config-grid-multiple">
    <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 10px;">
      ✅ Matriz de selección múltiple. Permite marcar varios cuadros por fila.
    </p>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
      <div>
        <label style="color: #cbd5e1; font-size: 0.75rem;">Filas:</label>
        <div v-for="(f, i) in campo.filas" :key="i" style="display: flex; margin-bottom: 4px;">
          <input v-model="campo.filas[i]" style="flex: 1; background: #0f172a; color: white; border: 1px solid #475569; padding: 4px; border-radius: 3px;">
          <button @click="campo.filas.splice(i,1)" style="color:#ef4444; border:none; background:none;">×</button>
        </div>
        <button @click="agregar('fila')" style="width:100%; font-size:0.7rem; color:#10b981;">+ Añadir Fila</button>
      </div>

      <div>
        <label style="color: #cbd5e1; font-size: 0.75rem;">Columnas:</label>
        <div v-for="(c, i) in campo.columnas" :key="i" style="display: flex; margin-bottom: 4px;">
          <input v-model="campo.columnas[i]" style="flex: 1; background: #0f172a; color: white; border: 1px solid #475569; padding: 4px; border-radius: 3px;">
          <button @click="campo.columnas.splice(i,1)" style="color:#ef4444; border:none; background:none;">×</button>
        </div>
        <button @click="agregar('columna')" style="width:100%; font-size:0.7rem; color:#10b981;">+ Añadir Columna</button>
      </div>
    </div>
  </div>
</template>