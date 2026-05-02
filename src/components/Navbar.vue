<script setup>
import { useRouter, useRoute } from 'vue-router';
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useUsuarioStore } from '@/stores/useUsuarioStore';
import { useEmpresaStore } from '@/stores/useEmpresaStore';
import { useUiStore } from '@/stores/useUiStore';
import api from '../api/axios';
import {
  LayoutDashboard,
  Building2,
  ClipboardCheck,
  FileText,
  Settings,
  Users,
  Palette,
  CreditCard,
  Bell,
  User,
  History,
  CheckSquare,
  Store,
  LogOut,
  Menu,
  X,
  AlertTriangle
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const usuarioStore = useUsuarioStore();
const empresaStore = useEmpresaStore();
const uiStore = useUiStore();

const user = computed(() => usuarioStore.user);
const empresa = computed(() => empresaStore.empresa);
const notificaciones = computed(() => uiStore.notificaciones.filter(n => !n.leida));
const isSuspended = computed(() => empresaStore.isSuspended);

const menuAbierto = ref(false);
const perfilMenuAbierto = ref(false);
const mobileMenuRef = ref(null);

// Formatear imagen
const formatearImagen = (ruta) => {
  if (!ruta) return null;
  if (ruta.startsWith('http')) return ruta;
  const serverUrl = api.defaults.baseURL.replace('/api', '');
  return `${serverUrl}/${ruta}`;
};

// Navegación por roles
const navLinksSuperAdmin = [
  { to: '/superadmin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/superadmin-empresas', label: 'Empresas', icon: Building2 },
  { to: '/superadmin-pagos', label: 'Validación Pagos', icon: ClipboardCheck, badge: 'pendingPayments' },
  { to: '/constructor', label: 'Plantillas', icon: FileText },
  { to: '/superadmin-planes', label: 'Planes', icon: Settings },
];

const navLinksGerente = [
  { to: '/gerente-dashboard', label: 'Mi Dashboard', icon: LayoutDashboard },
  { to: '/admin', label: 'Mis Formas', icon: FileText },
  { to: '/usuarios', label: 'Equipo', icon: Users },
  { to: '/gerente-branding', label: 'Branding', icon: Palette },
  { to: '/gerente-pagos', label: 'Pagos', icon: CreditCard },
];

const navLinksEmpleado = [
  { to: '/app', label: 'Mis Tareas', icon: CheckSquare },
  { to: '/app/historial', label: 'Historial', icon: History },
  { to: '/perfil', label: 'Mi Perfil', icon: User },
];

// Mobile bottom nav (top 4 por rol)
const mobileNavLinks = computed(() => {
  if (user.value?.rol === 'superadmin') {
    return [
      { to: '/superadmin-dashboard', icon: LayoutDashboard, label: 'Inicio' },
      { to: '/superadmin-pagos', icon: ClipboardCheck, label: 'Pagos' },
      { to: '/constructor', icon: FileText, label: 'Plantillas' },
      { to: '/perfil', icon: User, label: 'Perfil' },
    ];
  } else if (user.value?.rol === 'gerente') {
    return [
      { to: '/gerente-dashboard', icon: LayoutDashboard, label: 'Inicio' },
      { to: '/admin', icon: FileText, label: 'Formas' },
      { to: '/usuarios', icon: Users, label: 'Equipo' },
      { to: '/perfil', icon: User, label: 'Perfil' },
    ];
  } else {
    return [
      { to: '/app', icon: LayoutDashboard, label: 'Inicio' },
      { to: '/app/tareas', icon: CheckSquare, label: 'Tareas' },
      { to: '/app/historial', icon: History, label: 'Historial' },
      { to: '/perfil', icon: User, label: 'Perfil' },
    ];
  }
});

const currentNavLinks = computed(() => {
  if (user.value?.rol === 'superadmin') return navLinksSuperAdmin;
  if (user.value?.rol === 'gerente') return navLinksGerente;
  return navLinksEmpleado;
});

// Branding
const brandLogo = computed(() => {
  if (user.value?.rol === 'superadmin') return null;
  return empresaStore.logoUrl;
});

const brandName = computed(() => {
  if (user.value?.rol === 'superadmin') return 'SuperAdmin';
  return empresaStore.nombre || user.value?.empresaId || 'Mi Empresa';
});

// CSS Variables dinámicas
const cssVariables = computed(() => {
  return {
    '--primary-color': empresaStore.primaryColor || '#3b82f6',
    '--primary-hover': empresaStore.primaryHover || '#2563eb',
  };
});

const logout = () => {
  usuarioStore.logout();
  router.push('/');
};

// Cerrar menús al cambiar de ruta
watch(() => route.path, () => {
  menuAbierto.value = false;
  perfilMenuAbierto.value = false;
});

// Cerrar menú al hacer click fuera - con cleanup correcto
const handleClickOutside = (e) => {
  // Solo procesar si el menú está abierto
  if (!menuAbierto.value) return;
  
  // Verificar si el click fue fuera del menú móvil
  if (mobileMenuRef.value && !mobileMenuRef.value.contains(e.target)) {
    menuAbierto.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

// Cleanup al desmontar
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div v-if="user && route.path !== '/'" :style="cssVariables">
    <!-- Alerta de Suspensión -->
    <div v-if="isSuspended" class="bg-red-600 text-white px-4 py-2 text-sm text-center">
      <div class="flex items-center justify-center gap-2">
        <AlertTriangle class="w-4 h-4" />
        <span>Suscripción vencida. Algunas funciones están limitadas.</span>
        <router-link 
          v-if="user.rol === 'gerente'" 
          to="/gerente-pagos" 
          class="underline font-semibold hover:text-red-200"
        >
          Pagar ahora
        </router-link>
      </div>
    </div>

    <!-- Desktop Navbar -->
    <nav class="hidden md:block bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center gap-3">
            <router-link to="/" class="flex items-center gap-2">
              <img 
                v-if="brandLogo" 
                :src="formatearImagen(brandLogo)" 
                class="h-8 w-8 object-contain rounded"
                alt="Logo"
              />
              <div 
                v-else-if="user.rol === 'superadmin'"
                class="w-8 h-8 rounded bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center"
              >
                <Store class="w-5 h-5 text-white" />
              </div>
              <span class="font-semibold text-slate-100">{{ brandName }}</span>
            </router-link>
          </div>

          <!-- Navigation Links -->
          <div class="flex items-center gap-1">
            <router-link
              v-for="link in currentNavLinks"
              :key="link.to"
              :to="link.to"
              :class="[
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                route.path === link.to 
                  ? 'bg-[var(--primary-color)]/20 text-[var(--primary-color)]' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              ]"
            >
              <component :is="link.icon" class="w-4 h-4" />
              <span>{{ link.label }}</span>
              <span 
                v-if="link.badge && notificaciones.length > 0"
                class="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
              >
                {{ notificaciones.length }}
              </span>
            </router-link>
          </div>

          <!-- Right Side: Notifications & Profile -->
          <div class="flex items-center gap-3">
            <!-- Notifications -->
            <button 
              class="relative p-2 text-slate-400 hover:text-slate-200 transition-colors"
              @click="uiStore.toggleNotificacionesPanel"
            >
              <Bell class="w-5 h-5" />
              <span 
                v-if="notificaciones.length > 0"
                class="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
              >
                {{ notificaciones.length > 9 ? '9+' : notificaciones.length }}
              </span>
            </button>

            <!-- Profile Dropdown -->
            <div class="relative">
              <button 
                @click="perfilMenuAbierto = !perfilMenuAbierto"
                class="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                  <img 
                    v-if="user.fotoUrl" 
                    :src="formatearImagen(user.fotoUrl)" 
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="text-sm font-medium text-slate-300">
                    {{ user.nombre?.charAt(0) }}
                  </span>
                </div>
                <div class="hidden lg:block text-left">
                  <p class="text-sm font-medium text-slate-200">{{ user.nombre }}</p>
                  <p class="text-xs text-slate-500 capitalize">{{ user.rol }}</p>
                </div>
              </button>

              <!-- Profile Menu -->
              <div 
                v-if="perfilMenuAbierto"
                class="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 z-50"
              >
                <router-link 
                  to="/perfil"
                  class="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                  @click="perfilMenuAbierto = false"
                >
                  <User class="w-4 h-4" />
                  Mi Perfil
                </router-link>
                <button 
                  @click="logout"
                  class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-700"
                >
                  <LogOut class="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Mobile Header -->
    <nav class="md:hidden bg-slate-900 border-b border-slate-800 fixed top-0 left-0 right-0 z-40">
      <div class="flex items-center justify-between px-4 h-14">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-2">
          <img 
            v-if="brandLogo" 
            :src="formatearImagen(brandLogo)" 
            class="h-7 w-7 object-contain rounded"
          />
          <div 
            v-else-if="user.rol === 'superadmin'"
            class="w-7 h-7 rounded bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center"
          >
            <Store class="w-4 h-4 text-white" />
          </div>
          <span class="font-semibold text-slate-100 text-sm">{{ brandName }}</span>
        </router-link>

        <!-- Mobile Menu Button -->
        <div class="flex items-center gap-2">
          <button 
            class="relative p-2 text-slate-400"
            @click.stop="uiStore.toggleNotificacionesPanel"
          >
            <Bell class="w-5 h-5" />
            <span 
              v-if="notificaciones.length > 0"
              class="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
            >
              {{ notificaciones.length > 9 ? '9+' : notificaciones.length }}
            </span>
          </button>
          <button 
            @click.stop="menuAbierto = !menuAbierto"
            class="p-2 text-slate-400 hover:text-slate-200"
          >
            <Menu v-if="!menuAbierto" class="w-6 h-6" />
            <X v-else class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Mobile Menu Overlay -->
      <div 
        v-if="menuAbierto"
        ref="mobileMenuRef"
        class="absolute top-14 left-0 right-0 bg-slate-900 border-b border-slate-800 shadow-xl max-h-[calc(100vh-3.5rem)] overflow-y-auto"
      >
        <!-- User Header -->
        <div class="px-4 py-4 border-b border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
              <img 
                v-if="user.fotoUrl" 
                :src="formatearImagen(user.fotoUrl)" 
                class="w-full h-full object-cover"
              />
              <span v-else class="text-lg font-medium text-slate-300">
                {{ user.nombre?.charAt(0) }}
              </span>
            </div>
            <div>
              <p class="font-medium text-slate-100">{{ user.nombre }}</p>
              <p class="text-sm text-slate-500 capitalize">{{ user.rol }}</p>
            </div>
          </div>
        </div>

        <!-- Mobile Nav Links -->
        <div class="px-2 py-2 space-y-1">
          <router-link
            v-for="link in currentNavLinks"
            :key="link.to"
            :to="link.to"
            class="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
            :class="{ 'bg-[var(--primary-color)]/20 text-[var(--primary-color)]': route.path === link.to }"
            @click="menuAbierto = false"
          >
            <component :is="link.icon" class="w-5 h-5" />
            <span>{{ link.label }}</span>
            <span 
              v-if="link.badge && notificaciones.length > 0"
              class="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
            >
              {{ notificaciones.length }}
            </span>
          </router-link>

          <div class="border-t border-slate-800 my-2"></div>

          <button 
            @click="logout"
            class="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-400 hover:bg-slate-800 transition-colors"
          >
            <LogOut class="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Mobile Bottom Navigation -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-40 pb-safe">
      <div class="flex items-center justify-around h-16">
        <router-link
          v-for="link in mobileNavLinks"
          :key="link.to"
          :to="link.to"
          class="flex flex-col items-center justify-center gap-1 flex-1 h-full"
          :class="[
            route.path === link.to 
              ? 'text-[var(--primary-color)]' 
              : 'text-slate-500'
          ]"
        >
          <component :is="link.icon" class="w-6 h-6" />
          <span class="text-xs">{{ link.label }}</span>
        </router-link>
      </div>
    </nav>

    <!-- Spacer for mobile bottom nav -->
    <div class="md:hidden h-16"></div>
  </div>
</template>

<style scoped>
/* Safe area for mobile bottom nav */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0);
}

/* Active link styling */
.router-link-active {
  position: relative;
}
</style>