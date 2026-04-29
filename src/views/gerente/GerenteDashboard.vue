<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEmpresaStore } from '@/stores/useEmpresaStore'
import { useUsuarioStore } from '@/stores/useUsuarioStore'
import { useUiStore } from '@/stores/useUiStore'
import { 
  Palette, Users, FileText, HardDrive, Upload,
  CheckCircle, AlertTriangle, Settings, CreditCard,
  TrendingUp, QrCode, ChevronRight
} from 'lucide-vue-next'

const empresaStore = useEmpresaStore()
const usuarioStore = useUsuarioStore()
const uiStore = useUiStore()

// Tabs
const activeTab = ref('overview') // overview, branding, billing, limits

// Branding
const logoFile = ref(null)
const logoPreview = ref(null)
const colorPrimario = ref('#3b82f6')
const colorSecundario = ref('#1e293b')
const uploading = ref(false)

// Computed
const limits = computed(() => empresaStore.limits)
const canCreateUser = computed(() => empresaStore.canCreateUser)
const canCreateForm = computed(() => empresaStore.canCreateForm)
const storagePercentage = computed(() => empresaStore.storagePercentage)

const usageStats = computed(() => [
  {
    label: 'Usuarios',
    used: limits.value.usuariosUsados,
    total: limits.value.usuariosLimite,
    percentage: Math.round((limits.value.usuariosUsados / limits.value.usuariosLimite) * 100),
    icon: Users,
    color: 'bg-blue-500'
  },
  {
    label: 'Formularios',
    used: limits.value.formulariosUsados,
    total: limits.value.formulariosLimite,
    percentage: Math.round((limits.value.formulariosUsados / limits.value.formulariosLimite) * 100),
    icon: FileText,
    color: 'bg-purple-500'
  },
  {
    label: 'Storage',
    used: (limits.value.storageUsado / 1024).toFixed(1),
    total: (limits.value.storageLimite / 1024).toFixed(1),
    unit: 'GB',
    percentage: storagePercentage.value,
    icon: HardDrive,
    color: 'bg-orange-500'
  }
])

// Actions branding
const handleLogoSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    logoFile.value = file
    logoPreview.value = URL.createObjectURL(file)
  }
}

const saveBranding = async () => {
  uploading.value = true
  try {
    // Subir logo si hay archivo
    if (logoFile.value && empresaStore.empresa?._id) {
      await empresaStore.updateBranding({
        logoFile: logoFile.value
      })
    }
    
    // Actualizar colores
    await empresaStore.updateBranding({
      colorPrimario: colorPrimario.value,
      colorSecundario: colorSecundario.value
    })
    
    uiStore.addToast('Branding actualizado correctamente', 'success')
  } catch (err) {
    uiStore.addToast('Error al actualizar branding', 'error')
  } finally {
    uploading.value = false
  }
}

const init = async () => {
  if (empresaStore.empresa?._id) {
    await empresaStore.refreshLimits()
    // Cargar colores actuales
    colorPrimario.value = empresaStore.branding.colorPrimario
    colorSecundario.value = empresaStore.branding.colorSecundario
  }
}

