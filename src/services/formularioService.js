import api from './api'

export const formularioService = {
  // Formularios de empresa
  list: (empresaId) => api.get(`/empresas/${empresaId}/formularios`),
  
  getById: (id) => api.get(`/formularios/${id}`),
  
  create: (data) => api.post('/formularios', data),
  
  update: (id, data) => api.put(`/formularios/${id}`, data),
  
  delete: (id) => api.delete(`/formularios/${id}`),
  
  // Activar/desactivar
  toggleActive: (id) => api.patch(`/formularios/${id}/toggle`),
  
  // Plantillas (SuperAdmin)
  listPlantillas: () => api.get('/admin/plantillas'),
  
  createPlantilla: (data) => api.post('/admin/plantillas', data),
  
  updatePlantilla: (id, data) => api.put(`/admin/plantillas/${id}`, data),
  
  deletePlantilla: (id) => api.delete(`/admin/plantillas/${id}`),
  
  // Clonar plantilla a empresa
  clonar: (plantillaId, empresaId) => 
    api.post(`/empresas/${empresaId}/clonar/${plantillaId}`),
  
  // Grupos
  updateGrupo: (id, grupo) => api.patch(`/formularios/${id}/grupo`, { grupo }),
  
  // Respuestas
  getResponses: (id, params) => api.get(`/formularios/${id}/responses`, { params }),
  
  exportResponses: (id, format) => api.get(`/formularios/${id}/export`, {
    params: { format },
    responseType: format === 'csv' ? 'blob' : 'json'
  })
}
