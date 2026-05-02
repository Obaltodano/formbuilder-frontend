<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEmpresaStore } from '@/stores/useEmpresaStore'
import { empresaService } from '@/services/empresaService'
import { 
  Building2, 
  Plus, 
  Search, 
  MoreVertical,
  Edit3,
  Ban,
  CheckCircle,
  Trash2,
  ExternalLink,
  X
} from 'lucide-vue-next'

const empresaStore = useEmpresaStore()
const empresas = ref([])
const loading = ref(false)
const searchQuery = ref('')
const filterStatus = ref('todas')

// Modal de nueva empresa
const showNuevaEmpresaModal = ref(false)
const nuevaEmpresa = ref({
  nombre: '',
  empresaId: '',
  email: '',
  plan: 'basico',
  contactoNombre: '',
  contactoTelefono: ''
})
const creandoEmpresa = ref(false)

// Modal de editar empresa
const showEditarEmpresaModal = ref(false)
const empresaEditando = ref(null)
const editandoEmpresa = ref(false)

// Modal de detalles/ver empresa
const showDetalleEmpresaModal = ref(false)
const empresaDetalle = ref(null)

const fetchEmpresas = async () => {
  loading.value = true
  try {
    const response = await empresaService.getAll()
    empresas.value = response.data
  } catch (err) {
    console.error('Error cargando empresas:', err)
  } finally {
    loading.value = false
  }
}

const filteredEmpresas = computed(() => {
  let result = empresas.value
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(e => 
      e.nombre?.toLowerCase().includes(query) ||
      e.empresaId?.toLowerCase().includes(query) ||
      e.email?.toLowerCase().includes(query)
    )
  }
  
  if (filterStatus.value !== 'todas') {
    result = result.filter(e => e.status === filterStatus.value)
  }
  
  return result
})

const toggleStatus = async (empresa) => {
  const newStatus = empresa.status === 'activa' ? 'suspendida' : 'activa'
  try {
    await empresaService.updateStatus(empresa._id, newStatus)
    empresa.status = newStatus
  } catch (err) {
    console.error('Error cambiando estado:', err)
    alert('Error al cambiar estado')
  }
}

const abrirModalNuevaEmpresa = () => {
  nuevaEmpresa.value = {
    nombre: '',
    empresaId: '',
    email: '',
    plan: 'basico',
    contactoNombre: '',
    contactoTelefono: ''
  }
  showNuevaEmpresaModal.value = true
}

const cerrarModalNuevaEmpresa = () => {
  showNuevaEmpresaModal.value = false
}

const crearEmpresa = async () => {
  if (!nuevaEmpresa.value.nombre || !nuevaEmpresa.value.empresaId || !nuevaEmpresa.value.email) {
    alert('Por favor completa los campos obligatorios: Nombre, ID de Empresa y Email')
    return
  }
  
  creandoEmpresa.value = true
  try {
    // Transformar datos al formato esperado por el backend
    // Mapeo de nombres de plan a IDs (esto debería venir del backend, pero por ahora usamos mapeo estático)
    const planMapping = {
      'basico': 'basic',
      'pro': 'pro',
      'enterprise': 'enterprise'
    }
    
    const empresaData = {
      nombre: nuevaEmpresa.value.nombre,
      empresaId: nuevaEmpresa.value.empresaId,
      email: nuevaEmpresa.value.email,
      planId: planMapping[nuevaEmpresa.value.plan] || nuevaEmpresa.value.plan,
      nombreAdmin: nuevaEmpresa.value.contactoNombre,
      password: 'TempPass123!' // Password temporal - el admin debería cambiarlo
    }
    
    const response = await empresaService.create(empresaData)
    empresas.value.unshift(response.data)
    cerrarModalNuevaEmpresa()
    alert('Empresa creada exitosamente')
  } catch (err) {
    console.error('Error creando empresa:', err)
    alert('Error al crear empresa: ' + (err.message || 'Error desconocido'))
  } finally {
    creandoEmpresa.value = false
  }
}

// Funciones para editar
const abrirModalEditar = (empresa) => {
  empresaEditando.value = { ...empresa }
  showEditarEmpresaModal.value = true
}

