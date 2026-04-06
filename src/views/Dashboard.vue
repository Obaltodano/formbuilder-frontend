<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api/axios';

const router = useRouter();
const formularios = ref([]);
const cargando = ref(true);
const user = ref(null);

onMounted(async () => {
  // 1. INTENTAR CARGAR USUARIO
  const savedUser = sessionStorage.getItem('user');
  
  if (!savedUser || savedUser === '{}' || savedUser === 'undefined') {
    console.error("Sesión inválida detectada");
    sessionStorage.removeItem('user'); // Limpiamos basura
    router.push('/'); // Mandamos al login
    return;
  }

  try {
    user.value = JSON.parse(savedUser);
    console.log("Usuario en Dashboard:", user.value);

    // 2. CARGAR FORMULARIOS DE LA API
    cargando.value = true;
    const res = await api.get('/formularios'); 
    
    // Filtramos o asignamos (según cómo responda tu API)
    formularios.value = res.data;
    
  } catch (error) {
    console.error("Error en Dashboard:", error);
    if (error.response?.status === 401) {
      router.push('/'); // Si el token expiró, fuera
    }
  } finally {
    cargando.value = false;
  }
});
</script>

<template>
  <div class="dashboard-wrapper">
    <header v-if="user" class="section-header">
      <h1 class="section-title">MIS TAREAS</h1>
      <div class="header-stats">
        <span class="stats-pill">{{ formularios.length }} DISPONIBLES</span>
      </div>
    </header>

    <main class="tasks-list">
      <div v-if="cargando" class="loading-state">
        <div class="spinner"></div>
        <p>Buscando formularios...</p>
      </div>

      <div v-else-if="formularios.length > 0" class="grid-container">
        <router-link 
          v-for="form in formularios" 
          :key="form._id" 
          :to="`/llenar/${form._id}`"
          class="task-card-wide"
        >
          <div class="task-content">
            <h2 class="task-title">{{ form.titulo }}</h2>
            <p class="task-subtitle">{{ form.campos?.length || 0 }} CAMPOS</p>
          </div>
          
          <div class="task-action-indicator">
            <span class="action-text">ABRIR</span>
            <div class="icon-circle">➔</div>
          </div>
        </router-link>
      </div>

      <div v-else class="empty-state-card">
        <span class="empty-icon">☕</span>
        <h2>No hay tareas pendientes</h2>
        <p>Los formularios para <strong>{{ user?.empresaId }}</strong> aparecerán aquí.</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
@import '../styles/dashboard.css';

.loading-state {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #1e293b;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>