<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios';

const usuarios = ref([]);
const nuevoUsuario = ref({ nombre: '', email: '', password: '', rol: 'empleado' });

const cargarUsuarios = async () => {
  try {
    const res = await api.get('/usuarios/equipo'); 
    usuarios.value = res.data;
  } catch (err) {
    console.error("Error al cargar equipo", err);
  }
};

const crearUsuario = async () => {
  try {
    await api.post('/usuarios/registro-equipo', nuevoUsuario.value);
    alert("¡Usuario creado!");
    nuevoUsuario.value = { nombre: '', email: '', password: '', rol: 'empleado' };
    await cargarUsuarios(); // Recargamos la lista
  } catch (err) {
    alert("Error al crear usuario: " + (err.response?.data?.msg || err.message));
  }
};

onMounted(() => {
  cargarUsuarios();
});
</script>

<template>
  <div class="gestion-container">
    <div class="gestion-content">
      <header class="section-header">
        <h1 class="title">GESTIÓN DE EQUIPO</h1>
        <div class="header-stats">
          <span class="stats-pill">{{ usuarios.length }} MIEMBROS ACTIVOS</span>
        </div>
      </header>
      
      <div class="admin-grid">
        <section class="card-alta">
          <div class="card-header-icon">👤</div>
          <h3>Registrar Nuevo Miembro</h3>
          <p class="card-subtitle">Crea credenciales de acceso para tu personal.</p>
          
          <div class="form-group">
            <label class="input-label">NOMBRE COMPLETO</label>
            <input v-model="nuevoUsuario.nombre" placeholder="Ej: Juan Pérez" class="input-form" />
            
            <label class="input-label">CORREO ELECTRÓNICO</label>
            <input v-model="nuevoUsuario.email" type="email" placeholder="correo@empresa.com" class="input-form" />
            
            <label class="input-label">CONTRASEÑA</label>
            <input v-model="nuevoUsuario.password" type="password" placeholder="••••••••" class="input-form" />
            
            <label class="input-label">ROL ASIGNADO</label>
            <select v-model="nuevoUsuario.rol" class="input-form">
              <option value="empleado">Empleado (Solo llena formularios)</option>
              <option value="gerente">Gerente (Acceso administrativo)</option>
            </select>
            
            <button @click="crearUsuario" class="btn-save">
              <span>🚀</span> CREAR ACCESO
            </button>
          </div>
        </section>

        <section class="card-lista">
          <div class="card-title-group">
             <h3>Personal Activo</h3>
          </div>
          
          <div class="table-scroll">
            <table class="user-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="u in usuarios" :key="u._id" class="user-row">
                  <td class="td-name">
                    <div class="user-avatar">{{ u.nombre.charAt(0) }}</div>
                    <span>{{ u.nombre }}</span>
                  </td>
                  <td class="td-email">{{ u.email }}</td>
                  <td>
                    <span :class="['badge', u.rol]">{{ u.rol }}</span>
                  </td>
                </tr>
                <tr v-if="usuarios.length === 0">
                  <td colspan="3" class="empty-row">No hay personal registrado aún.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('../styles/gestionusuarios.css');
</style>