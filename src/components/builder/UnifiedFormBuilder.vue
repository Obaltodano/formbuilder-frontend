<script setup>
import { ref, computed, watch } from 'vue'
import { useUiStore } from '@/stores/useUiStore'
import { 
  Type, AlignLeft, Hash, Mail, CircleDot, 
  ChevronDown, CheckSquare, SlidersHorizontal, Camera, 
  Video, FileUp, MapPin, Grid3X3, Grid2X2, GripVertical, X, Settings
} from 'lucide-vue-next'

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({
      titulo: '',
      descripcion: '',
      campos: []
    })
  },
  modo: {
    type: String,
    default: 'empresa', // 'superadmin' | 'empresa'
    validator: (v) => ['superadmin', 'empresa'].includes(v)
  },
  readOnly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['save', 'cancel', 'preview'])

const uiStore = useUiStore()

// Estado del formulario
const formulario = ref({
  titulo: props.initialData.titulo || '',
  descripcion: props.initialData.descripcion || '',
  campos: [...(props.initialData.campos || [])]
})

const campoSeleccionado = ref(null)
const isDragging = ref(false)
const draggedItemIndex = ref(null)

// Tipos de campo disponibles
const tiposCampo = [
  { id: 'texto_corto', label: 'Texto Corto', icon: Type, categoria: 'basicos' },
  { id: 'texto_largo', label: 'Texto Largo', icon: AlignLeft, categoria: 'basicos' },
  { id: 'numero', label: 'Número', icon: Hash, categoria: 'basicos' },
  { id: 'email', label: 'Email', icon: Mail, categoria: 'basicos' },
  { id: 'radio', label: 'Opción Única', icon: CircleDot, categoria: 'seleccion' },
  { id: 'dropdown', label: 'Desplegable', icon: ChevronDown, categoria: 'seleccion' },
  { id: 'multiple', label: 'Múltiple', icon: CheckSquare, categoria: 'seleccion' },
  { id: 'escala', label: 'Escala', icon: SlidersHorizontal, categoria: 'seleccion' },
  { id: 'foto', label: 'Foto', icon: Camera, categoria: 'multimedia' },
  { id: 'video', label: 'Video', icon: Video, categoria: 'multimedia' },
  { id: 'archivo', label: 'Archivo', icon: FileUp, categoria: 'multimedia' },
  { id: 'gps', label: 'GPS', icon: MapPin, categoria: 'multimedia' },
  { id: 'cuadricula_unica', label: 'Cuadrícula Única', icon: Grid3X3, categoria: 'avanzados' },
  { id: 'cuadricula_multiple', label: 'Cuadrícula Múltiple', icon: Grid2X2, categoria: 'avanzados' }
]

const categorias = {
  basicos: 'Básicos',
  seleccion: 'Selección',
  multimedia: 'Multimedia',
  avanzados: 'Avanzados'
}

// Agregar campo
const agregarCampo = (tipo) => {
  const tipoConfig = tiposCampo.find(t => t.id === tipo)
  
  const nuevoCampo = {
    id: `campo_${Date.now()}`,
    tipo,
    label: `Nuevo ${tipoConfig.label}`,
    requerido: false,
    placeholder: '',
    // Config específica por tipo
    ...(tipo === 'radio' || tipo === 'multiple' || tipo === 'dropdown' ? {
      opciones: ['Opción 1', 'Opción 2']
    } : {}),
    ...(tipo === 'escala' ? {
      escalaMin: 1,
      escalaMax: 5,
      escalaEtiquetaMin: '',
      escalaEtiquetaMax: ''
    } : {}),
    ...(tipo === 'cuadricula_unica' || tipo === 'cuadricula_multiple' ? {
      filas: ['Fila 1'],
      columnas: ['Columna 1', 'Columna 2']
    } : {})
  }
  
  formulario.value.campos.push(nuevoCampo)
  campoSeleccionado.value = nuevoCampo
}

// Seleccionar campo
const seleccionarCampo = (campo) => {
  if (!props.readOnly) {
    campoSeleccionado.value = campo
  }
}

// Eliminar campo
const eliminarCampo = (index) => {
  formulario.value.campos.splice(index, 1)
  if (campoSeleccionado.value?.id === formulario.value.campos[index]?.id) {
    campoSeleccionado.value = null
  }
}

// Duplicar campo
const duplicarCampo = (campo, index) => {
  const copia = JSON.parse(JSON.stringify(campo))
  copia.id = `campo_${Date.now()}`
  copia.label = `${copia.label} (copia)`
  formulario.value.campos.splice(index + 1, 0, copia)
}

// Drag and drop
const handleDragStart = (index) => {
  isDragging.value = true
  draggedItemIndex.value = index
}

