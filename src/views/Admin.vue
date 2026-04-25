<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios';
import Constructor from './Constructor.vue'; 

const pestaña = ref('lista'); 
const formularios = ref([]);
const formularioSeleccionado = ref(null);

const cargarFormularios = async () => {
  try {
    const res = await api.get('/formularios');
    formularios.value = res.data;
  } catch (err) { 
    console.error("Error al obtener formularios:", err); 
  }
};

onMounted(cargarFormularios);

const irAConstructorNuevo = () => {
  formularioSeleccionado.value = null; 
  pestaña.value = 'constructor';
};

const prepararEdicion = (form) => {
  // Aseguramos que pasamos una copia limpia para editar
  formularioSeleccionado.value = JSON.parse(JSON.stringify(form));
  pestaña.value = 'constructor';
};

const finalizarGuardado = () => {
  pestaña.value = 'lista';
  cargarFormularios();
};

const eliminarFormulario = async (id) => {
  if (!confirm("¿Seguro que quieres borrar este reporte?")) return;
  try {
    await api.delete(`/formularios/${id}`);
    cargarFormularios();
  } catch (err) { 
    alert("No se pudo eliminar el formulario"); 
  }
};
</script>

<template>
  <div class="admin-page">
    <header class="admin-header">
      <h1 class="admin-title">ADMINISTRACIÓN</h1>
      <nav class="tab-nav">
        <button @click="pestaña = 'lista'" :class="['tab-btn', { active: pestaña === 'lista' }]">
          MIS FORMULARIOS
        </button>
        <button @click="irAConstructorNuevo" :class="['tab-btn', { active: pestaña === 'constructor' }]">
          + CREAR NUEVO
        </button>
      </nav>
    </header>

    <section v-if="pestaña === 'lista'" class="forms-grid">
      <div v-for="form in formularios" :key="form._id" class="form-card">
        <div class="form-meta">
          <h2 class="form-name">{{ form.titulo }}</h2>
          <span class="form-badge">{{ form.campos.length }} CAMPOS</span>
        </div>
        <div class="form-actions">
          <button @click="prepararEdicion(form)" class="action-btn edit">✏️</button>
          <button @click="eliminarFormulario(form._id)" class="action-btn delete">🗑️</button>
        </div>
      </div>
      <div v-if="formularios.length === 0" class="empty-state">
        <p>No hay formularios. Haz clic en "+ CREAR NUEVO".</p>
      </div>
    </section>

    <section v-if="pestaña === 'constructor'" class="builder-container">
      <Constructor 
        :datosEdicion="formularioSeleccionado" 
        @finalizado="finalizarGuardado"
      />
    </section>
  </div>
</template>

<style scoped>
@import '../styles/admin.css';
</style>