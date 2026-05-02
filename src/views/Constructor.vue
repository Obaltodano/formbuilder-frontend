<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../api/axios';
import CampoConfigRender from '../components/campos/CampoConfigRender.vue';
import {
  Type, AlignLeft, Hash, Mail, Camera, Video, Paperclip, MapPin,
  Circle, CheckSquare, ChevronDown, BarChart3, Grid3X3, LayoutGrid,
  Save, X, Plus, Trash2, Settings, ArrowLeft, Store
} from 'lucide-vue-next';

const props = defineProps(['datosEdicion', 'modo']);
const emit = defineEmits(['finalizado']);

const idEditando = ref(null);
const tituloFormulario = ref('');
const campos = ref([]);
const campoSeleccionado = ref(null);
const saving = ref(false);

const descripcionFormulario = ref('');
const categoriaFormulario = ref('');
const precioFormulario = ref(0);
const esPublico = ref(true);

const esModoMarketplace = computed(() => props.modo === 'marketplace');

const toolGroups = [
  {
    title: 'Básicos',
    tools: [
      { tipo: 'texto_corto', label: 'Texto Corto', icon: Type },
      { tipo: 'texto_largo', label: 'Texto Largo', icon: AlignLeft },
      { tipo: 'numero', label: 'Número', icon: Hash },
      { tipo: 'email', label: 'Correo', icon: Mail }
    ]
  },
  {
    title: 'Multimedia',
    tools: [
      { tipo: 'foto', label: 'Tomar Foto', icon: Camera },
      { tipo: 'video', label: 'Grabar Video', icon: Video },
      { tipo: 'adjunto', label: 'Adjunto', icon: Paperclip },
      { tipo: 'gps', label: 'GPS', icon: MapPin }
    ]
  },
  {
    title: 'Avanzados',
    tools: [
      { tipo: 'radio', label: 'Opción Única', icon: Circle },
      { tipo: 'multiple', label: 'Múltiple', icon: CheckSquare },
      { tipo: 'dropdown', label: 'Desplegable', icon: ChevronDown },
      { tipo: 'escala', label: 'Escala', icon: BarChart3 },
      { tipo: 'cuadricula_unica', label: 'Cuadrícula Única', icon: Grid3X3 },
      { tipo: 'cuadricula_multiple', label: 'Cuadrícula Múltiple', icon: LayoutGrid }
    ]
  }
];

onMounted(() => {
  if (props.datosEdicion) {
    idEditando.value = props.datosEdicion._id;
    tituloFormulario.value = props.datosEdicion.titulo;
    
    if (esModoMarketplace.value) {
      descripcionFormulario.value = props.datosEdicion.descripcion || '';
      categoriaFormulario.value = props.datosEdicion.categoria || '';
      precioFormulario.value = props.datosEdicion.precio || 0;
      esPublico.value = props.datosEdicion.esPublico !== false;
    }
    
    campos.value = props.datosEdicion.campos.map(c => ({
      ...c,
      id: c.id || Math.random().toString(36).substr(2, 9),
      escalaConfig: c.escalaConfig || { min: 1, max: 5 },
      opciones: c.opciones || [],
      filas: c.filas || [],
      columnas: c.columnas || []
    }));
  }
});

const agregarCampo = (tipo) => {
  const nuevoCampo = {
    id: Date.now().toString(),
    label: 'Nueva pregunta...',
    tipo: tipo,
    requerido: false,
    placeholder: '',
    opciones: ['radio', 'multiple', 'dropdown'].includes(tipo) ? ['Opción 1'] : [],
    filas: ['cuadricula_unica', 'cuadricula_multiple'].includes(tipo) ? ['Pregunta 1'] : [],
    columnas: ['cuadricula_unica', 'cuadricula_multiple'].includes(tipo) ? ['Respuesta 1'] : [],
    escalaConfig: tipo === 'escala' ? { min: 1, max: 5 } : null
  };

  campos.value.push(nuevoCampo);
  campoSeleccionado.value = nuevoCampo;
};

const seleccionarCampo = (campo) => {
  campoSeleccionado.value = campo;
};

const eliminarCampo = (id) => {
  campos.value = campos.value.filter(c => c.id !== id);
  if (campoSeleccionado.value?.id === id) campoSeleccionado.value = null;
};

