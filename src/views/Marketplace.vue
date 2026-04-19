<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios'; // Usamos tu instancia configurada

const templates = ref([]);

const cargarTienda = async () => {
  const res = await api.get('/market/templates');
  templates.value = res.data;
};

const instalar = async (id) => {
  if (confirm("¿Quieres añadir este formulario a tu empresa?")) {
    try {
      await api.post(`/market/instalar/${id}`);
      alert("¡Instalado! Ya puedes verlo en tu lista de formularios.");
    } catch (err) {
      alert("Error al instalar");
    }
  }
};

onMounted(cargarTienda);
</script>

<template>
  <div class="market-container">
    <div class="market-page">
      <header class="market-header">
        <h1 class="title">Tienda de Formularios</h1>
        <p class="subtitle">Explora e instala plantillas prediseñadas para tu equipo</p>
      </header>

      <div v-if="templates.length > 0" class="template-grid">
        <div v-for="temp in templates" :key="temp._id" class="template-card">
          <div class="card-header">
             <div class="preview-icon">📝</div>
             <span class="badge">{{ temp.categoria }}</span>
          </div>
          
          <div class="card-body">
            <h3>{{ temp.titulo }}</h3>
            <p>{{ temp.descripcion }}</p>
          </div>

          <div class="card-footer">
            <button @click="instalar(temp._id)" class="btn-download">
              <span class="icon">📥</span> INSTALAR
            </button>
          </div>
        </div>
      </div>

      <div v-else class="market-empty">
        <p>Cargando plantillas disponibles...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>

@import '../styles/marketplace.css';
</style>