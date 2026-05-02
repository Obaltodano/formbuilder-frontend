<script setup>
import { ref, onMounted } from 'vue'
import { useEmpresaStore } from '@/stores/useEmpresaStore'
import { empresaService } from '@/services/empresaService'
import { 
  Palette, 
  Upload, 
  CheckCircle, 
  Image as ImageIcon,
  Type,
  Paintbrush
} from 'lucide-vue-next'

const empresaStore = useEmpresaStore()
const loading = ref(false)
const saving = ref(false)
const logoFile = ref(null)
const logoPreview = ref(null)

const branding = ref({
  primaryColor: '#3B82F6',
  secondaryColor: '#1E293B',
  logoUrl: null,
  faviconUrl: null,
  nombreApp: ''
})

onMounted(async () => {
  if (empresaStore.empresa) {
    branding.value = {
      primaryColor: empresaStore.empresa.primaryColor || '#3B82F6',
      secondaryColor: empresaStore.empresa.secondaryColor || '#1E293B',
      logoUrl: empresaStore.empresa.logoUrl,
      faviconUrl: empresaStore.empresa.faviconUrl,
      nombreApp: empresaStore.empresa.nombreApp || empresaStore.empresa.nombre
    }
    logoPreview.value = empresaStore.empresa.logoUrl
  }
})

const handleLogoChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    logoFile.value = file
    logoPreview.value = URL.createObjectURL(file)
  }
}

const guardarBranding = async () => {
  saving.value = true
  try {
    // Subir logo si hay archivo nuevo
    if (logoFile.value && empresaStore.empresa?._id) {
      await empresaService.uploadLogo(empresaStore.empresa._id, logoFile.value)
    }
    
    // Actualizar colores y nombre
    if (empresaStore.empresa?._id) {
      await empresaService.updateBranding(empresaStore.empresa._id, {
        primaryColor: branding.value.primaryColor,
        secondaryColor: branding.value.secondaryColor,
        nombreApp: branding.value.nombreApp
      })
    }
    
    alert('Branding actualizado exitosamente')
  } catch (err) {
    console.error('Error guardando branding:', err)
    alert('Error al guardar: ' + (err.response?.data?.msg || err.message))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 pb-24 md:pb-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Palette class="w-6 h-6 text-blue-400" />
          Personalización de Marca
        </h1>
        <p class="text-slate-400 mt-1">Configura los colores y logo de tu empresa</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Logo -->
        <div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div class="flex items-center gap-2 mb-4">
            <ImageIcon class="w-5 h-5 text-slate-400" />
            <h2 class="font-semibold text-slate-200">Logo de la Empresa</h2>
          </div>
          
          <div class="flex flex-col items-center gap-4">
            <div class="w-32 h-32 rounded-xl bg-slate-700 flex items-center justify-center border-2 border-dashed border-slate-600">
              <img 
                v-if="logoPreview" 
                :src="logoPreview" 
                alt="Logo preview"
                class="w-full h-full object-contain rounded-xl"
              />
              <ImageIcon v-else class="w-12 h-12 text-slate-500" />
            </div>
            
            <label class="cursor-pointer">
              <input 
                type="file" 
                accept="image/*"
                class="hidden"
                @change="handleLogoChange"
              />
              <span class="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 text-sm transition-colors">
                <Upload class="w-4 h-4" />
                {{ logoPreview ? 'Cambiar Logo' : 'Subir Logo' }}
              </span>
            </label>
            
            <p class="text-xs text-slate-500">PNG, JPG o SVG. Máx 2MB.</p>
          </div>
        </div>

        <!-- Colores -->
        <div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div class="flex items-center gap-2 mb-4">
            <Paintbrush class="w-5 h-5 text-slate-400" />
            <h2 class="font-semibold text-slate-200">Colores de Marca</h2>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-slate-400 mb-2">Color Primario</label>
              <div class="flex items-center gap-3">
                <input 
                  v-model="branding.primaryColor"
                  type="color"
                  class="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input 
                  v-model="branding.primaryColor"
                  type="text"
                  class="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-sm uppercase"
                />
              </div>
            </div>
            
            <div>
              <label class="block text-sm text-slate-400 mb-2">Color Secundario</label>
              <div class="flex items-center gap-3">
                <input 
                  v-model="branding.secondaryColor"
                  type="color"
                  class="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input 
                  v-model="branding.secondaryColor"
                  type="text"
                  class="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-sm uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Nombre de la App -->
        <div class="bg-slate-800 rounded-xl border border-slate-700 p-6 lg:col-span-2">
          <div class="flex items-center gap-2 mb-4">
            <Type class="w-5 h-5 text-slate-400" />
            <h2 class="font-semibold text-slate-200">Nombre de la Aplicación</h2>
          </div>
          
          <input 
            v-model="branding.nombreApp"
            type="text"
            placeholder="Ej: FormBuilder Pro"
            class="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:border-blue-500 outline-none"
          />
          <p class="text-xs text-slate-500 mt-2">Este nombre aparecerá en el navegador y notificaciones.</p>
        </div>

        <!-- Preview -->
        <div class="bg-slate-800 rounded-xl border border-slate-700 p-6 lg:col-span-2">
          <h2 class="font-semibold text-slate-200 mb-4">Vista Previa</h2>
          <div 
            class="rounded-lg p-6"
            :style="{ backgroundColor: branding.secondaryColor }"
          >
            <div class="flex items-center gap-3">
              <div 
                class="w-10 h-10 rounded-lg flex items-center justify-center"
                :style="{ backgroundColor: branding.primaryColor }"
              >
                <Palette class="w-5 h-5 text-white" />
              </div>
              <span class="text-lg font-semibold text-white">
                {{ branding.nombreApp || 'Tu App' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Guardar -->
      <div class="mt-8 flex justify-end">
        <button 
          @click="guardarBranding"
          :disabled="saving"
          class="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
        >
          <CheckCircle v-if="!saving" class="w-5 h-5" />
          <span v-if="!saving">Guardar Cambios</span>
          <span v-else>Guardando...</span>
        </button>
      </div>
    </div>
  </div>
</template>
