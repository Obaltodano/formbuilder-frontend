<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios';

const props = defineProps(['datosEdicion']);
const emit = defineEmits(['finalizado']);

const idEditando = ref(null);
const tituloFormulario = ref('');
const campos = ref([]);

onMounted(() => {
  if (props.datosEdicion) {
    idEditando.value = props.datosEdicion._id;
    tituloFormulario.value = props.datosEdicion.titulo;
    campos.value = props.datosEdicion.campos.map(c => ({
      ...c,
      id: c.id || Math.random(),
      label: c.etiqueta || c.label
    }));
  }
});

const agregarCampo = (tipo) => {
  const nuevoCampo = {
    id: Date.now(),
    label: '',
    tipo: tipo,
    requerido: false,
    opciones: ['radio', 'multiple', 'dropdown', 'escala'].includes(tipo) ? ['Opción 1'] : []
  };

  // Inicialización especial para Cuadrículas
  if (tipo === 'cuadricula_opcion' || tipo === 'cuadricula_casilla') {
    nuevoCampo.filas = ['Fila 1'];
    nuevoCampo.columnas = ['Columna 1'];
  }

  // Inicialización para Escala (Min-Max)
  if (tipo === 'escala') {
    nuevoCampo.escalaMin = 1;
    nuevoCampo.escalaMax = 5;
  }

  campos.value.push(nuevoCampo);
  
  setTimeout(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }, 100);
};

const eliminarCampo = (id) => {
  campos.value = campos.value.filter(c => c.id !== id);
};

const guardarFormulario = async () => {
  if (!tituloFormulario.value.trim()) return alert("⚠️ Título obligatorio");
  
  const payload = {
    titulo: tituloFormulario.value,
    campos: campos.value.map(c => ({
      label: c.label.trim(),
      tipo: c.tipo,
      requerido: c.requerido,
      opciones: c.opciones || [],
      filas: c.filas || [],
      columnas: c.columnas || [],
      escalaConfig: c.tipo === 'escala' ? { min: c.escalaMin, max: c.escalaMax } : null
    }))
  };

  try {
    if (idEditando.value) {
      await api.put(`/formularios/${idEditando.value}`, payload);
    } else {
      await api.post('/formularios', payload);
    }
    alert("🚀 ¡Guardado con éxito!");
    emit('finalizado');
  } catch (error) {
    alert("❌ Error al guardar");
  }
};
</script>

<template>
  <div class="builder-layout">
    <aside class="tool-panel">
      <div class="panel-scroll-content">
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
          <button @click="agregarCampo('archivo')">📎 Adjunto</button>
          <button @click="agregarCampo('gps')">📍 GPS</button>
        </div>
        
        <div class="tool-group">
          <h4>AVANZADOS</h4>
          <button @click="agregarCampo('radio')">🔘 Única</button>
          <button @click="agregarCampo('multiple')">✅ Múltiple</button>
          <button @click="agregarCampo('dropdown')">📜 Desplegable</button>
          <button @click="agregarCampo('escala')">📈 Escala Lineal</button>
          <button @click="agregarCampo('cuadricula_opcion')">📊 Cuadrícula Única</button>
          <button @click="agregarCampo('cuadricula_casilla')">🏁 Cuadrícula Múltiple</button>
        </div>
      </div>
    </aside>

    <main class="work-area">
      <div class="work-header">
        <input v-model="tituloFormulario" placeholder="Título del Formulario..." class="title-input">
      </div>

      <div class="fields-list">
        <div v-for="(campo, index) in campos" :key="campo.id" class="field-card">
          <div class="field-main">
            <span class="field-index">#{{ index + 1 }}</span>
            <input v-model="campo.label" placeholder="Escriba la pregunta o instrucción..." class="label-input">
            <button @click="eliminarCampo(campo.id)" class="btn-del">🗑️</button>
          </div>

          <div v-if="['radio', 'multiple', 'dropdown'].includes(campo.tipo)" class="options-container">
            <p class="options-title">Configurar Opciones:</p>
            <div class="options-grid">
              <div v-for="(opc, i) in campo.opciones" :key="i" class="opt-row">
                <input v-model="campo.opciones[i]" class="opt-input">
                <button @click="campo.opciones.splice(i, 1)" class="btn-opt-del">✕</button>
              </div>
              <button @click="campo.opciones.push('Nueva Opción')" class="btn-add-opt">+ Añadir Opción</button>
            </div>
          </div>

          <div v-if="campo.tipo === 'escala'" class="options-container">
            <p class="options-title">Rango de escala:</p>
            <div class="scale-editor">
              <select v-model="campo.escalaMin">
                <option :value="0">0</option>
                <option :value="1">1</option>
              </select>
              <span>hasta</span>
              <select v-model="campo.escalaMax">
                <option v-for="n in 9" :key="n" :value="n + 1">{{ n + 1 }}</option>
                <option :value="10">10</option>
              </select>
            </div>
          </div>

          <div v-if="['cuadricula_opcion', 'cuadricula_casilla'].includes(campo.tipo)" class="grid-editor-container">
            <div class="grid-section">
              <p class="options-title">Filas (Preguntas):</p>
              <div v-for="(fila, i) in campo.filas" :key="i" class="opt-row">
                <input v-model="campo.filas[i]" class="opt-input">
                <button @click="campo.filas.splice(i, 1)" class="btn-opt-del">✕</button>
              </div>
              <button @click="campo.filas.push('Nueva Fila')" class="btn-add-opt small">+ Fila</button>
            </div>
            <div class="grid-section">
              <p class="options-title">Columnas (Respuestas):</p>
              <div v-for="(col, i) in campo.columnas" :key="i" class="opt-row">
                <input v-model="campo.columnas[i]" class="opt-input">
                <button @click="campo.columnas.splice(i, 1)" class="btn-opt-del">✕</button>
              </div>
              <button @click="campo.columnas.push('Nueva Columna')" class="btn-add-opt small">+ Columna</button>
            </div>
          </div>

          <div class="field-config">
            <span class="badge-tipo" :class="campo.tipo">{{ campo.tipo.replace(/_/g, ' ').toUpperCase() }}</span>
            <label class="switch-req">
              <input type="checkbox" v-model="campo.requerido"> Obligatorio
            </label>
          </div>
        </div>
      </div>

      <div class="builder-actions">
        <button @click="guardarFormulario" class="btn-save">PUBLICAR DISEÑO FINAL</button>
      </div>
    </main>
  </div>
</template>

<style scoped>
@import '../styles/builder.css';
</style>