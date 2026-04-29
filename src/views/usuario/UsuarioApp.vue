<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUsuarioStore } from '@/stores/useUsuarioStore'
import { useEmpresaStore } from '@/stores/useEmpresaStore'
import { useFormularioStore } from '@/stores/useFormularioStore'
import { useUiStore } from '@/stores/useUiStore'
import { 
  ClipboardList, CheckCircle, Clock, MapPin, Camera, 
  ChevronRight, Menu, Bell, LogOut, FileText, Home
} from 'lucide-vue-next'

const usuarioStore = useUsuarioStore()
const empresaStore = useEmpresaStore()
const formularioStore = useFormularioStore()
const uiStore = useUiStore()

// Estado
const activeTab = ref('tareas') // tareas, completados, perfil
const tareas = ref([])
const loading = ref(false)
const refreshing = ref(false)

// Computed
const tareasPendientes = computed(() => tareas.value.filter(t => t.estado === 'pendiente'))
const tareasCompletadas = computed(() => tareas.value.filter(t => t.estado === 'completado'))

// Fetch tareas asignadas al usuario
const fetchTareas = async () => {
  loading.value = true
  try {
    // Simulación de llamada API
    await new Promise(r => setTimeout(r, 500))
    tareas.value = [
      {
        id: 1,
        formularioId: 'form_1',
        titulo: 'Inspección de Seguridad - Tienda Norte',
        descripcion: 'Realizar checklist de seguridad antes de apertura',
        estado: 'pendiente',
        prioridad: 'alta',
        fechaLimite: '2025-01-15',
        camposCount: 8
      },
      {
        id: 2,
        formularioId: 'form_2',
        titulo: 'Reporte de Inventario',
        descripcion: 'Conteo semanal de productos en bodega',
        estado: 'pendiente',
        prioridad: 'media',
        fechaLimite: '2025-01-16',
        camposCount: 12
      },
      {
        id: 3,
        formularioId: 'form_3',
        titulo: 'Evaluación de Proveedor',
        descripcion: 'Calificación de servicio del proveedor XYZ',
        estado: 'completado',
        prioridad: 'baja',
        fechaCompletado: '2025-01-10',
        camposCount: 5
      }
    ]
  } catch (err) {
    uiStore.addToast('Error al cargar tareas', 'error')
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const refresh = () => {
  refreshing.value = true
  fetchTareas()
}

const startForm = (tarea) => {
  // Navegar al formulario
  router.push(`/llenar/${tarea.formularioId}?tarea=${tarea.id}`)
}

const logout = () => {
  usuarioStore.logout()
  router.push('/')
}

// Formatear fecha
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short'
  })
}

