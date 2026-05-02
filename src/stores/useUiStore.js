import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUiStore = defineStore('ui', () => {
  // State
  const sidebarOpen = ref(false)
  const currentModal = ref(null)
  const toasts = ref([])
  const notificaciones = ref([])
  const notificacionesPanelOpen = ref(false)
  const isMobile = ref(false)
  const isTablet = ref(false)
  const isDesktop = ref(true)
  const theme = ref('dark')

  // Getters
  const isModalOpen = computed(() => !!currentModal.value)
  const modalData = computed(() => currentModal.value?.data || null)

  // Actions
  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
  }

  const closeSidebar = () => {
    sidebarOpen.value = false
  }

  const openModal = (name, data = null) => {
    currentModal.value = { name, data }
  }

  const closeModal = () => {
    currentModal.value = null
  }

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now()
    toasts.value.push({ id, message, type, duration })
    
    setTimeout(() => {
      removeToast(id)
    }, duration)
    
    return id
  }

  const removeToast = (id) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  const checkScreenSize = () => {
    const width = window.innerWidth
    isMobile.value = width < 768
    isTablet.value = width >= 768 && width < 1024
    isDesktop.value = width >= 1024
  }

  const initScreenListener = () => {
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
  }

  const setTheme = (newTheme) => {
    theme.value = newTheme
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  // Notificaciones
  const addNotificacion = (notificacion) => {
    const id = Date.now()
    notificaciones.value.unshift({
      id,
      leida: false,
      fecha: new Date().toISOString(),
      ...notificacion
    })
    return id
  }

  const marcarNotificacionLeida = (id) => {
    const notif = notificaciones.value.find(n => n.id === id)
    if (notif) notif.leida = true
  }

  const marcarTodasLeidas = () => {
    notificaciones.value.forEach(n => n.leida = true)
  }

  const removeNotificacion = (id) => {
    notificaciones.value = notificaciones.value.filter(n => n.id !== id)
  }

  const toggleNotificacionesPanel = () => {
    notificacionesPanelOpen.value = !notificacionesPanelOpen.value
  }

  const closeNotificacionesPanel = () => {
    notificacionesPanelOpen.value = false
  }

  return {
    sidebarOpen,
    currentModal,
    toasts,
    notificaciones,
    notificacionesPanelOpen,
    isMobile,
    isTablet,
    isDesktop,
    theme,
    isModalOpen,
    modalData,
    toggleSidebar,
    closeSidebar,
    openModal,
    closeModal,
    addToast,
    removeToast,
    checkScreenSize,
    initScreenListener,
    setTheme,
    // Notificaciones
    addNotificacion,
    marcarNotificacionLeida,
    marcarTodasLeidas,
    removeNotificacion,
    toggleNotificacionesPanel,
    closeNotificacionesPanel
  }
})
