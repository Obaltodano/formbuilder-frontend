import { useApi, BASE_URL } from './useApi';
import { ref, readonly } from 'vue';
import type { 
  Respuesta, 
  Formulario, 
  RespuestaDatos, 
  FileGroup,
  ArchivosPorCampo,
  CampoConfig 
} from '@/types/form.types';

/**
 * Composable para gestión de respuestas de formularios
 * 
 * @example
 * const { 
 *   respuestas, 
 *   loading, 
 *   fetchRespuestas, 
 *   submitRespuesta,
 *   getFileUrl,
 *   extractFilesFromRespuesta 
 * } = useRespuestas();
 */
export function useRespuestas() {
  const { request, loading, error } = useApi();
  const respuestas = ref<Respuesta[]>([]);

  /**
   * Obtener todas las respuestas
   */
  const fetchRespuestas = async (): Promise<Respuesta[]> => {
    respuestas.value = await request<Respuesta[]>('GET', '/api/respuestas');
    return respuestas.value;
  };

  /**
   * Obtener respuestas por formulario
   */
  const fetchRespuestasByFormulario = async (formularioId: string): Promise<Respuesta[]> => {
    respuestas.value = await request<Respuesta[]>(
      'GET', 
      `/api/respuestas/formulario/${formularioId}`
    );
    return respuestas.value;
  };

  /**
   * Obtener una respuesta por ID
   */
  const fetchRespuestaById = async (id: string): Promise<Respuesta> => {
    return await request<Respuesta>('GET', `/api/respuestas/${id}`);
  };

  /**
   * ⭐ Enviar respuesta de formulario
   * 
   * REGLAS IMPORTANTES:
   * 1. Usar label como key en datos JSON
   * 2. Usar label como fieldname en FormData para archivos
   * 3. Enviar como multipart/form-data
   */
  const submitRespuesta = async (
    formulario: Formulario,
    respuestaDatos: RespuestaDatos,
    archivosPorCampo: ArchivosPorCampo
  ): Promise<Respuesta> => {
    // Crear FormData
    const formData = new FormData();

    // 1. Agregar metadatos
    const userStr = localStorage.getItem('user_data');
    const user = userStr ? JSON.parse(userStr) : {};
    
    formData.append('empresaId', user.empresaId || '');
    formData.append('formularioId', formulario._id!);
    formData.append('nombreFormulario', formulario.titulo);
    formData.append('usuarioId', user.id || '');

    // 2. ⭐ DATOS JSON: Labels como keys
    formData.append('datos', JSON.stringify(respuestaDatos));

    // 3. ⭐ ARCHIVOS: Usar LABEL como fieldname
    Object.entries(archivosPorCampo).forEach(([label, files]) => {
      files.forEach((file) => {
        // ⭐ CRÍTICO: fieldname = label del campo
        formData.append(label, file);
      });
    });

    // Enviar
    const result = await request<Respuesta>(
      'POST',
      '/api/respuestas',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return result;
  };

  /**
   * ⭐ Convertir ruta relativa a URL completa
   * 
   * @param relativePath - Ruta relativa (ej: "uploads/empresa/usuario/form/file.jpg")
   * @returns URL completa
   */
  const getFileUrl = (relativePath: string): string => {
    if (!relativePath) return '';
    if (relativePath.startsWith('http')) return relativePath;
    return `${BASE_URL}/${relativePath}`;
  };

  /**
   * ⭐ Verificar si un campo contiene archivos
   * Detecta rutas de archivos en el valor
   */
  const isFileField = (value: any): boolean => {
    if (typeof value !== 'string') return false;
    return value.startsWith('uploads/') || 
           value.match(/\.(jpg|jpeg|png|gif|webp|mp4|webm|ogg|pdf|doc|docx)$/i) !== null;
  };

  /**
   * ⭐ Extraer archivos de la respuesta
   * Convierte rutas relativas a URLs completas
   * 
   * @param respuesta - Respuesta del formulario
   * @returns Array de grupos de archivos organizados por label
   */
  const extractFilesFromRespuesta = (respuesta: Respuesta): FileGroup[] => {
    const files: FileGroup[] = [];

    if (!respuesta.datos) return files;

    Object.entries(respuesta.datos).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // Array de rutas (múltiples archivos)
        const fileUrls = value
          .filter(v => isFileField(v))
          .map(v => getFileUrl(v));

        if (fileUrls.length > 0) {
          files.push({ label: key, urls: fileUrls });
        }
      } else if (isFileField(value)) {
        // Archivo único
        files.push({ label: key, urls: [getFileUrl(value)] });
      }
    });

    return files;
  };

  /**
   * Inicializar datos vacíos para un formulario
   * Crea la estructura inicial de respuestaDatos según los campos
   */
  const initializeRespuestaDatos = (campos: CampoConfig[]): RespuestaDatos => {
    const datos: RespuestaDatos = {};

    campos.forEach(campo => {
      switch (campo.tipo) {
        case 'cuadricula_unica':
          datos[campo.label] = {};
          break;
        case 'cuadricula_multiple':
          datos[campo.label] = {};
          break;
        case 'geolocalizacion':
          datos[campo.label] = { lat: null, lng: null };
          break;
        case 'checkbox':
          datos[campo.label] = false;
          break;
        case 'number':
        case 'escala':
          datos[campo.label] = campo.min || 0;
          break;
        default:
          datos[campo.label] = '';
      }
    });

    return datos;
  };

  /**
   * Manejar cambio en cuadrícula
   */
  const handleCuadriculaChange = (
    datos: RespuestaDatos,
    label: string,
    fila: string,
    columna: string,
    isMultiple: boolean
  ): void => {
    if (isMultiple) {
      // Cuadrícula múltiple: Array de selecciones
      if (!datos[label]) {
        datos[label] = {};
      }
      if (!Array.isArray(datos[label][fila])) {
        datos[label][fila] = [];
      }

      const index = datos[label][fila].indexOf(columna);
      if (index > -1) {
        datos[label][fila].splice(index, 1);
      } else {
        datos[label][fila].push(columna);
      }
    } else {
      // Cuadrícula única: Un valor por fila
      if (!datos[label]) {
        datos[label] = {};
      }
      datos[label][fila] = columna;
    }
  };

  /**
   * Obtener geolocalización del navegador
   */
  const obtenerGeolocalizacion = (
    datos: RespuestaDatos,
    label: string,
    onError?: (error: string) => void
  ): void => {
    if (!navigator.geolocation) {
      onError?.('Geolocalización no soportada por el navegador');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        datos[label] = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
      },
      (error) => {
        onError?.('Error obteniendo ubicación: ' + error.message);
      },
      { enableHighAccuracy: true }
    );
  };

  /**
   * Renderizar valor según tipo para visualización
   */
  const renderValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    
    if (typeof value === 'object') {
      // Geolocalización
      if (value.lat !== undefined && value.lng !== undefined) {
        return `📍 ${Number(value.lat).toFixed(4)}, ${Number(value.lng).toFixed(4)}`;
      }
      // Cuadrícula u otro objeto
      return JSON.stringify(value);
    }
    
    // Booleanos
    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No';
    }
    
    return String(value);
  };

  return {
    // Estado
    respuestas: readonly(respuestas),
    loading: readonly(loading),
    error: readonly(error),

    // Métodos
    fetchRespuestas,
    fetchRespuestasByFormulario,
    fetchRespuestaById,
    submitRespuesta,
    getFileUrl,
    isFileField,
    extractFilesFromRespuesta,
    initializeRespuestaDatos,
    handleCuadriculaChange,
    obtenerGeolocalizacion,
    renderValue
  };
}

// Re-exportar BASE_URL para que esté disponible al importar desde useRespuestas
export { BASE_URL };

export default useRespuestas;
