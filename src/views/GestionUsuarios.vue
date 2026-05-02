<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios';
import { 
  Users, 
  Plus, 
  UserPlus,
  Mail,
  Lock,
  User,
  Shield,
  Loader2,
  AlertCircle
} from 'lucide-vue-next';

const usuarios = ref([]);
const nuevoUsuario = ref({ nombre: '', email: '', password: '', rol: 'empleado' });
const loading = ref(false);
const creating = ref(false);
const error = ref(null);
const success = ref(false);

const cargarUsuarios = async () => {
  loading.value = true;
  try {
    const res = await api.get('/usuarios/equipo');
    usuarios.value = res.data;
  } catch (err) {
    console.error("Error al cargar equipo", err);
    error.value = err.message || 'Error al cargar usuarios';
  } finally {
    loading.value = false;
  }
};

const crearUsuario = async () => {
  if (!nuevoUsuario.value.nombre || !nuevoUsuario.value.email || !nuevoUsuario.value.password) {
    alert("Por favor completa todos los campos");
    return;
  }
  
  creating.value = true;
  try {
    await api.post('/usuarios/registro-equipo', nuevoUsuario.value);
    success.value = true;
    setTimeout(() => success.value = false, 3000);
    nuevoUsuario.value = { nombre: '', email: '', password: '', rol: 'empleado' };
    await cargarUsuarios();
  } catch (err) {
    // Manejar errores específicos del backend
    let mensaje = err.message || 'Error al crear usuario';
    
    if (err.code === 'LIMITE_PLAN_EXCEDIDO') {
      mensaje = `⚠️ ${err.message}`;
    } else if (err.code === 'EMAIL_EXISTS') {
      mensaje = '❌ Este email ya está registrado';
    } else if (err.code === 'LAST_GERENTE') {
      mensaje = '❌ ' + err.message;
    }
    
    alert(mensaje);
  } finally {
    creating.value = false;
  }
};

const getRolBadgeClass = (rol) => {
  return rol === 'gerente' 
    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
};

onMounted(() => {
  cargarUsuarios();
});
</script>

<template>
  <div class="min-h-screen bg-slate-950 pb-20 md:pb-0">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Users class="w-7 h-7 text-blue-400" />
            Gestión de Equipo
          </h1>
          <p class="text-slate-400 mt-1">
            Administra los usuarios de tu empresa
          </p>
        </div>
        
        <div class="flex items-center gap-3">
          <span class="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300">
            <span class="font-semibold text-blue-400">{{ usuarios.length }}</span> miembros
          </span>
        </div>
      </div>

      <!-- Success Message -->
      <div 
        v-if="success" 
        class="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3"
      >
        <div class="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <UserPlus class="w-4 h-4 text-emerald-400" />
        </div>
        <p class="text-emerald-400">Usuario creado exitosamente</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Formulario de Creación -->
        <div class="lg:col-span-1 order-first lg:order-last">
          <div class="bg-slate-800 rounded-xl border border-slate-700 p-6 lg:sticky lg:top-6">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <UserPlus class="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 class="font-semibold text-slate-200">Nuevo Usuario</h2>
                <p class="text-sm text-slate-500">Crea accesos para tu equipo</p>
              </div>
            </div>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-400 mb-2">
                  <span class="flex items-center gap-2">
                    <User class="w-4 h-4" />
                    Nombre Completo
                  </span>
                </label>
                <input 
                  v-model="nuevoUsuario.nombre" 
                  placeholder="Ej: Juan Pérez"
                  class="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-slate-400 mb-2">
                  <span class="flex items-center gap-2">
                    <Mail class="w-4 h-4" />
                    Correo Electrónico
                  </span>
                </label>
                <input 
                  v-model="nuevoUsuario.email" 
                  type="email"
                  placeholder="correo@empresa.com"
                  class="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-slate-400 mb-2">
                  <span class="flex items-center gap-2">
                    <Lock class="w-4 h-4" />
                    Contraseña
                  </span>
                </label>
                <input 
                  v-model="nuevoUsuario.password" 
                  type="password"
                  placeholder="••••••••"
                  class="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-slate-400 mb-2">
                  <span class="flex items-center gap-2">
                    <Shield class="w-4 h-4" />
                    Rol Asignado
                  </span>
                </label>
                <select 
                  v-model="nuevoUsuario.rol"
                  class="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="empleado">Empleado (Solo llena formularios)</option>
                  <option value="gerente">Gerente (Acceso administrativo)</option>
                </select>
                <p class="text-xs text-slate-500 mt-1">
                  {{ nuevoUsuario.rol === 'gerente' ? 'Acceso completo al sistema' : 'Solo puede llenar formularios asignados' }}
                </p>
              </div>
              
              <button 
                @click="crearUsuario"
                :disabled="creating"
                class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                <Loader2 v-if="creating" class="w-5 h-5 animate-spin" />
                <Plus v-else class="w-5 h-5" />
                {{ creating ? 'Creando...' : 'Crear Usuario' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Lista de Usuarios -->
        <div class="lg:col-span-2">
          <div class="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col max-h-[calc(100vh-300px)] lg:max-h-none">
            <div class="p-4 border-b border-slate-700 flex-shrink-0">
              <h2 class="font-semibold text-slate-200">Personal Activo</h2>
            </div>
            
            <!-- Loading -->
            <div v-if="loading" class="flex flex-col items-center justify-center py-16 flex-1">
              <Loader2 class="w-10 h-10 text-blue-500 animate-spin mb-4" />
              <p class="text-slate-400">Cargando usuarios...</p>
            </div>

            <!-- Error -->
            <div v-else-if="error" class="flex flex-col items-center justify-center py-16 flex-1">
              <div class="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <AlertCircle class="w-8 h-8 text-red-400" />
              </div>
              <p class="text-slate-400">{{ error }}</p>
            </div>

            <!-- Table -->
            <div v-else class="overflow-auto flex-1">
              <table class="w-full">
                <thead class="bg-slate-900/50 border-b border-slate-700 sticky top-0">
                  <tr>
                    <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Usuario</th>
                    <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase hidden sm:table-cell">Email</th>
                    <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Rol</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-700">
                  <tr v-for="u in usuarios" :key="u._id" class="hover:bg-slate-700/30">
                    <td class="px-4 sm:px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {{ u.nombre.charAt(0).toUpperCase() }}
                        </div>
                        <div class="min-w-0">
                          <span class="font-medium text-slate-200 block truncate">{{ u.nombre }}</span>
                          <span class="text-xs text-slate-500 sm:hidden">{{ u.email }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 sm:px-6 py-4 text-slate-400 hidden sm:table-cell">{{ u.email }}</td>
                    <td class="px-4 sm:px-6 py-4">
                      <span 
                        :class="[
                          'px-2.5 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap',
                          getRolBadgeClass(u.rol)
                        ]"
                      >
                        {{ u.rol }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="usuarios.length === 0">
                    <td colspan="3" class="px-6 py-12 text-center text-slate-500">
                      <Users class="w-12 h-12 mx-auto mb-3 text-slate-600" />
                      <p>No hay personal registrado aún.</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>