const guardarFormulario = async () => {
  if (!tituloFormulario.value.trim()) return alert("Título obligatorio");
  
  if (esModoMarketplace.value) {
    if (!descripcionFormulario.value.trim()) return alert("Descripción obligatoria para marketplace");
    if (!categoriaFormulario.value.trim()) return alert("Categoría obligatoria");
  }
  
  saving.value = true;
  try {
    const payload = {
      titulo: tituloFormulario.value,
      campos: campos.value
    };
    
    if (esModoMarketplace.value) {
      payload.descripcion = descripcionFormulario.value;
      payload.categoria = categoriaFormulario.value;
      payload.precio = precioFormulario.value;
      payload.esPublico = esPublico.value;
    }

    const endpoint = esModoMarketplace.value 
      ? '/backoffice/market/subir' 
      : '/formularios';
    
    if (idEditando.value) {
      await api.put(`${endpoint}/${idEditando.value}`, payload);
    } else {
      await api.post(endpoint, payload);
    }
    emit('finalizado');
  } catch (error) {
    console.error('Error guardando formulario:', error);
    
    let mensaje = 'Error al guardar el formulario';
    
    if (error.code === 'LIMITE_PLAN_EXCEDIDO') {
      mensaje = '⚠️ Has alcanzado el límite de formularios de tu plan. Actualiza para crear más.';
    } else if (error.code === 'MISSING_FIELDS') {
      mensaje = '⚠️ Por favor completa todos los campos obligatorios.';
    } else if (error.message) {
      mensaje = error.message;
    }
    
    alert(mensaje);
  } finally {
    saving.value = false;
  }
};

const getTipoLabel = (tipo) => {
  const labels = {
    'texto_corto': 'Texto',
    'texto_largo': 'Párrafo',
    'numero': 'Número',
    'email': 'Email',
    'foto': 'Foto',
    'video': 'Video',
    'adjunto': 'Adjunto',
    'gps': 'Ubicación',
    'radio': 'Opción única',
    'multiple': 'Múltiple',
    'dropdown': 'Desplegable',
    'escala': 'Escala',
    'cuadricula_unica': 'Cuadrícula',
    'cuadricula_multiple': 'Cuadrícula multiple'
  };
  return labels[tipo] || tipo;
};
</script>

