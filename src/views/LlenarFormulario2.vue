<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../api/axios';

const route = useRoute();
const router = useRouter();
const formulario = ref(null);
const respuestas = ref({});
const capturandoGps = ref(false);
const user = ref(null); 
const archivos = ref({}); 
const previews = ref({}); 

// --- LÓGICA DE MULTIMEDIA (CÁMARA Y VIDEO PRO) ---
const showMediaModal = ref(false);
const mediaType = ref(''); // 'foto' o 'video'
const videoRef = ref(null);
const canvasRef = ref(null);
const activeCampoId = ref(null);

let streamInstance = null;
let mediaRecorder = null;
const isRecording = ref(false);
const recordedChunks = ref([]);

onMounted(async () => {
  const savedUser = sessionStorage.getItem('user');
  if (savedUser) user.value = JSON.parse(savedUser);

  try {
    const res = await api.get(`/formularios/${route.params.id}`);
    formulario.value = res.data;
    
    // Inicialización de estructura de respuestas según tipo de campo
    formulario.value.campos.forEach(campo => {
      if (campo.tipo === 'multiple' || campo.tipo === 'cuadricula_casilla') {
        respuestas.value[campo._id] = []; 
      } else if (campo.tipo === 'cuadricula_opcion') {
        respuestas.value[campo._id] = {}; 
      } else if (campo.tipo === 'escala') {
        respuestas.value[campo._id] = campo.escalaConfig?.min || 1;
      } else {
        respuestas.value[campo._id] = ""; 
      }
    });
  } catch (err) {
    console.error("Error al cargar formulario", err);
  }
});

/**
 * GESTIÓN DE CÁMARA Y VIDEO (PC Y MÓVIL)
 */
const abrirMedia = async (id, tipo) => {
  activeCampoId.value = id;
  mediaType.value = tipo;
  showMediaModal.value = true;
  try {
    streamInstance = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: "environment" }, 
      audio: tipo === 'video' 
    });
    if (videoRef.value) videoRef.value.srcObject = streamInstance;
  } catch (err) {
    alert("Error de acceso a periféricos. Verifica los permisos.");
    showMediaModal.value = false;
  }
};

// Captura de Foto
const tomarFoto = () => {
  const video = videoRef.value;
  const canvas = canvasRef.value;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);

  canvas.toBlob((blob) => {
    procesarArchivoFinal(blob, `foto_${Date.now()}.jpg`, 'image/jpeg');
    cerrarMedia();
  }, 'image/jpeg', 0.8);
};

// Grabación de Video
const iniciarGrabacion = () => {
  recordedChunks.value = [];
  mediaRecorder = new MediaRecorder(streamInstance);
  mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunks.value.push(e.data); };
  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks.value, { type: 'video/mp4' });
    procesarArchivoFinal(blob, `video_${Date.now()}.mp4`, 'video/mp4');
  };
  mediaRecorder.start();
  isRecording.value = true;
};

const detenerGrabacion = () => {
  mediaRecorder.stop();
  isRecording.value = false;
  cerrarMedia();
};

const procesarArchivoFinal = (blob, fileName, type) => {
  const file = new File([blob], fileName, { type });
  const id = activeCampoId.value;
  archivos.value[id] = file;
  respuestas.value[id] = `Captura: ${fileName}`;
  if (previews.value[id]) URL.revokeObjectURL(previews.value[id]);
  previews.value[id] = URL.createObjectURL(file);
};

const cerrarMedia = () => {
  if (streamInstance) streamInstance.getTracks().forEach(t => t.stop());
  showMediaModal.value = false;
  isRecording.value = false;
};

/**
 * OTROS EVENTOS (ARCHIVOS Y GPS)
 */
const abrirCapturadorDoc = (id) => {
  const input = document.getElementById('input-file-' + id);
  if (input) input.click();
};

