<script setup>
import api from '../api/axios';
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUsuarioStore } from '@/stores/useUsuarioStore';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2,
  Building2,
  ArrowRight,
  Download,
  Smartphone,
  X
} from 'lucide-vue-next';

const router = useRouter();
const usuarioStore = useUsuarioStore();
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const error = ref('');

// ============================================
// PWA - INSTALACIÓN
// ============================================
const showInstallPrompt = ref(false)
const isInstalled = ref(false)
let installPrompt = null

const handleInstallPrompt = (e) => {
  console.log('[Login] PWA instalable detectado')
  installPrompt = e.detail
  showInstallPrompt.value = true
}

const installPWA = async () => {
  if (!installPrompt) {
    // Intentar usar la función global
    const result = await window.installPWA()
    if (result.success) {
      showInstallPrompt.value = false
      isInstalled.value = true
    }
    return
  }
  
  installPrompt.prompt()
  const { outcome } = await installPrompt.userChoice
  
  if (outcome === 'accepted') {
    console.log('[Login] PWA instalada')
    showInstallPrompt.value = false
    isInstalled.value = true
  } else {
    console.log('[Login] Usuario rechazó instalación')
  }
}

const dismissInstall = () => {
  showInstallPrompt.value = false
}

onMounted(() => {
  // Verificar si ya está instalada
  isInstalled.value = window.isPWAInstalled ? window.isPWAInstalled() : 
    (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone)
  
  // Escuchar evento de instalación
  window.addEventListener('pwa-installable', handleInstallPrompt)
  window.addEventListener('pwa-installed', () => {
    isInstalled.value = true
    showInstallPrompt.value = false
  })
  
  // Si ya hay un prompt disponible (navegación hacia atrás)
  if (window.isPWAInstallable && window.isPWAInstallable()) {
    showInstallPrompt.value = true
  }
})

onUnmounted(() => {
  window.removeEventListener('pwa-installable', handleInstallPrompt)
})

// ============================================
// LOGIN
// ============================================
const login = async () => {
  error.value = '';
  
  if (!email.value || !password.value) {
    error.value = 'Por favor ingresa email y contraseña';
    return;
  }
  
  loading.value = true;
  
  try {
    console.log('🔑 Intentando login con:', { 
      email: email.value, 
      password: password.value ? '***' : '(vacía)'
    });
    
    const res = await api.post('/auth/login', { 
      email: email.value, 
      password: password.value 
    });
    
    console.log('✅ Login exitoso:', res.data);

    // El backend devuelve: { exito, token, user } o { token, user }
    // Normalizar la estructura
    const userData = res.data.user || res.data.usuario;
    const token = res.data.token;
    
    if (!userData || !token) {
      console.error('❌ Respuesta inválida:', res.data);
      error.value = 'Error en la respuesta del servidor';
      loading.value = false;
      return;
    }

    // Actualizar el store de Pinia (para que el Navbar lo detecte inmediatamente)
    usuarioStore.token = token;
    usuarioStore.user = userData;
    
    // Guardamos en sessionStorage para persistencia
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(userData));

    // DISPARAR EVENTO: Esto le avisa al App.vue y Navbar que actualicen
    window.dispatchEvent(new CustomEvent('usuario-actualizado'));

    // ROUTING CORRECTO SEGÚN ROL SaaS
    const rol = userData.rol;
    console.log('👤 Rol detectado:', rol);
    
    switch (rol) {
      case 'superadmin':
        router.push('/superadmin-dashboard');
        break;
      case 'gerente':
        router.push('/gerente-dashboard');
        break;
      case 'empleado':
      case 'usuario':
        router.push('/app');
        break;
      default:
        router.push('/dashboard');
    }

  } catch (err) {
    console.error('❌ Error completo:', err);
    console.error('❌ Código:', err.code);
    console.error('❌ Mensaje:', err.message);
    
    // Manejar errores específicos del backend
    let mensajeError = 'Error de conexión';
    
    switch (err.code) {
      case 'INVALID_CREDENTIALS':
        mensajeError = '❌ Email o contraseña incorrectos';
        break;
      case 'EMPRESA_NOT_ACTIVE':
        mensajeError = '⚠️ Tu empresa está suspendida. Contacta al administrador.';
        break;
      case 'EMPRESA_NOT_FOUND':
        mensajeError = '⚠️ Empresa asociada no encontrada. Contacta al administrador.';
        break;
      case 'USER_INACTIVE':
        mensajeError = '⚠️ Tu cuenta está desactivada';
        break;
      case 'USER_NOT_FOUND':
        mensajeError = '❌ Usuario no encontrado';
        break;
      default:
        mensajeError = err.message || 'Error de conexión';
    }
    
    error.value = mensajeError;
  } finally {
    loading.value = false;
  }
};

