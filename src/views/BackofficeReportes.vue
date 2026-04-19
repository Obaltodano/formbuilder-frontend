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
    <header class="report-header">
      <div class="header-content">
        <span class="badge-master">GLOBAL AUDIT</span>
        <h1>Reportes Globales</h1>
        <p>Monitoreo en tiempo real de todas las empresas registradas</p>
      </div>
      <div class="header-stats" v-if="reportesGlobales.length">
        <div class="stat-item">
          <span class="stat-value">{{ reportesGlobales.length }}</span>
          <span class="stat-label">TOTAL ENVÍOS</span>
        </div>
      </div>
    </header>

    <div v-if="cargando" class="loader-container">
      <div class="spinner"></div>
      <p>Sincronizando datos globales...</p>
    </div>

    <div v-else class="table-container">
      <table class="global-table">
        <thead>
          <tr>
            <th>Empresa</th>
            <th>Usuario / Empleado</th>
            <th>Formulario</th>
            <th>Fecha de Envío</th>
            <th class="text-center">Evidencia</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rep in reportesGlobales" :key="rep._id" class="global-row">
            <td>
              <span class="badge-empresa">
                {{ rep.usuarioId?.empresaId || 'S/E' }}
              </span>
            </td>
            <td>
              <div class="user-info-cell">
                <span class="user-main-name">{{ rep.usuarioId?.nombre || 'Desconocido' }}</span>
                <span class="user-sub-id">ID: {{ rep.usuarioId?._id?.slice(-6) }}</span>
              </div>
            </td>
            <td>
              <div class="form-title-cell">
                <span class="icon-form">📄</span>
                {{ rep.formularioId?.titulo || 'Formulario Eliminado' }}
              </div>
            </td>
            <td>
              <div class="date-cell">
                <span class="date-primary">{{ new Date(rep.fechaEnvio).toLocaleDateString() }}</span>
                <span class="date-secondary">{{ new Date(rep.fechaEnvio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</span>
              </div>
            </td>
            <td class="text-center">
              <div v-if="rep.datos?.fotosUrl && rep.datos.fotosUrl.length > 0" class="mini-gallery">
                <div class="thumb-wrapper" @click="verImagenGrande(rep.datos.fotosUrl[0])">
                  <img 
                    :src="formatearRutaImagen(rep.datos.fotosUrl[0])" 
                    class="thumb-mini"
                    alt="Evidencia"
                  />
                  <div class="thumb-overlay"><span>🔍</span></div>
                </div>
              </div>
              <span v-else class="no-data-badge">Sin Fotos</span>
            </td>
          </tr>
          
          <tr v-if="reportesGlobales.length === 0">
            <td colspan="5" class="empty-state">
              No se han encontrado reportes en el sistema.
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