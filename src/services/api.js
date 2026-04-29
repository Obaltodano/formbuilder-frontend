import axios from 'axios'
import { useUsuarioStore } from '@/stores/useUsuarioStore'
import { useEmpresaStore } from '@/stores/useEmpresaStore'

// Crear instancia de axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - Agregar token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token')
    if (token) {
      config.headers['x-auth-token'] = token
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - Manejo de errores SaaS
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error
    
    if (response) {
      // Manejo específico de errores SaaS
      switch (response.status) {
        case 401:
          // Token expirado
          sessionStorage.clear()
          window.location.href = '/'
          break
          
        case 403:
          if (response.data?.code === 'ENTERPRISE_SUSPENDED') {
            // Redirigir a página de pago
            const empresaStore = useEmpresaStore()
            empresaStore.status = 'suspendida'
            window.location.href = '/suspension'
          }
          if (response.data?.code === 'LIMIT_EXCEEDED') {
            // Mostrar modal de límite alcanzado
            console.warn('Límite del plan alcanzado:', response.data.message)
          }
          break
          
        case 429:
          // Rate limiting
          console.warn('Demasiadas peticiones')
          break
          
        case 413:
          // Payload too large - límite de storage
          console.error('Archivo demasiado grande o límite de storage alcanzado')
          break
      }
    }
    
    return Promise.reject(error)
  }
)

export default api
