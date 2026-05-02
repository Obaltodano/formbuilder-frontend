import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './styles/theme.css'
import './styles/main.css'
import App from './App.vue'
import router from './router'
import { pinia } from './stores'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.mount('#app')

// ============================================
// REGISTRO DEL SERVICE WORKER (PWA)
// ============================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[PWA] SW registrado correctamente:', registration.scope)
        
        // Escuchar actualizaciones del SW
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[PWA] Nueva versión disponible')
              // Aquí se puede mostrar un toast para actualizar
            }
          })
        })
      })
      .catch((error) => {
        console.error('[PWA] Error registrando SW:', error)
      })
  })
}

// ============================================
// MANEJO DE INSTALACIÓN PWA
// ============================================
let deferredPrompt = null

// Capturar el evento beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('[PWA] beforeinstallprompt disparado')
  // Prevenir que Chrome muestre el prompt automático
  e.preventDefault()
  // Guardar el evento para usarlo después
  deferredPrompt = e
  // Disparar evento custom para que los componentes lo detecten
  window.dispatchEvent(new CustomEvent('pwa-installable', { detail: e }))
})

// Escuchar instalación exitosa
window.addEventListener('appinstalled', () => {
  console.log('[PWA] App instalada correctamente')
  deferredPrompt = null
  window.dispatchEvent(new CustomEvent('pwa-installed'))
})

// Exponer función global para instalar
window.installPWA = async () => {
  if (!deferredPrompt) {
    console.log('[PWA] No hay prompt de instalación disponible')
    return { success: false, error: 'NOT_AVAILABLE' }
  }
  
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  
  if (outcome === 'accepted') {
    console.log('[PWA] Usuario aceptó instalación')
    deferredPrompt = null
    return { success: true }
  } else {
    console.log('[PWA] Usuario rechazó instalación')
    return { success: false, error: 'DISMISSED' }
  }
}

// Verificar si ya está instalada
window.isPWAInstalled = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone || 
         document.referrer.includes('android-app://')
}

// Verificar si es instalable
window.isPWAInstallable = () => {
  return !!deferredPrompt
}