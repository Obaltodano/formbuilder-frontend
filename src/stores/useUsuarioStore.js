import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'

export const useUsuarioStore = defineStore('usuario', () => {
  // State
  const user = ref(null)
  const token = ref(null)
  const isAuthenticated = computed(() => !!token.value)
  
  const roles = {
    SUPERADMIN: 'superadmin',
    GERENTE: 'gerente',
    USUARIO: 'usuario'
  }

  // Getters
  const isSuperAdmin = computed(() => user.value?.rol === roles.SUPERADMIN)
  const isGerente = computed(() => user.value?.rol === roles.GERENTE)
  const isUsuario = computed(() => user.value?.rol === roles.USUARIO)
  const userName = computed(() => user.value?.nombre || 'Usuario')
  
  // Actions
  const login = async (credentials) => {
    const response = await authService.login(credentials)
    token.value = response.data.token
    user.value = response.data.usuario
    
    // Persistir
    sessionStorage.setItem('token', response.data.token)
    sessionStorage.setItem('user', JSON.stringify(response.data.usuario))
    
    return response.data
  }

  const logout = () => {
    token.value = null
    user.value = null
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
  }

  const restoreSession = () => {
    const savedToken = sessionStorage.getItem('token')
    const savedUser = sessionStorage.getItem('user')
    
    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
      return true
    }
    return false
  }

  const updateProfile = async (data) => {
    const response = await authService.updateProfile(user.value._id, data)
    user.value = { ...user.value, ...response.data }
    sessionStorage.setItem('user', JSON.stringify(user.value))
    return response.data
  }

  return {
    user,
    token,
    isAuthenticated,
    isSuperAdmin,
    isGerente,
    isUsuario,
    userName,
    roles,
    login,
    logout,
    restoreSession,
    updateProfile
  }
})
