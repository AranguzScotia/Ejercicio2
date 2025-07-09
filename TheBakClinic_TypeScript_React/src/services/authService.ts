import clienteHttp from './api'; // Importar la instancia de Axios

// Interfaces específicas para Auth
export interface LoginPayload {
  email: string; // Cambiado de rut a email
  contrasena: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  usuario?: any;
}

/**
 * Realiza el login de usuario.
 */
export const iniciarSesion = async (credenciales: LoginPayload): Promise<LoginResponse> => {
  const formData = new URLSearchParams();
  formData.append('username', credenciales.email); // Usar email como username
  formData.append('password', credenciales.contrasena);

  try {
    // Usar clienteHttp.post directamente para poder especificar Content-Type para esta llamada
    const response = await clienteHttp.post<LoginResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (response.data.access_token) {
      localStorage.setItem('authToken', response.data.access_token);
    }
    return response.data;
  } catch (error) {
    console.error('Error en iniciarSesion (authService):', error);
    throw error;
  }
};

/**
 * Cierra la sesión del usuario.
 */
export const cerrarSesion = (): void => {
  localStorage.removeItem('authToken');
  console.log("Sesión cerrada, token eliminado.");
};

/**
 * Verifica si hay un token de autenticación almacenado.
 */
export const estaAutenticado = (): boolean => {
  return localStorage.getItem('authToken') !== null;
};
