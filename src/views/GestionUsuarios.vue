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
    <h1 class="title">Mi Equipo</h1>
    
    <div class="admin-grid">
      <section class="card-alta">
        <h3>Registrar Nuevo Miembro</h3>
        <div class="form-group">
          <input v-model="nuevoUsuario.nombre" placeholder="Nombre completo" class="input-form" />
          <input v-model="nuevoUsuario.email" type="email" placeholder="Correo" class="input-form" />
          <input v-model="nuevoUsuario.password" type="password" placeholder="Contraseña" class="input-flat" />
          <select v-model="nuevoUsuario.rol" class="input-form">
            <option value="empleado">Empleado (Solo llena formularios)</option>
            <option value="gerente">Gerente (Acceso administrativo)</option>
          </select>
          <button @click="crearUsuario" class="btn-save">CREAR ACCESO</button>
        </div>
      </section>

      <section class="card-lista">
        <h3>Personal Activo</h3>
        <div class="table-scroll">
          <table class="user-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in usuarios" :key="u._id">
                <td>{{ u.nombre }}</td>
                <td><span :class="['badge', u.rol]">{{ u.rol }}</span></td>
                <td>{{ u.email }}</td>
              </tr>
              <tr v-if="usuarios.length === 0">
                <td colspan="3" style="text-align: center; padding: 20px;">No hay personal registrado aún.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
@import url('../styles/gestionusuarios.css');
</style>