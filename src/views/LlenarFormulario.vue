<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CampoRender from '../components/campos/CampoRender.vue';
import { useFormValidation } from '../composables/useFormValidation.js';
import { useRespuestas } from '@/composables/useRespuestas';
import { useApi } from '@/composables/useApi';
import {
  FileText,
  Send,
  X,
  Camera,
  Video,
  AlertCircle,
  Loader2,
  CheckCircle,
  ChevronLeft
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const { submitRespuesta } = useRespuestas();
const { request } = useApi();

const formulario = ref(null);
const user = ref(null); 
const archivos = ref({}); 
const previews = ref({});

// Validación del formulario
const validationSchema = computed(() => {
  if (!formulario.value) return {};
  
  const schema = {};
  formulario.value.campos.forEach(campo => {
    const rules = [];
    
    if (campo.requerido) {
      rules.push('required');
    }
    
    if (campo.tipo === 'email') {
      rules.push('email');
    }
    
    if (campo.tipo === 'numero') {
      rules.push('number');
      if (campo.validacion?.min) {
        rules.push({ type: 'min', value: campo.validacion.min, message: `Mínimo ${campo.validacion.min}` });
      }
      if (campo.validacion?.max) {
        rules.push({ type: 'max', value: campo.validacion.max, message: `Máximo ${campo.validacion.max}` });
      }
    }
    
    if (campo.tipo === 'texto_corto' && campo.validacion?.maxLength) {
      rules.push({ type: 'maxLength', value: campo.validacion.maxLength, message: `Máximo ${campo.validacion.maxLength} caracteres` });
    }
    
    schema[campo._id] = {
      label: campo.label,
      rules
    };
  });
  
  return schema;
});

const { 
  formData, 
  errors, 
  touched, 
  isValid, 
  hasErrors, 
  firstError,
  validateField, 
  validateForm, 
  touchField, 
  resetValidation 
} = useFormValidation(validationSchema);

// Sincronizar formData con respuestas existentes
const respuestas = computed({
  get: () => formData.value,
  set: (value) => {
    formData.value = value;
  }
}); 

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
    formulario.value = await request('GET', `/formularios/${route.params.id}`);
    
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

  // Validar formulario antes de enviar
  if (!validateForm()) {
    alert("Por favor complete los campos requeridos antes de enviar.");
    return;
  }

  try {
    const datosFinales = {};

    // Recorremos los campos del formulario para construir el objeto final
    formulario.value.campos.forEach(campo => {
      // Obtenemos el valor usando el _id que usa el v-model
      const valor = respuestas.value[campo._id];
      
      // Usamos campo.label como llave para evitar el 'undefined'
      datosFinales[campo.label] = (valor !== undefined && valor !== null) ? valor : "";

      // Si hay un archivo (foto/video) asociado a este campo por su ID
      if (archivos.value[campo._id]) {
        datosFinales[campo.label] = archivos.value[campo._id];
      }
    });

    // ⭐ REGLA CRÍTICA: Convertir archivos a formato con labels como keys
    // archivosPorLabel debe ser: { "Label Campo": [File1, File2] }
    const archivosPorLabel = {};
    Object.keys(archivos.value).forEach(id => {
      const campo = formulario.value.campos.find(c => c._id === id);
      if (campo) {
        archivosPorLabel[campo.label] = [archivos.value[id]];
      }
    });

    // Usar el nuevo composable para enviar respuesta
    await submitRespuesta(formulario.value, datosFinales, archivosPorLabel);

    alert("🚀 Reporte enviado con éxito");
    router.push('/dashboard');
  } catch (error) {
    console.error("Error al enviar:", error);
    alert("Error al enviar el reporte.");
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-950 pb-24">
    <!-- Loading State -->
    <div v-if="!formulario" class="flex flex-col items-center justify-center min-h-screen">
      <Loader2 class="w-12 h-12 text-blue-500 animate-spin mb-4" />
      <p class="text-slate-400">Cargando formulario...</p>
    </div>

    <div v-else class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Header -->
      <div class="mb-6">
        <button 
          @click="$router.back()"
          class="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-4"
        >
          <ChevronLeft class="w-5 h-5" />
          Volver
        </button>
        
        <div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <FileText class="w-5 h-5 text-blue-400" />
            </div>
            <h1 class="text-xl font-bold text-slate-100">{{ formulario.titulo }}</h1>
          </div>
          <p class="text-slate-400 text-sm">Complete la información solicitada</p>
        </div>
      </div>

      <!-- Form Fields -->
      <div class="space-y-4">
        <div v-for="campo in formulario.campos" 
             :key="campo._id" 
             class="bg-slate-800 rounded-xl border border-slate-700 p-5"
             :class="{ 'border-red-500/50': errors[campo._id] && touched[campo._id] }"
        >
          <label class="block text-sm font-medium text-slate-200 mb-3">
            {{ campo.label }}
            <span v-if="campo.requerido" class="text-red-400">*</span>
          </label>

          <CampoRender 
            :campo="campo"
            :id="campo._id"
            v-model="respuestas[campo._id]"
            @update:modelValue="touchField(campo._id)"
            @solicitarCamara="abrirMedia"
          />
          
          <!-- Validation Errors -->
          <div v-if="errors[campo._id] && touched[campo._id]" class="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div class="flex items-center gap-2">
              <AlertCircle class="w-4 h-4 text-red-400 flex-shrink-0" />
              <span v-for="error in errors[campo._id]" :key="error" class="text-sm text-red-400">
                {{ error }}
              </span>
            </div>
          </div>
          
          <!-- Media Previews -->
          <div v-if="previews[campo._id]" class="mt-4">
            <img v-if="campo.tipo === 'foto'" :src="previews[campo._id]" class="max-w-xs rounded-lg border border-slate-700" />
            <div v-if="campo.tipo === 'video'" class="max-w-xs">
              <video :src="previews[campo._id]" controls class="w-full rounded-lg border border-slate-700" />
            </div>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="mt-8 flex justify-end">
        <button 
          @click="enviarReporte"
          class="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <Send class="w-5 h-5" />
          Enviar Reporte
        </button>
      </div>
    </div>
  </div>

  <!-- Camera Modal -->
  <Teleport to="body">
    <div v-if="showMediaModal" class="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div class="relative w-full h-full max-w-lg mx-auto">
        <video ref="videoRef" autoplay playsinline class="w-full h-full object-cover"></video>
        <canvas ref="canvasRef" class="hidden"></canvas>
        
        <!-- Controls -->
        <div class="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-8">
          <button 
            @click="cerrarMedia" 
            class="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-white hover:bg-slate-700"
          >
            <X class="w-6 h-6" />
          </button>
          
          <button 
            v-if="mediaType === 'foto'" 
            @click="tomarFoto" 
            class="w-16 h-16 rounded-full bg-white flex items-center justify-center"
          >
            <div class="w-14 h-14 rounded-full border-4 border-slate-900"></div>
          </button>
          
          <button 
            v-if="mediaType === 'video'" 
            @click="isRecording ? detenerGrabacion() : iniciarGrabacion()" 
            class="w-16 h-16 rounded-full flex items-center justify-center transition-colors"
            :class="isRecording ? 'bg-red-500' : 'bg-white'"
          >
            <div 
              class="transition-all"
              :class="isRecording ? 'w-6 h-6 bg-white rounded' : 'w-14 h-14 rounded-full border-4 border-slate-900'"
            ></div>
          </button>
        </div>
        
        <!-- Recording Indicator -->
        <div v-if="isRecording" class="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 bg-red-500 rounded-full">
          <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span class="text-white text-sm font-medium">REC</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>