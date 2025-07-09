import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button'; // Ajustar rutas de importación si es necesario
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import clinicLogo from 'figma:asset/edbed43c3db39494f85e7ae6f92ba61a21ce649c.png'; // Asumiendo que está accesible o mover a /public
import {
  Home, Calendar, UserPlus, History, Sparkles, Users, BarChart3, Bell, LogOut, Menu, X, LucideIcon
} from 'lucide-react';
import { cerrarSesion } from '../services/authService'; // Para el logout

interface MenuItem {
  id: string;
  path: string;
  label: string;
  icon: LucideIcon;
}

// Definir menuItems aquí o pasarlos como prop si son dinámicos
const menuItems: MenuItem[] = [
  { id: "dashboard", path: "/dashboard", label: "Dashboard", icon: Home },
  { id: "agenda", path: "/cirugias", label: "Agenda Quirúrgica", icon: Calendar },
  { id: "paciente", path: "/pacientes/nuevo", label: "Ingreso Paciente", icon: UserPlus }, // Asumiendo una ruta para nuevo paciente
  // { id: "pacientes", path: "/pacientes", label: "Lista Pacientes", icon: Users2 }, // Si hay listado
  { id: "historial", path: "/historial-cirugias", label: "Historial Cirugías", icon: History },
  { id: "limpieza", path: "/limpieza", label: "Panel Limpieza", icon: Sparkles },
  { id: "usuarios", path: "/usuarios", label: "Gestión Usuarios", icon: Users },
  { id: "reportes", path: "/reportes", label: "Reportes y KPIs", icon: BarChart3 },
  { id: "notificaciones", path: "/notificaciones", label: "Notificaciones", icon: Bell },
];

interface MainLayoutProps {
  // onLogout: () => void; // Se manejará internamente con useNavigate
  // Considerar pasar el usuario actual para mostrar en el sidebar si es necesario
}

export default function MainLayout({ }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    cerrarSesion(); // Limpia el token
    navigate('/login'); // Redirige a login
  };

  const getCurrentTitle = () => {
    const currentItem = menuItems.find(item => location.pathname.startsWith(item.path));
    return currentItem?.label || "Sistema Clínico";
  };

  // Simulación de datos de usuario - reemplazar con datos reales si se obtienen del backend/contexto
  const usuarioActual = {
      nombre: "Dr. Admin",
      email: "admin@clinicabak.cl"
  };
  const notificacionesNoLeidas = 2; // Simulación - reemplazar con datos reales

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <Link to="/dashboard" className="flex flex-col items-center w-full">
                <img src={clinicLogo} alt="The BAK Clinic" className="h-12 w-auto object-contain mb-2" />
                <div className="text-center">
                  <h2 className="font-bold text-primary text-sm">Gestión de Pabellones</h2>
                  <p className="text-xs text-muted-foreground">Sistema Clínico</p>
                </div>
              </Link>
              <Button variant="ghost" size="sm" className="lg:hidden absolute top-4 right-4" onClick={() => setSidebarOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3"
                  asChild // Para que el Button actúe como un Link de react-router-dom
                >
                  <Link to={item.path} onClick={() => setSidebarOpen(false)}>
                    <Icon className="w-4 h-4" />
                    {item.label}
                    {item.id === "notificaciones" && notificacionesNoLeidas > 0 && (
                      <Badge variant="destructive" className="ml-auto">{notificacionesNoLeidas}</Badge>
                    )}
                  </Link>
                </Button>
              );
            })}
          </nav>

          <div className="p-4 border-t">
            <div className="space-y-2">
              <div className="text-sm">
                <p className="font-medium">{usuarioActual.nombre}</p>
                <p className="text-muted-foreground">{usuarioActual.email}</p>
              </div>
              <Separator />
              <Button variant="outline" className="w-full justify-start gap-3" onClick={handleLogoutClick}>
                <LogOut className="w-4 h-4" /> Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col"> {/* Asegurar que el contenido principal pueda crecer */}
        <header className="bg-card border-b px-6 py-4 flex items-center justify-between lg:justify-end sticky top-0 z-30">
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="lg:hidden"> {/* Logo solo en móvil si el sidebar está cerrado */}
              {!sidebarOpen && <img src={clinicLogo} alt="The BAK Clinic" className="h-8 w-auto object-contain" />}
            </div>
            <div className="hidden md:block text-right">
              <p className="font-medium">{getCurrentTitle()}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(), "eeee, d 'de' MMMM 'de' yyyy", { locale: es })}
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/notificaciones">
                <Bell className="w-4 h-4" />
                {notificacionesNoLeidas > 0 && <Badge variant="destructive" className="ml-2">{notificacionesNoLeidas}</Badge>}
              </Link>
            </Button>
          </div>
        </header>

        {/* Contenido de la Pantalla (Outlet) */}
        <main className="flex-1 p-6 overflow-auto"> {/* Permitir scroll en el contenido */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
