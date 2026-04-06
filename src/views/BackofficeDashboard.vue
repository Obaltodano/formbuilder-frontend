<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios';

// --- ESTADO PARA MARKETPLACE ---
const nuevoForm = ref({
  titulo: '',
  descripcion: '',
  categoria: 'Seguridad', // Por defecto
  campos: []
});

const categorias = ['Seguridad', 'Inventario', 'Ventas', 'Limpieza', 'Mantenimiento'];

// --- ESTADO PARA GESTIÓN DE EMPRESAS ---
const nuevaEmpresa = ref({
  nombre: '',
  email: '',
  password: '',
  empresaId: ''
});

// --- LÓGICA MARKETPLACE ---
const agregarCampo = (tipo) => {
  const etiqueta = prompt(`Nombre de la etiqueta para ${tipo}:`);
  if (etiqueta) {
    nuevoForm.value.campos.push({
      idLocal: Date.now().toString(), // Cambiamos _id por idLocal
      etiqueta,
      tipo
    });
  }
};

const eliminarCampo = (index) => nuevoForm.value.campos.splice(index, 1);

const publicarPlantilla = async () => {
  if (nuevoForm.value.campos.length === 0) return alert("Añade al menos un campo");
  
  try {
    // OPCIONAL: Limpiar los IDs temporales antes de enviar para que la DB esté limpia
    const datosParaEnviar = {
      ...nuevoForm.value,
      campos: nuevoForm.value.campos.map(({ etiqueta, tipo }) => ({ etiqueta, tipo }))
    };

    await api.post('/backoffice/market/subir', datosParaEnviar);
    alert("🚀 Plantilla publicada con éxito");
    nuevoForm.value = { titulo: '', descripcion: '', categoria: 'Ventas', campos: [] };
  } catch (err) {
    alert("Error al publicar: " + err.response?.data?.msg || err.message);
  }
};
// --- LÓGICA EMPRESAS ---
const registrarEmpresa = async () => {
  try {
    await api.post('/backoffice/alta-empresa', nuevaEmpresa.value);
    alert("🏢 Empresa y Gerente creados con éxito");
    nuevaEmpresa.value = { nombre: '', email: '', password: '', empresaId: '' };
  } catch (err) {
    alert("Error al crear empresa");
  }
};
</script>

<template>
  <div class="backoffice-container">
    <header class="header-maestro">
      <h1>Backoffice Maestro</h1>
      <p>Gestión global de empresas y recursos del Marketplace</p>
    </header>

    <div class="panel-maestro">
      
      <section class="card-gestion">
        <div class="card-header">
          <span class="icon">🛒</span>
          <h2>Nueva Plantilla para Marketplace</h2>
        </div>
        
        <div class="form-group">
          <input v-model="nuevoForm.titulo" placeholder="Título del Formulario (ej: Check-list Diario)" class="input-back" />
          <select v-model="nuevoForm.categoria" class="input-back">
            <option v-for="cat in categorias" :key="cat" :value="cat">{{ cat }}</option>
          </select>
          <textarea v-model="nuevoForm.descripcion" placeholder="Descripción para el Gerente..." class="input-back"></textarea>
        </div>
        
        <div class="constructor-campos">
          <p class="label-tiny">CONSTRUCTOR DE FORMULARIO</p>
          <div class="toolbar">
            <button @click="agregarCampo('texto')" class="btn-tool">📝 Texto</button>
            <button @click="agregarCampo('foto')" class="btn-tool">📷 Foto</button>
            <button @click="agregarCampo('gps')" class="btn-tool">📍 GPS</button>
          </div>

          <div class="preview-lista">
            <div v-for="(campo, i) in nuevoForm.campos" :key="campo._id" class="item-campo">
              <span><strong>{{ campo.tipo.toUpperCase() }}:</strong> {{ campo.etiqueta }}</span>
              <button @click="eliminarCampo(i)" class="btn-del">×</button>
            </div>
          </div>
        </div>

        <button @click="publicarPlantilla" class="btn-alta">PUBLICAR EN TIENDA VIRTUAL</button>
      </section>

      <section class="card-gestion">
        <div class="card-header">
          <span class="icon">🏢</span>
          <h2>Alta de Nueva Empresa</h2>
        </div>
        <p class="desc">Crea el acceso principal para un nuevo cliente (Gerente).</p>
        
        <div class="form-group">
          <input v-model="nuevaEmpresa.empresaId" placeholder="ID Único Empresa (ej: EMPRESA_A)" class="input-back" />
          <input v-model="nuevaEmpresa.nombre" placeholder="Nombre del Gerente" class="input-back" />
          <input v-model="nuevaEmpresa.email" type="email" placeholder="Correo Electrónico" class="input-back" />
          <input v-model="nuevaEmpresa.password" type="password" placeholder="Contraseña de Acceso" class="input-back" />
        </div>
        
        <button @click="registrarEmpresa" class="btn-alta secondary">REGISTRAR EMPRESA</button>
      </section>

    </div>
  </div>
</template>

<style scoped>
@import '../styles/backoffice.css';
</style>