/**
 * Tipos de campos soportados por el sistema FormBuilder
 */
export type CampoTipo = 
  | 'text'           // Texto simple
  | 'textarea'       // Texto largo
  | 'number'         // Número
  | 'date'           // Fecha
  | 'email'          // Email
  | 'telefono'       // Teléfono
  | 'foto'           // 📷 Imagen (genera input file)
  | 'video'          // 🎥 Video (genera input file video)
  | 'geolocalizacion' // 📍 Coordenadas GPS (lat/lng)
  | 'cuadricula_unica'   // ☐ Cuadrícula selección única
  | 'cuadricula_multiple' // ☑️ Cuadrícula selección múltiple
  | 'escala'         // 📊 Escala 1-5 o 1-10
  | 'select'         // Lista desplegable
  | 'checkbox'       // Casilla única
  | 'radio';         // Opción única

/**
 * Configuración de un campo de formulario
 * ⭐ IMPORTANTE: Usar label como KEY en datos
 */
export interface CampoConfig {
  label: string;           // ⭐ IMPORTANTE: Usar como KEY en datos
  tipo: CampoTipo;
  requerido: boolean;
  placeholder?: string;

  // Para cuadrículas
  filas?: string[];        // Ej: ["Limpieza", "Organización"]
  columnas?: string[];     // Ej: ["Malo", "Regular", "Bueno", "Excelente"]

  // Para escala
  min?: number;
  max?: number;

  // Para select
  opciones?: string[];
}

/**
 * Estructura de un formulario
 */
export interface Formulario {
  _id?: string;
  titulo: string;
  descripcion?: string;
  categoria?: string;
  empresaId: string;
  campos: CampoConfig[];
  esPlantilla?: boolean;
  fechaCreacion?: string;
}

/**
 * Datos de respuesta usando labels como keys
 * ⭐ REGLA CRÍTICA: Usar Labels como Keys, no IDs
 * 
 * ✅ CORRECTO:
 * {
 *   "Nombre del Empleado": "Juan Pérez",
 *   "Fecha de Inspección": "2024-01-15",
 *   "Calificación de Limpieza": "Bueno"
 * }
 * 
 * ❌ INCORRECTO:
 * {
 *   "campo_123": "Valor",
 *   "campo_456": "Otro valor"
 * }
 */
export interface RespuestaDatos {
  [key: string]: any;  // ⭐ KEY = Label del campo
}

/**
 * Estructura de una respuesta enviada
 */
export interface Respuesta {
  _id?: string;
  empresaId: string;
  formularioId: string | Formulario;
  usuarioId: string | Usuario;
  nombreFormulario: string;
  datos: RespuestaDatos;
  fechaEnvio?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Estructura de usuario
 */
export interface Usuario {
  _id: string;
  nombre: string;
  email: string;
  rol: 'superadmin' | 'gerente' | 'empleado';
  empresaId: string;
}

/**
 * Respuesta de login
 */
export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

/**
 * Datos para registro de usuario
 */
export interface RegisterData {
  nombre: string;
  email: string;
  password: string;
  rol: 'gerente' | 'empleado';
  empresaId: string;
}

/**
 * Estructura de archivos por campo
 * Mapa de label -> File[]
 */
export type ArchivosPorCampo = Record<string, File[]>;

/**
 * Grupo de archivos extraídos de una respuesta
 */
export interface FileGroup {
  label: string;
  urls: string[];
}

/**
 * Coordenadas GPS
 */
export interface GeoCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
}

/**
 * Configuración de cuadrícula
 */
export interface CuadriculaConfig {
  filas: string[];
  columnas: string[];
}

/**
 * Valor de cuadrícula única
 * { "Fila 1": "Bueno", "Fila 2": "Excelente" }
 */
export type CuadriculaUnicaValue = Record<string, string>;

/**
 * Valor de cuadrícula múltiple
 * { "Fila 1": ["Bueno", "Excelente"], "Fila 2": ["Regular"] }
 */
export type CuadriculaMultipleValue = Record<string, string[]>;
