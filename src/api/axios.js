import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

// INTERCEPTOR DE PETICIÓN: Para enviar el token
api.interceptors.request.use((config) => {
  // CAMBIO CLAVE: Usar sessionStorage en lugar de localStorage
  const token = sessionStorage.getItem('token'); 
  
  if (token) {
    config.headers['x-auth-token'] = token;
    // console.log("🚀 Enviando token desde SessionStorage");
  } else {
    // console.warn("⚠️ No hay token activo");
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// INTERCEPTOR DE RESPUESTA: Normalizar datos y manejar errores
api.interceptors.response.use(
  (response) => {
    // Normalizar respuestas del backend
    // El backend envía: { exito: true, data: {...}, mensaje: "..." }
    // O para login: { token, user } (sin wrapper)
    const data = response.data;
    
    // Si tiene la propiedad 'exito', es el formato nuevo con wrapper
    if (data && typeof data.exito === 'boolean') {
      if (data.exito) {
        // Reemplazar data con el contenido real para simplificar acceso
        response.data = data.data || data;
        // Guardar mensaje si existe
        response.data._mensaje = data.mensaje;
        response.data._exito = true;
      } else {
        // Error del backend, crear error personalizado
        const error = new Error(data.error || data.mensaje || 'Error del servidor');
        error.response = { data, status: 400 };
        error.code = data.code || 'UNKNOWN_ERROR';
        throw error;
      }
    }
    // Si no tiene 'exito', es formato directo (como login), dejarlo como está
    
    return response;
  },
  (error) => {
    // Si el servidor responde 401, significa que la sesión no es válida
    if (error.response && error.response.status === 401) {
      console.error("Sesión inválida o expirada. Limpiando...");
      
      // Limpiamos todo rastro
      sessionStorage.clear();
      localStorage.clear();
      
      // Solo redirigimos si no estamos ya en el login para evitar bucles infinitos
      if (window.location.pathname !== '/') {
        window.location.href = '/'; 
      }
    }
    
    // Normalizar errores del backend
    if (error.response && error.response.data) {
      const data = error.response.data;
      error.code = data.code || 'UNKNOWN_ERROR';
      error.message = data.error || data.mensaje || error.message || 'Error de conexión';
      
      // Casos especiales
      if (data.code === 'LIMITE_PLAN_EXCEDIDO') {
        console.error('⚠️ Límite del plan excedido:', data);
      }
      if (data.code === 'EMPRESA_NOT_ACTIVE') {
        console.error('⚠️ Empresa no activa:', data.status);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;