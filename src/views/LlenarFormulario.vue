<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../api/axios';

const route = useRoute();
const router = useRouter();
const formulario = ref(null);
const respuestas = ref({});
const capturandoGps = ref(false);

// Definimos 'user' para cargar los datos del localStorage
const user = ref(null); 
const archivos = ref({}); 

onMounted(async () => {
  // CARGA DEL USUARIO: Esto es vital para que no salga "undefined"
  const savedUser = sessionStorage.getItem('user');
  if (savedUser) {
    user.value = JSON.parse(savedUser);
    console.log("Usuario detectado:", user.value);
  }

  try {
    const res = await api.get(`/formularios/${route.params.id}`);
    formulario.value = res.data;
    
    // Inicializar respuestas
    formulario.value.campos.forEach(campo => {
      respuestas.value[campo._id] = ""; 
    });
  } catch (err) {
    console.error("Error al cargar formulario", err);
  }
});

const manejarArchivo = (event, id) => {
  const archivo = event.target.files[0];
  if (archivo) {
    archivos.value[id] = archivo; // Guardamos el binario real para Multer
    respuestas.value[id] = archivo.name; // Solo para mostrar en la interfaz
  }
};

const obtenerUbicacion = (id) => {
  capturandoGps.value = true;
  navigator.geolocation.getCurrentPosition((pos) => {
    respuestas.value[id] = `${pos.coords.latitude}, ${pos.coords.longitude}`;
    capturandoGps.value = false;
  }, () => { 
    alert("Habilita el GPS para continuar");
    capturandoGps.value = false; 
  });
};

const enviarReporte = async () => {
  // 1. Verificación manual antes de enviar
  if (!user.value || !user.value.empresaId) {
    alert("Error: Los datos de usuario no cargaron. Cierra sesión y vuelve a entrar.");
    return;
  }

  try {
    const formData = new FormData();

    // Metadatos obligatorios
    formData.append('empresaId', user.value.empresaId);
    formData.append('nombreEmpleado', user.value.nombre);
    formData.append('nombreFormulario', formulario.value.titulo);
    formData.append('formularioId', formulario.value._id);

    // Respuestas en JSON
    formData.append('datos', JSON.stringify(respuestas.value));

    // Archivos
    const keys = Object.keys(archivos.value);
    if (keys.length > 0) {
      keys.forEach(key => {
        formData.append('archivo', archivos.value[key]);
      });
    }

    const response = await api.post('/respuestas', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    alert("¡Reporte enviado!");
    router.push('/dashboard');

  } catch (error) {
    // ESTO TE DIRÁ EL ERROR REAL DEL SERVIDOR
    console.error("ERROR REAL DEL SERVIDOR:", error.response?.data);
    alert("Error 500: Revisa la consola del terminal de tu Backend.");
  }
};
</script>

<template>
  <div v-if="formulario" class="llenar-page">
    <header class="form-header">
      <h1 class="form-title">{{ formulario.titulo }}</h1>
    </header>

    <div v-for="campo in formulario.campos" :key="campo._id" class="field-group">
      <label class="field-label">{{ campo.label || campo.etiqueta }}</label>

      <input v-if="campo.tipo === 'texto'" 
             v-model="respuestas[campo._id]" 
             type="text" class="input-text" placeholder="Escribe aquí...">
      
      <input v-if="campo.tipo === 'numero'" 
             v-model="respuestas[campo._id]" 
             type="number" class="input-number">

      <div v-if="campo.tipo === 'gps'">
        <button @click="obtenerUbicacion(campo._id)" class="btn-gps">
          {{ capturandoGps ? 'OBTENIENDO...' : '📍 CAPTURAR UBICACIÓN' }}
        </button>
        <p v-if="respuestas[campo._id]" class="gps-value">{{ respuestas[campo._id] }}</p>
      </div>

      <div v-if="campo.tipo === 'foto'">
        <input type="file" accept="image/*" capture="environment"
               @change="manejarArchivo($event, campo._id)" class="input-file">
      </div>
    </div>

    <button @click="enviarReporte" class="btn-submit">
      ENVIAR REPORTE FINAL
    </button>
  </div>
</template>

<style scoped>
@import '../styles/llenar.css';
</style>