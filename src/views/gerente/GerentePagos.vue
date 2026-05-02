<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEmpresaStore } from '@/stores/useEmpresaStore'
import { useUsuarioStore } from '@/stores/useUsuarioStore'
import { 
  CreditCard, 
  Calendar, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Download,
  FileText,
  ChevronRight
} from 'lucide-vue-next'

const empresaStore = useEmpresaStore()
const usuarioStore = useUsuarioStore()

const loading = ref(false)
const facturas = ref([])
const planActual = ref(null)

// Planes disponibles
const planes = ref([
  { 
    id: 'basico', 
    nombre: 'Básico', 
    precio: 49.99, 
    usuarios: 5, 
    formularios: 10, 
    storage: '1 GB',
    features: ['5 usuarios', '10 formularios', '1 GB storage', 'Soporte email']
  },
  { 
    id: 'pro', 
    nombre: 'Pro', 
    precio: 99.99, 
    usuarios: 25, 
    formularios: 50, 
    storage: '5 GB',
    features: ['25 usuarios', '50 formularios', '5 GB storage', 'Soporte prioritario', 'API access'],
    recomendado: true
  },
  { 
    id: 'enterprise', 
    nombre: 'Enterprise', 
    precio: 199.99, 
    usuarios: 100, 
    formularios: 'Ilimitados', 
    storage: '50 GB',
    features: ['100 usuarios', 'Formularios ilimitados', '50 GB storage', 'Soporte 24/7', 'API access', 'White-label']
  }
])

const planEmpresa = computed(() => {
  return planes.value.find(p => p.id === empresaStore.empresa?.plan) || planes.value[0]
})

onMounted(() => {
  // Mock data - en producción vendría del backend
  facturas.value = [
    { id: 'INV-001', fecha: '2024-01-01', monto: 99.99, estado: 'pagado', plan: 'Pro' },
    { id: 'INV-002', fecha: '2024-02-01', monto: 99.99, estado: 'pagado', plan: 'Pro' },
    { id: 'INV-003', fecha: '2024-03-01', monto: 99.99, estado: 'pendiente', plan: 'Pro' }
  ]
})

const cambiarPlan = async (planId) => {
  if (!confirm(`¿Confirmar cambio al plan ${planId}? Se generará una nueva factura.`)) {
    return
  }
  alert(`Solicitud de cambio a plan ${planId} enviada. El administrador te contactará.`)
}

