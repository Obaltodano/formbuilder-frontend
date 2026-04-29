import { ref, onUnmounted } from 'vue';

export function useCamera() {
  const stream = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  const videoRef = ref(null);

  const startCamera = async (options = {}) => {
    const defaultOptions = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "environment"
      },
      audio: false
    };

    const mediaOptions = { ...defaultOptions, ...options };

    try {
      isLoading.value = true;
      error.value = null;

      // Detener stream existente
      if (stream.value) {
        stopCamera();
      }

      stream.value = await navigator.mediaDevices.getUserMedia(mediaOptions);
      
      // Asignar stream al elemento video si existe
      if (videoRef.value) {
        videoRef.value.srcObject = stream.value;
      }

      isLoading.value = false;
      return stream.value;
    } catch (err) {
      error.value = `Error al acceder a la cámara: ${err.message}`;
      isLoading.value = false;
      throw err;
    }
  };

  const stopCamera = () => {
    if (stream.value) {
      stream.value.getTracks().forEach(track => track.stop());
      stream.value = null;
    }
    
    if (videoRef.value) {
      videoRef.value.srcObject = null;
    }
  };

  const takePhoto = (canvasRef, quality = 0.9) => {
    return new Promise((resolve, reject) => {
      if (!stream.value || !videoRef.value || !canvasRef.value) {
        reject(new Error('Cámara no inicializada'));
        return;
      }

      const video = videoRef.value;
      const canvas = canvasRef.value;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `foto_${Date.now()}.jpg`, { 
            type: 'image/jpeg' 
          });
          resolve(file);
        } else {
          reject(new Error('Error al capturar foto'));
        }
      }, 'image/jpeg', quality);
    });
  };

  const startRecording = () => {
    return new Promise((resolve, reject) => {
      if (!stream.value) {
        reject(new Error('Cámara no inicializada'));
        return;
      }

      try {
        const chunks = [];
        const mediaRecorder = new MediaRecorder(stream.value);
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };
        
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/mp4' });
          const file = new File([blob], `video_${Date.now()}.mp4`, { 
            type: 'video/mp4' 
          });
          resolve(file);
        };
        
        mediaRecorder.onerror = () => {
          reject(new Error('Error en la grabación'));
        };
        
        mediaRecorder.start();
        resolve(mediaRecorder);
      } catch (err) {
        reject(err);
      }
    });
  };

  const checkCameraSupport = () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  };

  const checkCameraPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' });
      return result.state;
    } catch (err) {
      // Algunos navegadores no soportan permissions API
      return 'unknown';
    }
  };

  onUnmounted(() => {
    stopCamera();
  });

  return {
    stream,
    isLoading,
    error,
    videoRef,
    startCamera,
    stopCamera,
    takePhoto,
    startRecording,
    checkCameraSupport,
    checkCameraPermission
  };
}
