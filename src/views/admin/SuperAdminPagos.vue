<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  ClipboardCheck,
  CheckCircle,
  XCircle,
  FileText,
  Calendar,
  DollarSign,
  User,
  Building2,
  Download,
  Search,
  Filter,
  X,
  Eye
} from 'lucide-vue-next'

const pagos = ref([])
const loading = ref(false)
const filterStatus = ref('pendiente')
const searchQuery = ref('')

// Modal de comprobante
const showComprobanteModal = ref(false)
const comprobanteSeleccionado = ref(null)

const verComprobante = (pago) => {
  comprobanteSeleccionado.value = pago
  showComprobanteModal.value = true
}

const cerrarComprobante = () => {
  showComprobanteModal.value = false
  comprobanteSeleccionado.value = null
}

const descargarComprobante = () => {
  if (comprobanteSeleccionado.value?.comprobanteUrl) {
    const link = document.createElement('a')
    link.href = comprobanteSeleccionado.value.comprobanteUrl
    link.download = `comprobante-${comprobanteSeleccionado.value.referencia}.jpg`
    link.click()
  }
}

// Datos de ejemplo
const mockPagos = [
  {
    _id: '1',
    empresa: { nombre: 'Empresa ABC', empresaId: 'empresa-abc' },
    monto: 99.99,
    plan: 'Pro',
    estado: 'pendiente',
    fechaComprobante: '2024-01-15',
    metodo: 'Transferencia',
    referencia: 'REF-001234',
    comprobanteUrl: '/uploads/comprobante1.jpg'
  },
  {
    _id: '2',
    empresa: { nombre: 'Tech Solutions', empresaId: 'tech-solutions' },
    monto: 199.99,
    plan: 'Enterprise',
    estado: 'pendiente',
    fechaComprobante: '2024-01-14',
    metodo: 'Depósito',
    referencia: 'REF-005678',
    comprobanteUrl: '/uploads/comprobante2.jpg'
  },
  {
    _id: '3',
    empresa: { nombre: 'Startup XYZ', empresaId: 'startup-xyz' },
    monto: 49.99,
    plan: 'Básico',
    estado: 'aprobado',
    fechaComprobante: '2024-01-10',
    metodo: 'Transferencia',
    referencia: 'REF-009876',
    comprobanteUrl: null
  }
]

const fetchPagos = async () => {
  loading.value = true
  // Simular API call
  await new Promise(r => setTimeout(r, 500))
  pagos.value = mockPagos
  loading.value = false
}

const filteredPagos = computed(() => {
  let result = pagos.value
  
  if (filterStatus.value !== 'todos') {
    result = result.filter(p => p.estado === filterStatus.value)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p => 
      p.empresa.nombre.toLowerCase().includes(query) ||
      p.referencia.toLowerCase().includes(query)
    )
  }
  
  return result
})

const stats = computed(() => ({
  pendientes: pagos.value.filter(p => p.estado === 'pendiente').length,
  aprobados: pagos.value.filter(p => p.estado === 'aprobado').length,
  rechazados: pagos.value.filter(p => p.estado === 'rechazado').length,
  totalPendiente: pagos.value
    .filter(p => p.estado === 'pendiente')
    .reduce((sum, p) => sum + p.monto, 0)
}))

const aprobarPago = async (pago) => {
  pago.estado = 'aprobado'
  alert(`Pago de ${pago.empresa.nombre} aprobado`)
}

const rechazarPago = async (pago) => {
  if (confirm(`¿Rechazar pago de ${pago.empresa.nombre}?`)) {
    pago.estado = 'rechazado'
    alert('Pago rechazado')
  }
}

onMounted(fetchPagos)
</script>