const handleDragEnd = () => {
  isDragging.value = false
  draggedItemIndex.value = null
}

const handleDrop = (dropIndex) => {
  if (draggedItemIndex.value === null || draggedItemIndex.value === dropIndex) return
  
  const item = formulario.value.campos.splice(draggedItemIndex.value, 1)[0]
  formulario.value.campos.splice(dropIndex, 0, item)
  
  isDragging.value = false
  draggedItemIndex.value = null
}

// Validar y guardar
const validarFormulario = () => {
  if (!formulario.value.titulo.trim()) {
    uiStore.addToast('El título del formulario es obligatorio', 'error')
    return false
  }
  
  if (formulario.value.campos.length === 0) {
    uiStore.addToast('Debe agregar al menos un campo', 'error')
    return false
  }
  
  // Validar que todos los campos tengan label
  const campoSinLabel = formulario.value.campos.find(c => !c.label.trim())
  if (campoSinLabel) {
    uiStore.addToast('Todos los campos deben tener un label', 'error')
    return false
  }
  
  return true
}

const guardar = () => {
  if (!validarFormulario()) return
  
  // Generar JSON con labels como keys
  const output = {
    titulo: formulario.value.titulo,
    descripcion: formulario.value.descripcion,
    modo: props.modo,
    campos: formulario.value.campos.map(c => ({
      key: c.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
      label: c.label,
      tipo: c.tipo,
      requerido: c.requerido,
      placeholder: c.placeholder,
      opciones: c.opciones,
      escalaMin: c.escalaMin,
      escalaMax: c.escalaMax,
      escalaEtiquetaMin: c.escalaEtiquetaMin,
      escalaEtiquetaMax: c.escalaEtiquetaMax,
      filas: c.filas,
      columnas: c.columnas
    }))
  }
  
  emit('save', output)
}

const cancelar = () => {
  emit('cancel')
}

// Preview
const preview = () => {
  emit('preview', formulario.value)
}

// Agregar/quitar opciones
const agregarOpcion = (campo) => {
  campo.opciones.push(`Opción ${campo.opciones.length + 1}`)
}

const eliminarOpcion = (campo, index) => {
  if (campo.opciones.length > 2) {
    campo.opciones.splice(index, 1)
  }
}

// Agregar filas/columnas para cuadrícula
const agregarFila = (campo) => {
  campo.filas.push(`Fila ${campo.filas.length + 1}`)
}

const agregarColumna = (campo) => {
  campo.columnas.push(`Columna ${campo.columnas.length + 1}`)
}

const eliminarFila = (campo, index) => {
  if (campo.filas.length > 1) campo.filas.splice(index, 1)
}

const eliminarColumna = (campo, index) => {
  if (campo.columnas.length > 2) campo.columnas.splice(index, 1)
}
</script>

