<script setup>
import api from '../api/axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const email = ref('');
const password = ref('');

const login = async () => {
  try {
    console.log('🔑 Intentando login con:', { 
      email: email.value, 
      password: password.value ? '***' : '(vacía)'
    });
    
    const res = await api.post('/auth/login', { 
      email: email.value, 
      password: password.value 
    });
    
    console.log('✅ Login exitoso:', res.data);

    // Guardamos en sessionStorage para que sea temporal por pestaña
    sessionStorage.setItem('token', res.data.token);
    sessionStorage.setItem('user', JSON.stringify(res.data.usuario));

    // DISPARAR EVENTO: Esto le avisa al Navbar que debe leer el storage
    window.dispatchEvent(new CustomEvent('usuario-actualizado'));

    console.log("Respuesta del servidor:", res.data);

    // USAMOS EL ROUTER: Esto no recarga la página, solo cambia el componente visible.
    if (res.data.usuario.rol === 'empleado') {
      router.push('/dashboard');
    } else {
      router.push('/admin'); 
    }

  } catch (err) {
    console.error('❌ Error completo:', err);
    console.error('❌ Response data:', err.response?.data);
    console.error('❌ Status:', err.response?.status);
    
    const msg = err.response?.data?.msg || 
                err.response?.data?.error || 
                err.message || 
                "Error de conexión";
    alert("Error al entrar: " + msg);
  }
};
</script>

<style scoped>
@import '../styles/login.css';
</style>

<template>
  <div class="auth-wrapper">
    <div class="auth-box">
      <h1>Ingresar al Sistema</h1>
      <input v-model="email" type="email" placeholder="Email" class="auth-input">
      <input v-model="password" type="password" placeholder="Clave" class="auth-input">
      <button @click="login" class="btn-login">Entrar</button>
    </div>
  </div>
</template>