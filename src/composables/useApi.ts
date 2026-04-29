import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { ref, readonly } from 'vue';

/**
 * URL Base de la API
 * Se puede configurar via variable de entorno VITE_API_URL
 */
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Instancia Axios configurada para el proyecto
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30s para uploads grandes
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Interceptor de peticiones para agregar token de autenticación
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('x-auth-token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Interceptor de respuestas para manejar errores
 * - 401: Redirigir al login y limpiar sesión
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      sessionStorage.removeItem('x-auth-token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Composable para realizar peticiones HTTP
 * 
 * @example
 * const { request, loading, error } = useApi();
 * const data = await request<User>('GET', '/api/users');
 */
export function useApi() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Realiza una petición HTTP
   * 
   * @param method - Método HTTP (GET, POST, PUT, DELETE, etc.)
   * @param url - URL del endpoint
   * @param data - Datos a enviar (opcional)
   * @param config - Configuración adicional de Axios
   * @returns Promise con los datos de la respuesta
   */
  const request = async <T>(
    method: string,
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await apiClient.request<T>({
        method,
        url,
        data,
        ...config
      });
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.msg || 
                          err.response?.data?.error || 
                          'Error de conexión';
      error.value = errorMessage;
      throw new Error(errorMessage);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Realiza una petición GET
   */
  const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return request<T>('GET', url, undefined, config);
  };

  /**
   * Realiza una petición POST
   */
  const post = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return request<T>('POST', url, data, config);
  };

  /**
   * Realiza una petición PUT
   */
  const put = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return request<T>('PUT', url, data, config);
  };

  /**
   * Realiza una petición DELETE
   */
  const del = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return request<T>('DELETE', url, undefined, config);
  };

  return {
    apiClient,
    loading: readonly(loading),
    error: readonly(error),
    request,
    get,
    post,
    put,
    delete: del
  };
}

export { apiClient };
export default useApi;