<template>
  <div class="min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] bg-slate-950 flex flex-col lg:flex-row overflow-hidden">
    <!-- Left Sidebar - Tools -->
    <aside class="w-full lg:w-64 bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 flex-shrink-0 overflow-y-auto hidden lg:block">
      <div class="p-4 space-y-6">
        <div v-for="group in toolGroups" :key="group.title">
          <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            {{ group.title }}
          </h4>
          <div class="space-y-1">
            <button
              v-for="tool in group.tools"
              :key="tool.tipo"
              @click="agregarCampo(tool.tipo)"
              class="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-slate-100 rounded-lg transition-colors"
            >
              <component :is="tool.icon" class="w-4 h-4 text-slate-400" />
              {{ tool.label }}
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Mobile Tools Button -->
    <button 
      @click="$refs.mobileToolsModal.showModal()"
      class="lg:hidden fixed bottom-20 right-4 z-30 w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg"
    >
      <Plus class="w-6 h-6 text-white" />
    </button>

    <!-- Mobile Tools Modal -->
    <dialog ref="mobileToolsModal" class="bg-slate-900 rounded-xl p-0 m-auto backdrop:bg-black/50">
      <div class="w-[90vw] max-w-sm max-h-[80vh] overflow-y-auto p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-slate-100">Agregar Campo</h3>
          <button @click="$refs.mobileToolsModal.close()" class="p-1 text-slate-400 hover:text-slate-200">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="space-y-6">
          <div v-for="group in toolGroups" :key="group.title">
            <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              {{ group.title }}
            </h4>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="tool in group.tools"
                :key="tool.tipo"
                @click="agregarCampo(tool.tipo); $refs.mobileToolsModal.close()"
                class="flex flex-col items-center gap-2 p-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-slate-100 rounded-lg transition-colors"
              >
                <component :is="tool.icon" class="w-5 h-5 text-slate-400" />
                {{ tool.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </dialog>

    <!-- Main Design Area -->
    <main class="flex-1 overflow-y-auto pb-20 lg:pb-0">
      <div class="max-w-3xl mx-auto p-4 lg:p-8 space-y-6">
        <!-- Header -->
        <div class="bg-slate-800 rounded-xl border border-slate-700 p-4 lg:p-6 space-y-4">
          <input 
            v-model="tituloFormulario" 
            placeholder="Título del Formulario..."
            class="w-full text-xl lg:text-2xl font-bold bg-transparent border-none outline-none text-slate-100 placeholder-slate-500"
          >
          
          <!-- Marketplace Fields -->
          <div v-if="esModoMarketplace" class="space-y-3 pt-4 border-t border-slate-700">
            <input 
              v-model="descripcionFormulario" 
              placeholder="Descripción de la plantilla..."
              class="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:border-blue-500 outline-none"
            >
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input 
                v-model="categoriaFormulario" 
                placeholder="Categoría"
                class="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:border-blue-500 outline-none"
              >
              <div class="flex items-center gap-3">
                <input 
                  v-model.number="precioFormulario" 
                  type="number"
                  placeholder="Precio"
                  class="w-24 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:border-blue-500 outline-none"
                >
                <label class="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                  <input type="checkbox" v-model="esPublico" class="rounded border-slate-600">
                  Público
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Fields List -->
        <div class="space-y-3">
          <div
            v-for="(campo, index) in campos"
            :key="campo.id"
            @click="seleccionarCampo(campo)"
            :class="[
              'group bg-slate-800 rounded-xl border p-4 cursor-pointer transition-all',
              campoSeleccionado?.id === campo.id 
                ? 'border-blue-500 ring-1 ring-blue-500' 
                : 'border-slate-700 hover:border-slate-600'
            ]"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-3">
                <span class="text-xs font-medium text-slate-500">#{{ index + 1 }}</span>
                <span class="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                  {{ getTipoLabel(campo.tipo) }}
                </span>
                <span v-if="campo.requerido" class="text-xs text-red-400">*</span>
              </div>
              <button 
                @click.stop="eliminarCampo(campo.id)"
                class="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
            <p class="text-slate-200 font-medium">
              {{ campo.label || '(Sin pregunta definida)' }}
            </p>
          </div>

          <!-- Empty State -->
          <div v-if="campos.length === 0" class="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl">
            <Plus class="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p class="text-slate-500">El formulario está vacío</p>
            <p class="text-sm text-slate-600">Agrega campos desde el menú lateral</p>
          </div>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end pt-4">
          <button 
            @click="guardarFormulario"
            :disabled="saving || campos.length === 0"
            class="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            <Loader2 v-if="saving" class="w-5 h-5 animate-spin" />
            <Save v-else class="w-5 h-5" />
            {{ saving ? 'Guardando...' : (esModoMarketplace ? 'Publicar' : 'Guardar Formulario') }}
          </button>
        </div>
      </div>
    </main>

    <!-- Right Sidebar - Properties -->
    <aside 
      :class="[
        'fixed lg:static inset-y-0 right-0 w-full lg:w-80 bg-slate-900 border-l border-slate-800 transform transition-transform z-20 lg:transform-none',
        campoSeleccionado ? 'translate-x-0' : 'translate-x-full lg:hidden'
      ]"
    >
      <!-- Mobile Close -->
      <button 
        @click="campoSeleccionado = null"
        class="lg:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200"
      >
        <X class="w-5 h-5" />
      </button>

      <div class="h-full overflow-y-auto p-4 lg:p-6">
        <h3 class="font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Settings class="w-5 h-5" />
          Propiedades
        </h3>
        
        <div v-if="campoSeleccionado" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-400 mb-2">Pregunta</label>
            <input 
              v-model="campoSeleccionado.label" 
              type="text"
              placeholder="Escribe la pregunta..."
              class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:border-blue-500 outline-none"
            >
          </div>
          
          <label class="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
            <input type="checkbox" v-model="campoSeleccionado.requerido" class="rounded border-slate-600">
            Campo obligatorio
          </label>

          <div class="pt-4 border-t border-slate-800">
            <CampoConfigRender :campo="campoSeleccionado" />
          </div>
        </div>

        <div v-else class="text-center py-8 text-slate-500">
          <Settings class="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Selecciona un campo para editar</p>
        </div>
      </div>
    </aside>

    <!-- Mobile Overlay -->
    <div 
      v-if="campoSeleccionado" 
      class="fixed inset-0 bg-black/50 z-10 lg:hidden"
      @click="campoSeleccionado = null"
    ></div>
  </div>
</template>
