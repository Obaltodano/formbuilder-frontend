<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios';
// Importamos nuestro renderizador dinámico de configuración
import CampoConfigRender from '../components/campos/CampoConfigRender.vue';

const props = defineProps(['datosEdicion']);
const emit = defineEmits(['finalizado']);

// ESTADOS
const idEditando = ref(null);
const tituloFormulario = ref('');
const campos = ref([]);
const campoSeleccionado = ref(null);

// Inicializar si estamos editando
onMounted(() => {
  if (props.datosEdicion) {
    idEditando.value = props.datosEdicion._id;
    tituloFormulario.value = props.datosEdicion.titulo;
    // Adaptamos los datos que vienen de la DB al formato de nuestros nuevos componentes
    campos.value = props.datosEdicion.campos.map(c => ({
      ...c,
      id: c.id || Math.random().toString(36).substr(2, 9),
      // Aseguramos que existan los objetos de configuración para evitar errores en el Render
      escalaConfig: c.escalaConfig || { min: 1, max: 5 },
      opciones: c.opciones || [],
      filas: c.filas || [],
      columnas: c.columnas || []
    }));
  }
});

// Lógica para añadir campos nuevos
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
  // Seleccionamos automáticamente el nuevo campo para editarlo
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
  if (!tituloFormulario.value.trim()) return alert("⚠️ Título obligatorio");
  
  try {
    const payload = {
      titulo: tituloFormulario.value,
      campos: campos.value
    };

    if (idEditando.value) {
      await api.put(`/formularios/${idEditando.value}`, payload);
    } else {
      await api.post('/formularios', payload);
    }
    alert("🚀 ¡Guardado con éxito!");
    emit('finalizado');
  } catch (error) {
    console.error(error);
    alert("❌ Error al guardar");
  }
};
</script>

<template>
  <div class="constructor-layout">
    
    <aside class="sidebar-izquierdo">
      <div class="tool-group">
        <h4>BÁSICOS</h4>
        <button @click="agregarCampo('texto_corto')">🔡 Texto Corto</button>
        <button @click="agregarCampo('texto_largo')">📄 Texto Largo</button>
        <button @click="agregarCampo('numero')">🔢 Número</button>
        <button @click="agregarCampo('email')">📧 Correo</button>
      </div>
      
      <div class="tool-group">
        <h4>MULTIMEDIA</h4>
        <button @click="agregarCampo('foto')">📸 Tomar Foto</button>
        <button @click="agregarCampo('video')">🎥 Grabar Video</button>
        <button @click="agregarCampo('adjunto')">📎 Adjunto</button>
        <button @click="agregarCampo('gps')">📍 GPS</button>
      </div>
      
      <div class="tool-group">
        <h4>AVANZADOS</h4>
        <button @click="agregarCampo('radio')">🔘 Única</button>
        <button @click="agregarCampo('multiple')">✅ Múltiple</button>
        <button @click="agregarCampo('dropdown')">📜 Desplegable</button>
        <button @click="agregarCampo('escala')">📈 Escala Lineal</button>
        <button @click="agregarCampo('cuadricula_unica')">📊 Cuadrícula Única</button>
        <button @click="agregarCampo('cuadricula_multiple')">🏁 Cuadrícula Múltiple</button>
      </div>
    </aside>

    <main class="diseno-area">
      <div class="work-header">
        <input v-model="tituloFormulario" placeholder="Título del Formulario..." class="title-input">
      </div>

      <div class="fields-list">
        <div 
          v-for="(campo, index) in campos" 
          :key="campo.id" 
          class="field-card"
          :class="{ 'is-selected': campoSeleccionado?.id === campo.id }"
          @click="seleccionarCampo(campo)"
        >
          <div class="field-preview-header">
            <span class="field-index">#{{ index + 1 }}</span>
            <span class="field-type-badge">{{ campo.tipo.replace('_', ' ') }}</span>
            <button @click.stop="eliminarCampo(campo.id)" class="btn-mini-del">✕</button>
          </div>
          <div class="field-label-preview">
            {{ campo.label || '(Sin pregunta definida)' }}
          </div>
        </div>

        <div v-if="campos.length === 0" class="empty-state">
          <p>El formulario está vacío. Agrega un campo para comenzar.</p>
        </div>
      </div>

      <div class="builder-actions">
        <button @click="guardarFormulario" class="btn-save">GUARDAR FORMULARIO</button>
      </div>
    </main>

    <aside class="sidebar-derecha" :class="{ 'active': campoSeleccionado }">
      <div class="mobile-close-handle" @click="campoSeleccionado = null">
        CERRAR Y VOLVER AL DISEÑO ✕
      </div>

      <div class="config-panel-content">
        <h3 class="desktop-only-title">Propiedades</h3>
        
        <div v-if="campoSeleccionado">
          <div class="propiedades-basicas">
            <label>Pregunta / Etiqueta:</label>
            <input v-model="campoSeleccionado.label" type="text" placeholder="Escriba la pregunta...">
            
            <label class="checkbox-label">
              <input type="checkbox" v-model="campoSeleccionado.requerido"> 
              Es obligatorio
            </label>
          </div>

          <CampoConfigRender :campo="campoSeleccionado" />
        </div>

        <div v-else class="no-selection-msg">
          <p>Haz clic en un campo para editarlo</p>
        </div>
      </div>
    </aside>

    <div 
      v-if="campoSeleccionado" 
      class="mobile-overlay" 
      @click="campoSeleccionado = null"
    ></div>

  </div>
</template>

<style scoped>
@import '../styles/builder.css';
</style>
