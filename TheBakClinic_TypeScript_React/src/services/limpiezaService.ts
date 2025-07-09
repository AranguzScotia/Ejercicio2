import { get, put } from './api';

export interface EstadoQuirofano {
  nombre_quirofano: string;
  estado_limpieza: string;
  ultima_vez_ocupado_hasta?: string | null; // ISO datetime string
  ultima_limpieza_realizada_dt?: string | null; // ISO datetime string
  notas_limpieza?: string | null;
  id_quirofano_fk?: number | null;
}

export interface EstadoQuirofanoListResponse {
  quirofanos: EstadoQuirofano[];
  total: number;
}

export type EstadoQuirofanoUpdatePayload = {
  estado_limpieza?: string;
  // ultima_vez_ocupado_hasta?: string | null; // Generalmente no se actualiza desde aquí
  // ultima_limpieza_realizada_dt?: string | null; // La API lo maneja si cambia a limpio
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

// Si se implementan Tareas de Limpieza, se añadirían aquí:
// export interface TareaLimpieza { ... }
// export const obtenerTareasLimpieza = async (...): Promise<...> => { ... };
// etc.
