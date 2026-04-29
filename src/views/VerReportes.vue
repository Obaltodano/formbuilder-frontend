<script setup>
import { ref, onMounted } from 'vue';
import * as ReportesCampos from '../components/campos/index.js';
import { useRespuestas, BASE_URL } from '@/composables/useRespuestas';

const { 
  respuestas: reportes, 
  loading, 
  fetchRespuestas, 
  getFileUrl, 
  extractFilesFromRespuesta,
  renderValue 
} = useRespuestas();

const reporteSeleccionado = ref(null);

// ⭐ Base para archivos multimedia - usar helper del composable
const urlServidor = BASE_URL;

onMounted(async () => {
  try {
    await fetchRespuestas();
  } catch (err) {
    console.error("Error cargando reportes", err);
  }
});

// Busca la configuración del campo para obtener el label y el tipo
const obtenerConfigCampo = (rep, campoId) => {
  const campoConfig = rep.formularioId?.campos?.find(c => c._id === campoId);
  return campoConfig || { label: campoId, tipo: 'texto_corto' };
};

// ⭐ Helper para obtener URL completa de archivo usando el composable
const getFullFileUrl = (relativePath) => getFileUrl(relativePath);

// ⭐ Extraer archivos de una respuesta usando el composable
const getFilesFromResponse = (respuesta) => extractFilesFromRespuesta(respuesta);

const obtenerComponenteReporte = (tipo) => {
  const mapa = {
    'texto_corto': ReportesCampos.ReporteTextoCorto,
    'texto_largo': ReportesCampos.ReporteTextoLargo,
    'numero': ReportesCampos.ReporteNumero,
    'email': ReportesCampos.ReporteEmail,
    'foto': ReportesCampos.ReporteFoto,
    'video': ReportesCampos.ReporteVideo,
    'gps': ReportesCampos.ReporteGPS,
    'cuadricula_unica': ReportesCampos.ReporteCuadriculaUnica,
    'cuadricula_multiple': ReportesCampos.ReporteCuadriculaMultiple,
    'radio': ReportesCampos.ReporteRadio,
    'multiple': ReportesCampos.ReporteMultiple,
    'dropdown': ReportesCampos.ReporteDropdown,
    'escala': ReportesCampos.ReporteEscala,
    'archivo': ReportesCampos.ReporteArchivo
  };
  return mapa[tipo] || ReportesCampos.ReporteTextoCorto;
};

const abrirDetalle = (rep) => { reporteSeleccionado.value = rep; };
const cerrarModal = () => { reporteSeleccionado.value = null; };
</script>

<template>
  <div class="reports-container">
    <div class="reports-page">
      <header class="section-header">
        <h1 class="section-title">HISTORIAL DE REPORTES</h1>
        <div class="header-stats">
          <span class="stats-pill" v-if="reportes.length">{{ reportes.length }} REGISTROS</span>
        </div>
      </header>

      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Empleado</th>
              <th>Formulario</th>
              <th>Fecha</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rep in reportes" :key="rep._id" class="table-row">
              <td>
                <div class="user-info-table">
                  <span class="user-name">{{ rep.usuarioId?.nombre || 'Usuario' }}</span>
                  <span class="user-id-tag">{{ rep.usuarioId?.rol || 'Personal' }}</span>
                </div>
              </td>
              <td><span class="form-badge">{{ rep.formularioId?.titulo }}</span></td>
              <td>{{ new Date(rep.fechaEnvio).toLocaleString() }}</td>
              <td class="text-center">
                <button @click="abrirDetalle(rep)" class="btn-view-modal">👁️ VER DETALLES</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="reporteSeleccionado" class="modal-overlay" @click.self="cerrarModal">
        <div class="modal-container">
          <header class="modal-header">
            <h3>{{ reporteSeleccionado.formularioId?.titulo }}</h3>
            <button @click="cerrarModal" class="btn-close-modal">×</button>
          </header>

          <div class="modal-scroll-area">
            <div class="data-grid-segments">
              <div v-for="(valor, campoId) in reporteSeleccionado.datos" :key="campoId" class="data-card">
                <span class="data-label">
                  {{ obtenerConfigCampo(reporteSeleccionado, campoId).label }}
                </span>
                
                <component 
                  :is="obtenerComponenteReporte(obtenerConfigCampo(reporteSeleccionado, campoId).tipo)"
                  :modelValue="valor"
                  :campo="obtenerConfigCampo(reporteSeleccionado, campoId)"
                  :baseUrl="urlServidor"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '../styles/reportes.css';
</style>