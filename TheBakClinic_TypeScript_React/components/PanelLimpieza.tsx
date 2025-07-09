import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Separator } from './ui/separator';
import { Play, CheckCircle, Clock, AlertTriangle, User, MapPin, ClipboardList } from 'lucide-react';

interface PanelLimpiezaProps {
  onNavigate: (screen: string) => void;
}

export function PanelLimpieza({ onNavigate }: PanelLimpiezaProps) {
  const [selectedPabellon, setSelectedPabellon] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [registroForm, setRegistroForm] = useState({
    tipoLimpieza: '',
    horaInicio: '',
    horaFin: '',
    responsable: '',
    observaciones: ''
  });

  const pabellones = [
    {
      id: 1,
      nombre: 'Pabellón 1',
      estado: 'pendiente',
      ultimaCirugia: '10:15',
      tipoLimpiezaRequerida: 'Desinfección Completa',
      prioridad: 'alta',
      tiempoEstimado: '45 min',
      responsableAsignado: 'Equipo A'
    },
    {
      id: 2,
      nombre: 'Pabellón 2',
      estado: 'en-proceso',
      ultimaCirugia: '14:30',
      tipoLimpiezaRequerida: 'Limpieza Estándar',
      prioridad: 'media',
      tiempoEstimado: '30 min',
      responsableAsignado: 'María Silva',
      horaInicio: '15:00'
    },
    {
      id: 3,
      nombre: 'Pabellón 3',
      estado: 'completado',
      ultimaCirugia: '08:45',
      tipoLimpiezaRequerida: 'Limpieza Estándar',
      prioridad: 'baja',
      tiempoEstimado: '30 min',
      responsableAsignado: 'Juan Pérez',
      horaInicio: '09:30',
      horaFin: '10:00'
    },
    {
      id: 4,
      nombre: 'Pabellón 4',
      estado: 'disponible',
      ultimaCirugia: '16:00',
      tipoLimpiezaRequerida: 'Mantenimiento',
      prioridad: 'baja',
      tiempoEstimado: '60 min',
      responsableAsignado: 'Equipo B',
      horaInicio: '17:00',
      horaFin: '18:00'
    },
    {
      id: 5,
      nombre: 'Pabellón 5',
      estado: 'pendiente',
      ultimaCirugia: '12:20',
      tipoLimpiezaRequerida: 'Desinfección Completa',
      prioridad: 'alta',
      tiempoEstimado: '45 min',
      responsableAsignado: 'Ana Martínez'
    }
  ];

  const historialLimpieza = [
    {
      id: 1,
      pabellon: 'Pabellón 3',
      fecha: '2025-06-25',
      tipo: 'Limpieza Estándar',
      responsable: 'Juan Pérez',
      inicio: '09:30',
      fin: '10:00',
      observaciones: 'Limpieza completada sin novedad'
    },
    {
      id: 2,
      pabellon: 'Pabellón 4',
      fecha: '2025-06-25',
      tipo: 'Mantenimiento',
      responsable: 'Equipo B',
      inicio: '17:00',
      fin: '18:00',
      observaciones: 'Revisión y mantenimiento de equipos'
    }
  ];

  const getEstadoInfo = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return { color: 'bg-red-100 text-red-800 border-red-300', text: 'Pendiente', icon: AlertTriangle };
      case 'en-proceso':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', text: 'En Proceso', icon: Clock };
      case 'completado':
        return { color: 'bg-green-100 text-green-800 border-green-300', text: 'Completado', icon: CheckCircle };
      case 'disponible':
        return { color: 'bg-blue-100 text-blue-800 border-blue-300', text: 'Disponible', icon: CheckCircle };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-300', text: estado, icon: Clock };
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'bg-red-500';
      case 'media': return 'bg-yellow-500';
      case 'baja': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const iniciarLimpieza = (pabellon: any) => {
    setSelectedPabellon(pabellon);
    setRegistroForm({
      tipoLimpieza: pabellon.tipoLimpiezaRequerida,
      horaInicio: new Date().toTimeString().slice(0, 5),
      horaFin: '',
      responsable: pabellon.responsableAsignado,
      observaciones: ''
    });
    setIsDialogOpen(true);
  };

  const completarLimpieza = () => {
    alert(`Limpieza de ${selectedPabellon?.nombre} registrada exitosamente`);
    setIsDialogOpen(false);
    setSelectedPabellon(null);
  };

  const tiposLimpieza = [
    'Limpieza Estándar',
    'Desinfección Completa',
    'Limpieza Terminal',
    'Mantenimiento',
    'Limpieza de Emergencia'
  ];

  const personal = [
    'María Silva',
    'Juan Pérez',
    'Ana Martínez',
    'Carlos López',
    'Equipo A',
    'Equipo B'
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1>Panel de Limpieza</h1>
          <p className="text-muted-foreground">Gestión y control de aseo de pabellones</p>
        </div>
        
        <div className="flex gap-2">
          <Badge variant="outline" className="text-red-600 border-red-300">
            Pendiente: {pabellones.filter(p => p.estado === 'pendiente').length}
          </Badge>
          <Badge variant="outline" className="text-yellow-600 border-yellow-300">
            En Proceso: {pabellones.filter(p => p.estado === 'en-proceso').length}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Pabellones */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Estado de Pabellones</CardTitle>
              <CardDescription>Pabellones pendientes y en proceso de limpieza</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pabellones.map((pabellon) => {
                  const estadoInfo = getEstadoInfo(pabellon.estado);
                  const EstadoIcon = estadoInfo.icon;
                  
                  return (
                    <div key={pabellon.id} className="border rounded-lg p-4 space-y-3">
                      {/* Header del pabellón */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getPrioridadColor(pabellon.prioridad)}`}></div>
                          <div>
                            <h3 className="font-medium">{pabellon.nombre}</h3>
                            <p className="text-sm text-muted-foreground">
                              Última cirugía: {pabellon.ultimaCirugia}
                            </p>
                          </div>
                        </div>
                        
                        <Badge className={estadoInfo.color}>
                          <EstadoIcon className="w-3 h-3 mr-1" />
                          {estadoInfo.text}
                        </Badge>
                      </div>
                      
                      {/* Información del pabellón */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Tipo de limpieza:</span>
                          <p className="font-medium">{pabellon.tipoLimpiezaRequerida}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tiempo estimado:</span>
                          <p className="font-medium">{pabellon.tiempoEstimado}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Responsable:</span>
                          <p className="font-medium">{pabellon.responsableAsignado}</p>
                        </div>
                      </div>
                      
                      {/* Tiempos si está en proceso */}
                      {pabellon.estado === 'en-proceso' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                          <div className="flex items-center gap-2 text-yellow-800">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">En proceso desde las {pabellon.horaInicio}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Tiempos si está completado */}
                      {pabellon.estado === 'completado' && pabellon.horaInicio && pabellon.horaFin && (
                        <div className="bg-green-50 border border-green-200 rounded p-3">
                          <div className="flex items-center gap-2 text-green-800">
                            <CheckCircle className="w-4 h-4" />
                            <span className="font-medium">
                              Completado: {pabellon.horaInicio} - {pabellon.horaFin}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Botones de acción */}
                      <div className="flex gap-2">
                        {pabellon.estado === 'pendiente' && (
                          <Button size="sm" onClick={() => iniciarLimpieza(pabellon)}>
                            <Play className="w-4 h-4 mr-1" />
                            Iniciar Limpieza
                          </Button>
                        )}
                        
                        {pabellon.estado === 'en-proceso' && (
                          <Button size="sm" onClick={() => iniciarLimpieza(pabellon)}>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Completar Limpieza
                          </Button>
                        )}
                        
                        <Button variant="outline" size="sm">
                          <ClipboardList className="w-4 h-4 mr-1" />
                          Ver Checklist
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          {/* Resumen */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Día</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Pabellones pendientes</span>
                <Badge variant="destructive">
                  {pabellones.filter(p => p.estado === 'pendiente').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>En proceso</span>
                <Badge variant="secondary">
                  {pabellones.filter(p => p.estado === 'en-proceso').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Completados</span>
                <Badge className="bg-green-100 text-green-800">
                  {pabellones.filter(p => p.estado === 'completado').length}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span>Disponibles</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {pabellones.filter(p => p.estado === 'disponible').length}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Historial Reciente */}
          <Card>
            <CardHeader>
              <CardTitle>Historial Reciente</CardTitle>
              <CardDescription>Últimas limpiezas completadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {historialLimpieza.slice(0, 3).map((registro) => (
                  <div key={registro.id} className="border-l-2 border-green-500 pl-3 space-y-1">
                    <p className="font-medium text-sm">{registro.pabellon}</p>
                    <p className="text-xs text-muted-foreground">
                      {registro.tipo} - {registro.responsable}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {registro.inicio} - {registro.fin}
                    </p>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" size="sm">
                Ver Historial Completo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog para registrar limpieza */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedPabellon?.estado === 'pendiente' ? 'Iniciar' : 'Completar'} Limpieza
            </DialogTitle>
            <DialogDescription>
              Registrar {selectedPabellon?.estado === 'pendiente' ? 'inicio' : 'finalización'} de limpieza para {selectedPabellon?.nombre}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Limpieza</Label>
              <Select value={registroForm.tipoLimpieza} onValueChange={(value) => setRegistroForm(prev => ({ ...prev, tipoLimpieza: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tiposLimpieza.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hora Inicio</Label>
                <Input
                  type="time"
                  value={registroForm.horaInicio}
                  onChange={(e) => setRegistroForm(prev => ({ ...prev, horaInicio: e.target.value }))}
                />
              </div>
              
              {selectedPabellon?.estado === 'en-proceso' && (
                <div className="space-y-2">
                  <Label>Hora Fin</Label>
                  <Input
                    type="time"
                    value={registroForm.horaFin}
                    onChange={(e) => setRegistroForm(prev => ({ ...prev, horaFin: e.target.value }))}
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Responsable</Label>
              <Select value={registroForm.responsable} onValueChange={(value) => setRegistroForm(prev => ({ ...prev, responsable: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {personal.map((persona) => (
                    <SelectItem key={persona} value={persona}>{persona}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Observaciones</Label>
              <Textarea
                value={registroForm.observaciones}
                onChange={(e) => setRegistroForm(prev => ({ ...prev, observaciones: e.target.value }))}
                placeholder="Observaciones o novedades durante la limpieza..."
                rows={3}
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={completarLimpieza}>
                {selectedPabellon?.estado === 'pendiente' ? 'Iniciar' : 'Completar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}