<template>
  <div class="flex flex-col lg:flex-row h-screen bg-slate-900 text-slate-100">
    <!-- Panel de Herramientas (Sidebar Izquierdo) -->
    <aside class="w-full lg:w-64 bg-slate-800 border-b lg:border-b-0 lg:border-r border-slate-700 flex flex-col">
      <div class="p-4 border-b border-slate-700">
        <h2 class="text-lg font-bold text-slate-200 flex items-center gap-2">
          <Settings class="w-5 h-5" />
          Componentes
        </h2>
      </div>
      
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <div v-for="(label, categoria) in categorias" :key="categoria">
          <h3 class="text-xs font-semibold text-slate-500 uppercase mb-2">{{ label }}</h3>
          <div class="space-y-1">
            <button
              v-for="tipo in tiposCampo.filter(t => t.categoria === categoria)"
              :key="tipo.id"
              @click="agregarCampo(tipo.id)"
              :disabled="readOnly"
              class="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              <component :is="tipo.icon" class="w-4 h-4 text-slate-400" />
              <span class="text-slate-300">{{ tipo.label }}</span>
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Área de Edición (Centro) -->
    <main class="flex-1 flex flex-col min-w-0">
      <!-- Header -->
      <header class="bg-slate-800 border-b border-slate-700 p-4">
        <div class="max-w-3xl mx-auto space-y-3">
          <input
            v-model="formulario.titulo"
            type="text"
            placeholder="Título del formulario..."
            :disabled="readOnly"
            class="w-full text-2xl font-bold bg-transparent border-b-2 border-slate-600 focus:border-blue-500 outline-none text-slate-100 placeholder-slate-600 px-0 py-1 disabled:cursor-not-allowed"
          />
          <input
            v-model="formulario.descripcion"
            type="text"
            placeholder="Descripción (opcional)..."
            :disabled="readOnly"
            class="w-full text-sm bg-transparent border-b border-slate-600 focus:border-blue-500 outline-none text-slate-400 placeholder-slate-600 px-0 py-1 disabled:cursor-not-allowed"
          />
        </div>
      </header>

      <!-- Campos -->
      <div class="flex-1 overflow-y-auto p-4">
        <div class="max-w-3xl mx-auto space-y-3">
          <!-- Estado vacío -->
          <div v-if="formulario.campos.length === 0" class="text-center py-12 text-slate-500">
            <p class="text-lg mb-2">El formulario está vacío</p>
            <p class="text-sm">Haz clic en un componente de la izquierda para comenzar</p>
          </div>

          <!-- Lista de campos -->
          <div
            v-for="(campo, index) in formulario.campos"
            :key="campo.id"
            draggable="!readOnly"
            @dragstart="handleDragStart(index)"
            @dragend="handleDragEnd"
            @dragover.prevent
            @drop="handleDrop(index)"
            @click="seleccionarCampo(campo)"
            :class="[
              'group relative bg-slate-800 border rounded-lg p-4 cursor-pointer transition-all',
              campoSeleccionado?.id === campo.id 
                ? 'border-blue-500 ring-2 ring-blue-500/20' 
                : 'border-slate-700 hover:border-slate-600',
              isDragging && draggedItemIndex === index ? 'opacity-50' : ''
            ]"
          >
            <!-- Drag Handle -->
            <div 
              v-if="!readOnly"
              class="absolute left-2 top-1/2 -translate-y-1/2 text-slate-600 cursor-grab active:cursor-grabbing"
            >
              <GripVertical class="w-4 h-4" />
            </div>

            <!-- Contenido del Campo -->
            <div class="pl-6">
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs font-medium px-2 py-0.5 rounded bg-slate-700 text-slate-400">
                      {{ tiposCampo.find(t => t.id === campo.tipo)?.label }}
                    </span>
                    <span v-if="campo.requerido" class="text-red-500">*</span>
                  </div>
                  <p class="font-medium text-slate-200">{{ campo.label }}</p>
                  <p v-if="campo.placeholder" class="text-sm text-slate-500 mt-1">
                    Placeholder: {{ campo.placeholder }}
                  </p>
                </div>

                <!-- Acciones -->
                <div v-if="!readOnly" class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    @click.stop="duplicarCampo(campo, index)"
                    class="p-1.5 rounded hover:bg-slate-700 text-slate-400"
                    title="Duplicar"
                  >
                    <span class="text-sm">📋</span>
                  </button>
                  <button 
                    @click.stop="eliminarCampo(index)"
                    class="p-1.5 rounded hover:bg-red-500/20 hover:text-red-400 text-slate-400"
                    title="Eliminar"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer con acciones -->
      <footer v-if="!readOnly" class="bg-slate-800 border-t border-slate-700 p-4">
        <div class="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div class="text-sm text-slate-500">
            {{ formulario.campos.length }} campo(s)
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="cancelar"
              class="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="preview"
              class="px-4 py-2 rounded-lg border border-blue-600 text-blue-400 hover:bg-blue-600/10 transition-colors"
            >
              Vista Previa
            </button>
            <button
              @click="guardar"
              class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
            >
              Guardar Formulario
            </button>
          </div>
        </div>
      </footer>
    </main>

    <!-- Panel de Propiedades (Sidebar Derecho) -->
    <aside 
      v-if="campoSeleccionado && !readOnly"
      class="w-full lg:w-80 bg-slate-800 border-t lg:border-t-0 lg:border-l border-slate-700 flex flex-col"
    >
      <div class="p-4 border-b border-slate-700 flex items-center justify-between">
        <h3 class="font-semibold text-slate-200">Propiedades</h3>
        <button @click="campoSeleccionado = null" class="text-slate-500 hover:text-slate-300">
          <X class="w-4 h-4" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <!-- Label -->
        <div>
          <label class="block text-xs font-medium text-slate-500 mb-1.5">
            Label (Key del JSON) <span class="text-red-500">*</span>
          </label>
          <input
            v-model="campoSeleccionado.label"
            type="text"
            class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-blue-500 outline-none"
            placeholder="Ej: Nombre completo"
          />
          <p class="text-xs text-slate-600 mt-1">
            Key generado: {{ campoSeleccionado.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') }}
          </p>
        </div>

        <!-- Requerido -->
        <div class="flex items-center gap-2">
          <input
            v-model="campoSeleccionado.requerido"
            type="checkbox"
            id="requerido"
            class="w-4 h-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-600"
          />
          <label for="requerido" class="text-sm text-slate-300">Campo obligatorio</label>
        </div>

        <!-- Placeholder (para tipos de texto) -->
        <div v-if="['texto_corto', 'texto_largo', 'email', 'numero'].includes(campoSeleccionado.tipo)">
          <label class="block text-xs font-medium text-slate-500 mb-1.5">Placeholder</label>
          <input
            v-model="campoSeleccionado.placeholder"
            type="text"
            class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-blue-500 outline-none"
            placeholder="Texto de ayuda..."
          />
        </div>

        <!-- Opciones (para radio, dropdown, multiple) -->
        <div v-if="['radio', 'dropdown', 'multiple'].includes(campoSeleccionado.tipo)">
          <label class="block text-xs font-medium text-slate-500 mb-1.5">Opciones</label>
          <div class="space-y-2">
            <div
              v-for="(opcion, idx) in campoSeleccionado.opciones"
              :key="idx"
              class="flex items-center gap-2"
            >
              <input
                v-model="campoSeleccionado.opciones[idx]"
                type="text"
                class="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:border-blue-500 outline-none"
              />
              <button
                @click="eliminarOpcion(campoSeleccionado, idx)"
                :disabled="campoSeleccionado.opciones.length <= 2"
                class="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 disabled:opacity-30"
              >
                <X class="w-3 h-3" />
              </button>
            </div>
            <button
              @click="agregarOpcion(campoSeleccionado)"
              class="w-full py-2 rounded-lg border border-dashed border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-300 text-sm"
            >
              + Agregar opción
            </button>
          </div>
        </div>

        <!-- Escala configuración -->
        <div v-if="campoSeleccionado.tipo === 'escala'" class="space-y-3">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">Mínimo</label>
              <input
                v-model.number="campoSeleccionado.escalaMin"
                type="number"
                min="0"
                max="10"
                class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">Máximo</label>
              <input
                v-model.number="campoSeleccionado.escalaMax"
                type="number"
                min="1"
                max="10"
                class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Etiqueta mínima</label>
            <input
              v-model="campoSeleccionado.escalaEtiquetaMin"
              type="text"
              placeholder="Ej: Muy malo"
              class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Etiqueta máxima</label>
            <input
              v-model="campoSeleccionado.escalaEtiquetaMax"
              type="text"
              placeholder="Ej: Muy bueno"
              class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <!-- Cuadrícula configuración -->
        <div v-if="['cuadricula_unica', 'cuadricula_multiple'].includes(campoSeleccionado.tipo)">
          <div class="mb-4">
            <label class="block text-xs font-medium text-slate-500 mb-1.5">Filas (preguntas)</label>
            <div class="space-y-2">
              <div
                v-for="(fila, idx) in campoSeleccionado.filas"
                :key="idx"
                class="flex items-center gap-2"
              >
                <input
                  v-model="campoSeleccionado.filas[idx]"
                  type="text"
                  class="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:border-blue-500 outline-none"
                />
                <button
                  @click="eliminarFila(campoSeleccionado, idx)"
                  :disabled="campoSeleccionado.filas.length <= 1"
                  class="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 disabled:opacity-30"
                >
                  <X class="w-3 h-3" />
                </button>
              </div>
              <button
                @click="agregarFila(campoSeleccionado)"
                class="w-full py-1.5 rounded-lg border border-dashed border-slate-600 text-slate-400 hover:border-slate-500 text-sm"
              >
                + Fila
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1.5">Columnas (respuestas)</label>
            <div class="space-y-2">
              <div
                v-for="(col, idx) in campoSeleccionado.columnas"
                :key="idx"
                class="flex items-center gap-2"
              >
                <input
                  v-model="campoSeleccionado.columnas[idx]"
                  type="text"
                  class="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:border-blue-500 outline-none"
                />
                <button
                  @click="eliminarColumna(campoSeleccionado, idx)"
                  :disabled="campoSeleccionado.columnas.length <= 2"
                  class="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 disabled:opacity-30"
                >
                  <X class="w-3 h-3" />
                </button>
              </div>
              <button
                @click="agregarColumna(campoSeleccionado)"
                class="w-full py-1.5 rounded-lg border border-dashed border-slate-600 text-slate-400 hover:border-slate-500 text-sm"
              >
                + Columna
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Overlay para seleccionar campo en móvil -->
    <div 
      v-if="campoSeleccionado && uiStore.isMobile && !readOnly"
      class="fixed inset-0 bg-black/50 z-40"
      @click="campoSeleccionado = null"
    />
  </div>
</template>

<style scoped>
/* Estilos adicionales específicos */
:deep(input[type="checkbox"]) {
  accent-color: #3b82f6;
}

:deep(.draggable-ghost) {
  opacity: 0.5;
  background: rgba(59, 130, 246, 0.1);
  border: 2px dashed #3b82f6;
}

/* Scrollbar personalizada */
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
