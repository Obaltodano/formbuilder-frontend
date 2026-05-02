<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios';
import Constructor from './Constructor.vue';
import { 
  FileText, 
  Plus, 
  Edit2, 
  Trash2, 
  Grid,
  CheckCircle,
  Loader2,
  ArrowLeft
} from 'lucide-vue-next';

const pestaña = ref('lista');
const formularios = ref([]);
const formularioSeleccionado = ref(null);
const loading = ref(false);
const deleting = ref(null);

const cargarFormularios = async () => {
  loading.value = true;
  try {
    const res = await api.get('/formularios');
    formularios.value = res.data;
  } catch (err) {
    console.error("Error al obtener formularios:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(cargarFormularios);

const irAConstructorNuevo = () => {
  formularioSeleccionado.value = null;
  pestaña.value = 'constructor';
};

const prepararEdicion = (form) => {
  formularioSeleccionado.value = JSON.parse(JSON.stringify(form));
  pestaña.value = 'constructor';
};

const finalizarGuardado = () => {
  pestaña.value = 'lista';
  cargarFormularios();
};

const eliminarFormulario = async (id) => {
  if (!confirm("¿Seguro que quieres eliminar este formulario?\n\nEsta acción no se puede deshacer.")) return;
  deleting.value = id;
  try {
    await api.delete(`/formularios/${id}`);
    await cargarFormularios();
  } catch (err) {
    console.error('Error eliminando formulario:', err);
    alert(err.message || "No se pudo eliminar el formulario");
  } finally {
    deleting.value = null;
  }
};

const volverALista = () => {
  pestaña.value = 'lista';
  formularioSeleccionado.value = null;
};
</script>

<template>
  <div class="min-h-screen bg-slate-950 pb-20 md:pb-0">
    <!-- Lista de Formularios -->
    <div v-if="pestaña === 'lista'" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Grid class="w-7 h-7 text-blue-400" />
            Mis Formularios
          </h1>
          <p class="text-slate-400 mt-1">
            Gestiona y crea formularios para tu equipo
          </p>
        </div>
        
        <button 
          @click="irAConstructorNuevo"
          class="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus class="w-5 h-5" />
          Crear Nuevo
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <Loader2 class="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p class="text-slate-400">Cargando formularios...</p>
      </div>

      <!-- Grid de Formularios -->
      <div v-else-if="formularios.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="form in formularios" 
          :key="form._id" 
          class="group bg-slate-800 border border-slate-700 rounded-xl p-5 transition-all hover:border-blue-500/50"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <FileText class="w-6 h-6 text-blue-400" />
            </div>
            <div class="flex items-center gap-1">
              <button 
                @click="prepararEdicion(form)"
                class="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                title="Editar formulario"
              >
                <Edit2 class="w-4 h-4" />
              </button>
              <button 
                @click="eliminarFormulario(form._id)"
                :disabled="deleting === form._id"
                class="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                title="Eliminar formulario"
              >
                <Trash2 v-if="deleting !== form._id" class="w-4 h-4" />
                <Loader2 v-else class="w-4 h-4 animate-spin" />
              </button>
            </div>
          </div>
          
          <h3 class="font-semibold text-slate-100 mb-2 line-clamp-1">{{ form.titulo }}</h3>
          
          <div class="flex items-center gap-3 text-sm text-slate-500">
            <span class="flex items-center gap-1">
              <CheckCircle class="w-4 h-4" />
              {{ form.campos?.length || 0 }} campos
            </span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="max-w-md mx-auto text-center py-16">
        <div class="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
          <FileText class="w-10 h-10 text-slate-600" />
        </div>
        <h2 class="text-xl font-semibold text-slate-200 mb-2">No hay formularios</h2>
        <p class="text-slate-400 mb-6">
          Comienza creando tu primer formulario para tu equipo.
        </p>
        <button 
          @click="irAConstructorNuevo"
          class="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors mx-auto"
        >
          <Plus class="w-5 h-5" />
          Crear Formulario
        </button>
      </div>
    </div>

    <!-- Constructor -->
    <div v-if="pestaña === 'constructor'" class="h-[calc(100vh-4rem)]">
      <!-- Header del Constructor -->
      <div class="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-3">
        <button 
          @click="volverALista"
          class="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft class="w-5 h-5" />
          <span>Volver a formularios</span>
        </button>
      </div>
      
      <Constructor 
        :datosEdicion="formularioSeleccionado" 
        modo="admin"
        @finalizado="finalizarGuardado"
      />
    </div>
  </div>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>