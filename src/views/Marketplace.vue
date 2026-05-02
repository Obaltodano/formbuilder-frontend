<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios';
import {
  Store,
  Download,
  FileText,
  Loader2,
  CheckCircle
} from 'lucide-vue-next';

const templates = ref([]);
const loading = ref(false);
const installing = ref(null);
const success = ref(null);

const cargarTienda = async () => {
  loading.value = true;
  try {
    const res = await api.get('/market/templates');
    templates.value = res.data;
  } catch (err) {
    console.error('Error cargando templates:', err);
  } finally {
    loading.value = false;
  }
};

const instalar = async (id) => {
  if (!confirm("¿Quieres instalar este formulario en tu empresa?")) return;
  
  installing.value = id;
  try {
    await api.post(`/market/instalar/${id}`);
    success.value = id;
    setTimeout(() => success.value = null, 3000);
  } catch (err) {
    alert("Error al instalar");
  } finally {
    installing.value = null;
  }
};

onMounted(cargarTienda);
</script>

<template>
  <div class="min-h-screen bg-slate-950 pb-20 md:pb-0">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <Store class="w-7 h-7 text-blue-400" />
          Tienda de Formularios
        </h1>
        <p class="text-slate-400 mt-1">
          Explora e instala plantillas prediseñadas para tu equipo
        </p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <Loader2 class="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p class="text-slate-400">Cargando plantillas...</p>
      </div>

      <!-- Templates Grid -->
      <div v-else-if="templates.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="temp in templates" 
          :key="temp._id" 
          class="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col"
        >
          <div class="p-5 flex-1">
            <div class="flex items-start justify-between mb-4">
              <div class="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText class="w-6 h-6 text-blue-400" />
              </div>
              <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
                {{ temp.categoria }}
              </span>
            </div>
            
            <h3 class="font-semibold text-slate-100 mb-2">{{ temp.titulo }}</h3>
            <p class="text-sm text-slate-400 line-clamp-2">{{ temp.descripcion }}</p>
          </div>

          <div class="p-4 border-t border-slate-700 bg-slate-800/50">
            <button 
              @click="instalar(temp._id)" 
              :disabled="installing === temp._id || success === temp._id"
              :class="[
                'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors',
                success === temp._id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white'
              ]"
            >
              <Loader2 v-if="installing === temp._id" class="w-4 h-4 animate-spin" />
              <CheckCircle v-else-if="success === temp._id" class="w-4 h-4" />
              <Download v-else class="w-4 h-4" />
              {{ success === temp._id ? 'Instalado' : (installing === temp._id ? 'Instalando...' : 'Instalar') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="max-w-md mx-auto text-center py-16">
        <Store class="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-slate-200 mb-2">No hay plantillas</h2>
        <p class="text-slate-400">
          No hay formularios disponibles en la tienda actualmente.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>