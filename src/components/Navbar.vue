<script setup>
import { useRouter, useRoute } from 'vue-router';
import { ref, watch, onMounted, computed } from 'vue';
import api from '../api/axios'; // Importante para sacar la URL base

const route = useRoute();
const router = useRouter();
const user = ref(null);
const menuAbierto = ref(false);

// 1. Cargar usuario desde sessionStorage
const actualizarUsuario = () => {
  const userData = sessionStorage.getItem('user');
  user.value = userData ? JSON.parse(userData) : null;
};

// 2. FUNCIÓN QUE FALTABA: Formatea la ruta de la imagen
const formatearImagen = (ruta) => {
  if (!ruta) return null;
  // Si ya es una URL completa (http...), no hacemos nada
  if (ruta.startsWith('http')) return ruta;
  
  // Obtenemos la URL base de tu axios (ej: http://localhost:3000)
  // Reemplazamos '/api' para apuntar directamente a la carpeta de archivos
  const serverUrl = api.defaults.baseURL.replace('/api', ''); 
  return `${serverUrl}/${ruta}`;
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
  router.push('/'); 
};

// Tu lógica original de Brand Name corregida
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
          
          <div class="mobile-user-header">
            <div class="avatar-circle large">
              <img v-if="user.fotoUrl" :src="formatearImagen(user.fotoUrl)" class="avatar-img" />
              <div v-else class="avatar-init">{{ user.nombre?.charAt(0) }}</div>
            </div>
            <div class="mobile-user-details">
              <span class="mobile-name">{{ user.nombre }}</span>
              <span :class="['role-tag', user.rol]">{{ user.rol }}</span>
            </div>
          </div>
          
          <template v-if="user.rol === 'superadmin'">
            <router-link to="/superadmin-dashboard" class="nav-link" @click="menuAbierto = false">
              <span class="icon">🏠</span> Panel Maestro
            </router-link>
            <router-link to="/superadmin-reportes" class="nav-link" @click="menuAbierto = false">
              <span class="icon">🌍</span> Reportes Globales
            </router-link>
          </template>

          <template v-else-if="user.rol === 'gerente'">
            <router-link to="/dashboard" class="nav-link" @click="menuAbierto = false">
              <span class="icon">📋</span> Mis Tareas
            </router-link>
            <router-link to="/admin" class="nav-link" @click="menuAbierto = false">
              <span class="icon">🏗️</span> Constructor
            </router-link>
            <router-link to="/marketplace" class="nav-link" @click="menuAbierto = false">
              <span class="icon">🛒</span> Tienda Virtual
            </router-link>
            <router-link to="/reportes" class="nav-link" @click="menuAbierto = false">
              <span class="icon">📊</span> Resultados
            </router-link>
            <router-link to="/usuarios" class="nav-link" @click="menuAbierto = false">
              <span class="icon">👥</span> Mi Equipo
            </router-link>
          </template>

          <template v-else-if="user.rol === 'empleado'">
            <router-link to="/dashboard" class="nav-link" @click="menuAbierto = false">
              <span class="icon">📋</span> Mis Tareas
            </router-link>
          </template>

          <router-link to="/perfil" class="nav-link" @click="menuAbierto = false">
            <span class="icon">👤</span> Mi Perfil
          </router-link>

          <button @click="logout" class="nav-link logout-mobile-btn">
            <span class="icon">🚪</span> CERRAR SESIÓN
          </button>
        </div>
      </div>

      <div class="nav-right desktop-only">
        <div class="user-pill">
          <div class="avatar-circle">
            <img v-if="user.fotoUrl" :src="formatearImagen(user.fotoUrl)" class="avatar-img" />
            <div v-else class="avatar-init">{{ user.nombre?.charAt(0) }}</div>
          </div>

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