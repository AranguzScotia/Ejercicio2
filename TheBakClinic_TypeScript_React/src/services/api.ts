import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error("Error: VITE_API_URL no está definida en el archivo .env");
  // Considerar lanzar un error o usar un valor por defecto si es apropiado,
  // pero para esta aplicación, es crucial.
}

const clienteHttp = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// Funciones genéricas de solicitud HTTP
// Estas pueden ser usadas por los servicios específicos o directamente si es necesario.

export const get = async <T>(endpoint: string, params?: Record<string, any>): Promise<T> => {
  try {
    const response = await clienteHttp.get<T>(endpoint, { params });
    return response.data;
  } catch (error) {
    // Aquí se podría añadir un manejo de errores más sofisticado si se desea (ej. logging, transformación del error)
    console.error(`Error en GET ${API_URL}${endpoint}:`, error);
    throw error; // Relanzar para que el llamador lo maneje
  }
};

export const post = async <T, U>(endpoint: string, data: U): Promise<T> => {
  try {
    const response = await clienteHttp.post<T>(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error en POST ${API_URL}${endpoint}:`, error);
    throw error;
  }
};

export const put = async <T, U>(endpoint: string, data: U): Promise<T> => {
  try {
    const response = await clienteHttp.put<T>(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error en PUT ${API_URL}${endpoint}:`, error);
    throw error;
  }
};

export const del = async <T>(endpoint: string): Promise<T> => {
  try {
    const response = await clienteHttp.delete<T>(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Error en DELETE ${API_URL}${endpoint}:`, error);
    throw error;
  }
};

export default clienteHttp; // Exportar la instancia para uso en otros servicios si es necesario, o no exportarla si solo se usan get/post/put/del.
// Por ahora la exporto, pero los servicios modulares usarán las funciones get/post/put/del.
