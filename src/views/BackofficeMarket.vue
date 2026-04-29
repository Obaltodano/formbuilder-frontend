<script setup>
import { ref } from 'vue';
import Constructor from './Constructor.vue';

const mostrarConstructor = ref(false);
const datosEdicion = ref(null);

const abrirConstructor = () => {
  mostrarConstructor.value = true;
  datosEdicion.value = null;
};

const editarPlantilla = (plantilla) => {
  mostrarConstructor.value = true;
  datosEdicion.value = plantilla;
};

const finalizarGuardado = () => {
  mostrarConstructor.value = false;
  datosEdicion.value = null;
  // Aquí podrías recargar la lista de plantillas si es necesario
};
</script>


<template>
  <div class="backoffice-container">
    <h1 class="section-title">Panel de Control: Marketplace</h1>
    
    <div class="panel-maestro">
      <section class="card-gestion">
        <h2>Crear Nueva Plantilla</h2>
        <p class="sub-label">Usa el constructor completo para crear plantillas detalladas para el marketplace.</p>
        
        <button @click="abrirConstructor" class="btn-alta">
          🚀 ABRIR CONSTRUCTOR DE FORMULARIOS
        </button>
      </section>

      <section class="card-info">
        <h3>Resumen del Market</h3>
        <p>Los formularios publicados aquí serán visibles para todos los Gerentes en su sección de "Tienda".</p>
        <p>Incluye campos como descripción, categoría y precio para cada plantilla.</p>
      </section>
    </div>

    <!-- ⭐ Constructor reutilizado con modo marketplace -->
    <Constructor 
      v-if="mostrarConstructor"
      :datosEdicion="datosEdicion"
      modo="marketplace"
      @finalizado="finalizarGuardado"
    />
  </div>
</template>

<style>
@import url('../styles/backofficemarket.css');
</style>