const handleKeydown = (e) => {
  if (e.key === 'Enter') login();
};
</script>

<template>
  <div class="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Background decoration -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-slate-800/50 rounded-full blur-3xl"></div>
    </div>

    <!-- Login Card -->
    <div class="relative w-full max-w-md">
      <!-- Logo/Brand -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25 mb-4">
          <Building2 class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-2xl font-bold text-slate-100">FormBuilder Pro</h1>
        <p class="text-slate-400 mt-1">Gestión inteligente de formularios</p>
      </div>

      <!-- Card -->
      <div class="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl p-8">
        <h2 class="text-xl font-semibold text-slate-100 mb-6">Iniciar Sesión</h2>

        <!-- Error Message -->
        <div 
          v-if="error" 
          class="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3"
        >
          <div class="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span class="text-red-400 text-xs">!</span>
          </div>
          <p class="text-red-400 text-sm">{{ error }}</p>
        </div>

        <!-- Email Field -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-400 mb-2">Email</label>
          <div class="relative">
            <Mail class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              v-model="email" 
              type="email" 
              placeholder="tu@empresa.com"
              class="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              @keydown="handleKeydown"
            >
          </div>
        </div>

        <!-- Password Field -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-slate-400 mb-2">Contraseña</label>
          <div class="relative">
            <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              v-model="password" 
              :type="showPassword ? 'text' : 'password'" 
              placeholder="••••••••"
              class="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-12 text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              @keydown="handleKeydown"
            >
            <button 
              @click="showPassword = !showPassword"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              type="button"
            >
              <Eye v-if="!showPassword" class="w-5 h-5" />
              <EyeOff v-else class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Login Button -->
        <button 
          @click="login" 
          :disabled="loading"
          class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/25"
        >
          <Loader2 v-if="loading" class="w-5 h-5 animate-spin" />
          <span v-if="!loading">Entrar al Sistema</span>
          <ArrowRight v-if="!loading" class="w-5 h-5" />
        </button>

        <!-- Demo credentials hint -->
        <div class="mt-6 pt-6 border-t border-slate-800">
          <p class="text-xs text-slate-500 text-center">
            ¿Problemas para acceder? Contacta al administrador de tu empresa
          </p>
        </div>
      </div>

      <!-- Footer -->
      <p class="text-center text-slate-500 text-sm mt-8">
        © 2024 FormBuilder Pro. Todos los derechos reservados.
      </p>

      <!-- PWA Install Prompt -->
      <transition 
        enter-active-class="transition duration-300 ease-out" 
        enter-from-class="transform translate-y-full opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform translate-y-full opacity-0"
      >
        <div 
          v-if="showInstallPrompt && !isInstalled" 
          class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-2xl shadow-blue-500/30 p-4 z-50"
        >
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Smartphone class="w-6 h-6 text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-white font-semibold text-sm mb-1">Instala FormBuilder Pro</h3>
              <p class="text-blue-100 text-xs mb-3">
                Accede más rápido. Funciona sin conexión. Como una app nativa.
              </p>
              <div class="flex gap-2">
                <button 
                  @click="installPWA"
                  class="flex-1 bg-white text-blue-600 font-medium text-xs py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Download class="w-4 h-4" />
                  Instalar
                </button>
                <button 
                  @click="dismissInstall"
                  class="px-3 py-2 text-blue-100 hover:text-white transition-colors"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- PWA Installed Badge -->
      <div 
        v-if="isInstalled" 
        class="fixed bottom-4 left-1/2 -translate-x-1/2 bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-medium py-2 px-4 rounded-full shadow-lg z-50 flex items-center gap-2"
      >
        <Smartphone class="w-4 h-4" />
        App instalada
      </div>
    </div>
  </div>
</template>