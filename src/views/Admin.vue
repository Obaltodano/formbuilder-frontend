<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios';

const pestaña = ref('lista'); // 'lista' o 'constructor'
const formularios = ref([]);
const idEditando = ref(null);

// Variables del Constructor
const tituloFormulario = ref('');
const campos = ref([]);

// 1. CARGAR LISTADO
const cargarFormularios = async () => {
  try {
    const res = await api.get('/formularios');
    formularios.value = res.data;
  } catch (err) {
    console.error("Error al traer formularios", err);
  }
};

onMounted(cargarFormularios);

const user = ref(null);

onMounted(() => {
  const savedUser = sessionStorage.getItem('user');
  if (savedUser) {
    user.value = JSON.parse(savedUser);
  }
});


// 2. LÓGICA DEL CONSTRUCTOR
const agregarCampo = (tipo) => {
  campos.value.push({
    id: Date.now(),
    label: '',
    tipo: tipo,
    requerido: false
  });
};

const eliminarCampo = (id) => {
  campos.value = campos.value.filter(c => c.id !== id);
};

// 3. PREPARAR EDICIÓN
const prepararEdicion = (form) => {
  idEditando.value = form._id;
  tituloFormulario.value = form.titulo;
  campos.value = form.campos.map(c => ({
    ...c,
    // El 'id' para Vue será el _id de Mongo convertido a número o un random
    // para que la UI no se queje, pero al guardar lo ignoraremos.
    id: Date.now() + Math.random(), 
    label: c.etiqueta || c.label
  }));
  pestaña.value = 'constructor';
};

const cancelarEdicion = () => {
  idEditando.value = null;
  tituloFormulario.value = '';
  campos.value = [];
  pestaña.value = 'lista';
};

// 4. GUARDAR (POST o PUT)
const guardarFormulario = async () => {
  if (!tituloFormulario.value.trim()) return alert("⚠️ Escribe un título.");
  if (campos.value.some(c => !c.label.trim())) return alert("⚠️ Campos sin nombre.");

  const payload = {
    titulo: tituloFormulario.value,
    campos: campos.value.map(c => {
      // Creamos un objeto limpio para el servidor
      const campoParaEnviar = {
        etiqueta: c.label.trim(),
        label: c.label.trim(), // Lo enviamos por si tu esquema lo pide
        tipo: c.tipo,
        requerido: c.requerido || false
      };

      // SOLO enviamos el _id de MongoDB si ya existe (para no crear duplicados)
      // Pero NUNCA enviamos el 'id' numérico de Vue
      if (c._id) {
        campoParaEnviar._id = c._id;
      }

      return campoParaEnviar;
    })
  };

  try {
    if (idEditando.value) {
      await api.put(`/formularios/${idEditando.value}`, payload);
      alert("✅ ¡Formulario actualizado!");
    } else {
      await api.post('/formularios', payload);
      alert("🚀 ¡Formulario creado!");
    }
    cancelarEdicion();
    cargarFormularios();
  } catch (error) {
    console.error("Error al guardar:", error);
    alert("❌ Error de validación: Revisa que los campos tengan nombre.");
  }
};

const eliminarFormulario = async (id) => {
  if (!confirm("¿Seguro que quieres borrar este formulario? Se perderán los datos asociados.")) return;
  try {
    await api.delete(`/formularios/${id}`);
    cargarFormularios();
  } catch (err) { alert("Error al borrar"); }
};
</script>

<style scoped>
/* Importamos el CSS específico para este componente */
@import '../styles/admin.css';
</style>

<template>
  <div class="admin-page">
    <header class="admin-header">
      <h1 class="admin-title">ADMINISTRACIÓN</h1>
      
      <nav class="tab-nav">
        <button 
          @click="pestaña = 'lista'" 
          :class="['tab-btn', { active: pestaña === 'lista' }]"
        >
          MIS FORMULARIOS
        </button>
        <button 
          @click="pestaña = 'constructor'; idEditando = null; tituloFormulario=''; campos=[]" 
          :class="['tab-btn', { active: pestaña === 'constructor' }]"
        >
          + CREAR NUEVO
        </button>
      </nav>
    </header>

    <section v-if="pestaña === 'lista'" class="forms-grid">
      <div v-for="form in formularios" :key="form._id" class="form-card">
        <div class="form-meta">
          <h2 class="form-name">{{ form.titulo }}</h2>
          <span class="form-badge">{{ form.campos.length }} PREGUNTAS</span>
        </div>
        <div class="form-actions">
          <button @click="prepararEdicion(form)" class="action-btn edit" title="Editar">✏️</button>
          <button @click="eliminarFormulario(form._id)" class="action-btn delete" title="Eliminar">🗑️</button>
        </div>
      </div>
    </section>

    <section v-if="pestaña === 'constructor'" class="builder-view">
      <div class="builder-card">
        <div class="field-group">
          <label class="field-label">Nombre del Reporte</label>
          <input 
            v-model="tituloFormulario" 
            placeholder="Ej: Control de Inventario" 
            class="main-input"
          >
        </div>
        
        <div class="builder-toolbar">
          <button @click="agregarCampo('texto')" class="tool-btn text">📝 TEXTO</button>
          <button @click="agregarCampo('numero')" class="tool-btn number">🔢 NÚMERO</button>
          <button @click="agregarCampo('gps')" class="tool-btn gps">📍 GPS</button>
          <button @click="agregarCampo('foto')" class="tool-btn photo">📸 FOTO</button>
        </div>

        <div class="fields-preview">
          <div v-for="campo in campos" :key="campo.id" class="field-item">
            <input 
              v-model="campo.label" 
              placeholder="Nombre de la pregunta" 
              class="item-input"
            >
            <span class="item-type-tag">{{ campo.tipo }}</span>
            <button @click="eliminarCampo(campo.id)" class="item-remove">✕</button>
          </div>
        </div>

        <div class="builder-footer">
          <button @click="cancelarEdicion" class="footer-btn cancel">CANCELAR</button>
          <button @click="guardarFormulario" class="footer-btn save">
            {{ idEditando ? '💾 ACTUALIZAR CAMBIOS' : '🚀 PUBLICAR FORMULARIO' }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
@import '../styles/admin.css';
</style>