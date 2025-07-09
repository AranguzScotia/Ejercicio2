import { get, post, put, del } from './api';

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
}

export type PacienteCreatePayload = Omit<Paciente, 'id_paciente' | 'fecha_registro'>;
export type PacienteUpdatePayload = Partial<PacienteCreatePayload>;

export interface PacienteListResponse {
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
  return del<any>(`/pacientes/${idPaciente}`);
};
