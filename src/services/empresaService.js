import api from './api'

export const empresaService = {
  // CRUD
  list: () => api.get('/admin/empresas'),
  
  getById: (id) => api.get(`/empresas/${id}`),
  
  getBySlug: (slug) => api.get(`/public/empresa/${slug}`),
  
  create: (data) => api.post('/admin/empresas', data),
  
  update: (id, data) => api.put(`/empresas/${id}`, data),
  
  delete: (id) => api.delete(`/admin/empresas/${id}`),
  
  // Branding
  updateBranding: (id, data) => api.put(`/empresas/${id}/branding`, data),
  
  uploadLogo: (id, file) => {
    const formData = new FormData()
    formData.append('logo', file)
    return api.post(`/empresas/${id}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  
  // Límites y métricas
  getLimits: (id) => api.get(`/empresas/${id}/limits`),
  
  getMetrics: (id) => api.get(`/empresas/${id}/metrics`),
  
  // Status
  suspend: (id, reason) => api.post(`/admin/empresas/${id}/suspend`, { reason }),
  
  activate: (id) => api.post(`/admin/empresas/${id}/activate`),
  
  // Plan
  changePlan: (id, planId) => api.put(`/empresas/${id}/plan`, { planId }),
  
  // Cupones
  validateCoupon: (code) => api.get(`/public/coupons/validate/${code}`),
  
  applyCoupon: (empresaId, code) => api.post(`/empresas/${empresaId}/coupon`, { code })
}