const cerrarModalEditar = () => {
  showEditarEmpresaModal.value = false
  empresaEditando.value = null
}

const guardarEdicion = async () => {
  if (!empresaEditando.value.nombre || !empresaEditando.value.email) {
    alert('Por favor completa los campos obligatorios')
    return
  }
  
  editandoEmpresa.value = true
  try {
    const response = await empresaService.update(empresaEditando.value._id, {
      nombre: empresaEditando.value.nombre,
      email: empresaEditando.value.email,
      plan: empresaEditando.value.plan,
      contactoNombre: empresaEditando.value.contactoNombre,
      contactoTelefono: empresaEditando.value.contactoTelefono
    })
    
    // Actualizar en la lista
    const index = empresas.value.findIndex(e => e._id === empresaEditando.value._id)
    if (index !== -1) {
      empresas.value[index] = { ...empresas.value[index], ...response.data }
    }
    
    cerrarModalEditar()
    alert('Empresa actualizada exitosamente')
  } catch (err) {
    console.error('Error actualizando empresa:', err)
    alert('Error al actualizar empresa: ' + (err.response?.data?.msg || err.message))
  } finally {
    editandoEmpresa.value = false
  }
}

// Funciones para ver detalles
const abrirModalDetalle = (empresa) => {
  empresaDetalle.value = empresa
  showDetalleEmpresaModal.value = true
}

const cerrarModalDetalle = () => {
  showDetalleEmpresaModal.value = false
  empresaDetalle.value = null
}

const eliminarEmpresa = async (empresa) => {
  if (!confirm(`¿Estás seguro de eliminar la empresa "${empresa.nombre}"? Esta acción no se puede deshacer.`)) {
    return
  }
  
  try {
    await empresaService.delete(empresa._id)
    empresas.value = empresas.value.filter(e => e._id !== empresa._id)
    alert('Empresa eliminada exitosamente')
  } catch (err) {
    console.error('Error eliminando empresa:', err)
    alert('Error al eliminar empresa: ' + (err.response?.data?.msg || err.message))
  }
}

onMounted(fetchEmpresas)
</script>

