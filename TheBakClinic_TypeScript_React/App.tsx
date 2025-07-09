import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { estaAutenticado } from './src/services/authService';

// Layouts
import MainLayout from './src/layouts/MainLayout';

// Pages (Componentes de vista principal)
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { AgendaQuirurgica } from "./components/AgendaQuirurgica";
import { IngresoPaciente } from "./components/IngresoPaciente";
// import { DetalleCirugia } from "./components/DetalleCirugia";
// import { HistorialCirugias } from "./components/HistorialCirugias";
import { PanelLimpieza } from "./components/PanelLimpieza";
import { GestionUsuarios } from "./components/GestionUsuarios";
import { ReportesKPIs } from "./components/ReportesKPIs";
import { NotificacionesAlertas } from "./components/NotificacionesAlertas";
import RutaProtegida from './src/components/auth/RutaProtegida'; // Importar RutaProtegida

// Este componente App ahora es principalmente para configurar el Router.
// El estado de autenticación y la lógica de layout se mueven.

export default function App() {
  // Este estado ayuda a App a re-renderizarse cuando cambia la autenticación,
  // lo cual es importante para que las Rutas Protegidas se re-evalúen.
  const [authVersion, setAuthVersion] = useState(0);

  const handleAuthChange = () => {
    setAuthVersion(v => v + 1); // Simplemente cambiar el valor para forzar re-render
  };

  // El componente Login ahora llamará a handleAuthChange y usará useNavigate
  // para redirigir después de un login exitoso.
  // MainLayout manejará el logout y también usará useNavigate.

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLoginSuccess={handleAuthChange} />} />

        {/* Rutas Protegidas envueltas por MainLayout a través de RutaProtegida */}
        <Route element={<RutaProtegida />}>
          <Route element={<MainLayout />}> {/* MainLayout ahora es parte de la ruta protegida */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/usuarios" element={<GestionUsuarios />} />
            {/*
              Las props onNavigate ya no son necesarias si los componentes usan
              useNavigate() o <Link /> de react-router-dom.
              Se deben revisar y actualizar los componentes hijos.
            */}
            <Route path="/pacientes/nuevo" element={<IngresoPaciente onNavigate={() => {console.warn("onNavigate obsoleto, usar useNavigate")}} />} />
            <Route path="/cirugias" element={<AgendaQuirurgica onNavigate={() => {console.warn("onNavigate obsoleto, usar useNavigate")}} />} />
            <Route path="/limpieza" element={<PanelLimpieza />} /> {/* Asumiendo que no usa onNavigate */}
            <Route path="/reportes" element={<ReportesKPIs />} /> {/* Asumiendo que no usa onNavigate */}
            <Route path="/notificaciones" element={<NotificacionesAlertas />} /> {/* Asumiendo que no usa onNavigate */}
            {/*
              Rutas adicionales que estaban en el switch de App.tsx original:
              - DetalleCirugia: Podría ser /cirugias/:idCirugia
              - HistorialCirugias: Podría ser /historial-cirugias
              Estas necesitarían sus propios componentes y rutas.
            */}
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={estaAutenticado() ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}