<template>
  <div class="min-h-screen bg-slate-950 pb-24 md:pb-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-slate-100">Validación de Pagos</h1>
        <p class="text-slate-400 mt-1">Revisa y aprueba los comprobantes de pago</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-amber-900/50 flex items-center justify-center">
              <ClipboardCheck class="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p class="text-sm text-slate-400">Pendientes</p>
              <p class="text-xl font-bold text-slate-100">{{ stats.pendientes }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-green-900/50 flex items-center justify-center">
              <CheckCircle class="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p class="text-sm text-slate-400">Aprobados</p>
              <p class="text-xl font-bold text-slate-100">{{ stats.aprobados }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-red-900/50 flex items-center justify-center">
              <XCircle class="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p class="text-sm text-slate-400">Rechazados</p>
              <p class="text-xl font-bold text-slate-100">{{ stats.rechazados }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-blue-900/50 flex items-center justify-center">
              <DollarSign class="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p class="text-sm text-slate-400">Monto Pendiente</p>
              <p class="text-xl font-bold text-slate-100">${{ stats.totalPendiente.toFixed(2) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="flex flex-col sm:flex-row gap-4 mb-6">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por empresa o referencia..."
            class="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div class="flex items-center gap-2">
          <Filter class="w-4 h-4 text-slate-500" />
          <select
            v-model="filterStatus"
            class="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="todos">Todos</option>
            <option value="pendiente">Pendientes</option>
            <option value="aprobado">Aprobados</option>
            <option value="rechazado">Rechazados</option>
          </select>
        </div>
      </div>

      <!-- Lista de Pagos -->
      <div class="space-y-4">
        <div
          v-for="pago in filteredPagos"
          :key="pago._id"
          class="bg-slate-800 rounded-xl border border-slate-700 p-6"
        >
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <!-- Info del pago -->
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center">
                <Building2 class="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <h3 class="font-semibold text-slate-100">{{ pago.empresa.nombre }}</h3>
                <p class="text-sm text-slate-500">{{ pago.empresa.empresaId }}</p>
                <div class="flex flex-wrap gap-3 mt-2 text-sm">
                  <span class="flex items-center gap-1 text-slate-400">
                    <DollarSign class="w-4 h-4" />
                    ${{ pago.monto.toFixed(2) }}
                  </span>
                  <span class="px-2 py-0.5 rounded bg-blue-900/50 text-blue-300">
                    {{ pago.plan }}
                  </span>
                  <span class="flex items-center gap-1 text-slate-400">
                    <Calendar class="w-4 h-4" />
                    {{ pago.fechaComprobante }}
                  </span>
                  <span class="text-slate-500">Ref: {{ pago.referencia }}</span>
                </div>
              </div>
            </div>

            <!-- Estado y Acciones -->
            <div class="flex items-center gap-4">
              <span :class="[
                'px-3 py-1 rounded-full text-sm font-medium',
                pago.estado === 'pendiente' ? 'bg-amber-900/50 text-amber-300' :
                pago.estado === 'aprobado' ? 'bg-green-900/50 text-green-300' :
                'bg-red-900/50 text-red-300'
              ]">
                {{ pago.estado.toUpperCase() }}
              </span>
              
              <div v-if="pago.estado === 'pendiente'" class="flex items-center gap-2">
                <button
                  v-if="pago.comprobanteUrl"
                  @click="verComprobante(pago)"
                  class="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"
                  title="Ver comprobante"
                >
                  <Eye class="w-5 h-5" />
                </button>
                <button
                  @click="aprobarPago(pago)"
                  class="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm font-medium transition-colors"
                >
                  <CheckCircle class="w-4 h-4" />
                  Aprobar
                </button>
                <button
                  @click="rechazarPago(pago)"
                  class="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-medium transition-colors"
                >
                  <XCircle class="w-4 h-4" />
                  Rechazar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredPagos.length === 0" class="text-center py-12">
          <ClipboardCheck class="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p class="text-slate-400">No hay pagos {{ filterStatus !== 'todos' ? filterStatus + 's' : '' }}</p>
        </div>
      </div>

      <!-- Modal de Comprobante -->
      <Teleport to="body">
        <div
          v-if="showComprobanteModal && comprobanteSeleccionado"
          class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          @click.self="cerrarComprobante"
        >
          <div class="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <!-- Header -->
            <div class="p-4 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h3 class="font-semibold text-slate-200">Comprobante de Pago</h3>
                <p class="text-sm text-slate-400">
                  {{ comprobanteSeleccionado.empresa.nombre }} - Ref: {{ comprobanteSeleccionado.referencia }}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="descargarComprobante"
                  class="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"
                  title="Descargar"
                >
                  <Download class="w-5 h-5" />
                </button>
                <button
                  @click="cerrarComprobante"
                  class="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X class="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <!-- Imagen del comprobante -->
            <div class="p-4 bg-slate-900 flex items-center justify-center min-h-[300px]">
              <img
                v-if="comprobanteSeleccionado.comprobanteUrl"
                :src="comprobanteSeleccionado.comprobanteUrl"
                alt="Comprobante de pago"
                class="max-w-full max-h-[60vh] object-contain rounded-lg"
              />
              <div v-else class="text-center">
                <FileText class="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p class="text-slate-400">No hay imagen disponible</p>
              </div>
            </div>
            
            <!-- Info del pago -->
            <div class="p-4 border-t border-slate-700">
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="text-slate-500">Monto</p>
                  <p class="font-semibold text-slate-200">${{ comprobanteSeleccionado.monto.toFixed(2) }}</p>
                </div>
                <div>
                  <p class="text-slate-500">Plan</p>
                  <p class="font-semibold text-slate-200">{{ comprobanteSeleccionado.plan }}</p>
                </div>
                <div>
                  <p class="text-slate-500">Fecha</p>
                  <p class="font-semibold text-slate-200">{{ comprobanteSeleccionado.fechaComprobante }}</p>
                </div>
                <div>
                  <p class="text-slate-500">Método</p>
                  <p class="font-semibold text-slate-200">{{ comprobanteSeleccionado.metodo }}</p>
                </div>
              </div>
              
              <!-- Acciones rápidas -->
              <div v-if="comprobanteSeleccionado.estado === 'pendiente'" class="flex gap-2 mt-4 pt-4 border-t border-slate-700">
                <button
                  @click="aprobarPago(comprobanteSeleccionado); cerrarComprobante()"
                  class="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors"
                >
                  <CheckCircle class="w-4 h-4" />
                  Aprobar Pago
                </button>
                <button
                  @click="rechazarPago(comprobanteSeleccionado); cerrarComprobante()"
                  class="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors"
                >
                  <XCircle class="w-4 h-4" />
                  Rechazar Pago
                </button>
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>
