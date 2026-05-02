<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api/axios';
import { 
  ClipboardList, 
  ArrowRight, 
  Loader2, 
  FileText,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-vue-next';

const router = useRouter();
const formularios = ref([]);
const cargando = ref(true);
const user = ref(null);
const error = ref(null);

onMounted(async () => {
  const savedUser = sessionStorage.getItem('user');
  
  if (!savedUser || savedUser === '{}' || savedUser === 'undefined') {
    console.error("Sesión inválida detectada");
    sessionStorage.removeItem('user');
    router.push('/');
    return;
  }

  try {
    user.value = JSON.parse(savedUser);
    cargando.value = true;
    const res = await api.get('/formularios');
    formularios.value = res.data;
  } catch (err) {
    console.error("Error en Dashboard:", err);
    error.value = err.message || 'Error al cargar formularios';
    // El interceptor de axios ya maneja 401
  } finally {
    cargando.value = false;
  }
});

const getStatusIcon = () => {
  if (cargando.value) return Clock;
  if (error.value) return AlertCircle;
  if (formularios.value.length === 0) return CheckCircle;
  return FileText;
};
</script>

<template>
  <div class="min-h-screen bg-slate-950 pb-20 md:pb-0">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-100 flex items-center gap-3">
              <ClipboardList class="w-7 h-7 text-blue-400" />
              Mis Tareas
            </h1>
            <p class="text-slate-400 mt-1">
              Formularios asignados a tu cuenta
            </p>
          </div>
          
          <div class="flex items-center gap-3">
            <span class="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300">
              <span class="font-semibold text-blue-400">{{ formularios.length }}</span> disponibles
            </span>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="cargando" class="flex flex-col items-center justify-center py-20">
        <Loader2 class="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p class="text-slate-400">Cargando formularios...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="max-w-md mx-auto text-center py-16">
        <div class="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertCircle class="w-10 h-10 text-red-400" />
        </div>
        <h2 class="text-xl font-semibold text-slate-200 mb-2">Error al cargar</h2>
        <p class="text-slate-400 mb-6">{{ error }}</p>
        <button 
          @click="$router.go(0)"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Reintentar
        </button>
      </div>

      <!-- Formularios Grid -->
      <div v-else-if="formularios.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <router-link 
          v-for="form in formularios" 
          :key="form._id" 
          :to="`/llenar/${form._id}`"
          class="group bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-blue-500/50 rounded-xl p-5 transition-all duration-200"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <FileText class="w-6 h-6 text-blue-400" />
            </div>
            <div class="flex items-center gap-1 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <span class="text-sm font-medium">Abrir</span>
              <ArrowRight class="w-4 h-4" />
            </div>
          </div>
          
          <h3 class="font-semibold text-slate-100 mb-2 line-clamp-2">{{ form.titulo }}</h3>
          
          <div class="flex items-center gap-4 text-sm text-slate-500">
            <span class="flex items-center gap-1">
              <CheckCircle class="w-4 h-4" />
              {{ form.campos?.length || 0 }} campos
            </span>
          </div>
        </router-link>
      </div>

      <!-- Empty State -->
      <div v-else class="max-w-md mx-auto text-center py-16">
        <div class="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
          <CheckCircle class="w-10 h-10 text-slate-600" />
        </div>
        <h2 class="text-xl font-semibold text-slate-200 mb-2">No hay tareas pendientes</h2>
        <p class="text-slate-400">
          Los formularios asignados a <strong class="text-slate-300">{{ user?.empresaId }}</strong> aparecerán aquí.
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

.bg-slate-750 {
  background-color: rgb(51 65 85);
}
</style>