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

// INTERCEPTOR DE RESPUESTA: Para detectar si el token expiró o hubo F5
api.interceptors.response.use(
  (response) => response,
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
    return Promise.reject(error);
  }
);

export default api;