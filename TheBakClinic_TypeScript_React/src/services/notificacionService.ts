import { get, put } from './api';

export interface NotificacionAlerta {
  id_notificacion: string | number; // El backend usa UUID string para simuladas
  mensaje: string;
  tipo: 'info' | 'alerta' | 'error' | string; // Permitir string por si backend envía otros tipos
  fecha_creacion: string; // ISO datetime string
  leida: boolean;
  entidad_tipo?: string | null;
  entidad_id?: number | string | null;
}

export interface NotificacionesListResponse {
  notificaciones: NotificacionAlerta[];
  total_no_leidas: number;
}

export const obtenerNotificaciones = async (limit: number = 20): Promise<NotificacionesListResponse> => {
  return get<NotificacionesListResponse>('/notificaciones', { limit });
};

export const marcarNotificacionComoLeida = async (idNotificacion: string | number): Promise<any> => {
  // El backend devuelve 204 No Content, así que el tipo de respuesta es 'any' o 'void'
  return put<any, {}>(`/notificaciones/${idNotificacion}/leida`, {});
};

// export const marcarTodasComoLeidas = async (): Promise<any> => {
//   return put<any, {}>(`/notificaciones/marcar-todas-leidas`, {});
// };
