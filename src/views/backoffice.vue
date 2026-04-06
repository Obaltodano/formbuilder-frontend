<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios';

const reportes = ref([]);

onMounted(async () => {
  try {
    const res = await api.get('/backoffice/reportes-globales');
    reportes.value = res.data;
  } catch (err) {
    console.error("Error", err);
  }
});

// Reutilizamos tus funciones de utilidad (esFoto, esCoordenada, obtenerUrlImagen)
// ... (las mismas que definimos en el paso anterior)
</script>

<template>
  <div class="backoffice-page">
    <header class="header-global">
      <h1>MONITOR CLOUD - TODAS LAS EMPRESAS</h1>
    </header>

    <table class="tabla-global">
      <thead>
        <tr>
          <th>Empresa (ID)</th>
          <th>Usuario</th>
          <th>Formulario</th>
          <th>Fecha</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="rep in reportes" :key="rep._id">
          <td><span class="badge-empresa">{{ rep.usuarioId?.empresaId }}</span></td>
          <td>{{ rep.usuarioId?.nombre }}</td>
          <td>{{ rep.formularioId?.titulo }}</td>
          <td>{{ new Date(rep.fechaEnvio).toLocaleString() }}</td>
          <td><button @click="verDetalle(rep)">👁️ Ver</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* Estilos segmentados en tu hoja de backoffice.css */
@import url('../styles/backoffice.css');
</style>