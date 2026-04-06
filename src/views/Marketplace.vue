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
  <div class="market-page">
    <h1 class="title">Tienda de Formularios</h1>
    <div class="template-grid">
      <div v-for="temp in templates" :key="temp._id" class="template-card">
        <div class="preview-placeholder">📝</div>
        <h3>{{ temp.titulo }}</h3>
        <p>{{ temp.descripcion }}</p>
        <div class="card-footer">
          <span class="badge">{{ temp.categoria }}</span>
          <button @click="instalar(temp._id)" class="btn-download">
            📥 INSTALAR
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

@import '../styles/marketplace.css';
</style>