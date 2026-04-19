<template>
  <div class="profile-container">
    <div class="profile-card" v-if="user">
      
      <div class="avatar-section">
        <div class="avatar-holder">
          <img 
            v-if="user.fotoUrl" 
            :src="formatearImagen(user.fotoUrl)" 
            class="avatar-img"
            @error="handleImageError"
          />
          <div v-else class="avatar-init">{{ user.nombre ? user.nombre.charAt(0) : 'U' }}</div>
          
          <label class="camera-btn">
            <input type="file" @change="subirFoto" hidden accept="image/*" />
            <span>📷</span>
          </label>
        </div>
        <h2 class="user-name">{{ user.nombre }}</h2>
      </div>

      <div class="form-grid">
        <div class="form-column readonly">
          <h3>Información del Sistema</h3>
          <div class="input-box">
            <label>Correo Electrónico</label>
            <input :value="user.email" readonly />
          </div>
          <div class="input-box">
            <label>Rol de Usuario</label>
            <input :value="user.rol" readonly />
          </div>
          <div class="input-box">
            <label>ID de Empresa</label>
            <input :value="user.empresaId" readonly />
          </div>
        </div>

        <form @submit.prevent="guardarDatos" class="form-column">
          <h3>Información Personal</h3>
          <div class="input-box">
            <label>DNI / Identificación</label>
            <input v-model="perfilEdit.dni" type="text" placeholder="Ingrese su DNI" />
          </div>
          <div class="input-box">
            <label>Teléfono de Contacto</label>
            <input v-model="perfilEdit.telefono" type="tel" placeholder="Ingrese su teléfono" />
          </div>
          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? 'GUARDANDO...' : 'ACTUALIZAR PERFIL' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>


<style scoped>

@import '../styles/perfil.css';
</style>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios'; // Tu instancia de Axios

const user = ref(JSON.parse(sessionStorage.getItem('user')) || null);
const loading = ref(false);
const perfilEdit = ref({
  dni: '',
  telefono: ''
});

// 1. CARGAR DATOS AL INICIAR
const cargarPerfil = async () => {
  try {
    const res = await api.get('/usuarios/perfil');
    user.value = res.data;
    
    // Rellenamos los campos con lo que ya existe en la BD
    perfilEdit.value.dni = res.data.dni || '';
    perfilEdit.value.telefono = res.data.telefono || '';
    
    sessionStorage.setItem('user', JSON.stringify(res.data));
  } catch (err) {
    console.error("Error al obtener perfil:", err);
  }
};

onMounted(cargarPerfil);

// 2. SUSTITUCIÓN DE LA URL MANUAL
// Usamos defaults.baseURL de tu instancia de Axios
const formatearImagen = (ruta) => {
  if (!ruta) return null;
  if (ruta.startsWith('http')) return ruta;

  // Obtenemos la URL base (http://localhost:3000) de Axios automáticamente
  const serverUrl = api.defaults.baseURL.replace('/api', ''); 
  return `${serverUrl}/${ruta}`;
};

// 3. SUBIR FOTO
const subirFoto = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('fotoPerfil', file);

  try {
    loading.value = true;
    const res = await api.post('/usuarios/perfil/foto', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    // Actualizamos con timestamp para forzar al navegador a refrescar la imagen
    user.value.fotoUrl = `${res.data.fotoUrl}`;
    sessionStorage.setItem('user', JSON.stringify(user.value));
    alert("Foto actualizada");
    
    // Opcional: recargar datos para asegurar sincronía
    await cargarPerfil();
  } catch (err) {
    console.error("Error al subir:", err);
  } finally {
    loading.value = false;
  }
};

// 4. GUARDAR DATOS
const guardarDatos = async () => {
  loading.value = true;
  try {
    await api.put('/usuarios/perfil', perfilEdit.value);
    // Actualizamos localmente el objeto user
    user.value = { ...user.value, ...perfilEdit.value };
    sessionStorage.setItem('user', JSON.stringify(user.value));
    alert("Datos guardados con éxito");
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleImageError = (e) => {
  console.log("Error cargando imagen en:", e.target.src);
};
</script>