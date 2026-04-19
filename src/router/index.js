import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';
import LlenarFormulario from '../views/LlenarFormulario.vue';
import VerReportes from '../views/VerReportes.vue';
import Perfil from '../views/Perfil.vue';

const routes = [
  { path: '/', component: Login },
  
  // --- RUTAS COMUNES (LOGUEADOS) ---
  { 
    path: '/dashboard', 
    component: Dashboard,
    meta: { requiresAuth: true } 
  },
  {
    path: '/perfil', // <--- NUEVA RUTA
    name: 'Perfil',
    component: Perfil,
    meta: { requiresAuth: true }
  },
  {
    path: '/llenar/:id',
    name: 'LlenarFormulario',
    component: LlenarFormulario,
    meta: { requiresAuth: true }
  },

  // --- RUTAS EXCLUSIVAS DEL GERENTE ---
  { 
    path: '/admin', 
    component: () => import('../views/Admin.vue'),
    meta: { requiresAuth: true, role: 'gerente' } 
  },
  { 
    path: '/marketplace', 
    component: () => import('../views/Marketplace.vue'),
    meta: { requiresAuth: true, role: 'gerente' } 
  },
  { 
    path: '/reportes', 
    name: 'VerReportes',
    component: VerReportes, 
    meta: { requiresAuth: true, role: 'gerente' } 
  },
  { 
    path: '/usuarios', 
    component: () => import('../views/GestionUsuarios.vue'),
    meta: { requiresAuth: true, role: 'gerente' } 
  },

  // --- RUTAS EXCLUSIVAS DEL SUPERADMIN (Antes Backoffice) ---
  { 
    path: '/superadmin-dashboard', 
    component: () => import('../views/BackofficeDashboard.vue'),
    meta: { requiresAuth: true, role: 'superadmin' } 
  },
  { 
    path: '/superadmin-reportes', 
    component: () => import('../views/BackofficeReportes.vue'),
    meta: { requiresAuth: true, role: 'superadmin' } 
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// EL GUARDIÁN (Navigation Guard)
router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem('token');
  const userRaw = sessionStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  const isAuthenticated = !!token;

  // 1. Evitar ir al login si ya está autenticado
  if (to.path === '/' && isAuthenticated) {
    return user.rol === 'superadmin' ? next('/superadmin-dashboard') : next('/dashboard');
  }

  // 2. Protección de rutas que requieren Auth
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next('/');
  }

  // 3. Control de roles estricto
  if (to.meta.role && user) {
    // Verificamos si el rol del usuario coincide exactamente con el meta.role de la ruta
    if (user.rol !== to.meta.role) {
      // Redirección inteligente según quién sea el intruso
      if (user.rol === 'superadmin') return next('/superadmin-dashboard');
      if (user.rol === 'gerente' || user.rol === 'empleado') return next('/dashboard');
      return next('/');
    }
  }

  next();
});

export default router;