<template>
  <div class="min-h-screen bg-slate-950 pb-24 md:pb-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-slate-100">Gestión de Empresas</h1>
          <p class="text-slate-400 mt-1">Administra los tenants del sistema</p>
        </div>
        <button 
          @click="abrirModalNuevaEmpresa"
          class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
        >
          <Plus class="w-4 h-4" />
          Nueva Empresa
        </button>
      </div>

      <!-- Filtros -->
      <div class="flex flex-col sm:flex-row gap-4 mb-6">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar empresas..."
            class="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          v-model="filterStatus"
          class="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="todas">Todas</option>
          <option value="activa">Activas</option>
          <option value="suspendida">Suspendidas</option>
          <option value="demo">Demo</option>
        </select>
      </div>

      <!-- Tabla -->
      <div class="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-900/50 border-b border-slate-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Empresa</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Plan</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Estado</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
              <tr v-for="empresa in filteredEmpresas" :key="empresa._id" class="hover:bg-slate-700/50">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                      <Building2 class="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p class="font-medium text-slate-200">{{ empresa.nombre }}</p>
                      <p class="text-sm text-slate-500">{{ empresa.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-slate-400">{{ empresa.empresaId }}</td>
                <td class="px-6 py-4">
                  <span class="px-2 py-1 rounded-full text-xs font-medium bg-blue-900/50 text-blue-300">
                    {{ empresa.plan || 'Básico' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    empresa.status === 'activa' ? 'bg-green-900/50 text-green-300' :
                    empresa.status === 'suspendida' ? 'bg-red-900/50 text-red-300' :
                    'bg-yellow-900/50 text-yellow-300'
                  ]">
                    {{ empresa.status }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <button 
                      @click="toggleStatus(empresa)"
                      :class="[
                        'p-2 rounded-lg transition-colors',
                        empresa.status === 'activa' 
                          ? 'text-amber-400 hover:bg-amber-900/30' 
                          : 'text-green-400 hover:bg-green-900/30'
                      ]"
                      :title="empresa.status === 'activa' ? 'Suspender' : 'Activar'"
                    >
                      <component :is="empresa.status === 'activa' ? Ban : CheckCircle" class="w-4 h-4" />
                    </button>
                    <button 
                      @click="abrirModalEditar(empresa)"
                      class="p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Editar empresa"
                    >
                      <Edit3 class="w-4 h-4" />
                    </button>
                    <button 
                      @click="abrirModalDetalle(empresa)"
                      class="p-2 text-slate-400 hover:bg-slate-700 rounded-lg transition-colors"
                      title="Ver detalles"
                    >
                      <ExternalLink class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Empty State -->
        <div v-if="filteredEmpresas.length === 0 && !loading" class="text-center py-12">
          <Building2 class="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p class="text-slate-400">No se encontraron empresas</p>
        </div>
      </div>

      <!-- Modal Editar Empresa -->
      <Teleport to="body">
        <div
          v-if="showEditarEmpresaModal && empresaEditando"
          class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          @click.self="cerrarModalEditar"
        >
          <div class="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div class="p-4 border-b border-slate-700 flex items-center justify-between">
              <h3 class="font-semibold text-slate-200">Editar Empresa</h3>
              <button @click="cerrarModalEditar" class="text-slate-500 hover:text-slate-300">
                <X class="w-5 h-5" />
              </button>
            </div>
            
            <div class="p-4 space-y-4">
              <div>
                <label class="block text-sm text-slate-400 mb-1">Nombre de la Empresa *</label>
                <input
                  v-model="empresaEditando.nombre"
                  type="text"
                  class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label class="block text-sm text-slate-400 mb-1">ID de Empresa</label>
                <input
                  v-model="empresaEditando.empresaId"
                  type="text"
                  disabled
                  class="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-500 cursor-not-allowed"
                />
                <p class="text-xs text-slate-500 mt-1">El ID no se puede modificar</p>
              </div>
              
              <div>
                <label class="block text-sm text-slate-400 mb-1">Email de Contacto *</label>
                <input
                  v-model="empresaEditando.email"
                  type="email"
                  class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label class="block text-sm text-slate-400 mb-1">Plan</label>
                <select
                  v-model="empresaEditando.plan"
                  class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="basico">Básico ($49.99/mes)</option>
                  <option value="pro">Pro ($99.99/mes)</option>
                  <option value="enterprise">Enterprise ($199.99/mes)</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm text-slate-400 mb-1">Estado</label>
                <select
                  v-model="empresaEditando.status"
                  class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="activa">Activa</option>
                  <option value="suspendida">Suspendida</option>
                  <option value="demo">Demo</option>
                </select>
              </div>
            </div>
            
            <div class="p-4 border-t border-slate-700 flex justify-end gap-2">
              <button
                @click="cerrarModalEditar"
                class="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                @click="guardarEdicion"
                :disabled="editandoEmpresa"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
              >
                {{ editandoEmpresa ? 'Guardando...' : 'Guardar Cambios' }}
              </button>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Modal Detalle Empresa -->
      <Teleport to="body">
        <div
          v-if="showDetalleEmpresaModal && empresaDetalle"
          class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          @click.self="cerrarModalDetalle"
        >
          <div class="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-lg">
            <div class="p-4 border-b border-slate-700 flex items-center justify-between">
              <h3 class="font-semibold text-slate-200">Detalles de Empresa</h3>
              <button @click="cerrarModalDetalle" class="text-slate-500 hover:text-slate-300">
                <X class="w-5 h-5" />
              </button>
            </div>
            
            <div class="p-4 space-y-4">
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-xl bg-slate-700 flex items-center justify-center">
                  <Building2 class="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <h4 class="text-lg font-semibold text-slate-100">{{ empresaDetalle.nombre }}</h4>
                  <p class="text-sm text-slate-400">ID: {{ empresaDetalle.empresaId }}</p>
                  <span :class="[
                    'inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1',
                    empresaDetalle.status === 'activa' ? 'bg-green-900/50 text-green-300' :
                    empresaDetalle.status === 'suspendida' ? 'bg-red-900/50 text-red-300' :
                    'bg-yellow-900/50 text-yellow-300'
                  ]">
                    {{ empresaDetalle.status }}
                  </span>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                <div>
                  <p class="text-sm text-slate-500">Plan</p>
                  <p class="font-medium text-slate-200 capitalize">{{ empresaDetalle.plan || 'Básico' }}</p>
                </div>
                <div>
                  <p class="text-sm text-slate-500">Email</p>
                  <p class="font-medium text-slate-200">{{ empresaDetalle.email || 'N/A' }}</p>
                </div>
                <div>
                  <p class="text-sm text-slate-500">Usuarios</p>
                  <p class="font-medium text-slate-200">{{ empresaDetalle.usuariosCount || 0 }} / {{ empresaDetalle.usuariosLimite || 5 }}</p>
                </div>
                <div>
                  <p class="text-sm text-slate-500">Formularios</p>
                  <p class="font-medium text-slate-200">{{ empresaDetalle.formulariosCount || 0 }} / {{ empresaDetalle.formulariosLimite || 10 }}</p>
                </div>
              </div>
              
              <div class="flex gap-2 pt-4 border-t border-slate-700">
                <button
                  @click="cerrarModalDetalle(); abrirModalEditar(empresaDetalle)"
                  class="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
                >
                  <Edit3 class="w-4 h-4" />
                  Editar
                </button>
                <button
                  @click="toggleStatus(empresaDetalle); cerrarModalDetalle()"
                  :class="[
                    'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                    empresaDetalle.status === 'activa'
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  ]"
                >
                  <component :is="empresaDetalle.status === 'activa' ? Ban : CheckCircle" class="w-4 h-4" />
                  {{ empresaDetalle.status === 'activa' ? 'Suspender' : 'Activar' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Modal Nueva Empresa -->
      <Teleport to="body">
        <div
          v-if="showNuevaEmpresaModal"
          class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          @click.self="cerrarModalNuevaEmpresa"
        >
          <div class="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div class="p-4 border-b border-slate-700 flex items-center justify-between">
              <h3 class="font-semibold text-slate-200">Crear Nueva Empresa</h3>
              <button @click="cerrarModalNuevaEmpresa" class="text-slate-500 hover:text-slate-300">
                <X class="w-5 h-5" />
              </button>
            </div>
            
            <div class="p-4 space-y-4">
              <div>
                <label class="block text-sm text-slate-400 mb-1">Nombre de la Empresa *</label>
                <input
                  v-model="nuevaEmpresa.nombre"
                  type="text"
                  placeholder="Ej: Mi Empresa S.A."
                  class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label class="block text-sm text-slate-400 mb-1">ID de Empresa (slug) *</label>
                <input
                  v-model="nuevaEmpresa.empresaId"
                  type="text"
                  placeholder="Ej: mi-empresa"
                  class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <p class="text-xs text-slate-500 mt-1">Este será el identificador único en la URL</p>
              </div>
              
              <div>
                <label class="block text-sm text-slate-400 mb-1">Email de Contacto *</label>
                <input
                  v-model="nuevaEmpresa.email"
                  type="email"
                  placeholder="admin@empresa.com"
                  class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label class="block text-sm text-slate-400 mb-1">Plan</label>
                <select
                  v-model="nuevaEmpresa.plan"
                  class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="basico">Básico ($49.99/mes)</option>
                  <option value="pro">Pro ($99.99/mes)</option>
                  <option value="enterprise">Enterprise ($199.99/mes)</option>
                </select>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm text-slate-400 mb-1">Nombre del Contacto</label>
                  <input
                    v-model="nuevaEmpresa.contactoNombre"
                    type="text"
                    placeholder="Nombre del administrador"
                    class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm text-slate-400 mb-1">Teléfono</label>
                  <input
                    v-model="nuevaEmpresa.contactoTelefono"
                    type="tel"
                    placeholder="+1 234 567 890"
                    class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div class="p-4 border-t border-slate-700 flex justify-end gap-2">
              <button
                @click="cerrarModalNuevaEmpresa"
                class="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                @click="crearEmpresa"
                :disabled="creandoEmpresa"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
              >
                {{ creandoEmpresa ? 'Creando...' : 'Crear Empresa' }}
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>
