<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from './components/Navbar.vue';
import './styles/theme.css'; // El genérico para todo el sitio

// En App.vue
import { onMounted } from 'vue';

//
const route = useRoute();
const mostrarNavbar = computed(() => route.path !== '/login');


onMounted(() => {
  // 1. Detectar si la página se está recargando (F5)
  if (window.performance && window.performance.navigation.type === window.performance.navigation.TYPE_RELOAD) {
    console.log("Recarga detectada. Limpiando sesión por seguridad...");
    
    // Limpiamos los datos para evitar el error 401
    sessionStorage.clear();
    localStorage.clear();
    
    // Redirigimos al login para empezar de cero
    window.location.href = '/';
  }

  // 2. Bloqueo opcional del botón "Atrás" (Popstate)
  window.history.pushState(null, null, window.location.pathname);
  window.addEventListener('popstate', () => {
    if (sessionStorage.getItem('token')) {
      sessionStorage.clear();
      window.location.href = '/';
    }
  });
});
</script>

<template>
  <div id="app">
    <Navbar v-if="mostrarNavbar" />
    <router-view />
  </div>
</template>