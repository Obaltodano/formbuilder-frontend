<script setup>
import { ref } from 'vue';
import api from '../api/axios';

const nuevoForm = ref({
  titulo: '',
  descripcion: '',
  campos: [] // Aquí se guardan los objetos { label, tipo }
});

// Función para añadir campos dinámicamente
const agregarCampo = (tipo) => {
  const nombreCampo = prompt(`Nombre para el campo de ${tipo}:`, `Ingresar ${tipo}`);
  
  if (nombreCampo) {
    nuevoForm.value.campos.push({
      label: nombreCampo,
      tipo: tipo, // 'text', 'foto', o 'gps'
      required: true
    });
  }
};

const eliminarCampo = (index) => {
  nuevoForm.value.campos.splice(index, 1);
};

const publicarPlantilla = async () => {
  if (nuevoForm.value.campos.length === 0) {
    return alert("El formulario debe tener al menos un campo.");
  }

  try {
    // Enviamos al endpoint de backoffice que creamos antes
    await api.post('/backoffice/market/subir', nuevoForm.value);
    alert("¡Plantilla publicada con éxito!");
    
    // Limpiamos el formulario
    nuevoForm.value = { titulo: '', descripcion: '', campos: [] };
  } catch (err) {
    console.error("Error al publicar:", err);
    alert("Hubo un error al publicar la plantilla.");
  }
};
</script>


<template>
  <div class="backoffice-container">
    <h1 class="section-title">Panel de Control: Marketplace</h1>
    
    <div class="panel-maestro">
      <section class="card-gestion">
        <h2>Nueva Plantilla para Marketplace</h2>
        
        <div class="form-group">
          <label>Título de la Plantilla</label>
          <input v-model="nuevoForm.titulo" placeholder="Ej: Auditoría de Tienda" class="input-back" />
          
          <label>Descripción</label>
          <textarea v-model="nuevoForm.descripcion" placeholder="¿Para qué sirve este formulario?" class="input-back"></textarea>
        </div>
        
        <div class="constructor-campos">
          <p class="sub-label">Añadir Elementos al Formulario:</p>
          <div class="btn-group">
            <button @click="agregarCampo('text')" class="btn-tool">+ Texto</button>
            <button @click="agregarCampo('foto')" class="btn-tool">+ Foto</button>
            <button @click="agregarCampo('gps')" class="btn-tool">+ GPS</button>
          </div>
        </div>

        <div class="preview-campos" v-if="nuevoForm.campos.length > 0">
          <h3>Estructura del Formulario:</h3>
          <div v-for="(campo, index) in nuevoForm.campos" :key="index" class="campo-item">
            <span>{{ index + 1 }}. {{ campo.label }} <strong>({{ campo.tipo }})</strong></span>
            <button @click="eliminarCampo(index)" class="btn-del">×</button>
          </div>
        </div>

        <button @click="publicarPlantilla" class="btn-alta" :disabled="!nuevoForm.titulo">
          🚀 PUBLICAR EN TIENDA VIRTUAL
        </button>
      </section>

      <section class="card-info">
        <h3>Resumen del Market</h3>
        <p>Los formularios publicados aquí serán visibles para todos los Gerentes en su sección de "Tienda".</p>
      </section>
    </div>
  </div>
</template>

<style>
@import url('../styles/backofficemarket.css');
</style>