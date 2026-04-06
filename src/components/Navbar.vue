<script setup>
import { useRouter, useRoute } from 'vue-router';
import { ref, watch, onMounted, computed } from 'vue';

const route = useRoute();
const router = useRouter();
const user = ref(null);
const menuAbierto = ref(false);

// Cargar usuario desde sessionStorage
const actualizarUsuario = () => {
  const userData = sessionStorage.getItem('user');
  user.value = userData ? JSON.parse(userData) : null;
};

onMounted(() => {
  actualizarUsuario();
});

// Vigilamos cambios de ruta para cerrar el menú móvil y re-verificar usuario
watch(() => route.path, () => {
  actualizarUsuario();
  menuAbierto.value = false;
});

const logout = () => {
  sessionStorage.clear();
  localStorage.clear();
  router.push('/'); // Usamos router para una navegación más fluida
};

// Computed para simplificar el nombre del logo
const brandName = computed(() => {
  if (!user.value) return 'Sistema';
  return user.value.rol === 'superadmin' ? '☁️ SuperAdmin' : user.value.empresaId;
});
</script>

<template>
  <nav v-if="user && route.path !== '/'" class="main-navbar">
    <div class="navbar-container">
      
      <div class="nav-left">
        <div class="brand-logo">{{ brandName }}</div>
        
        <button 
          class="mobile-menu-btn" 
          @click="menuAbierto = !menuAbierto"
          :class="{ 'active': menuAbierto }"
        >
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>

        <div :class="['nav-menu', { 'is-open': menuAbierto }]">
          
          <template v-if="user.rol === 'superadmin'">
            <router-link to="/superadmin-dashboard" class="nav-link">
              <span class="icon">🏠</span> Panel Maestro
            </router-link>
            <router-link to="/superadmin-reportes" class="nav-link">
              <span class="icon">🌍</span> Reportes Globales
            </router-link>
          </template>

          <template v-else-if="user.rol === 'gerente'">
            <router-link to="/dashboard" class="nav-link">
              <span class="icon">📋</span> Mis Tareas
            </router-link>
            <router-link to="/admin" class="nav-link">
              <span class="icon">🏗️</span> Constructor
            </router-link>
            <router-link to="/marketplace" class="nav-link">
              <span class="icon">🛒</span> Tienda Virtual
            </router-link>
            <router-link to="/reportes" class="nav-link">
              <span class="icon">📊</span> Resultados
            </router-link>
            <router-link to="/usuarios" class="nav-link">
              <span class="icon">👥</span> Mi Equipo
            </router-link>
          </template>

          <template v-else-if="user.rol === 'empleado'">
            <router-link to="/dashboard" class="nav-link">
              <span class="icon">📋</span> Mis Tareas
            </router-link>
          </template>

        </div>
      </div>

      <div class="nav-right desktop-only">
        <div class="user-pill">
          <div class="user-info">
            <span class="user-name">{{ user.nombre }}</span>
            <span :class="['role-tag', user.rol]">{{ user.rol }}</span>
          </div>
          <button @click="logout" class="btn-logout" title="Cerrar Sesión">
            <span class="logout-icon">🚪</span>
          </button>
        </div>
      </div>

    </div>
  </nav>
</template>

<style scoped>
@import '../styles/navbar.css';

</style>