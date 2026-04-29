import { useApi, BASE_URL } from './useApi';
import { ref, readonly, computed } from 'vue';
import type { LoginResponse, RegisterData, Usuario } from '@/types/form.types';

/**
 * Composable para gestión de autenticación
 * 
 * @example
 * const { login, register, logout, getCurrentUser, isAuthenticated } = useAuth();
 */
export function useAuth() {
  const { request, loading, error } = useApi();
  const currentUser = ref<Usuario | null>(null);

  /**
   * Iniciar sesión
   * Guarda token y datos de usuario en localStorage
   */
  const login = async (email: string, password: string): Promise<LoginResponse> => {
    const result = await request<LoginResponse>('POST', '/api/auth/login', {
      email,
      password
    });

    // Guardar en localStorage
    localStorage.setItem('auth_token', result.token);
    localStorage.setItem('user_data', JSON.stringify(result.usuario));
    
    // Actualizar estado reactivo
    currentUser.value = result.usuario;

    return result;
  };

  /**
   * Registrar nuevo usuario (solo gerentes)
   */
  const register = async (data: RegisterData): Promise<{ token: string; user: Usuario }> => {
    return await request<{ token: string; user: Usuario }>(
      'POST', 
      '/api/auth/register', 
      data
    );
  };

  /**
   * Cerrar sesión
   * Limpia localStorage y redirige al login
   */
  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    currentUser.value = null;
    window.location.href = '/login';
  };

  /**
   * Obtener usuario actual desde localStorage
   */
  const getCurrentUser = (): Usuario | null => {
    if (currentUser.value) return currentUser.value;
    
    const userStr = localStorage.getItem('user_data');
    if (userStr) {
      try {
        currentUser.value = JSON.parse(userStr);
        return currentUser.value;
      } catch {
        return null;
      }
    }
    return null;
  };

  /**
   * Verificar si hay un usuario autenticado
   */
  const isAuthenticated = computed(() => {
    return !!getCurrentUser() && !!localStorage.getItem('auth_token');
  });

  /**
   * Verificar si el usuario actual es empleado
   */
  const isEmpleado = computed(() => {
    return getCurrentUser()?.rol === 'empleado';
  });

  /**
   * Verificar si el usuario actual es gerente
   */
  const isGerente = computed(() => {
    const user = getCurrentUser();
    return user?.rol === 'gerente' || user?.rol === 'superadmin';
  });

  /**
   * Obtener la ruta del dashboard según el rol
   */
  const getDashboardRoute = (): string => {
    const user = getCurrentUser();
    if (!user) return '/login';
    
    return user.rol === 'empleado' 
      ? '/employee/dashboard' 
      : '/manager/dashboard';
  };

  /**
   * Verificar autenticación al cargar la aplicación
   */
  const checkAuth = (): boolean => {
    const token = localStorage.getItem('auth_token');
    const user = getCurrentUser();
    return !!token && !!user;
  };

  return {
    // Estado
    loading: readonly(loading),
    error: readonly(error),
    currentUser: readonly(currentUser),
    
    // Métodos
    login,
    register,
    logout,
    getCurrentUser,
    getDashboardRoute,
    checkAuth,
    
    // Computed
    isAuthenticated,
    isEmpleado,
    isGerente
  };
}

export default useAuth;
