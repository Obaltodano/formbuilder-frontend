/**
 * Índice de Composables
 * 
 * Exporta todos los composables del sistema para facilitar las importaciones
 * 
 * @example
 * import { useApi, useAuth, useRespuestas } from '@/composables';
 */

// Composables principales
export { useApi, apiClient, BASE_URL } from './useApi';
export { useAuth } from './useAuth';
export { useRespuestas } from './useRespuestas';

// Composables de utilidad
export { useFormValidation } from './useFormValidation.js';
export { useCamera } from './useCamera.js';

// Re-exportar tipos
export type { 
  CampoTipo,
  CampoConfig,
  Formulario,
  RespuestaDatos,
  Respuesta,
  Usuario,
  LoginResponse,
  RegisterData,
  ArchivosPorCampo,
  FileGroup,
  GeoCoordinates,
  CuadriculaConfig,
  CuadriculaUnicaValue,
  CuadriculaMultipleValue
} from '@/types/form.types';
