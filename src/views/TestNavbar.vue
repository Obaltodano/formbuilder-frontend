<script setup>
import { ref, computed } from 'vue'
import { useUsuarioStore } from '@/stores/useUsuarioStore'
import { useEmpresaStore } from '@/stores/useEmpresaStore'
import Navbar from '@/components/Navbar.vue'

const usuarioStore = useUsuarioStore()
const empresaStore = useEmpresaStore()

const rolSeleccionado = ref('superadmin')

const simularLogin = () => {
  const users = {
    superadmin: {
      _id: '1',
      nombre: 'Super Admin',
      email: 'super@sistema.com',
      rol: 'superadmin',
      fotoUrl: null
    },
    gerente: {
      _id: '2',
      nombre: 'Gerente Empresa',
      email: 'gerente@empresa.com',
      rol: 'gerente',
      empresaId: 'mi-empresa',
      fotoUrl: null
    },
    empleado: {
      _id: '3',
      nombre: 'Juan Empleado',
      email: 'juan@empresa.com',
      rol: 'empleado',
      empresaId: 'mi-empresa',
      grupo: 'Ventas',
      fotoUrl: null
    }
  }
  
  const user = users[rolSeleccionado.value]
  
  // Simular login en store
  usuarioStore.user = user
  usuarioStore.token = 'fake-token-' + Date.now()
  sessionStorage.setItem('token', usuarioStore.token)
  sessionStorage.setItem('user', JSON.stringify(user))
  
  // Simular empresa para gerente/empleado
  if (rolSeleccionado.value !== 'superadmin') {
    empresaStore.empresa = {
      _id: 'emp-123',
      nombre: 'Mi Empresa S.A.',
      empresaId: 'mi-empresa',
      status: 'activa',
      logoUrl: null,
      colorPrimario: '#3b82f6'
    }
    empresaStore.branding = {
      nombreEmpresa: 'Mi Empresa S.A.',
      logoUrl: null,
      colorPrimario: '#3b82f6',
      colorSecundario: '#1e293b'
    }
    empresaStore.status = 'activa'
  }
  
  console.log('✅ Login simulado como:', user.rol)
  alert(`Login simulado como: ${user.rol}`)
}

const limpiarSesion = () => {
  usuarioStore.logout()
  empresaStore.$reset?.()
  sessionStorage.clear()
  console.log('🗑️ Sesión limpiada')
  alert('Sesión limpiada. Recarga la página.')
}

const estadoActual = computed(() => {
  return {
    user: usuarioStore.user,
    isAuth: usuarioStore.isAuthenticated,
    empresa: empresaStore.empresa?.nombre
  }
})
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 p-8">
    <h1 class="text-2xl font-bold mb-6">🧪 Test del Navbar por Roles</h1>
    
    <!-- Selector de Rol -->
    <div class="bg-slate-800 p-6 rounded-xl mb-6 border border-slate-700">
      <h2 class="text-lg font-semibold mb-4">1. Selecciona un rol para simular:</h2>
      <div class="flex gap-3 mb-4">
        <label class="flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600">
          <input type="radio" v-model="rolSeleccionado" value="superadmin" class="w-4 h-4">
          <span>👑 SuperAdmin</span>
        </label>
        <label class="flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600">
          <input type="radio" v-model="rolSeleccionado" value="gerente" class="w-4 h-4">
          <span>💼 Gerente</span>
        </label>
        <label class="flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600">
          <input type="radio" v-model="rolSeleccionado" value="empleado" class="w-4 h-4">
          <span>🔧 Empleado</span>
        </label>
      </div>
      
      <div class="flex gap-3">
        <button 
          @click="simularLogin"
          class="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
        >
          Simular Login
        </button>
        <button 
          @click="limpiarSesion"
          class="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
        >
          Limpiar Sesión
        </button>
      </div>
    </div>
    
    <!-- Estado Actual -->
    <div class="bg-slate-800 p-6 rounded-xl border border-slate-700">
      <h2 class="text-lg font-semibold mb-4">2. Estado Actual:</h2>
      <pre class="bg-slate-900 p-4 rounded-lg text-sm text-green-400 overflow-auto">{{ JSON.stringify(estadoActual, null, 2) }}</pre>
    </div>
    
    <!-- Instrucciones -->
    <div class="mt-6 bg-blue-900/30 border border-blue-700 p-4 rounded-lg">
      <h3 class="font-semibold text-blue-300 mb-2">📋 Instrucciones:</h3>
      <ol class="list-decimal list-inside space-y-1 text-slate-300 text-sm">
        <li>Selecciona un rol arriba y haz clic en "Simular Login"</li>
        <li>Recarga la página (F5) - el Navbar debería aparecer automáticamente</li>
        <li>Navega entre las rutas disponibles para ese rol</li>
        <li>En móvil: verifica la bottom navigation bar</li>
        <li>Prueba con cada rol para ver los menús diferentes</li>
      </ol>
    </div>
  </div>
</template>
