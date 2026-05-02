<script setup>
import { ref, onMounted } from 'vue';
import * as ReportesCampos from '../components/campos/index.js';
import { useRespuestas, BASE_URL } from '@/composables/useRespuestas';
import {
  FileText,
  Eye,
  X,
  Loader2,
  User,
  Calendar,
  ClipboardList
} from 'lucide-vue-next';

const { 
  respuestas: reportes, 
  loading, 
  fetchRespuestas, 
  getFileUrl, 
  extractFilesFromRespuesta,
  renderValue 
} = useRespuestas();

const reporteSeleccionado = ref(null);
const urlServidor = BASE_URL;

onMounted(async () => {
  try {
    await fetchRespuestas();
  } catch (err) {
    console.error("Error cargando reportes", err);
  }
});

const obtenerConfigCampo = (rep, campoId) => {
  const campoConfig = rep.formularioId?.campos?.find(c => c._id === campoId);
  return campoConfig || { label: campoId, tipo: 'texto_corto' };
};

const getFullFileUrl = (relativePath) => getFileUrl(relativePath);
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
  <div class="min-h-screen bg-slate-950 pb-20 md:pb-0">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <ClipboardList class="w-7 h-7 text-blue-400" />
            Historial de Reportes
          </h1>
          <p class="text-slate-400 mt-1">
            Visualiza todos los reportes enviados por tu equipo
          </p>
        </div>
        
        <div v-if="reportes.length" class="flex items-center gap-3">
          <span class="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300">
            <span class="font-semibold text-blue-400">{{ reportes.length }}</span> registros
          </span>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <Loader2 class="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p class="text-slate-400">Cargando reportes...</p>
      </div>

      <!-- Table -->
      <div v-else class="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-900/50 border-b border-slate-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Empleado</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Formulario</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Fecha</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
              <tr v-for="rep in reportes" :key="rep._id" class="hover:bg-slate-700/30">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {{ (rep.usuarioId?.nombre || 'U').charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <span class="font-medium text-slate-200 block">{{ rep.usuarioId?.nombre || 'Usuario' }}</span>
                      <span class="text-xs text-slate-500 capitalize">{{ rep.usuarioId?.rol || 'Personal' }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                    {{ rep.formularioId?.titulo }}
                  </span>
                </td>
                <td class="px-6 py-4 text-slate-400 text-sm">
                  {{ new Date(rep.fechaEnvio).toLocaleString() }}
                </td>
                <td class="px-6 py-4 text-center">
                  <button 
                    @click="abrirDetalle(rep)" 
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Eye class="w-4 h-4" />
                    Ver
                  </button>
                </td>
              </tr>
              <tr v-if="reportes.length === 0">
                <td colspan="4" class="px-6 py-12 text-center text-slate-500">
                  <ClipboardList class="w-12 h-12 mx-auto mb-3 text-slate-600" />
                  <p>No hay reportes registrados aún.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div 
        v-if="reporteSeleccionado" 
        class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        @click.self="cerrarModal"
      >
        <div class="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] flex flex-col">
          <!-- Modal Header -->
          <div class="flex items-center justify-between p-4 border-b border-slate-700">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText class="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 class="font-semibold text-slate-100">{{ reporteSeleccionado.formularioId?.titulo }}</h3>
                <p class="text-sm text-slate-500">
                  {{ new Date(reporteSeleccionado.fechaEnvio).toLocaleString() }}
                </p>
              </div>
            </div>
            <button 
              @click="cerrarModal" 
              class="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Modal Content -->
          <div class="overflow-y-auto p-4 space-y-3">
            <div 
              v-for="(valor, campoId) in reporteSeleccionado.datos" 
              :key="campoId" 
              class="bg-slate-900/50 rounded-lg p-4 border border-slate-700"
            >
              <span class="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-2">
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
    </Teleport>
  </div>
</template>