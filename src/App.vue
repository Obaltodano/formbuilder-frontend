<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUsuarioStore } from '@/stores/useUsuarioStore';
import { useEmpresaStore } from '@/stores/useEmpresaStore';
import Navbar from './components/Navbar.vue';
import './styles/theme.css'; // El genérico para todo el sitio

// En App.vue
const route = useRoute();
const router = useRouter();
const usuarioStore = useUsuarioStore();
const empresaStore = useEmpresaStore();

const mostrarNavbar = computed(() => {
  const hiddenPaths = ['/', '/login']
  return !hiddenPaths.includes(route.path)
})

onMounted(async () => {
  // Restaurar sesión si existe token
  const hasSession = usuarioStore.restoreSession();
  
  if (hasSession) {
    console.log('✅ Sesión restaurada:', usuarioStore.user?.rol);
    
    // Cargar datos de empresa si es gerente o empleado
    if (usuarioStore.user?.empresaId && !usuarioStore.isSuperAdmin) {
      try {
        await empresaStore.fetchEmpresaById(usuarioStore.user.empresaId);
      } catch (err) {
        console.error('Error cargando empresa:', err);
      }
    }
  } else {
    console.log('⚠️ No hay sesión activa');
    // Solo redirigir si está en una ruta protegida
    if (route.meta.requiresAuth) {
      router.push('/');
    }
  }
});
</script>

<template>
  <div id="app">
    <Navbar v-if="mostrarNavbar" />
    <router-view />
  </div>
</template>