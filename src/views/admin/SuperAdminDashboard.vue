<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUsuarioStore } from '@/stores/useUsuarioStore'
import { useUiStore } from '@/stores/useUiStore'
import { empresaService } from '@/services/empresaService'
import { 
  Building2, Users, DollarSign, HardDrive, 
  TrendingUp, AlertCircle, CheckCircle, XCircle,
  Search, Filter, MoreVertical, Image as ImageIcon
} from 'lucide-vue-next'

const router = useRouter()
const usuarioStore = useUsuarioStore()
const uiStore = useUiStore()

// Estado
const empresas = ref([])
const pagosPendientes = ref([])
const metricas = ref({
  mrr: 0,
  totalEmpresas: 0,
  empresasActivas: 0,
  empresasSuspendidas: 0,
  storageTotal: 0
})
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('todos')
const selectedEmpresa = ref(null)
const showEmpresaModal = ref(false)
const showPagoModal = ref(false)
const selectedPago = ref(null)

// Modales adicionales
const showCrearEmpresaModal = ref(false)
const showConfigurarPlanesModal = ref(false)
const showMarketplaceModal = ref(false)

// Formulario nueva empresa
const nuevaEmpresa = ref({
  nombre: '',
  empresaId: '',
  email: '',
  plan: 'basico'
})

// Planes disponibles
const planes = ref([
  { id: 'basico', nombre: 'Básico', precio: 29, usuarios: 5, formularios: 10, storage: 1024 },
  { id: 'pro', nombre: 'Profesional', precio: 79, usuarios: 25, formularios: 50, storage: 5120 },
  { id: 'enterprise', nombre: 'Enterprise', precio: 199, usuarios: 100, formularios: 999, storage: 51200 }
])

// Marketplace - Plantillas
const plantillasMarketplace = ref([])

// Computed
const empresasFiltradas = computed(() => {
  return empresas.value.filter(e => {
    const matchesSearch = e.nombre.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         e.empresaId.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = statusFilter.value === 'todos' || e.status === statusFilter.value
    return matchesSearch && matchesStatus
  })
})

const statsCards = computed(() => [
  { 
    title: 'MRR Mensual', 
    value: `$${metricas.value.mrr.toLocaleString()}`, 
    icon: DollarSign,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10'
  },
  { 
    title: 'Empresas Activas', 
    value: metricas.value.empresasActivas, 
    icon: Building2,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10'
  },
  { 
    title: 'Usuarios Totales', 
    value: metricas.value.totalEmpresas * 5, // Estimado
    icon: Users,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10'
  },
  { 
    title: 'Storage Usado', 
    value: `${(metricas.value.storageTotal / 1024).toFixed(1)} GB`, 
    icon: HardDrive,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10'
  }
])

// Actions
const fetchData = async () => {
  loading.value = true
  try {
    const [empresasRes, metricasRes] = await Promise.all([
      empresaService.list(),
      empresaService.getMetrics('global')
    ])
    empresas.value = empresasRes.data
    metricas.value = metricasRes.data
  } catch (err) {
    uiStore.addToast('Error al cargar datos', 'error')
  } finally {
    loading.value = false
  }
}

const viewEmpresa = (empresa) => {
  selectedEmpresa.value = empresa
  showEmpresaModal.value = true
}

const toggleEmpresaStatus = async (empresa) => {
  try {
    if (empresa.status === 'activa') {
      await empresaService.suspend(empresa._id, 'Suspendido por administrador')
      uiStore.addToast('Empresa suspendida', 'warning')
    } else {
      await empresaService.activate(empresa._id)
      uiStore.addToast('Empresa activada', 'success')
    }
    fetchData()
  } catch (err) {
    uiStore.addToast('Error al cambiar estado', 'error')
  }
}

const aprobarPago = async (pago) => {
  try {
    // Llamada al servicio para aprobar
    uiStore.addToast('Pago aprobado y servicios activados', 'success')
    showPagoModal.value = false
    fetchData()
  } catch (err) {
    uiStore.addToast('Error al aprobar pago', 'error')
  }
}

