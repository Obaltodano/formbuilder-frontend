<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios';

const urlServidor = api.defaults.baseURL.replace('/api', '');

const reportes = ref([]);
const reporteSeleccionado = ref(null);
const mapaSeleccionado = ref(null);

onMounted(async () => {
  try {
    const res = await api.get('/respuestas');
    reportes.value = res.data;
  } catch (err) {
    console.error("Error cargando reportes", err);
  }
});

// NUEVA FUNCIÓN: Construye la URL de la imagen correctamente
const obtenerUrlImagen = (ruta) => {
  if (!ruta) return '';
  // Convertimos barras invertidas de Windows a barras de URL
  const rutaLimpia = ruta.replace(/\\/g, '/');
  // Retornamos la URL completa: http://localhost:3000/uploads/...
  return `${urlServidor}/${rutaLimpia}`;
};

const esCoordenada = (valor) => {
  if (typeof valor !== 'string') return false;
  return /^-?\d+\.\d+,\s*-?\d+\.\d+$/.test(valor);
};

// Modificada para detectar la carpeta 'uploads'
// Detectar si el valor es una imagen o un conjunto de ellas
const esFoto = (valor) => {
  // Caso 1: Es un Array (como se ve en tu captura fotosUrl)
  if (Array.isArray(valor)) {
    return valor.length > 0 && valor[0].toLowerCase().includes('uploads');
  }
  
  // Caso 2: Es un string simple
  if (typeof valor !== 'string') return false;
  const contieneCarpeta = valor.toLowerCase().includes('uploads');
  const tieneExtension = /\.(jpg|jpeg|png|webp)$/i.test(valor);
  return contieneCarpeta || tieneExtension;
};

const abrirDetalle = (rep) => { reporteSeleccionado.value = rep; };
const cerrarModal = () => { reporteSeleccionado.value = null; };

const obtenerEtiquetaLegible = (rep, campoId) => {
  const campo = rep.formularioId?.campos?.find(c => c._id === campoId);
  return campo ? (campo.label || campo.etiqueta) : campoId;
};
</script>
<template>
  <div class="reports-container">
    <div class="reports-page">
      
      <header class="section-header">
        <h1 class="section-title">HISTORIAL DE REPORTES</h1>
        <div class="header-stats">
          <span class="stats-pill" v-if="reportes && reportes.length">
            {{ reportes.length }} REGISTROS ENCONTRADOS
          </span>
          <span class="stats-pill" v-else>0 REGISTROS</span>
        </div>
      </header>
      
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Empleado</th>
              <th>Formulario</th>
              <th>Fecha y Hora</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="reportes && reportes.length > 0">
              <tr v-for="rep in reportes" :key="rep._id" class="table-row">
                <td class="user-cell">
                  <div class="user-info-table">
                    <span class="user-name">{{ rep.usuarioId?.nombre || 'Sin nombre' }}</span>
                    <span class="user-id-tag">{{ rep.usuarioId?.rol || 'Personal' }}</span>
                  </div>
                </td>
                <td>
                  <span class="form-badge">
                    {{ rep.formularioId?.titulo || 'Formulario eliminado' }}
                  </span>
                </td>
                <td>
                  <div class="date-container">
                    <span class="date-main">{{ new Date(rep.fechaEnvio).toLocaleDateString() }}</span>
                    <span class="date-sub">{{ new Date(rep.fechaEnvio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</span>
                  </div>
                </td>
                <td class="text-center">
                  <button @click="abrirDetalle(rep)" class="btn-view-modal">
                    👁️ VER DETALLES
                  </button>
                </td>
              </tr>
            </template>
            <tr v-else>
              <td colspan="4" style="text-align: center; padding: 3rem; color: #94a3b8;">
                No hay reportes disponibles para mostrar.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="reporteSeleccionado" class="modal-overlay" @click.self="cerrarModal">
        <div class="modal-container">
          <header class="modal-header">
            <div class="modal-header-info">
              <h3>DETALLE DEL REPORTE</h3>
              <span class="form-badge">{{ reporteSeleccionado.formularioId?.titulo }}</span>
            </div>
            <button @click="cerrarModal" class="btn-close-modal">×</button>
          </header>

          <div class="modal-scroll-area">
            <div class="report-meta">
              <div class="meta-item">
                <span class="meta-label">ENVIADO POR:</span>
                <span class="meta-value">{{ reporteSeleccionado.usuarioId?.nombre }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">FECHA DE ENVÍO:</span>
                <span class="meta-value">{{ new Date(reporteSeleccionado.fechaEnvio).toLocaleString() }}</span>
              </div>
            </div>

            <div class="data-grid-segments">
              <div v-for="(valor, campoId) in reporteSeleccionado.datos" :key="campoId" class="data-card">
                <span class="data-label">{{ obtenerEtiquetaLegible(reporteSeleccionado, campoId) }}</span>
                
                <div v-if="esFoto(valor)" class="data-content-media">
                  <img :src="obtenerUrlImagen(valor)" class="img-preview" alt="Evidencia" />
                  <a :href="obtenerUrlImagen(valor)" target="_blank" class="btn-zoom">
                    🔍 ABRIR IMAGEN COMPLETA
                  </a>
                </div>

                <div v-else-if="esCoordenada(valor)" class="data-content-media">
                  <iframe 
                    width="100%" height="200" frameborder="0"
                    :src="`https://maps.google.com/maps?q=${valor}&t=&z=15&ie=UTF8&iwloc=&output=embed`"
                    class="mini-map-iframe">
                  </iframe>
                  <p class="coords-txt">📍 {{ valor }}</p>
                </div>

                <div v-else class="data-content-text">
                  {{ valor || 'N/A' }}
                </div>
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