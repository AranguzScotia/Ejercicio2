import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error("Error: VITE_API_URL no está definida en el archivo .env");
  // Podrías lanzar un error aquí o tener un valor por defecto,
  // pero para este caso, es crucial que esté definida.
}

const clienteHttp = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token de autenticación si existe
clienteHttp.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Realiza una solicitud GET genérica.
 * @param endpoint El endpoint al que se llamará (ej. "/usuarios")
 * @param params Parámetros de query opcionales
 * @returns Promise con la respuesta de la API
 */
export const get = async <T>(endpoint: string, params?: Record<string, any>): Promise<T> => {
  try {
    const response = await clienteHttp.get<T>(endpoint, { params });
    return response.data;
  } catch (error) {
    console.error(`Error en GET ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Realiza una solicitud POST genérica.
 * @param endpoint El endpoint al que se llamará (ej. "/usuarios")
 * @param data El cuerpo de la solicitud
 * @returns Promise con la respuesta de la API
 */
export const post = async <T, U>(endpoint: string, data: U): Promise<T> => {
  try {
    const response = await clienteHttp.post<T>(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error en POST ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Realiza una solicitud PUT genérica.
 * @param endpoint El endpoint al que se llamará (ej. "/usuarios/1")
 * @param data El cuerpo de la solicitud
 * @returns Promise con la respuesta de la API
 */
export const put = async <T, U>(endpoint: string, data: U): Promise<T> => {
  try {
    const response = await clienteHttp.put<T>(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error en PUT ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Realiza una solicitud DELETE genérica.
 * @param endpoint El endpoint al que se llamará (ej. "/usuarios/1")
 * @returns Promise con la respuesta de la API
 */
export const del = async <T>(endpoint: string): Promise<T> => {
  try {
    const response = await clienteHttp.delete<T>(endpoint);
    return response.data;
  } catch (error)
    console.error(`Error en DELETE ${endpoint}:`, error);
    throw error;
  }
};

// --- Funciones específicas para endpoints ---

// Auth
interface LoginPayload {
  rut: string;
  contrasena: string; // Asumiendo que el backend esperará 'contrasena'
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  // Podría incluir información del usuario también
  usuario?: any;
}

/**
 * Realiza el login de usuario.
 * @param credenciales Objeto con rut y contrasena
 */
export const iniciarSesion = async (credenciales: LoginPayload): Promise<LoginResponse> => {
  // Asumiendo que el backend espera 'username' y 'password' para un form de OAuth2
  // o un JSON con 'rut' y 'contrasena'. Ajustaremos según la implementación final del backend.
  // Por ahora, para FastAPI y OAuth2PasswordRequestForm, se envían como FormData.
  const formData = new URLSearchParams();
  formData.append('username', credenciales.rut); // FastAPI OAuth2 espera 'username'
  formData.append('password', credenciales.contrasena);

  try {
    const response = await clienteHttp.post<LoginResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    // Guardar token después de un login exitoso
    if (response.data.access_token) {
      localStorage.setItem('authToken', response.data.access_token);
    }
    return response.data;
  } catch (error) {
    console.error('Error en iniciarSesion:', error);
    // Limpiar token si el login falla (opcional, depende de la lógica deseada)
    // localStorage.removeItem('authToken');
    throw error;
  }
};

export const cerrarSesion = () => {
  localStorage.removeItem('authToken');
  // Aquí podrías añadir una llamada a un endpoint de logout en el backend si existiera
};

// Ejemplo para Usuarios (a expandir según los schemas)
export interface Usuario {
  id_usuario: number; // o string, dependiendo de la BD
  nombre: string;
  apellido: string;
  rut: string;
  email: string;
  telefono?: string;
  rol: string;
  especialidad?: string;
  activo: boolean;
  // Otros campos que puedan venir del backend
  fecha_ingreso?: string;
  ultimo_acceso?: string;
  // Podría tener fecha_creacion también si el backend la devuelve consistentemente
  fecha_creacion?: string; // ISO datetime string
}

// Para la respuesta de listado de usuarios
export interface UsuarioListResponse {
  usuarios: Usuario[];
  total: number;
}

export const obtenerUsuarios = async (skip: number = 0, limit: number = 100): Promise<UsuarioListResponse> => {
  return get<UsuarioListResponse>('/usuarios', { skip, limit });
};

// Para la creación, se podría definir un UsuarioCreatePayload si difiere mucho de Omit<Usuario, 'id_usuario'>
// Por ejemplo, si se necesita enviar 'contrasena'
export type UsuarioCreatePayload = Omit<Usuario, 'id_usuario' | 'fecha_creacion' | 'ultimo_acceso' | 'fecha_ingreso'> & {
  contrasena: string; // Asegurar que la contraseña se envíe
};


export const crearUsuario = async (datosUsuario: UsuarioCreatePayload): Promise<Usuario> => {
  return post<Usuario, Omit<Usuario, 'id_usuario'>>('/usuarios', datosUsuario);
};

export const actualizarUsuario = async (idUsuario: number | string, datosUsuario: Partial<Usuario>): Promise<Usuario> => {
  return put<Usuario, Partial<Usuario>>(`/usuarios/${idUsuario}`, datosUsuario);
};

export const eliminarUsuario = async (idUsuario: number | string): Promise<any> => { // El backend podría no devolver nada o un mensaje
  return del<any>(`/usuarios/${idUsuario}`);
};

// Aquí se añadirían más funciones para pacientes, cirugías, etc.
// Por ejemplo:
// --- Pacientes ---
export interface Paciente {
  id_paciente: number;
  nombre: string;
  apellido: string;
  rut: string;
  fecha_nacimiento: string; // ISO date string (YYYY-MM-DD)
  telefono?: string;
  email?: string;
  direccion?: string;
  prevision?: string;
  numero_ficha?: string;
  fecha_registro: string; // ISO datetime string
  // edad?: number; // Si se calcula y se devuelve desde el backend
}

// Para la creación, algunos campos son obligatorios y otros no tienen ID aún
export type PacienteCreatePayload = Omit<Paciente, 'id_paciente' | 'fecha_registro'>;
export type PacienteUpdatePayload = Partial<PacienteCreatePayload>;

interface PacienteListResponse {
  pacientes: Paciente[];
  total: number;
}

export const obtenerPacientes = async (skip: number = 0, limit: number = 100): Promise<PacienteListResponse> => {
  return get<PacienteListResponse>('/pacientes', { skip, limit });
};

export const obtenerPacientePorId = async (idPaciente: number): Promise<Paciente> => {
  return get<Paciente>(`/pacientes/${idPaciente}`);
};

export const crearPaciente = async (datosPaciente: PacienteCreatePayload): Promise<Paciente> => {
  return post<Paciente, PacienteCreatePayload>('/pacientes', datosPaciente);
};

export const actualizarPaciente = async (idPaciente: number, datosPaciente: PacienteUpdatePayload): Promise<Paciente> => {
  return put<Paciente, PacienteUpdatePayload>(`/pacientes/${idPaciente}`, datosPaciente);
};

export const eliminarPaciente = async (idPaciente: number): Promise<any> => {
  return del<any>(`/pacientes/${idPaciente}`); // Asume 204 No Content o un mensaje simple
};

// --- Cirugías ---
export interface Cirugia {
  id_cirugia: number;
  id_paciente: number;
  id_medico_principal: number;
  id_quirofano?: number;
  nombre_quirofano?: string;
  fecha_hora_inicio_programada: string; // ISO datetime string
  duracion_estimada_minutos?: number;
  fecha_hora_fin_programada?: string; // ISO datetime string
  tipo_cirugia: string;
  estado_cirugia: string;
  notas_preoperatorias?: string;
  notas_postoperatorias?: string;
  fecha_creacion_registro: string; // ISO datetime string
  fecha_ultima_modificacion?: string; // ISO datetime string

  // Opcional: campos expandidos si el backend los incluye
  // paciente?: Paciente;
  // medico_principal?: Usuario;
}

export type CirugiaCreatePayload = Omit<Cirugia, 'id_cirugia' | 'fecha_creacion_registro' | 'fecha_ultima_modificacion' | 'fecha_hora_fin_programada'> & {
  // fecha_hora_fin_programada es opcional si se calcula desde duración
  fecha_hora_fin_programada?: string;
};

export type CirugiaUpdatePayload = Partial<Omit<CirugiaCreatePayload, 'id_paciente' | 'id_medico_principal'>>; // No permitir cambiar paciente o médico principal fácilmente, o manejar con cuidado

interface CirugiaListResponse {
  cirugias: Cirugia[];
  total: number;
}

// Tipos para los parámetros de filtro del listado de cirugías
export interface CirugiaListParams {
  skip?: number;
  limit?: number;
  fecha_desde?: string; // YYYY-MM-DD
  fecha_hasta?: string; // YYYY-MM-DD
  id_paciente?: number;
  id_medico?: number;
  estado?: string;
}

export const obtenerCirugias = async (params?: CirugiaListParams): Promise<CirugiaListResponse> => {
  return get<CirugiaListResponse>('/cirugias', params);
};

export const obtenerCirugiaPorId = async (idCirugia: number): Promise<Cirugia> => {
  return get<Cirugia>(`/cirugias/${idCirugia}`);
};

export const crearCirugia = async (datosCirugia: CirugiaCreatePayload): Promise<Cirugia> => {
  return post<Cirugia, CirugiaCreatePayload>('/cirugias', datosCirugia);
};

export const actualizarCirugia = async (idCirugia: number, datosCirugia: CirugiaUpdatePayload): Promise<Cirugia> => {
  return put<Cirugia, CirugiaUpdatePayload>(`/cirugias/${idCirugia}`, datosCirugia);
};

export const eliminarCirugia = async (idCirugia: number): Promise<any> => {
  return del<any>(`/cirugias/${idCirugia}`);
};

// --- Limpieza ---
export interface EstadoQuirofano {
  nombre_quirofano: string;
  estado_limpieza: string;
  ultima_vez_ocupado_hasta?: string | null; // ISO datetime string
  ultima_limpieza_realizada_dt?: string | null; // ISO datetime string
  notas_limpieza?: string | null;
  id_quirofano_fk?: number | null; // Si se usa
}

export interface EstadoQuirofanoListResponse {
  quirofanos: EstadoQuirofano[];
  total: number;
}

export type EstadoQuirofanoUpdatePayload = {
  estado_limpieza?: string;
  ultima_vez_ocupado_hasta?: string | null;
  ultima_limpieza_realizada_dt?: string | null;
  notas_limpieza?: string | null;
};

export const obtenerEstadosQuirofanos = async (): Promise<EstadoQuirofanoListResponse> => {
  return get<EstadoQuirofanoListResponse>('/limpieza/quirofanos/estados');
};

export const obtenerEstadoQuirofano = async (nombreQuirofano: string): Promise<EstadoQuirofano> => {
  return get<EstadoQuirofano>(`/limpieza/quirofanos/${nombreQuirofano}/estado`);
};

export const actualizarEstadoQuirofano = async (nombreQuirofano: string, payload: EstadoQuirofanoUpdatePayload): Promise<EstadoQuirofano> => {
  return put<EstadoQuirofano, EstadoQuirofanoUpdatePayload>(`/limpieza/quirofanos/${nombreQuirofano}/estado`, payload);
};

// --- Reportes (Ejemplo) ---
export interface ReporteConteoCirugias {
  estado: string;
  cantidad: number;
}
export interface ReporteGeneralData {
    total_pacientes: number;
    total_usuarios: number;
    cirugias_por_estado: ReporteConteoCirugias[];
    // ... otros KPIs
}

export const obtenerReporteGeneral = async (): Promise<ReporteGeneralData> => {
    return get<ReporteGeneralData>('/reportes/general'); // Asumiendo este endpoint
};


// --- Notificaciones (Ejemplo) ---
export interface NotificacionAlerta {
    id: string; // o number
    tipo: 'info' | 'alerta' | 'error';
    mensaje: string;
    fecha: string; // ISO datetime string
    leida: boolean;
    entidad_relacionada?: string; // ej. "Cirugia ID: 123"
    id_entidad_relacionada?: number;
}
export interface NotificacionesListResponse {
    notificaciones: NotificacionAlerta[];
    total_no_leidas: number;
}

export const obtenerNotificaciones = async (limit: number = 20): Promise<NotificacionesListResponse> => {
    return get<NotificacionesListResponse>('/notificaciones', { limit }); // Asumiendo este endpoint
};

export const marcarNotificacionComoLeida = async (idNotificacion: string | number): Promise<any> => {
    return put<any, {}>(`/notificaciones/${idNotificacion}/leida`, {}); // Asumiendo este endpoint
};


export default clienteHttp;