onMounted(fetchTareas)
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-slate-100">
    <!-- Header -->
    <header 
      class="sticky top-0 z-20 px-4 py-3 border-b border-slate-800"
      :style="{ backgroundColor: empresaStore.branding.colorSecundario }"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div 
            v-if="empresaStore.branding.logoUrl"
            class="w-8 h-8 rounded-lg overflow-hidden"
          >
            <img :src="empresaStore.branding.logoUrl" class="w-full h-full object-cover" />
          </div>
          <div v-else class="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            {{ empresaStore.branding.nombreEmpresa.charAt(0) }}
          </div>
          <span class="font-semibold">{{ empresaStore.branding.nombreEmpresa }}</span>
        </div>
        <button 
          @click="logout"
          class="p-2 rounded-full hover:bg-white/10"
        >
          <LogOut class="w-5 h-5" />
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="pb-20">
      <!-- Tab: Tareas Pendientes -->
      <div v-if="activeTab === 'tareas'" class="p-4 space-y-3">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-lg font-semibold">Mis Tareas</h2>
          <button 
            @click="refresh"
            :disabled="refreshing"
            class="p-2 text-slate-400"
            :class="{ 'animate-spin': refreshing }"
          >
            <Clock class="w-5 h-5" />
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="space-y-3">
          <div v-for="i in 3" :key="i" class="bg-slate-800 rounded-xl p-4 animate-pulse">
            <div class="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
            <div class="h-3 bg-slate-700 rounded w-1/2"></div>
          </div>
        </div>

        <!-- Empty -->
        <div v-else-if="tareasPendientes.length === 0" class="text-center py-12">
          <CheckCircle class="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <p class="text-slate-400">¡No tienes tareas pendientes!</p>
        </div>

        <!-- Tareas List -->
        <div v-else class="space-y-3">
          <div
            v-for="tarea in tareasPendientes"
            :key="tarea.id"
            @click="startForm(tarea)"
            class="bg-slate-800 rounded-xl p-4 border border-slate-700 active:scale-[0.98] transition-transform cursor-pointer"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span 
                    :class="[
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      tarea.prioridad === 'alta' ? 'bg-red-500/20 text-red-400' :
                      tarea.prioridad === 'media' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-blue-500/20 text-blue-400'
                    ]"
                  >
                    {{ tarea.prioridad }}
                  </span>
                  <span class="text-xs text-slate-500">
                    {{ tarea.camposCount }} campos
                  </span>
                </div>
                <h3 class="font-medium text-slate-100 mb-1 line-clamp-1">{{ tarea.titulo }}</h3>
                <p class="text-sm text-slate-400 line-clamp-2">{{ tarea.descripcion }}</p>
                <div class="flex items-center gap-3 mt-3 text-xs text-slate-500">
                  <span class="flex items-center gap-1">
                    <Clock class="w-3 h-3" />
                    {{ formatDate(tarea.fechaLimite) }}
                  </span>
                </div>
              </div>
              <ChevronRight class="w-5 h-5 text-slate-600 ml-2" />
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Completados -->
      <div v-if="activeTab === 'completados'" class="p-4 space-y-3">
        <h2 class="text-lg font-semibold mb-4">Completados</h2>

        <div v-if="tareasCompletadas.length === 0" class="text-center py-12">
          <ClipboardList class="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p class="text-slate-400">Aún no has completado tareas</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="tarea in tareasCompletadas"
            :key="tarea.id"
            class="bg-slate-800/50 rounded-xl p-4 border border-slate-800"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle class="w-5 h-5 text-emerald-400" />
              </div>
              <div class="flex-1">
                <h3 class="font-medium text-slate-300 line-clamp-1">{{ tarea.titulo }}</h3>
                <p class="text-xs text-slate-500">
                  Completado {{ formatDate(tarea.fechaCompletado) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Perfil -->
      <div v-if="activeTab === 'perfil'" class="p-4">
        <div class="bg-slate-800 rounded-xl p-6 text-center mb-6">
          <div 
            class="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold"
            :style="{ backgroundColor: empresaStore.branding.colorPrimario + '30', color: empresaStore.branding.colorPrimario }"
          >
            {{ usuarioStore.userName.charAt(0) }}
          </div>
          <h3 class="font-semibold text-lg">{{ usuarioStore.userName }}</h3>
          <p class="text-sm text-slate-400">{{ usuarioStore.user?.email }}</p>
          <span class="inline-block mt-2 px-3 py-1 rounded-full bg-slate-700 text-xs text-slate-300">
            {{ usuarioStore.user?.rol }}
          </span>
        </div>

        <div class="space-y-2">
          <button 
            class="w-full flex items-center gap-3 p-4 bg-slate-800 rounded-xl text-left"
          >
            <FileText class="w-5 h-5 text-slate-400" />
            <span class="flex-1">Mis Respuestas</span>
            <ChevronRight class="w-5 h-5 text-slate-600" />
          </button>

          <button 
            class="w-full flex items-center gap-3 p-4 bg-slate-800 rounded-xl text-left"
          >
            <Bell class="w-5 h-5 text-slate-400" />
            <span class="flex-1">Notificaciones</span>
            <ChevronRight class="w-5 h-5 text-slate-600" />
          </button>

          <button 
            @click="logout"
            class="w-full flex items-center gap-3 p-4 bg-red-500/10 rounded-xl text-left text-red-400"
          >
            <LogOut class="w-5 h-5" />
            <span class="flex-1">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </main>

    <!-- Bottom Navigation -->
    <nav class="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 px-2 py-1 z-30">
      <div class="flex items-center justify-around">
        <button
          v-for="tab in [
            { id: 'tareas', label: 'Tareas', icon: ClipboardList },
            { id: 'completados', label: 'Hechos', icon: CheckCircle },
            { id: 'perfil', label: 'Perfil', icon: Home }
          ]"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg transition-colors',
            activeTab === tab.id 
              ? 'text-blue-400' 
              : 'text-slate-500'
          ]"
        >
          <component :is="tab.icon" class="w-6 h-6" />
          <span class="text-xs">{{ tab.label }}</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<style scoped>
/* Safe area for iOS */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Line clamp */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Touch feedback */
button, [role="button"] {
  -webkit-tap-highlight-color: transparent;
}

/* Disable text selection on UI elements */
nav, header {
  user-select: none;
  -webkit-user-select: none;
}
</style>
