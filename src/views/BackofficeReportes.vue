<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios';

const reportesGlobales = ref([]);
const cargando = ref(true);

// Detectamos la URL base del backend para las fotos
const urlBaseBackend = 'http://localhost:3000'; 

const cargarReportesGlobales = async () => {
  try {
    const res = await api.get('/backoffice/reportes-globales');
    reportesGlobales.value = res.data;
  } catch (err) {
    console.error("Error al cargar reportes", err);
  } finally {
    cargando.value = false;
  }
};

// Función crítica para corregir las rutas de las fotos
const formatearRutaImagen = (pathOriginal) => {
  if (!pathOriginal) return null;
  // Si la ruta ya es una URL completa, la dejamos así
  if (pathOriginal.startsWith('http')) return pathOriginal;
  
  // Limpiamos barras invertidas de Windows y aseguramos que empiece correctamente
  const rutaLimpia = pathOriginal.replace(/\\/g, '/');
  return `${urlBaseBackend}/${rutaLimpia}`;
};

onMounted(cargarReportesGlobales);
</script>

<template>
  <div class="backoffice-reportes">
    <div v-if="!cargando" class="table-container">
      <table class="global-table">
        <thead>
          <tr>
            <th>Empresa</th>
            <th>Usuario</th>
            <th>Formulario</th>
            <th>Fecha</th>
            <th>Evidencia</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rep in reportesGlobales" :key="rep._id">
            <td><span class="badge-empresa">{{ rep.usuarioId?.empresaId || 'S/E' }}</span></td>
            <td>{{ rep.usuarioId?.nombre }}</td>
            <td>{{ rep.formularioId?.titulo }}</td>
            <td>{{ new Date(rep.fechaEnvio).toLocaleString() }}</td>
            <td>
              <div v-if="rep.datos?.fotosUrl && rep.datos.fotosUrl.length > 0" class="mini-gallery">
                <img 
                  :src="formatearRutaImagen(rep.datos.fotosUrl[0])" 
                  class="thumb-mini"
                  @click="verImagenGrande(rep.datos.fotosUrl[0])"
                />
              </div>
              <span v-else class="no-data">Sin evidencia</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
@import '../styles/BackofficeReportes.css';
/* Estilos para que se vea profesional como en tu captura */

</style>