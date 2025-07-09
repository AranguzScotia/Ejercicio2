import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Bell, AlertTriangle, Info, CheckCircle, Clock, Send, Search, Filter, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  obtenerNotificaciones,
  marcarNotificacionComoLeida,
  NotificacionAlerta as NotificacionApi,
  NotificacionesListResponse
} from '../services/api';

// interface NotificacionesAlertasProps {
//   onNavigate: (screen: string, data?: any) => void; // Si se necesita para navegar a entidad_relacionada
// }

export function NotificacionesAlertas(/*{ onNavigate }: NotificacionesAlertasProps*/) {
  const [notificaciones, setNotificaciones] = useState<NotificacionApi[]>([]);
  const [totalNoLeidas, setTotalNoLeidas] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorApi, setErrorApi] = useState<string | null>(null);

  const [filtroTipo, setFiltroTipo] = useState('todas'); // tipos: info, alerta, error (del backend)
  const [filtroEstado, setFiltroEstado] = useState('todas'); // leidas, no-leidas
  const [busqueda, setBusqueda] = useState('');

  const fetchNotificaciones = useCallback(async () => {
    setIsLoading(true);
    setErrorApi(null);
    try {
      const response: NotificacionesListResponse = await obtenerNotificaciones(50); // Cargar hasta 50
      setNotificaciones(response.notificaciones || []);
      setTotalNoLeidas(response.total_no_leidas || 0);
    } catch (error: any) {
      setErrorApi(error.response?.data?.detail || error.message || 'Error al cargar notificaciones.');
      setNotificaciones([]);
      setTotalNoLeidas(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotificaciones();
  }, [fetchNotificaciones]);

  const getIconoTipo = (tipo: string) => {
    switch (tipo?.toLowerCase()) {
      case 'alerta': return AlertTriangle;
      case 'error': return AlertTriangle; // Podría ser XCircle
      case 'info': return Info;
      case 'exito': return CheckCircle; // Si tuviéramos este tipo
      default: return Bell;
    }
  };

  const getColorTipo = (tipo: string) => {
    switch (tipo?.toLowerCase()) {
      case 'alerta': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'error': return 'bg-red-100 text-red-800 border-red-300';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'exito': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const notificacionesFiltradas = notificaciones.filter(notif => {
    const cumpleTipo = filtroTipo === 'todas' || notif.tipo.toLowerCase() === filtroTipo;
    const cumpleEstado = filtroEstado === 'todas' || 
      (filtroEstado === 'leidas' && notif.leida) ||
      (filtroEstado === 'no-leidas' && !notif.leida);
    const cumpleBusqueda = !busqueda || 
      notif.mensaje.toLowerCase().includes(busqueda.toLowerCase()) ||
      (notif.entidad_relacionada && notif.entidad_relacionada.toLowerCase().includes(busqueda.toLowerCase()));
    
    return cumpleTipo && cumpleEstado && cumpleBusqueda;
  });

  const handleMarcarComoLeida = async (idNotificacion: string | number) => {
    // Optimistic update (opcional)
    // setNotificaciones(prev => prev.map(n => n.id_notificacion === idNotificacion ? {...n, leida: true} : n));
    try {
      await marcarNotificacionComoLeida(idNotificacion);
      // Refrescar para obtener el conteo de no leídas actualizado y el estado real
      fetchNotificaciones();
    } catch (error: any) {
      setErrorApi(error.response?.data?.detail || error.message || 'Error al marcar como leída.');
      // Revertir optimistic update si falló
      // fetchNotificaciones(); // O revertir manualmente el cambio local
    }
  };

  // const handleReenviarAlerta = (id: string | number) => {
  //   alert(`Funcionalidad de reenviar alerta ${id} no implementada.`);
  // };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div> <h1>Notificaciones y Alertas</h1> <p className="text-muted-foreground">Centro de notificaciones del sistema</p> </div>
        <Badge variant={totalNoLeidas > 0 ? 'destructive' : 'secondary'}>
          <Bell className="w-4 h-4 mr-1" /> {totalNoLeidas} sin leer
        </Badge>
      </div>

      {errorApi && <Alert variant="destructive" className="my-2"><AlertTitle>Error</AlertTitle><AlertDescription>{errorApi}</AlertDescription></Alert>}

      <Card>
        <CardHeader> <CardTitle className="flex items-center gap-2"><Filter className="w-5 h-5" /> Filtros</CardTitle> </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2"> <label className="text-sm font-medium">Búsqueda</label>
              <div className="relative"> <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar notificaciones..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div className="space-y-2"> <label className="text-sm font-medium">Tipo</label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}> <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="alerta">Alertas</SelectItem>
                  <SelectItem value="error">Errores</SelectItem>
                  <SelectItem value="info">Información</SelectItem>
                  {/* <SelectItem value="exito">Éxito</SelectItem> */}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"> <label className="text-sm font-medium">Estado</label>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}> <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="no-leidas">No leídas</SelectItem>
                  <SelectItem value="leidas">Leídas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notificaciones Recientes ({isLoading ? <Loader2 className="inline w-4 h-4 animate-spin"/> : notificacionesFiltradas.length})</CardTitle>
          <CardDescription>Eventos y alertas importantes del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && notificaciones.length === 0 && (
             <div className="text-center py-10"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /><p>Cargando notificaciones...</p></div>
          )}
          <div className="space-y-4">
            {notificacionesFiltradas.map((notif) => {
              const IconoTipo = getIconoTipo(notif.tipo);
              return (
                <div key={notif.id_notificacion} className={`border rounded-lg p-4 space-y-2 ${!notif.leida ? 'bg-blue-50/50 border-blue-200 shadow-sm' : 'opacity-70'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-1.5 rounded-md ${getColorTipo(notif.tipo)}`}> <IconoTipo className="w-4 h-4" /> </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-medium text-sm ${!notif.leida ? 'text-gray-800' : 'text-gray-600'}`}>{notif.entidad_relacionada || notif.tipo.toUpperCase()}</h3>
                          {!notif.leida && (<div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>)}
                        </div>
                        <p className={`text-sm ${!notif.leida ? 'text-gray-700' : 'text-gray-500'}`}>{notif.mensaje}</p>
                        <div className="text-xs text-muted-foreground">
                          {format(parseISO(notif.fecha_creacion), 'Pp', { locale: es })}
                          {notif.entidad_tipo && notif.entidad_id && (
                            <span className="ml-2">({notif.entidad_tipo} ID: {notif.entidad_id})</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center">
                      {!notif.leida && (
                        <Button variant="outline" size="sm" onClick={() => handleMarcarComoLeida(notif.id_notificacion)} disabled={isLoading}>
                          <CheckCircle className="w-3 h-3 mr-1" /> Marcar Leída
                        </Button>
                      )}
                      {/* <Button variant="ghost" size="sm" onClick={() => handleReenviarAlerta(notif.id_notificacion)} className="text-muted-foreground hover:text-primary">
                        <Send className="w-3 h-3 mr-1" /> Reenviar
                      </Button> */}
                    </div>
                  </div>
                </div>
              );
            })}
            {!isLoading && notificacionesFiltradas.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No hay notificaciones que coincidan con los filtros.</div>
            )}
             {!isLoading && notificaciones.length === 0 && !errorApi && (
              <div className="text-center py-8 text-muted-foreground">No hay notificaciones.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}