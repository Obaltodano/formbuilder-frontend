import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { empresaService } from '@/services/empresaService'

export const useEmpresaStore = defineStore('empresa', () => {
  // State
  const empresa = ref(null)
  const branding = ref({
    logoUrl: null,
    colorPrimario: '#3b82f6',
    colorSecundario: '#1e293b',
    nombreEmpresa: 'FormBuilder'
  })
  const limits = ref({
    usuariosUsados: 0,
    usuariosLimite: 5,
    formulariosUsados: 0,
    formulariosLimite: 10,
    storageUsado: 0,
    storageLimite: 1024, // MB
    formulariosActivosUsados: 0,
    formulariosActivosLimite: 5
  })
  const status = ref('activa') // activa, suspendida, demo
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const isSuspended = computed(() => status.value === 'suspendida')
  const isDemo = computed(() => status.value === 'demo')
  const canCreateUser = computed(() => limits.value.usuariosUsados < limits.value.usuariosLimite)
  const canCreateForm = computed(() => limits.value.formulariosUsados < limits.value.formulariosLimite)
  const storagePercentage = computed(() => 
    Math.round((limits.value.storageUsado / limits.value.storageLimite) * 100)
  )
  const cssVariables = computed(() => ({
    '--color-primary': branding.value.colorPrimario,
    '--color-secondary': branding.value.colorSecundario
  }))

  // Actions
  const fetchEmpresa = async (slug) => {
    loading.value = true
    try {
      const response = await empresaService.getBySlug(slug)
      empresa.value = response.data
      branding.value = {
        logoUrl: response.data.logoUrl,
        colorPrimario: response.data.colorPrimario || '#3b82f6',
        colorSecundario: response.data.colorSecundario || '#1e293b',
        nombreEmpresa: response.data.nombre
      }
      limits.value = response.data.limits || limits.value
      status.value = response.data.status
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateBranding = async (brandingData) => {
    const response = await empresaService.updateBranding(empresa.value._id, brandingData)
    branding.value = { ...branding.value, ...brandingData }
    return response.data
  }

  const checkLimits = (type) => {
    switch (type) {
      case 'user':
        return canCreateUser.value
      case 'form':
        return canCreateForm.value
      case 'storage':
        return limits.value.storageUsado < limits.value.storageLimite
      default:
        return true
    }
  }

  const refreshLimits = async () => {
    if (!empresa.value?._id) return
    const response = await empresaService.getLimits(empresa.value._id)
    limits.value = { ...limits.value, ...response.data }
  }

  return {
    empresa,
    branding,
    limits,
    status,
    loading,
    error,
    isSuspended,
    isDemo,
    canCreateUser,
    canCreateForm,
    storagePercentage,
    cssVariables,
    fetchEmpresa,
    updateBranding,
    checkLimits,
    refreshLimits
  }
})
