import { useState } from "react";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { AgendaQuirurgica } from "./components/AgendaQuirurgica";
import { IngresoPaciente } from "./components/IngresoPaciente";
import { DetalleCirugia } from "./components/DetalleCirugia";
import { HistorialCirugias } from "./components/HistorialCirugias";
import { PanelLimpieza } from "./components/PanelLimpieza";
import { GestionUsuarios } from "./components/GestionUsuarios";
import { ReportesKPIs } from "./components/ReportesKPIs";
import { NotificacionesAlertas } from "./components/NotificacionesAlertas";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Separator } from "./components/ui/separator";
import clinicLogo from "figma:asset/edbed43c3db39494f85e7ae6f92ba61a21ce649c.png";
import {
  Home,
  Calendar,
  UserPlus,
  History,
  Sparkles,
  Users,
  BarChart3,
  Bell,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [screenData, setScreenData] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // const [usuario, setUsuario] = useState<any>(null); // Opcional: para guardar datos del usuario

  const handleLoginSuccess = (/*data?: any*/) => { // data podría venir de la API con info del usuario
    setIsLoggedIn(true);
    // if (data && data.usuario) setUsuario(data.usuario); // Opcional
    setCurrentScreen("dashboard");
  };

  const handleLogout = () => {
    // setUsuario(null); // Opcional
    setIsLoggedIn(false);
    setCurrentScreen("login");
    setSidebarOpen(false);
  };

  const handleNavigate = (screen: string, data?: any) => {
    setCurrentScreen(screen);
    setScreenData(data);
    setSidebarOpen(false);
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    {
      id: "agenda",
      label: "Agenda Quirúrgica",
      icon: Calendar,
    },
    {
      id: "paciente",
      label: "Ingreso Paciente",
      icon: UserPlus,
    },
    {
      id: "historial",
      label: "Historial Cirugías",
      icon: History,
    },
    { id: "limpieza", label: "Panel Limpieza", icon: Sparkles },
    { id: "usuarios", label: "Gestión Usuarios", icon: Users },
    {
      id: "reportes",
      label: "Reportes y KPIs",
      icon: BarChart3,
    },
    {
      id: "notificaciones",
      label: "Notificaciones",
      icon: Bell,
    },
  ];

  const getCurrentTitle = () => {
    const item = menuItems.find(
      (item) => item.id === currentScreen,
    );
    return item?.label || "Sistema Clínico";
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case "dashboard":
        return <Dashboard onNavigate={handleNavigate} />;
      case "agenda":
        return <AgendaQuirurgica onNavigate={handleNavigate} />;
      case "paciente":
        return <IngresoPaciente onNavigate={handleNavigate} />;
      case "detalle-cirugia":
        return (
          <DetalleCirugia
            onNavigate={handleNavigate}
            data={screenData}
          />
        );
      case "historial":
        return (
          <HistorialCirugias onNavigate={handleNavigate} />
        );
      case "limpieza":
        return <PanelLimpieza onNavigate={handleNavigate} />;
      case "usuarios":
        return <GestionUsuarios onNavigate={handleNavigate} />;
      case "reportes":
        return <ReportesKPIs onNavigate={handleNavigate} />;
      case "notificaciones":
        return (
          <NotificacionesAlertas onNavigate={handleNavigate} />
        );
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          {/* Header del Sidebar */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center w-full">
                <img
                  src={clinicLogo}
                  alt="The BAK Clinic"
                  className="h-12 w-auto object-contain mb-2"
                />
                <div className="text-center">
                  <h2 className="font-bold text-primary text-sm">
                    Gestión de Pabellones
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Sistema Clínico
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden absolute top-4 right-4"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Navegación */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;

              return (
                <Button
                  key={item.id}
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3"
                  onClick={() => handleNavigate(item.id)}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                  {item.id === "notificaciones" && (
                    <Badge
                      variant="destructive"
                      className="ml-auto"
                    >
                      2
                    </Badge>
                  )}
                </Button>
              );
            })}
          </nav>

          {/* Footer del Sidebar */}
          <div className="p-4 border-t">
            <div className="space-y-2">
              <div className="text-sm">
                <p className="font-medium">Dr. Admin</p>
                <p className="text-muted-foreground">
                  admin@clinicabak.cl
                </p>
              </div>
              <Separator />
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Contenido Principal */}
      <div className="flex-1 lg:ml-0">
        {/* Header Principal */}
        <header className="bg-card border-b px-6 py-4 flex items-center justify-between lg:justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-4">
            {/* Logo en header móvil */}
            <div className="lg:hidden">
              <img
                src={clinicLogo}
                alt="The BAK Clinic"
                className="h-8 w-auto object-contain"
              />
            </div>

            <div className="hidden md:block text-right">
              <p className="font-medium">{getCurrentTitle()}</p>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString("es-CL", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigate("notificaciones")}
            >
              <Bell className="w-4 h-4" />
              <Badge variant="destructive" className="ml-2">
                2
              </Badge>
            </Button>
          </div>
        </header>

        {/* Contenido de la Pantalla */}
        <main className="flex-1">{renderCurrentScreen()}</main>
      </div>
    </div>
  );
}