onMounted(init)
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-slate-100">
    <!-- Header -->
    <header class="bg-slate-800 border-b border-slate-700">
      <div class="px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div 
              v-if="empresaStore.branding.logoUrl"
              class="w-10 h-10 rounded-lg overflow-hidden"
            >
              <img :src="empresaStore.branding.logoUrl" class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
              <span class="text-lg font-bold text-slate-500">
                {{ empresaStore.branding.nombreEmpresa.charAt(0) }}
              </span>
            </div>
            <div>
              <h1 class="text-xl font-bold text-slate-100">
                {{ empresaStore.branding.nombreEmpresa }}
              </h1>
              <p class="text-xs text-slate-500">Panel de Administración</p>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
            <span 
              v-if="empresaStore.isDemo"
              class="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium"
            >
              Modo Demo
            </span>
            <span 
              v-if="empresaStore.isSuspended"
              class="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium"
            >
              Suspendido
            </span>
            <button class="p-2 rounded-lg hover:bg-slate-700 text-slate-400">
              <Settings class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="px-4 sm:px-6 lg:px-8 border-t border-slate-700">
        <nav class="flex gap-1 -mb-px overflow-x-auto">
          <button
            v-for="tab in [
              { id: 'overview', label: 'Resumen', icon: TrendingUp },
              { id: 'branding', label: 'Apariencia', icon: Palette },
              { id: 'billing', label: 'Facturación', icon: CreditCard },
              { id: 'limits', label: 'Límites', icon: HardDrive }
            ]"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            ]"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            {{ tab.label }}
          </button>
        </nav>
      </div>
    </header>

    <main class="px-4 sm:px-6 lg:px-8 py-6">
      <!-- Tab: Overview -->
      <div v-if="activeTab === 'overview'" class="space-y-6">
        <!-- Alertas de límite -->
        <div v-if="!canCreateUser || !canCreateForm || storagePercentage > 80" class="space-y-3">
          <div 
            v-if="!canCreateUser"
            class="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-center gap-3"
          >
            <AlertTriangle class="w-5 h-5 text-amber-400" />
            <div class="flex-1">
              <p class="text-sm font-medium text-amber-400">Límite de usuarios alcanzado</p>
              <p class="text-xs text-amber-400/70">Actualiza tu plan para agregar más usuarios</p>
            </div>
            <button 
              @click="activeTab = 'billing'"
              class="px-3 py-1.5 bg-amber-500 text-slate-900 rounded-lg text-sm font-medium hover:bg-amber-400"
            >
              Actualizar
            </button>
          </div>
        </div>

        <!-- Stats de uso -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div 
            v-for="stat in usageStats" 
            :key="stat.label"
            class="bg-slate-800 rounded-xl border border-slate-700 p-4"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2">
                <component :is="stat.icon" class="w-5 h-5 text-slate-400" />
                <span class="text-sm text-slate-400">{{ stat.label }}</span>
              </div>
            </div>
            
            <div class="flex items-end justify-between">
              <div>
                <span class="text-2xl font-bold text-slate-100">{{ stat.used }}</span>
                <span class="text-sm text-slate-500">/ {{ stat.total }} {{ stat.unit || '' }}</span>
              </div>
              <span :class="['text-sm font-medium', stat.percentage > 90 ? 'text-red-400' : 'text-slate-400']">
                {{ stat.percentage }}%
              </span>
            </div>
            
            <div class="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                :class="['h-full rounded-full transition-all', stat.color]"
                :style="{ width: `${Math.min(stat.percentage, 100)}%` }"
              />
            </div>
          </div>
        </div>

        <!-- Acciones rápidas -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <router-link 
            to="/formularios"
            class="flex items-center gap-3 p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-colors group"
          >
            <div class="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20">
              <FileText class="w-5 h-5 text-blue-400" />
            </div>
            <div class="flex-1">
              <p class="font-medium text-slate-200">Formularios</p>
              <p class="text-xs text-slate-500">Gestionar formas</p>
            </div>
            <ChevronRight class="w-5 h-5 text-slate-600" />
          </router-link>

          <router-link 
            to="/usuarios"
            class="flex items-center gap-3 p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-purple-500/50 transition-colors group"
          >
            <div class="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20">
              <Users class="w-5 h-5 text-purple-400" />
            </div>
            <div class="flex-1">
              <p class="font-medium text-slate-200">Usuarios</p>
              <p class="text-xs text-slate-500">{{ limits.usuariosUsados }} de {{ limits.usuariosLimite }}</p>
            </div>
            <ChevronRight class="w-5 h-5 text-slate-600" />
          </router-link>

          <button 
            @click="activeTab = 'branding'"
            class="flex items-center gap-3 p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-emerald-500/50 transition-colors group text-left"
          >
            <div class="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20">
              <Palette class="w-5 h-5 text-emerald-400" />
            </div>
            <div class="flex-1">
              <p class="font-medium text-slate-200">Branding</p>
              <p class="text-xs text-slate-500">Personalizar apariencia</p>
            </div>
            <ChevronRight class="w-5 h-5 text-slate-600" />
          </button>

          <button 
            @click="activeTab = 'billing'"
            class="flex items-center gap-3 p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-amber-500/50 transition-colors group text-left"
          >
            <div class="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20">
              <CreditCard class="w-5 h-5 text-amber-400" />
            </div>
            <div class="flex-1">
              <p class="font-medium text-slate-200">Facturación</p>
              <p class="text-xs text-slate-500">Ver plan y pagos</p>
            </div>
            <ChevronRight class="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      <!-- Tab: Branding -->
      <div v-if="activeTab === 'branding'" class="max-w-2xl space-y-6">
        <div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 class="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Palette class="w-5 h-5 text-slate-400" />
            Personalización de Marca
          </h2>

          <div class="space-y-6">
            <!-- Logo -->
            <div>
              <label class="block text-sm font-medium text-slate-400 mb-3">Logo de la empresa</label>
              <div class="flex items-center gap-4">
                <div 
                  class="w-20 h-20 rounded-xl border-2 border-dashed border-slate-600 flex items-center justify-center overflow-hidden"
                  :style="{ borderColor: colorPrimario }"
                >
                  <img 
                    v-if="logoPreview || empresaStore.branding.logoUrl" 
                    :src="logoPreview || empresaStore.branding.logoUrl" 
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="text-2xl font-bold" :style="{ color: colorPrimario }">
                    {{ empresaStore.branding.nombreEmpresa.charAt(0) }}
                  </span>
                </div>
                <div class="flex-1">
                  <label class="flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors">
                    <Upload class="w-4 h-4 text-slate-400" />
                    <span class="text-sm text-slate-300">Cambiar logo</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      class="hidden" 
                      @change="handleLogoSelect"
                    />
                  </label>
                  <p class="text-xs text-slate-500 mt-1">PNG, JPG o SVG. Máximo 2MB.</p>
                </div>
              </div>
            </div>

            <!-- Colores -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-400 mb-2">Color Primario</label>
                <div class="flex items-center gap-3">
                  <input 
                    v-model="colorPrimario"
                    type="color"
                    class="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                  />
                  <input 
                    v-model="colorPrimario"
                    type="text"
                    class="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 uppercase"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-400 mb-2">Color Secundario</label>
                <div class="flex items-center gap-3">
                  <input 
                    v-model="colorSecundario"
                    type="color"
                    class="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                  />
                  <input 
                    v-model="colorSecundario"
                    type="text"
                    class="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 uppercase"
                  />
                </div>
              </div>
            </div>

            <!-- Preview -->
            <div>
              <label class="block text-sm font-medium text-slate-400 mb-2">Vista previa</label>
              <div 
                class="p-6 rounded-xl border border-slate-700"
                :style="{ backgroundColor: colorSecundario + '20' }"
              >
                <div class="flex items-center gap-3 mb-4">
                  <div 
                    class="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                    :style="{ backgroundColor: colorPrimario }"
                  >
                    {{ empresaStore.branding.nombreEmpresa.charAt(0) }}
                  </div>
                  <span class="font-medium" :style="{ color: colorPrimario }">
                    {{ empresaStore.branding.nombreEmpresa }}
                  </span>
                </div>
                <button 
                  class="px-4 py-2 rounded-lg text-white font-medium"
                  :style="{ backgroundColor: colorPrimario }"
                >
                  Botón de ejemplo
                </button>
              </div>
            </div>

            <button 
              @click="saveBranding"
              :disabled="uploading"
              class="w-full py-3 rounded-lg font-medium text-white transition-all disabled:opacity-50"
              :style="{ backgroundColor: colorPrimario }"
            >
              {{ uploading ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Tab: Billing -->
      <div v-if="activeTab === 'billing'" class="max-w-2xl space-y-6">
        <div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 class="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <CreditCard class="w-5 h-5 text-slate-400" />
            Plan Actual
          </h2>

          <div class="bg-slate-700/30 rounded-xl p-4 mb-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-lg font-semibold text-slate-100">Plan Profesional</span>
              <span class="text-emerald-400 text-sm font-medium">Activo</span>
            </div>
            <p class="text-sm text-slate-400">$49/mes - Facturación mensual</p>
            <p class="text-xs text-slate-500 mt-1">Próximo pago: 15 de enero, 2025</p>
          </div>

          <div class="space-y-3">
            <div class="flex items-center gap-3 text-sm">
              <CheckCircle class="w-4 h-4 text-emerald-400" />
              <span class="text-slate-300">10 usuarios incluidos</span>
            </div>
            <div class="flex items-center gap-3 text-sm">
              <CheckCircle class="w-4 h-4 text-emerald-400" />
              <span class="text-slate-300">Formularios ilimitados</span>
            </div>
            <div class="flex items-center gap-3 text-sm">
              <CheckCircle class="w-4 h-4 text-emerald-400" />
              <span class="text-slate-300">5 GB de almacenamiento</span>
            </div>
            <div class="flex items-center gap-3 text-sm">
              <CheckCircle class="w-4 h-4 text-emerald-400" />
              <span class="text-slate-300">Soporte prioritario</span>
            </div>
          </div>

          <div class="mt-6 flex gap-3">
            <button class="flex-1 py-2.5 bg-slate-700 text-slate-200 rounded-lg font-medium hover:bg-slate-600">
              Cambiar Plan
            </button>
            <button class="flex-1 py-2.5 bg-slate-700 text-slate-200 rounded-lg font-medium hover:bg-slate-600">
              Ver Facturas
            </button>
          </div>
        </div>

        <!-- Pago con transferencia -->
        <div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 class="font-medium text-slate-200 mb-3">Pago por Transferencia</h3>
          <p class="text-sm text-slate-400 mb-4">
            Si prefieres pagar por transferencia bancaria, sube tu comprobante aquí.
          </p>
          <label class="flex items-center justify-center gap-2 w-full py-8 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-slate-500 transition-colors">
            <Upload class="w-5 h-5 text-slate-400" />
            <span class="text-sm text-slate-400">Arrastra o haz clic para subir comprobante</span>
            <input type="file" accept="image/*,.pdf" class="hidden" />
          </label>
        </div>
      </div>

      <!-- Tab: Limits -->
      <div v-if="activeTab === 'limits'" class="max-w-2xl">
        <div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 class="text-lg font-semibold text-slate-200 mb-4">Uso de Recursos</h2>
          
          <div class="space-y-6">
            <div v-for="stat in usageStats" :key="stat.label" class="space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <component :is="stat.icon" class="w-4 h-4 text-slate-400" />
                  <span class="text-sm text-slate-300">{{ stat.label }}</span>
                </div>
                <span class="text-sm text-slate-400">
                  {{ stat.used }} / {{ stat.total }} {{ stat.unit || '' }}
                </span>
              </div>
              <div class="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  :class="['h-full rounded-full', stat.color]"
                  :style="{ width: `${Math.min(stat.percentage, 100)}%` }"
                />
              </div>
              <p :class="['text-xs', stat.percentage > 90 ? 'text-red-400' : 'text-slate-500']">
                {{ stat.percentage }}% utilizado
                <span v-if="stat.percentage > 90" class="font-medium"> - Considera actualizar tu plan</span>
              </p>
            </div>
          </div>

          <div class="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <p class="text-sm text-blue-400">
              <strong>¿Necesitas más recursos?</strong><br />
              Contacta a nuestro equipo de ventas para un plan Enterprise personalizado.
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 3px;
}
</style>
