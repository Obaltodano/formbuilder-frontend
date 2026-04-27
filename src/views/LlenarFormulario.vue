<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../api/axios';
import CampoRender from '../components/campos/CampoRender.vue';

const route = useRoute();
const router = useRouter();
const formulario = ref(null);
const respuestas = ref({});
const user = ref(null); 
const archivos = ref({}); 
const previews = ref({}); 

// --- LÓGICA DE MULTIMEDIA ---
const showMediaModal = ref(false);
const mediaType = ref('');
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
    
    // Inicialización de respuestas con validación de tipo
    formulario.value.campos.forEach(campo => {
      if (campo.tipo === 'multiple' || campo.tipo === 'cuadricula_multiple') {
        respuestas.value[campo._id] = []; 
      } else if (campo.tipo === 'cuadricula_unica') {
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

const abrirMedia = async ({ id, tipo }) => {
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
    alert("Acceso a cámara denegado.");
    showMediaModal.value = false;
  }
};

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
  
  // Guardamos el archivo para el FormData
  archivos.value[id] = file;
  
  // IMPORTANTE: Limpiamos el texto para que no se envíe "Captura: ..."
  respuestas.value[id] = ""; 
  
  previews.value[id] = URL.createObjectURL(file);
};

const cerrarMedia = () => {
  if (streamInstance) streamInstance.getTracks().forEach(t => t.stop());
  showMediaModal.value = false;
  isRecording.value = false;
};

const enviarReporte = async () => {
  if (!user.value?.empresaId) return alert("Sesión inválida.");

  try {
    const formData = new FormData();
    const datosFinales = {}; // Aquí guardaremos con los nombres legibles

    // Recorremos los campos del formulario para construir el objeto final
    formulario.value.campos.forEach(campo => {
      // Obtenemos el valor usando el _id que usa el v-model
      const valor = respuestas.value[campo._id];
      
      // IMPORTANTE: Usamos campo.label como llave para evitar el 'undefined'
      // Si el valor es null o undefined, enviamos un string vacío
      datosFinales[campo.label] = (valor !== undefined && valor !== null) ? valor : "";

      // Si hay un archivo (foto/video) asociado a este campo por su ID
      if (archivos.value[campo._id]) {
        // Adjuntamos el archivo usando el label como nombre del campo para Multer
        formData.append(campo.label, archivos.value[campo._id]);
      }
    });

    formData.append('empresaId', user.value.empresaId);
    formData.append('usuarioId', user.value.id || user.value._id);
    formData.append('formularioId', formulario.value._id);
    formData.append('nombreFormulario', formulario.value.titulo);
    
    // Enviamos el JSON de respuestas ya mapeado con los nombres de los campos
    formData.append('datos', JSON.stringify(datosFinales));

    await api.post('/respuestas', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    alert("🚀 Reporte enviado con éxito");
    router.push('/dashboard');
  } catch (error) {
    console.error("Error al enviar:", error);
    alert("Error al enviar el reporte.");
  }
};
</script>

<template>
  <div class="llenar-container">
    <div v-if="formulario" class="llenar-page">
      <header class="form-header">
        <h1 class="form-title">{{ formulario.titulo }}</h1>
        <p class="form-subtitle">Complete la información solicitada abajo</p>
      </header>

      <div class="form-body form-grid">
        <div v-for="campo in formulario.campos" 
             :key="campo._id" 
             class="field-card-fill"
             :class="{'full-width': campo.tipo.includes('cuadricula') || campo.tipo === 'texto_largo'}">
          
          <label class="field-label">
            {{ campo.label }}
            <span v-if="campo.requerido" class="req-star">*</span>
          </label>

          <CampoRender 
            :campo="campo"
            :id="campo._id"
            v-model="respuestas[campo._id]"
            @solicitarCamara="abrirMedia"
          />
          
          <div v-if="previews[campo._id]" class="media-preview-container">
            <img v-if="campo.tipo === 'foto'" :src="previews[campo._id]" class="mini-preview" />
            <div v-if="campo.tipo === 'video'" class="video-preview-wrapper">
              <video :src="previews[campo._id]" controls class="mini-preview" />
            </div>
          </div>
        </div>
      </div>

      <button @click="enviarReporte" class="btn-submit-form">
        ENVIAR REPORTE FINAL
      </button>
    </div>
  </div>

  <Teleport to="body">
    <div v-if="showMediaModal" class="camera-modal">
      <div class="camera-content">
        <video ref="videoRef" autoplay playsinline class="video-stream"></video>
        <canvas ref="canvasRef" style="display:none;"></canvas>
        <div class="camera-actions">
          <button @click="cerrarMedia" class="btn-cancel-cam">✕</button>
          <button v-if="mediaType === 'foto'" @click="tomarFoto" class="btn-shutter">
            <div class="inner-shutter"></div>
          </button>
          <button v-if="mediaType === 'video'" 
                  @click="isRecording ? detenerGrabacion() : iniciarGrabacion()" 
                  class="btn-shutter" :class="{ 'is-recording': isRecording }">
            <div class="inner-shutter" :class="isRecording ? 'rect' : 'circle'"></div>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@import '../styles/llenar.css';
</style>