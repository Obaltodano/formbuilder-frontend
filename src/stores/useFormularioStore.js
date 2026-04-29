import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { formularioService } from '@/services/formularioService'

export const useFormularioStore = defineStore('formulario', () => {
  // State
  const formularios = ref([])
  const formularioActivo = ref(null)
  const plantillas = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const formulariosActivos = computed(() => 
    formularios.value.filter(f => f.activo !== false)
  )
  
  const formulariosPorGrupo = computed(() => {
    const grupos = {}
    formularios.value.forEach(f => {
      const grupo = f.grupo || 'Sin grupo'
      if (!grupos[grupo]) grupos[grupo] = []
      grupos[grupo].push(f)
    })
    return grupos
  })

  // Actions
  const fetchFormularios = async (empresaId) => {
    loading.value = true
    try {
      const response = await formularioService.list(empresaId)
      formularios.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchPlantillas = async () => {
    const response = await formularioService.listPlantillas()
    plantillas.value = response.data
    return response.data
  }

  const crearFormulario = async (data) => {
    const response = await formularioService.create(data)
    formularios.value.unshift(response.data)
    return response.data
  }

  const actualizarFormulario = async (id, data) => {
    const response = await formularioService.update(id, data)
    const index = formularios.value.findIndex(f => f._id === id)
    if (index !== -1) {
      formularios.value[index] = { ...formularios.value[index], ...response.data }
    }
    return response.data
  }

  const eliminarFormulario = async (id) => {
    await formularioService.delete(id)
    formularios.value = formularios.value.filter(f => f._id !== id)
  }

  const clonarPlantilla = async (plantillaId, empresaId) => {
    const response = await formularioService.clonar(plantillaId, empresaId)
    formularios.value.unshift(response.data)
    return response.data
  }

  const setFormularioActivo = (formulario) => {
    formularioActivo.value = formulario
  }

  return {
    formularios,
    formularioActivo,
    plantillas,
    loading,
    error,
    formulariosActivos,
    formulariosPorGrupo,
    fetchFormularios,
    fetchPlantillas,
    crearFormulario,
    actualizarFormulario,
    eliminarFormulario,
    clonarPlantilla,
    setFormularioActivo
  }
})
