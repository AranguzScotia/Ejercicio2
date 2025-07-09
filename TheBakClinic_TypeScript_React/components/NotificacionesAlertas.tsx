import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Bell, AlertTriangle, Info, CheckCircle, Clock, Send, Search, Filter } from 'lucide-react';

interface NotificacionesAlertasProps {
  onNavigate: (screen: string) => void;
}

export function NotificacionesAlertas({ onNavigate }: NotificacionesAlertasProps) {
  const [filtroTipo, setFiltroTipo] = useState('todas');
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [busqueda, setBusqueda] = useState('');

  const alertas = [
    {
      id: 1,
      tipo: 'critica',
      titulo: 'Retraso en Pabellón 2',
      descripcion: 'La cirugía de Juan Pérez presenta un retraso de 45 minutos',
      fecha: '2025-06-25',
      hora: '14:30',
      leida: false,
      pabellon: 'Pabellón 2',
      prioridad: 'alta'
    },
    {
      id: 2,
      tipo: 'informacion',
      titulo: 'Limpieza Completada',
      descripcion: 'Pabellón 5 disponible para siguiente procedimiento',
      fecha: '2025-06-25',
      hora: '13:45',
      leida: true,
      pabellon: 'Pabellón 5',
      prioridad: 'baja'
    },
    {
      id: 3,
      tipo: 'advertencia',
      titulo: 'Personal Faltante',
      descripcion: 'Enfermera circulante no se ha registrado para turno de 15:00',
      fecha: '2025-06-25',
      hora: '12:20',
      leida: false,
      pabellon: 'Pabellón 1',
      prioridad: 'media'
    },
    {
      id: 4,
      tipo: 'critica',
      titulo: 'Equipo Fuera de Servicio',
      descripcion: 'Monitor cardíaco principal presenta falla técnica',
      fecha: '2025-06-25',
      hora: '11:15',
      leida: false,
      pabellon: 'Pabellón 3',
      prioridad: 'alta'
    },
    {
      id: 5,
      tipo: 'exito',
      titulo: 'Cirugía Finalizada',
      descripcion: 'Procedimiento de María González completado exitosamente',
      fecha: '2025-06-25',
      hora: '10:15',
      leida: true,
      pabellon: 'Pabellón 1',
      prioridad: 'baja'
    }
  ];

  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'critica': return AlertTriangle;
      case 'advertencia': return Clock;
      case 'informacion': return Info;
      case 'exito': return CheckCircle;
      default: return Bell;
    }
  };

  const getColorTipo = (tipo: string) => {
    switch (tipo) {
      case 'critica': return 'bg-red-100 text-red-800 border-red-300';
      case 'advertencia': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'informacion': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'exito': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const alertasFiltradas = alertas.filter(alerta => {
    const cumpleTipo = filtroTipo === 'todas' || alerta.tipo === filtroTipo;
    const cumpleEstado = filtroEstado === 'todas' || 
      (filtroEstado === 'leidas' && alerta.leida) ||
      (filtroEstado === 'no-leidas' && !alerta.leida);
    const cumpleBusqueda = !busqueda || 
      alerta.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      alerta.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    
    return cumpleTipo && cumpleEstado && cumpleBusqueda;
  });

  const marcarComoLeida = (id: number) => {
    alert(`Alerta ${id} marcada como leída`);
  };

  const reenviarAlerta = (id: number) => {
    alert(`Alerta ${id} reenviada a los responsables`);
  };

  const alertasNoLeidas = alertas.filter(a => !a.leida).length;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1>Notificaciones y Alertas</h1>
          <p className="text-muted-foreground">Centro de notificaciones del sistema</p>
        </div>
        
        <Badge variant={alertasNoLeidas > 0 ? 'destructive' : 'secondary'}>
          <Bell className="w-4 h-4 mr-1" />
          {alertasNoLeidas} sin leer
        </Badge>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Búsqueda</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar alertas..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="critica">Críticas</SelectItem>
                  <SelectItem value="advertencia">Advertencias</SelectItem>
                  <SelectItem value="informacion">Información</SelectItem>
                  <SelectItem value="exito">Éxito</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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

      {/* Lista de Alertas */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas Recientes ({alertasFiltradas.length})</CardTitle>
          <CardDescription>Eventos críticos y notificaciones del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alertasFiltradas.map((alerta) => {
              const IconoTipo = getIconoTipo(alerta.tipo);
              
              return (
                <div
                  key={alerta.id}
                  className={`border rounded-lg p-4 space-y-3 ${!alerta.leida ? 'bg-blue-50/50 border-blue-200' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${getColorTipo(alerta.tipo)}`}>
                        <IconoTipo className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{alerta.titulo}</h3>
                          {!alerta.leida && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{alerta.descripcion}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{alerta.fecha} - {alerta.hora}</span>
                          <span>{alerta.pabellon}</span>
                          <Badge variant="outline" className="text-xs">
                            {alerta.prioridad}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {!alerta.leida && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => marcarComoLeida(alerta.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Marcar Leída
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => reenviarAlerta(alerta.id)}
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Reenviar
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {alertasFiltradas.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron alertas que coincidan con los filtros aplicados.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}