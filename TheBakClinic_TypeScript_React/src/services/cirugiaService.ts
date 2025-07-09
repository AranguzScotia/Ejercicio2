import { get, post, put, del } from './api';
// Podríamos importar Paciente y Usuario si los anidamos en la interfaz Cirugia
// import { Paciente } from './pacienteService';
// import { Usuario } from './usuarioService';

export interface Cirugia {
  id_cirugia: number;
  id_paciente: number;
  id_medico_principal: number;
  id_quirofano?: number | null;
  nombre_quirofano?: string | null;
  fecha_hora_inicio_programada: string; // ISO datetime string
  duracion_estimada_minutos?: number | null;
  fecha_hora_fin_programada?: string | null; // ISO datetime string
  tipo_cirugia: string;
  estado_cirugia: string;
  notas_preoperatorias?: string | null;
  notas_postoperatorias?: string | null;
  fecha_creacion_registro: string; // ISO datetime string
  fecha_ultima_modificacion?: string | null; // ISO datetime string

  // paciente?: Paciente;
  // medico_principal?: Usuario;
}

// Para crear, omitimos IDs generados por BD y campos que se calculan o ponen por defecto en backend
export type CirugiaCreatePayload = Omit<Cirugia,
  'id_cirugia' |
  'fecha_creacion_registro' |
  'fecha_ultima_modificacion' |
  'fecha_hora_fin_programada' // Se calcula en backend o es opcional si hay duración
> & {
  fecha_hora_fin_programada?: string; // Permitir enviarla si se precalcula en frontend
};

// Para actualizar, la mayoría de los campos son opcionales.
// Podríamos restringir la actualización de id_paciente o id_medico_principal aquí.
export type CirugiaUpdatePayload = Partial<Omit<CirugiaCreatePayload, 'id_paciente' | 'id_medico_principal'>>;


export interface CirugiaListResponse {
  cirugias: Cirugia[];
  total: number;
}

export interface CirugiaListParams {
  skip?: number;
  limit?: number;
  fecha_desde?: string; // YYYY-MM-DD
  fecha_hasta?: string; // YYYY-MM-DD
  id_paciente?: number;
  id_medico?: number; // Debería ser id_medico_principal
  estado?: string;
  // nombre_quirofano?: string; // Si el backend lo soporta
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
