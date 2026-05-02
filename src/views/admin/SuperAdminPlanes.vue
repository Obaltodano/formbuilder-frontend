<script setup>
import { ref, computed, reactive } from 'vue'
import { 
  Settings,
  Plus,
  Edit3,
  Trash2,
  Users,
  FileText,
  HardDrive,
  Check,
  X
} from 'lucide-vue-next'

const planes = ref([
  {
    _id: '1',
    nombre: 'Básico',
    precio: 49.99,
    descripcion: 'Ideal para pequeños equipos',
    limites: {
      usuarios: 5,
      formularios: 10,
      storage: 1024, // MB
      respuestas: 1000
    },
    activo: true
  },
  {
    _id: '2',
    nombre: 'Pro',
    precio: 99.99,
    descripcion: 'Para empresas en crecimiento',
    limites: {
      usuarios: 25,
      formularios: 50,
      storage: 5120,
      respuestas: 10000
    },
    activo: true
  },
  {
    _id: '3',
    nombre: 'Enterprise',
    precio: 199.99,
    descripcion: 'Solución completa sin límites',
    limites: {
      usuarios: 100,
      formularios: 200,
      storage: 51200,
      respuestas: -1 // ilimitado
    },
    activo: true
  }
])

const editingPlan = ref(null)
const showModal = ref(false)

const newPlan = reactive({
  nombre: '',
  precio: 0,
  descripcion: '',
  limites: {
    usuarios: 5,
    formularios: 10,
    storage: 1024,
    respuestas: 1000
  }
})

const openEditModal = (plan) => {
  editingPlan.value = plan
  Object.assign(newPlan, JSON.parse(JSON.stringify(plan)))
  showModal.value = true
}

const openCreateModal = () => {
  editingPlan.value = null
  Object.assign(newPlan, {
    nombre: '',
    precio: 0,
    descripcion: '',
    limites: {
      usuarios: 5,
      formularios: 10,
      storage: 1024,
      respuestas: 1000
    }
  })
  showModal.value = true
}

const savePlan = () => {
  if (editingPlan.value) {
    Object.assign(editingPlan.value, JSON.parse(JSON.stringify(newPlan)))
  } else {
    planes.value.push({
      _id: Date.now().toString(),
      ...JSON.parse(JSON.stringify(newPlan)),
      activo: true
    })
  }
  showModal.value = false
}

const togglePlan = (plan) => {
  plan.activo = !plan.activo
}

const formatStorage = (mb) => {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`
  return `${mb} MB`
}

const formatNumber = (n) => {
  if (n === -1) return 'Ilimitado'
  return n.toLocaleString()
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 pb-24 md:pb-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-slate-100">Configuración de Planes</h1>
          <p class="text-slate-400 mt-1">Define precios y límites para cada plan</p>
        </div>
        <button 
          @click="openCreateModal"
          class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
        >
          <Plus class="w-4 h-4" />
          Nuevo Plan
        </button>
      </div>

      <!-- Planes Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="plan in planes"
          :key="plan._id"
          :class="[
            'rounded-xl border p-6 transition-all',
            plan.activo 
              ? 'bg-slate-800 border-slate-700' 
              : 'bg-slate-800/50 border-slate-700/50 opacity-75'
          ]"
        >
          <!-- Plan Header -->
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold text-slate-100">{{ plan.nombre }}</h3>
              <p class="text-sm text-slate-400">{{ plan.descripcion }}</p>
            </div>
            <div class="flex items-center gap-1">
              <button 
                @click="openEditModal(plan)"
                class="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"
              >
                <Edit3 class="w-4 h-4" />
              </button>
              <button 
                @click="togglePlan(plan)"
                :class="[
                  'p-1.5 rounded-lg transition-colors',
                  plan.activo ? 'text-green-400 hover:bg-green-900/30' : 'text-slate-400 hover:bg-slate-700'
                ]"
              >
                <Check v-if="plan.activo" class="w-4 h-4" />
                <X v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Precio -->
          <div class="mb-6">
            <span class="text-3xl font-bold text-slate-100">${{ plan.precio }}</span>
            <span class="text-slate-400">/mes</span>
          </div>

          <!-- Límites -->
          <div class="space-y-3">
            <div class="flex items-center gap-3 text-sm">
              <div class="w-8 h-8 rounded-lg bg-blue-900/30 flex items-center justify-center">
                <Users class="w-4 h-4 text-blue-400" />
              </div>
              <span class="text-slate-300">{{ formatNumber(plan.limites.usuarios) }} usuarios</span>
            </div>
            <div class="flex items-center gap-3 text-sm">
              <div class="w-8 h-8 rounded-lg bg-purple-900/30 flex items-center justify-center">
                <FileText class="w-4 h-4 text-purple-400" />
              </div>
              <span class="text-slate-300">{{ formatNumber(plan.limites.formularios) }} formularios</span>
            </div>
            <div class="flex items-center gap-3 text-sm">
              <div class="w-8 h-8 rounded-lg bg-amber-900/30 flex items-center justify-center">
                <HardDrive class="w-4 h-4 text-amber-400" />
              </div>
              <span class="text-slate-300">{{ formatStorage(plan.limites.storage) }} storage</span>
            </div>
          </div>

          <!-- Badge Activo/Inactivo -->
          <div class="mt-6 pt-4 border-t border-slate-700">
            <span :class="[
              'px-2 py-1 rounded-full text-xs font-medium',
              plan.activo ? 'bg-green-900/50 text-green-300' : 'bg-slate-700 text-slate-400'
            ]">
              {{ plan.activo ? 'ACTIVO' : 'INACTIVO' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <Teleport to="body">
        <div
          v-if="showModal"
          class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          @click.self="showModal = false"
        >
          <div class="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div class="p-4 border-b border-slate-700 flex items-center justify-between">
              <h3 class="font-semibold text-slate-200">
                {{ editingPlan ? 'Editar Plan' : 'Nuevo Plan' }}
              </h3>
              <button @click="showModal = false" class="text-slate-500 hover:text-slate-300">
                <X class="w-5 h-5" />
              </button>
            </div>
            
            <div class="p-4 space-y-4">
              <div>
                <label class="block text-sm text-slate-400 mb-1">Nombre del Plan</label>
                <input
                  v-model="newPlan.nombre"
                  type="text"
                  class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm text-slate-400 mb-1">Precio ($)</label>
                  <input
                    v-model.number="newPlan.precio"
                    type="number"
                    step="0.01"
                    class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm text-slate-400 mb-1">Usuarios</label>
                  <input
                    v-model.number="newPlan.limites.usuarios"
                    type="number"
                    class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm text-slate-400 mb-1">Formularios</label>
                  <input
                    v-model.number="newPlan.limites.formularios"
                    type="number"
                    class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm text-slate-400 mb-1">Storage (MB)</label>
                  <input
                    v-model.number="newPlan.limites.storage"
                    type="number"
                    class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label class="block text-sm text-slate-400 mb-1">Descripción</label>
                <textarea
                  v-model="newPlan.descripcion"
                  rows="2"
                  class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>
            </div>
            
            <div class="p-4 border-t border-slate-700 flex justify-end gap-2">
              <button
                @click="showModal = false"
                class="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                @click="savePlan"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
              >
                {{ editingPlan ? 'Guardar Cambios' : 'Crear Plan' }}
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>
