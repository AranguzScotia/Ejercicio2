import { get, post, put, del } from './api'; // Usar las funciones genéricas

export interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  rut: string;
  email: string;
  telefono?: string;
  rol: string;
  especialidad?: string;
  activo: boolean;
  fecha_creacion?: string; // ISO datetime string
  ultimo_acceso?: string; // ISO datetime string
  // fecha_ingreso no está en el schema del backend, pero estaba en la interfaz anterior. Se omite por ahora.
}

export interface UsuarioListResponse {
  usuarios: Usuario[];
  total: number;
}

// Payload para crear, debe incluir la contraseña y coincidir con UserCreate del backend
export type UsuarioCreatePayload = Omit<Usuario, 'id_usuario' | 'fecha_creacion' | 'ultimo_acceso'> & {
  contrasena: string;
};

// Payload para actualizar, todos los campos son opcionales y no se incluye contraseña
export type UsuarioUpdatePayload = Partial<Omit<Usuario, 'id_usuario' | 'fecha_creacion' | 'ultimo_acceso' | 'contrasena'>>;


export const obtenerUsuarios = async (skip: number = 0, limit: number = 100): Promise<UsuarioListResponse> => {
  return get<UsuarioListResponse>('/usuarios', { skip, limit });
};

export const obtenerUsuarioPorId = async (idUsuario: number | string): Promise<Usuario> => {
  return get<Usuario>(`/usuarios/${idUsuario}`);
};

export const crearUsuario = async (datosUsuario: UsuarioCreatePayload): Promise<Usuario> => {
  // El tipo del segundo argumento de post genérico (U) debe coincidir con datosUsuario
  return post<Usuario, UsuarioCreatePayload>('/usuarios', datosUsuario);
};

export const actualizarUsuario = async (idUsuario: number | string, datosUsuario: UsuarioUpdatePayload): Promise<Usuario> => {
  return put<Usuario, UsuarioUpdatePayload>(`/usuarios/${idUsuario}`, datosUsuario);
};

export const eliminarUsuario = async (idUsuario: number | string): Promise<any> => {
  return del<any>(`/usuarios/${idUsuario}`);
};
