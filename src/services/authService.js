import api from './api'

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  
  register: (data) => api.post('/auth/register', data),
  
  logout: () => api.post('/auth/logout'),
  
  getProfile: () => api.get('/auth/profile'),
  
  updateProfile: (id, data) => api.put(`/usuarios/${id}`, data),
  
  changePassword: (data) => api.post('/auth/change-password', data),
  
  // White-label: obtener empresa por slug para login personalizado
  getEmpresaBySlug: (slug) => api.get(`/public/empresa/${slug}`)
}
