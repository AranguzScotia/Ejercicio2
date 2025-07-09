import { get } from './api';

export interface ConteoPorEstado { // Ya existe en el schema del backend
  estado: string;
  cantidad: number;
}

export interface ReporteGeneralData { // Coincide con ReporteGeneralDataPublic del backend
  total_pacientes_registrados: number;
  total_usuarios_personal: number;
  conteo_cirugias_por_estado: ConteoPorEstado[];
  // otros KPIs si se añaden
}

export const obtenerReporteGeneral = async (): Promise<ReporteGeneralData> => {
  return get<ReporteGeneralData>('/reportes/general');
};

// Otras funciones para reportes específicos podrían ir aquí.
