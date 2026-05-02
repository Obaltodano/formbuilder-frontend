<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios';
import {
  User,
  Mail,
  Shield,
  Building2,
  Camera,
  Save,
  Loader2,
  CreditCard,
  Phone,
  CheckCircle
} from 'lucide-vue-next';

const user = ref(JSON.parse(sessionStorage.getItem('user')) || null);
const loading = ref(false);
const saving = ref(false);
const uploading = ref(false);
const success = ref(false);
const perfilEdit = ref({
  dni: '',
  telefono: ''
});

const cargarPerfil = async () => {
  try {
    const res = await api.get('/usuarios/perfil');
    user.value = res.data;
    perfilEdit.value.dni = res.data.dni || '';
    perfilEdit.value.telefono = res.data.telefono || '';
    sessionStorage.setItem('user', JSON.stringify(res.data));
  } catch (err) {
    console.error("Error al obtener perfil:", err);
  }
};

onMounted(cargarPerfil);

const formatearImagen = (ruta) => {
  if (!ruta) return null;
  if (ruta.startsWith('http')) return ruta;
  const serverUrl = api.defaults.baseURL.replace('/api', '');
  return `${serverUrl}/${ruta}`;
};

const subirFoto = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('fotoPerfil', file);

  uploading.value = true;
  try {
    const res = await api.post('/usuarios/perfil/foto', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    user.value.fotoUrl = `${res.data.fotoUrl}`;
    sessionStorage.setItem('user', JSON.stringify(user.value));
    await cargarPerfil();
  } catch (err) {
    console.error("Error al subir:", err);
    alert(err.message || "Error al subir foto");
  } finally {
    uploading.value = false;
  }
};

const guardarDatos = async () => {
  saving.value = true;
  try {
    await api.put('/usuarios/perfil', perfilEdit.value);
    user.value = { ...user.value, ...perfilEdit.value };
    sessionStorage.setItem('user', JSON.stringify(user.value));
    success.value = true;
    setTimeout(() => success.value = false, 3000);
  } catch (err) {
    console.error("Error guardando perfil:", err);
    alert(err.message || "Error al guardar");
  } finally {
    saving.value = false;
  }
};

const getRolBadgeClass = (rol) => {
  const classes = {
    'superadmin': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'gerente': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'empleado': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'usuario': 'bg-slate-500/20 text-slate-300 border-slate-500/30'
  };
  return classes[rol] || classes['usuario'];
};
</script>

<template>
  <div class="min-h-screen bg-slate-950 pb-20 md:pb-0">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <User class="w-7 h-7 text-blue-400" />
          Mi Perfil
        </h1>
        <p class="text-slate-400 mt-1">
          Gestiona tu información personal
        </p>
      </div>

      <!-- Success Message -->
      <div 
        v-if="success" 
        class="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3"
      >
        <CheckCircle class="w-5 h-5 text-emerald-400" />
        <p class="text-emerald-400">Perfil actualizado exitosamente</p>
      </div>

      <div v-if="user" class="space-y-6">
        <!-- Avatar Section -->
        <div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div class="flex flex-col sm:flex-row sm:items-center gap-6">
            <div class="relative">
              <div class="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <img 
                  v-if="user.fotoUrl" 
                  :src="formatearImagen(user.fotoUrl)" 
                  class="w-full h-full object-cover"
                  @error="user.fotoUrl = null"
                />
                <span v-else class="text-3xl font-bold text-white">
                  {{ user.nombre ? user.nombre.charAt(0).toUpperCase() : 'U' }}
                </span>
              </div>
              
              <label class="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-lg">
                <Camera class="w-4 h-4 text-white" />
                <input type="file" @change="subirFoto" hidden accept="image/*" />
              </label>
              
              <div v-if="uploading" class="absolute inset-0 rounded-full bg-slate-900/80 flex items-center justify-center">
                <Loader2 class="w-6 h-6 text-blue-400 animate-spin" />
              </div>
            </div>
            
            <div>
              <h2 class="text-xl font-semibold text-slate-100">{{ user.nombre }}</h2>
              <p class="text-slate-400">{{ user.email }}</p>
              <span 
                :class="[
                  'inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium border capitalize',
                  getRolBadgeClass(user.rol)
                ]"
              >
                {{ user.rol }}
              </span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Información del Sistema -->
          <div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 class="font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Shield class="w-5 h-5 text-slate-400" />
              Información del Sistema
            </h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm text-slate-400 mb-1">
                  <span class="flex items-center gap-2">
                    <Mail class="w-4 h-4" />
                    Correo Electrónico
                  </span>
                </label>
                <input 
                  :value="user.email" 
                  readonly
                  class="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed"
                />
              </div>
              
              <div>
                <label class="block text-sm text-slate-400 mb-1">
                  <span class="flex items-center gap-2">
                    <Shield class="w-4 h-4" />
                    Rol de Usuario
                  </span>
                </label>
                <input 
                  :value="user.rol" 
                  readonly
                  class="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed capitalize"
                />
              </div>
              
              <div>
                <label class="block text-sm text-slate-400 mb-1">
                  <span class="flex items-center gap-2">
                    <Building2 class="w-4 h-4" />
                    ID de Empresa
                  </span>
                </label>
                <input 
                  :value="user.empresaId" 
                  readonly
                  class="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <!-- Información Personal -->
          <div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 class="font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <CreditCard class="w-5 h-5 text-slate-400" />
              Información Personal
            </h3>
            
            <form @submit.prevent="guardarDatos" class="space-y-4">
              <div>
                <label class="block text-sm text-slate-400 mb-1">
                  <span class="flex items-center gap-2">
                    <CreditCard class="w-4 h-4" />
                    DNI / Identificación
                  </span>
                </label>
                <input 
                  v-model="perfilEdit.dni" 
                  type="text" 
                  placeholder="Ingrese su DNI"
                  class="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              
              <div>
                <label class="block text-sm text-slate-400 mb-1">
                  <span class="flex items-center gap-2">
                    <Phone class="w-4 h-4" />
                    Teléfono de Contacto
                  </span>
                </label>
                <input 
                  v-model="perfilEdit.telefono" 
                  type="tel" 
                  placeholder="Ingrese su teléfono"
                  class="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              
              <button 
                type="submit" 
                :disabled="saving"
                class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                <Loader2 v-if="saving" class="w-5 h-5 animate-spin" />
                <Save v-else class="w-5 h-5" />
                {{ saving ? 'Guardando...' : 'Actualizar Perfil' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>