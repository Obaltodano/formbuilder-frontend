<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  tipo: { type: String, default: 'foto' }
});

const emit = defineEmits(['close', 'capture']);

const videoRef = ref(null);
const canvasRef = ref(null);
const isRecording = ref(false);
const recordTime = ref(0);
let streamInstance = null;
let mediaRecorder = null;
let chunks = [];
let timerInterval = null;

onMounted(async () => {
  try {
    streamInstance = await navigator.mediaDevices.getUserMedia({
      video: { 
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "environment" 
      },
      audio: props.tipo === 'video'
    });
    if (videoRef.value) videoRef.value.srcObject = streamInstance;
  } catch (err) {
    alert("Error: Asegúrate de dar permisos a la cámara.");
    emit('close');
  }
});

const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

const tomarFoto = () => {
  const canvas = canvasRef.value;
  const video = videoRef.value;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  canvas.toBlob((blob) => {
    const file = new File([blob], `foto_${Date.now()}.jpg`, { type: 'image/jpeg' });
    emit('capture', file);
  }, 'image/jpeg', 0.9);
};

const toggleGrabacion = () => {
  if (!isRecording.value) {
    chunks = [];
    mediaRecorder = new MediaRecorder(streamInstance);
    recordTime.value = 0;
    timerInterval = setInterval(() => recordTime.value++, 1000);
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/mp4' });
      const file = new File([blob], `video_${Date.now()}.mp4`, { type: 'video/mp4' });
      emit('capture', file);
    };
    mediaRecorder.start();
    isRecording.value = true;
  } else {
    mediaRecorder.stop();
    clearInterval(timerInterval);
    isRecording.value = false;
  }
};

onUnmounted(() => {
  if (streamInstance) streamInstance.getTracks().forEach(t => t.stop());
  clearInterval(timerInterval);
});
</script>

<template>
  <Teleport to="body">
    <div class="camera-full-overlay">
      <div v-if="isRecording" class="rec-status-bar">
        <div class="rec-dot"></div>
        <span>REC {{ formatTime(recordTime) }}</span>
      </div>

      <div class="video-container">
        <video ref="videoRef" autoplay playsinline class="camera-video-element"></video>
        <canvas ref="canvasRef" style="display:none"></canvas>
      </div>

      <div class="camera-footer">
        <button @click="$emit('close')" class="btn-exit" v-if="!isRecording">✕</button>
        
        <button @click="tipo === 'foto' ? tomarFoto() : toggleGrabacion()" 
                class="shutter-main" :class="{ 'recording': isRecording }">
          <div :class="isRecording ? 'icon-stop' : 'icon-start'"></div>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.camera-full-overlay {
  position: fixed; inset: 0; background: #000; z-index: 10000;
  display: flex; flex-direction: column;
}

.video-container { flex: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; }

/* AJUSTE RESPONSIVO CRÍTICO */
.camera-video-element {
  width: 100%; height: 100%;
  object-fit: cover; /* En móvil llena toda la pantalla */
}

@media (min-width: 1024px) {
  .camera-video-element {
    object-fit: contain; /* En Desktop muestra la cámara completa sin cortes */
    max-width: 80%;
  }
}

.rec-status-bar {
  position: absolute; top: 25px; left: 50%; transform: translateX(-50%);
  background: rgba(0,0,0,0.8); color: #ff4444; padding: 6px 15px;
  border-radius: 20px; display: flex; align-items: center; gap: 8px; z-index: 10;
  font-family: monospace; font-weight: bold; border: 1px solid #ff4444;
}

.rec-dot { width: 10px; height: 10px; background: #ff4444; border-radius: 50%; animation: blink 1s infinite; }

.camera-footer {
  height: 120px; display: flex; align-items: center; justify-content: center; position: relative;
  background: linear-gradient(transparent, rgba(0,0,0,0.5));
}

.shutter-main {
  width: 75px; height: 75px; border-radius: 50%; border: 4px solid white;
  background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer;
}

.shutter-main.recording { border-color: #ff4444; }
.icon-start { width: 55px; height: 55px; background: white; border-radius: 50%; }
.icon-stop { width: 30px; height: 30px; background: #ff4444; border-radius: 4px; }

@keyframes blink { 50% { opacity: 0; } }
.btn-exit { position: absolute; left: 30px; background: none; border: none; color: white; font-size: 28px; }
</style>