const rechazarPago = async (pago) => {
  try {
    // Llamada al servicio para rechazar
    uiStore.addToast('Pago rechazado', 'warning')
    showPagoModal.value = false
    fetchData()
  } catch (err) {
    uiStore.addToast('Error al rechazar pago', 'error')
  }
}

// Crear nueva empresa
const crearEmpresa = async () => {
  try {
    loading.value = true
    await empresaService.create(nuevaEmpresa.value)
    uiStore.addToast('Empresa creada exitosamente', 'success')
    showCrearEmpresaModal.value = false
    nuevaEmpresa.value = { nombre: '', empresaId: '', email: '', plan: 'basico' }
    fetchData()
  } catch (err) {
    uiStore.addToast('Error al crear empresa', 'error')
  } finally {
    loading.value = false
  }
}

// Guardar configuración de planes
const guardarPlanes = async () => {
  try {
    uiStore.addToast('Configuración de planes guardada', 'success')
    showConfigurarPlanesModal.value = false
  } catch (err) {
    uiStore.addToast('Error al guardar planes', 'error')
  }
}

// Navegar a Marketplace de plantillas
const irAMarketplace = () => {
  router.push('/marketplace')
}

// Formatear fecha
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// Formatear moneda
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

onMounted(fetchData)
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-slate-100">
    <!-- Header -->
    <header class="bg-slate-800 border-b border-slate-700 sticky top-0 z-30">
      <div class="px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-xl font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp class="w-5 h-5 text-blue-400" />
              SuperAdmin Dashboard
            </h1>
            <p class="text-sm text-slate-500 mt-0.5">Gestión global del SaaS</p>
          </div>
          
          <div class="flex items-center gap-3">
            <span class="text-sm text-slate-400">
              {{ usuarioStore.user?.nombre || 'Admin' }}
            </span>
            <button 
              @click="usuarioStore.logout"
              class="px-3 py-1.5 text-sm rounded-lg border border-slate-600 text-slate-400 hover:text-slate-200 hover:border-slate-500"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="px-4 sm:px-6 lg:px-8 py-6">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div 
          v-for="stat in statsCards" 
          :key="stat.title"
          class="bg-slate-800 rounded-xl border border-slate-700 p-4"
        >
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm text-slate-500">{{ stat.title }}</p>
              <p class="text-2xl font-bold text-slate-100 mt-1">{{ stat.value }}</p>
            </div>
            <div :class="['p-2 rounded-lg', stat.bg]">
              <component :is="stat.icon" :class="['w-5 h-5', stat.color]" />
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Lista de Empresas -->
        <div class="xl:col-span-2 space-y-4">
          <div class="bg-slate-800 rounded-xl border border-slate-700">
            <div class="p-4 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 class="font-semibold text-slate-200 flex items-center gap-2">
                <Building2 class="w-4 h-4" />
                Empresas ({{ empresasFiltradas.length }})
              </h2>
              
              <div class="flex items-center gap-2">
                <!-- Search -->
                <div class="relative">
                  <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Buscar..."
                    class="w-40 sm:w-56 bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-sm text-slate-200 focus:border-blue-500 outline-none"
                  />
                </div>
                
                <!-- Filter -->
                <select
                  v-model="statusFilter"
                  class="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:border-blue-500 outline-none"
                >
                  <option value="todos">Todos</option>
                  <option value="activa">Activas</option>
                  <option value="suspendida">Suspendidas</option>
                  <option value="demo">Demo</option>
                </select>
              </div>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-slate-700/50 text-left">
                  <tr>
                    <th class="px-4 py-3 text-xs font-medium text-slate-400">Empresa</th>
                    <th class="px-4 py-3 text-xs font-medium text-slate-400">Plan</th>
                    <th class="px-4 py-3 text-xs font-medium text-slate-400">Estado</th>
                    <th class="px-4 py-3 text-xs font-medium text-slate-400 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-700">
                  <tr 
                    v-for="empresa in empresasFiltradas" 
                    :key="empresa._id"
                    class="hover:bg-slate-700/30 transition-colors"
                  >
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center">
                          <ImageIcon v-if="!empresa.logoUrl" class="w-4 h-4 text-slate-500" />
                          <img v-else :src="empresa.logoUrl" class="w-8 h-8 rounded-lg object-cover" />
                        </div>
                        <div>
                          <p class="text-sm font-medium text-slate-200">{{ empresa.nombre }}</p>
                          <p class="text-xs text-slate-500">{{ empresa.empresaId }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <span class="text-sm text-slate-300">{{ empresa.plan?.nombre || 'Básico' }}</span>
                    </td>
                    <td class="px-4 py-3">
                      <span 
                        :class="[
                          'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                          empresa.status === 'activa' ? 'bg-emerald-500/20 text-emerald-400' :
                          empresa.status === 'suspendida' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        ]"
                      >
                        <component 
                          :is="empresa.status === 'activa' ? CheckCircle : 
                                empresa.status === 'suspendida' ? XCircle : AlertCircle" 
                          class="w-3 h-3" 
                        />
                        {{ empresa.status }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <div class="flex items-center justify-end gap-1">
                        <button 
                          @click="viewEmpresa(empresa)"
                          class="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                        >
                          <MoreVertical class="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              
              <!-- Empty state -->
              <div v-if="empresasFiltradas.length === 0" class="text-center py-8 text-slate-500">
                <p>No se encontraron empresas</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar: Pagos Pendientes -->
        <div class="space-y-4">
          <div class="bg-slate-800 rounded-xl border border-slate-700">
            <div class="p-4 border-b border-slate-700">
              <h2 class="font-semibold text-slate-200 flex items-center gap-2">
                <DollarSign class="w-4 h-4 text-amber-400" />
                Pagos Pendientes
              </h2>
            </div>
            
            <div class="divide-y divide-slate-700 max-h-96 overflow-y-auto">
              <div 
                v-for="pago in pagosPendientes" 
                :key="pago._id"
                @click="selectedPago = pago; showPagoModal = true"
                class="p-4 hover:bg-slate-700/30 cursor-pointer transition-colors"
              >
                <div class="flex items-start justify-between">
                  <div>
                    <p class="text-sm font-medium text-slate-200">{{ pago.empresaNombre }}</p>
                    <p class="text-xs text-slate-500">{{ formatDate(pago.fecha) }}</p>
                  </div>
                  <span class="text-sm font-semibold text-emerald-400">
                    {{ formatCurrency(pago.monto) }}
                  </span>
                </div>
                <p class="text-xs text-slate-400 mt-1">{{ pago.planNombre }}</p>
              </div>
              
              <div v-if="pagosPendientes.length === 0" class="p-4 text-center text-slate-500">
                <p class="text-sm">No hay pagos pendientes</p>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <h3 class="font-medium text-slate-200 mb-3">Acciones Rápidas</h3>
            <div class="space-y-2">
              <button 
                @click="showCrearEmpresaModal = true"
                class="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-sm text-slate-300 transition-colors"
              >
                <Building2 class="w-4 h-4" />
                Crear Nueva Empresa
              </button>
              <button 
                @click="showConfigurarPlanesModal = true"
                class="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-sm text-slate-300 transition-colors"
              >
                <TrendingUp class="w-4 h-4" />
                Configurar Planes
              </button>
              <button 
                @click="irAMarketplace"
                class="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm text-white transition-colors"
              >
                <TrendingUp class="w-4 h-4" />
                Marketplace Plantillas
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal: Detalle Empresa -->
    <Teleport to="body">
      <div 
        v-if="showEmpresaModal && selectedEmpresa"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        @click.self="showEmpresaModal = false"
      >
        <div class="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div class="p-4 border-b border-slate-700 flex items-center justify-between">
            <h3 class="font-semibold text-slate-200">Detalle de Empresa</h3>
            <button @click="showEmpresaModal = false" class="text-slate-500 hover:text-slate-300">
              <XCircle class="w-5 h-5" />
            </button>
          </div>
          
          <div class="p-4 space-y-4">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-xl bg-slate-700 flex items-center justify-center">
                <ImageIcon v-if="!selectedEmpresa.logoUrl" class="w-8 h-8 text-slate-500" />
                <img v-else :src="selectedEmpresa.logoUrl" class="w-16 h-16 rounded-xl object-cover" />
              </div>
              <div>
                <h4 class="font-semibold text-slate-100">{{ selectedEmpresa.nombre }}</h4>
                <p class="text-sm text-slate-500">{{ selectedEmpresa.empresaId }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 text-sm">
              <div class="bg-slate-700/50 rounded-lg p-3">
                <p class="text-slate-500">Plan Actual</p>
                <p class="font-medium text-slate-200">{{ selectedEmpresa.plan?.nombre || 'Básico' }}</p>
              </div>
              <div class="bg-slate-700/50 rounded-lg p-3">
                <p class="text-slate-500">Estado</p>
                <p :class="['font-medium', 
                  selectedEmpresa.status === 'activa' ? 'text-emerald-400' :
                  selectedEmpresa.status === 'suspendida' ? 'text-red-400' : 'text-yellow-400'
                ]">
                  {{ selectedEmpresa.status }}
                </p>
              </div>
            </div>

            <div class="space-y-2">
              <p class="text-sm text-slate-500">Límites del Plan</p>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-slate-400">Usuarios</span>
                  <span class="text-slate-200">{{ selectedEmpresa.limits?.usuariosUsados || 0 }} / {{ selectedEmpresa.limits?.usuariosLimite || 5 }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Formularios</span>
                  <span class="text-slate-200">{{ selectedEmpresa.limits?.formulariosUsados || 0 }} / {{ selectedEmpresa.limits?.formulariosLimite || 10 }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Storage</span>
                  <span class="text-slate-200">{{ ((selectedEmpresa.limits?.storageUsado || 0) / 1024).toFixed(1) }} / {{ ((selectedEmpresa.limits?.storageLimite || 1024) / 1024).toFixed(1) }} GB</span>
                </div>
              </div>
            </div>
          </div>

          <div class="p-4 border-t border-slate-700 flex gap-2">
            <button 
              @click="toggleEmpresaStatus(selectedEmpresa)"
              :class="[
                'flex-1 py-2 rounded-lg font-medium text-sm',
                selectedEmpresa.status === 'activa' 
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
              ]"
            >
              {{ selectedEmpresa.status === 'activa' ? 'Suspender' : 'Activar' }}
            </button>
            <button 
              @click="showEmpresaModal = false"
              class="flex-1 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 text-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal: Aprobar/Rechazar Pago -->
    <Teleport to="body">
      <div 
        v-if="showPagoModal && selectedPago"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        @click.self="showPagoModal = false"
      >
        <div class="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md">
          <div class="p-4 border-b border-slate-700">
            <h3 class="font-semibold text-slate-200">Verificar Pago</h3>
          </div>
          
          <div class="p-4 space-y-4">
            <div class="text-center">
              <p class="text-3xl font-bold text-emerald-400">{{ formatCurrency(selectedPago.monto) }}</p>
              <p class="text-slate-400 mt-1">{{ selectedPago.empresaNombre }}</p>
            </div>

            <div class="bg-slate-700/50 rounded-lg p-3">
              <p class="text-xs text-slate-500 mb-1">Plan solicitado</p>
              <p class="text-sm text-slate-200">{{ selectedPago.planNombre }}</p>
            </div>

            <!-- Preview comprobante -->
            <div class="aspect-video bg-slate-900 rounded-lg flex items-center justify-center border border-slate-700">
              <button class="flex items-center gap-2 text-slate-400 hover:text-slate-200">
                <ImageIcon class="w-5 h-5" />
                Ver Comprobante
              </button>
            </div>
          </div>

          <div class="p-4 border-t border-slate-700 flex gap-2">
            <button 
              @click="rechazarPago(selectedPago)"
              class="flex-1 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-medium"
            >
              Rechazar
            </button>
            <button 
              @click="aprobarPago(selectedPago)"
              class="flex-1 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 text-sm font-medium"
            >
              Aprobar
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal: Crear Nueva Empresa -->
    <Teleport to="body">
      <div 
        v-if="showCrearEmpresaModal"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        @click.self="showCrearEmpresaModal = false"
      >
        <div class="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-lg">
          <div class="p-4 border-b border-slate-700 flex items-center justify-between">
            <h3 class="font-semibold text-slate-200">Crear Nueva Empresa</h3>
            <button @click="showCrearEmpresaModal = false" class="text-slate-500 hover:text-slate-300">
              <XCircle class="w-5 h-5" />
            </button>
          </div>
          
          <div class="p-4 space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-400 mb-1">Nombre de la Empresa</label>
              <input
                v-model="nuevaEmpresa.nombre"
                type="text"
                class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-blue-500 outline-none"
                placeholder="Ej: Mi Empresa S.A."
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-400 mb-1">ID de Empresa (slug)</label>
              <input
                v-model="nuevaEmpresa.empresaId"
                type="text"
                class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-blue-500 outline-none"
                placeholder="Ej: mi-empresa"
              />
              <p class="text-xs text-slate-500 mt-1">Este ID se usará para el login personalizado</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-400 mb-1">Email del Gerente</label>
              <input
                v-model="nuevaEmpresa.email"
                type="email"
                class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-blue-500 outline-none"
                placeholder="gerente@empresa.com"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-400 mb-1">Plan</label>
              <select
                v-model="nuevaEmpresa.plan"
                class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-blue-500 outline-none"
              >
                <option v-for="plan in planes" :key="plan.id" :value="plan.id">
                  {{ plan.nombre }} - ${{ plan.precio }}/mes
                </option>
              </select>
            </div>
          </div>

          <div class="p-4 border-t border-slate-700 flex gap-2">
            <button 
              @click="crearEmpresa"
              :disabled="loading || !nuevaEmpresa.nombre || !nuevaEmpresa.empresaId"
              class="flex-1 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
            >
              {{ loading ? 'Creando...' : 'Crear Empresa' }}
            </button>
            <button 
              @click="showCrearEmpresaModal = false"
              class="flex-1 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal: Configurar Planes -->
    <Teleport to="body">
      <div 
        v-if="showConfigurarPlanesModal"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        @click.self="showConfigurarPlanesModal = false"
      >
        <div class="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div class="p-4 border-b border-slate-700 flex items-center justify-between">
            <h3 class="font-semibold text-slate-200">Configurar Planes y Precios</h3>
            <button @click="showConfigurarPlanesModal = false" class="text-slate-500 hover:text-slate-300">
              <XCircle class="w-5 h-5" />
            </button>
          </div>
          
          <div class="p-4 space-y-4">
            <div v-for="plan in planes" :key="plan.id" class="bg-slate-700/30 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-semibold text-slate-200">{{ plan.nombre }}</h4>
                <div class="flex items-center gap-2">
                  <span class="text-sm text-slate-400">$</span>
                  <input
                    v-model.number="plan.precio"
                    type="number"
                    class="w-20 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-slate-200 text-center"
                  />
                  <span class="text-sm text-slate-400">/mes</span>
                </div>
              </div>
              
              <div class="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <label class="text-xs text-slate-500">Usuarios</label>
                  <input
                    v-model.number="plan.usuarios"
                    type="number"
                    class="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-slate-200"
                  />
                </div>
                <div>
                  <label class="text-xs text-slate-500">Formularios</label>
                  <input
                    v-model.number="plan.formularios"
                    type="number"
                    class="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-slate-200"
                  />
                </div>
                <div>
                  <label class="text-xs text-slate-500">Storage (MB)</label>
                  <input
                    v-model.number="plan.storage"
                    type="number"
                    class="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-slate-200"
                  />
                </div>
              </div>
            </div>

            <!-- Cupones -->
            <div class="border-t border-slate-700 pt-4">
              <h4 class="font-medium text-slate-200 mb-3">Cupones de Descuento</h4>
              <div class="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Código de cupón"
                  class="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
                />
                <input
                  type="number"
                  placeholder="Descuento %"
                  class="w-24 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
                />
                <button class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">
                  Agregar
                </button>
              </div>
            </div>
          </div>

          <div class="p-4 border-t border-slate-700 flex gap-2">
            <button 
              @click="guardarPlanes"
              class="flex-1 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
            >
              Guardar Configuración
            </button>
            <button 
              @click="showConfigurarPlanesModal = false"
              class="flex-1 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 text-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style>
