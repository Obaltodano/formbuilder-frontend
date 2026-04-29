<script setup>
import { ref } from 'vue';
import api from '../api/axios';
import Constructor from './Constructor.vue';

// --- ESTADO PARA GESTIÓN DE EMPRESAS ---
const nuevaEmpresa = ref({
  nombre: '',
  email: '',
  password: '',
  empresaId: ''
});

// --- ESTADO PARA CONSTRUCTOR MARKETPLACE ---
const mostrarConstructor = ref(false);
const datosEdicion = ref(null);

const abrirConstructorMarket = () => {
  mostrarConstructor.value = true;
  datosEdicion.value = null;
};

const finalizarGuardadoMarket = () => {
  mostrarConstructor.value = false;
  datosEdicion.value = null;
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
    <div class="backoffice-content">
      
      <header class="header-maestro">
        <div class="header-info">
          <span class="badge-master">MODO SUPERADMIN</span>
          <h1>Backoffice Maestro</h1>
          <p>Gestión global de empresas y recursos del Marketplace</p>
        </div>
      </header>

      <div class="panel-maestro">
        
        <section class="card-gestion">
          <div class="card-header">
            <div class="icon-circle">🛒</div>
            <div>
              <h2>Nueva Plantilla Marketplace</h2>
              <p class="card-desc">Crea formularios avanzados para la tienda virtual.</p>
            </div>
          </div>
          
          <div class="form-group">
            <p class="info-text">Usa el constructor completo con todos los tipos de campos:</p>
            <ul class="feature-list">
              <li>✅ Todos los tipos de campo (texto, números, email)</li>
              <li>✅ Opciones múltiples, escala lineal, cuadrículas</li>
              <li>✅ Multimedia (foto, video, GPS, adjuntos)</li>
              <li>✅ Configuración de categoría, precio y visibilidad</li>
            </ul>
          </div>

          <button @click="abrirConstructorMarket" class="btn-alta">
            <span>�️</span> ABRIR CONSTRUCTOR COMPLETO
          </button>
        </section>

        <!-- Constructor Modal para Marketplace -->
        <div v-if="mostrarConstructor" class="constructor-modal-overlay">
          <div class="constructor-modal">
            <button @click="mostrarConstructor = false" class="btn-close-modal">✕ Cerrar</button>
            <Constructor 
              :datosEdicion="datosEdicion"
              modo="marketplace"
              @finalizado="finalizarGuardadoMarket"
            />
          </div>
        </div>

        <section class="card-gestion">
          <div class="card-header">
            <div class="icon-circle secondary">🏢</div>
            <div>
              <h2>Alta de Nueva Empresa</h2>
              <p class="card-desc">Registra un nuevo cliente corporativo.</p>
            </div>
          </div>
          
          <div class="form-group">
            <label class="label-tiny">CONFIGURACIÓN DE CUENTA</label>
            <input v-model="nuevaEmpresa.empresaId" placeholder="ID Único (ej: COCA_COLA_MX)" class="input-back bold" />
            
            <label class="label-tiny">DATOS DEL GERENTE ADMIN</label>
            <input v-model="nuevaEmpresa.nombre" placeholder="Nombre completo" class="input-back" />
            <input v-model="nuevaEmpresa.email" type="email" placeholder="Correo electrónico" class="input-back" />
            <input v-model="nuevaEmpresa.password" type="password" placeholder="Contraseña inicial" class="input-back" />
          </div>
          
          <div class="info-box">
            <p>⚠️ Al registrar, se creará automáticamente el entorno privado para esta empresa.</p>
          </div>
          
          <button @click="registrarEmpresa" class="btn-alta btn-secondary">
             REGISTRAR EMPRESA
          </button>
        </section>

      </div>
    </div>
  </div>
</template>

<style scoped>
@import '../styles/backoffice.css';
</style>