const manejarArchivo = (event, id) => {
  const archivo = event.target.files[0];
  if (archivo) {
    archivos.value[id] = archivo;
    respuestas.value[id] = archivo.name;
    previews.value[id] = null;
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
  if (!user.value?.empresaId) return alert("Error de sesión.");

  try {
    const formData = new FormData();
    formData.append('empresaId', user.value.empresaId);
    formData.append('nombreEmpleado', user.value.nombre);
    formData.append('nombreFormulario', formulario.value.titulo);
    formData.append('formularioId', formulario.value._id);
    formData.append('datos', JSON.stringify(respuestas.value));

    Object.keys(archivos.value).forEach(key => {
      formData.append('archivo', archivos.value[key]);
    });

    await api.post('/respuestas', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    alert("🚀 ¡Reporte enviado con éxito!");
    router.push('/dashboard');
  } catch (error) {
    console.error(error);
    alert("Error al enviar el reporte.");
  }
};
</script>

<template>
  <div class="llenar-container">
    <div v-if="formulario" class="llenar-page">
      <header class="form-header">
        <h1 class="form-title">{{ formulario.titulo }}</h1>
        <span class="form-subtitle">Completa los campos requeridos</span>
      </header>

      <div v-for="campo in formulario.campos" :key="campo._id" class="field-group">
        <label class="field-label">
          {{ campo.label || campo.etiqueta }}
          <span v-if="campo.requerido" class="req-star">*</span>
        </label>

        <input v-if="['texto_corto', 'email', 'numero'].includes(campo.tipo)" 
               v-model="respuestas[campo._id]" :type="campo.tipo === 'numero' ? 'number' : 'text'" 
               class="input-text" placeholder="Respuesta...">

        <textarea v-if="campo.tipo === 'texto_largo'" v-model="respuestas[campo._id]" class="input-area"></textarea>

        <div v-if="campo.tipo === 'radio'" class="options-view">
          <label v-for="opc in campo.opciones" :key="opc" class="radio-item">
            <input type="radio" :name="campo._id" :value="opc" v-model="respuestas[campo._id]">
            <span>{{ opc }}</span>
          </label>
        </div>

        <div v-if="campo.tipo === 'multiple'" class="options-view">
          <label v-for="opc in campo.opciones" :key="opc" class="check-item">
            <input type="checkbox" :value="opc" v-model="respuestas[campo._id]">
            <span>{{ opc }}</span>
          </label>
        </div>

        <select v-if="campo.tipo === 'dropdown'" v-model="respuestas[campo._id]" class="input-select">
          <option value="" disabled>Seleccione una opción</option>
          <option v-for="opc in campo.opciones" :key="opc" :value="opc">{{ opc }}</option>
        </select>

        <div v-if="campo.tipo === 'escala'" class="escala-view">
          <span class="escala-num">{{ campo.escalaConfig?.min || 1 }}</span>
          <div class="escala-options">
            <label v-for="n in (campo.escalaConfig?.max - campo.escalaConfig?.min + 1)" :key="n" class="escala-item">
              <input type="radio" :name="campo._id" :value="n + (campo.escalaConfig?.min - 1)" v-model="respuestas[campo._id]">
              <div class="escala-dot">{{ n + (campo.escalaConfig?.min - 1) }}</div>
            </label>
          </div>
          <span class="escala-num">{{ campo.escalaConfig?.max || 5 }}</span>
        </div>

        <div v-if="['cuadricula_opcion', 'cuadricula_casilla'].includes(campo.tipo)" class="grid-view-container">
          <div class="grid-scroll">
            <table class="grid-table">
              <thead>
                <tr>
                  <th></th>
                  <th v-for="col in campo.columnas" :key="col">{{ col }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="fila in campo.filas" :key="fila">
                  <td class="fila-label">{{ fila }}</td>
                  <td v-for="col in campo.columnas" :key="col">
                    <input v-if="campo.tipo === 'cuadricula_opcion'" 
                           type="radio" :name="campo._id + fila" :value="col" v-model="respuestas[campo._id][fila]">
                    <input v-if="campo.tipo === 'cuadricula_casilla'" 
                           type="checkbox" :value="fila + '|' + col" v-model="respuestas[campo._id]">
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="campo.tipo === 'gps'">
          <button @click="obtenerUbicacion(campo._id)" class="btn-gps" type="button">
            {{ capturandoGps ? '📍 LOCALIZANDO...' : '📍 CAPTURAR UBICACIÓN' }}
          </button>
          <p v-if="respuestas[campo._id]" class="gps-value">{{ respuestas[campo._id] }}</p>
        </div>

        <div v-if="campo.tipo === 'foto'" class="media-zone">
          <button @click="abrirMedia(campo._id, 'foto')" type="button" class="btn-camera" :class="{ 'btn-success': respuestas[campo._id] }">
            {{ respuestas[campo._id] ? '📸 CAMBIAR FOTO' : '📷 TOMAR FOTO' }}
          </button>
          <div v-if="previews[campo._id]" class="preview-box">
            <img :src="previews[campo._id]" class="mini-preview">
          </div>
        </div>

        <div v-if="campo.tipo === 'video'" class="media-zone">
          <button @click="abrirMedia(campo._id, 'video')" type="button" class="btn-video" :class="{ 'btn-success': respuestas[campo._id] }">
            {{ respuestas[campo._id] ? '🎥 CAMBIAR VIDEO' : '📹 GRABAR VIDEO' }}
          </button>
          <div v-if="previews[campo._id]" class="preview-box">
            <video :src="previews[campo._id]" controls class="mini-preview"></video>
          </div>
        </div>

        <div v-if="campo.tipo === 'archivo'" class="file-zone">
          <input type="file" :id="'input-file-'+campo._id" class="input-file-hidden" @change="manejarArchivo($event, campo._id)">
          <button @click="abrirCapturadorDoc(campo._id)" type="button" class="btn-file">
            {{ respuestas[campo._id] ? '📎 ' + respuestas[campo._id] : '📁 ADJUNTAR ARCHIVO' }}
          </button>
        </div>
      </div>

      <button @click="enviarReporte" class="btn-submit">ENVIAR REPORTE FINAL</button>
    </div>
    <div v-else class="loader-empresa">Cargando formulario...</div>
  </div>

  <div v-if="showMediaModal" class="camera-modal">
    <div class="camera-content">
      <video ref="videoRef" autoplay playsinline class="video-stream" :muted="mediaType === 'foto'"></video>
      <canvas ref="canvasRef" style="display:none;"></canvas>
      <div class="camera-actions">
        <button @click="cerrarMedia" class="btn-close-cam">CANCELAR</button>
        
        <button v-if="mediaType === 'foto'" @click="tomarFoto" class="btn-shutter">CAPTURAR</button>
        
        <button v-if="mediaType === 'video'" 
                @click="isRecording ? detenerGrabacion() : iniciarGrabacion()" 
                class="btn-shutter" :class="{ 'recording': isRecording }">
          {{ isRecording ? '⏹ STOP' : '⏺ REC' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '../styles/llenar.css';

/* Estilos adicionales para la grabación */
.recording {
  background: #ef4444 !important;
  border-color: #fff !important;
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
</style>