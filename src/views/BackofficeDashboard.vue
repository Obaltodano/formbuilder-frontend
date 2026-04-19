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
              <p class="card-desc">Crea formularios base para la tienda virtual.</p>
            </div>
          </div>
          
          <div class="form-group">
            <label class="label-tiny">DATOS DE LA PLANTILLA</label>
            <input v-model="nuevoForm.titulo" placeholder="Título (ej: Auditoría de Seguridad)" class="input-back" />
            
            <select v-model="nuevoForm.categoria" class="input-back">
              <option disabled value="">Seleccionar Categoría</option>
              <option v-for="cat in categorias" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            
            <textarea v-model="nuevoForm.descripcion" placeholder="Descripción que verá el gerente al comprar..." class="input-back" rows="3"></textarea>
          </div>
          
          <div class="constructor-box">
            <p class="label-tiny">HERRAMIENTAS DE DISEÑO</p>
            <div class="toolbar-master">
              <button @click="agregarCampo('texto')" class="btn-tool"><span>📝</span> Texto</button>
              <button @click="agregarCampo('foto')" class="btn-tool"><span>📷</span> Foto</button>
              <button @click="agregarCampo('gps')" class="btn-tool"><span>📍</span> GPS</button>
            </div>

            <div class="preview-lista-master">
              <div v-if="nuevoForm.campos.length === 0" class="empty-fields">
                No hay campos agregados aún
              </div>
              <div v-for="(campo, i) in nuevoForm.campos" :key="i" class="item-campo-master">
                <div class="campo-info">
                  <span class="campo-type">{{ campo.tipo }}</span>
                  <input v-model="campo.etiqueta" placeholder="Nombre de la pregunta..." class="input-inline" />
                </div>
                <button @click="eliminarCampo(i)" class="btn-del-master">×</button>
              </div>
            </div>
          </div>

          <button @click="publicarPlantilla" class="btn-alta">
            <span>🌍</span> PUBLICAR EN TIENDA VIRTUAL
          </button>
        </section>

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