const descargarFactura = (factura) => {
  alert(`Descargando factura ${factura.id}...`)
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 pb-24 md:pb-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <CreditCard class="w-6 h-6 text-blue-400" />
          Gestión de Pagos
        </h1>
        <p class="text-slate-400 mt-1">Administra tu suscripción y facturación</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Plan Actual -->
        <div class="lg:col-span-1">
          <div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div class="flex items-center gap-2 mb-4">
              <CheckCircle class="w-5 h-5 text-emerald-400" />
              <h2 class="font-semibold text-slate-200">Plan Actual</h2>
            </div>
            
            <div class="text-center py-4">
              <p class="text-3xl font-bold text-slate-100">{{ planEmpresa.nombre }}</p>
              <p class="text-2xl font-semibold text-blue-400 mt-2">
                ${{ planEmpresa.precio }}<span class="text-sm text-slate-400">/mes</span>
              </p>
            </div>
            
            <div class="space-y-2 text-sm">
              <div class="flex justify-between text-slate-300">
                <span>Usuarios</span>
                <span>{{ planEmpresa.usuarios }}</span>
              </div>
              <div class="flex justify-between text-slate-300">
                <span>Formularios</span>
                <span>{{ planEmpresa.formularios }}</span>
              </div>
              <div class="flex justify-between text-slate-300">
                <span>Storage</span>
                <span>{{ planEmpresa.storage }}</span>
              </div>
            </div>
            
            <div class="mt-6 pt-6 border-t border-slate-700">
              <div class="flex items-center gap-2 text-sm text-slate-400">
                <Clock class="w-4 h-4" />
                <span>Próximo pago: 15 Mar 2024</span>
              </div>
            </div>
          </div>

          <!-- Resumen -->
          <div class="bg-slate-800 rounded-xl border border-slate-700 p-6 mt-6">
            <h3 class="font-semibold text-slate-200 mb-4">Resumen del Período</h3>
            <div class="space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-slate-400">Usuarios activos</span>
                <span class="text-slate-200">3 / {{ planEmpresa.usuarios }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-slate-400">Formularios creados</span>
                <span class="text-slate-200">7 / {{ planEmpresa.formularios }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-slate-400">Storage usado</span>
                <span class="text-slate-200">234 MB / {{ planEmpresa.storage }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Planes Disponibles -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h2 class="font-semibold text-slate-200 mb-6">Planes Disponibles</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                v-for="plan in planes" 
                :key="plan.id"
                :class="[
                  'rounded-xl border p-4 relative',
                  plan.id === planEmpresa.id 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                ]"
              >
                <div v-if="plan.recomendado" class="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span class="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                    Recomendado
                  </span>
                </div>
                
                <div class="text-center mb-4">
                  <h3 class="font-semibold text-slate-200">{{ plan.nombre }}</h3>
                  <p class="text-2xl font-bold text-slate-100 mt-2">
                    ${{ plan.precio }}
                    <span class="text-sm text-slate-400 font-normal">/mes</span>
                  </p>
                </div>
                
                <ul class="space-y-2 text-sm mb-4">
                  <li 
                    v-for="feature in plan.features" 
                    :key="feature"
                    class="flex items-center gap-2 text-slate-400"
                  >
                    <CheckCircle class="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {{ feature }}
                  </li>
                </ul>
                
                <button 
                  @click="cambiarPlan(plan.id)"
                  :disabled="plan.id === planEmpresa.id"
                  :class="[
                    'w-full py-2 rounded-lg text-sm font-medium transition-colors',
                    plan.id === planEmpresa.id
                      ? 'bg-slate-700 text-slate-400 cursor-default'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  ]"
                >
                  {{ plan.id === planEmpresa.id ? 'Plan Actual' : 'Seleccionar' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Historial de Facturas -->
          <div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h2 class="font-semibold text-slate-200 mb-4">Historial de Facturas</h2>
            
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="text-left">
                  <tr class="border-b border-slate-700">
                    <th class="pb-3 text-xs font-medium text-slate-500">Factura</th>
                    <th class="pb-3 text-xs font-medium text-slate-500">Fecha</th>
                    <th class="pb-3 text-xs font-medium text-slate-500">Plan</th>
                    <th class="pb-3 text-xs font-medium text-slate-500">Monto</th>
                    <th class="pb-3 text-xs font-medium text-slate-500">Estado</th>
                    <th class="pb-3 text-xs font-medium text-slate-500"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-700">
                  <tr v-for="factura in facturas" :key="factura.id" class="text-sm">
                    <td class="py-3 text-slate-300">{{ factura.id }}</td>
                    <td class="py-3 text-slate-400">{{ factura.fecha }}</td>
                    <td class="py-3 text-slate-400">{{ factura.plan }}</td>
                    <td class="py-3 text-slate-200">${{ factura.monto }}</td>
                    <td class="py-3">
                      <span :class="[
                        'px-2 py-1 rounded-full text-xs',
                        factura.estado === 'pagado' 
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      ]">
                        {{ factura.estado === 'pagado' ? 'Pagado' : 'Pendiente' }}
                      </span>
                    </td>
                    <td class="py-3 text-right">
                      <button 
                        @click="descargarFactura(factura)"
                        class="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded transition-colors"
                        title="Descargar factura"
                      >
                        <Download class="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div v-if="facturas.length === 0" class="text-center py-8 text-slate-500">
              <FileText class="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay facturas registradas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
