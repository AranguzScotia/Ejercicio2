import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { estaAutenticado } from '../../services/authService'; // Ajustar ruta si es necesario

interface RutaProtegidaProps {
  // Si se necesitan props específicas, como roles permitidos
  // rolesPermitidos?: string[];
}

const RutaProtegida: React.FC<RutaProtegidaProps> = (/*{ rolesPermitidos }*/) => {
  const location = useLocation();
  const autenticado = estaAutenticado();

  if (!autenticado) {
    // Redirigir a login, guardando la ubicación actual para posible redirección post-login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Lógica de roles (opcional, si se implementa más adelante)
  // const usuario = obtenerUsuarioActual(); // Suponiendo una función que devuelve el usuario y su rol
  // if (rolesPermitidos && usuario && !rolesPermitidos.includes(usuario.rol)) {
  //   return <Navigate to="/no-autorizado" replace />; // O a una página de acceso denegado
  // }

  return <Outlet />; // Renderiza el componente hijo (la ruta protegida)
};

export default RutaProtegida;
