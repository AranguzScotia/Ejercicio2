import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { ArrowLeft, Clock, User, MapPin, AlertCircle, CheckCircle, Play, Pause, Square } from 'lucide-react';

interface DetalleCirugiaProps {
  onNavigate: (screen: string) => void;
  data?: any;
}

export function DetalleCirugia({ onNavigate, data }: DetalleCirugiaProps) {
  const [estado, setEstado] = useState(data?.estado || 'programada');
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(45); // minutos

  // Datos de la cirugía (mockados si no se proporciona data)
  const cirugia = data || {
    id: 1,
    paciente: 'María González',
    rut: '12.345.678-9',
    medico: 'Dr. García',
    especialidad: 'Cardiología',
    procedimiento: 'Cateterismo Cardíaco',
    pabellon: 'Pabellón 1',
    fecha: '2025-06-25',
    inicio: '08:00',
    duracionEstimada: '2h',
    estado: 'en-curso'
  };

  const personal = [
    { nombre: 'Dr. García', rol: 'Cirujano Principal', presente: true },
    { nombre: 'Dra. López', rol: 'Anestesiólogo', presente: true },
    { nombre: 'Enf. Martínez', rol: 'Enfermera Instrumentista', presente: true },
    { nombre: 'Enf. Silva', rol: 'Enfermera Circulante', presente: false },
    { nombre: 'Téc. Ruiz', rol: 'Técnico Paramédico', presente: true }
  ];

  const tiemposReales = [
    { evento: 'Ingreso del paciente', hora: '07:45', completado: true },
    { evento: 'Inicio de anestesia', hora: '08:15', completado: true },
    { evento: 'Incisión quirúrgica', hora: '08:30', completado: true },
    { evento: 'Procedimiento principal', hora: '08:45', completado: false },
    { evento: 'Cierre de incisión', hora: 'Pendiente', completado: false },
    { evento: 'Recuperación', hora: 'Pendiente', completado: false }
  ];

  const getEstadoInfo = (estado: string) => {
    switch (estado) {
      case 'programada':
        return { color: 'bg-primary', text: 'Programada', icon: Clock };
      case 'en-curso':
        return { color: 'bg-secondary', text: 'En Curso', icon: Play };
      case 'finalizada':
        return { color: 'bg-green-500', text: 'Finalizada', icon: CheckCircle };
      case 'cancelada':
        return { color: 'bg-destructive', text: 'Cancelada', icon: AlertCircle };
      default:
        return { color: 'bg-gray-500', text: estado, icon: Clock };
    }
  };

  const estadoInfo = getEstadoInfo(estado);
  const progreso = estado === 'programada' ? 0 : estado === 'en-curso' ? 60 : estado === 'finalizada' ? 100 : 0;

  const cambiarEstado = (nuevoEstado: string) => {
    if (confirm(`¿Confirma cambiar el estado a "${nuevoEstado}"?`)) {
      setEstado(nuevoEstado);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => onNavigate('agenda')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Agenda
        </Button>
        <div className="flex-1">
          <h1>Detalle de Cirugía #{cirugia.id}</h1>
          <p className="text-muted-foreground">Información completa del procedimiento</p>
        </div>
        <Badge className={`${estadoInfo.color} text-white`}>
          <estadoInfo.icon className="w-4 h-4 mr-1" />
          {estadoInfo.text}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos del Procedimiento */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Procedimiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Paciente</p>
                  <p className="font-medium">{cirugia.paciente}</p>
                  <p className="text-sm text-muted-foreground">{cirugia.rut}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Médico Principal</p>
                  <p className="font-medium">{cirugia.medico}</p>
                  <p className="text-sm text-muted-foreground">{cirugia.especialidad}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Procedimiento</p>
                  <p className="font-medium">{cirugia.procedimiento}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ubicación</p>
                  <p className="font-medium">{cirugia.pabellon}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-medium">{new Date(cirugia.fecha).toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Horario</p>
                  <p className="font-medium">{cirugia.inicio} - Duración estimada: {cirugia.duracionEstimada}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progreso y Tiempos */}
          <Card>
            <CardHeader>
              <CardTitle>Progreso del Procedimiento</CardTitle>
              <CardDescription>Estado actual y tiempos registrados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progreso General</span>
                  <span>{progreso}%</span>
                </div>
                <Progress value={progreso} className="w-full" />
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <h4>Registro de Tiempos</h4>
                {tiemposReales.map((tiempo, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${tiempo.completado ? 'bg-green-500' : 'bg-gray-300'}`}>
                      {tiempo.completado && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{tiempo.evento}</p>
                    </div>
                    <div className={`text-sm ${tiempo.completado ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {tiempo.hora}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Personal Asignado */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Asignado</CardTitle>
              <CardDescription>Equipo médico participante en el procedimiento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {personal.map((persona, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${persona.presente ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <p className="font-medium">{persona.nombre}</p>
                        <p className="text-sm text-muted-foreground">{persona.rol}</p>
                      </div>
                    </div>
                    <Badge variant={persona.presente ? 'secondary' : 'destructive'}>
                      {persona.presente ? 'Presente' : 'Ausente'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel de Control */}
        <div className="space-y-6">
          {/* Controles de Estado */}
          <Card>
            <CardHeader>
              <CardTitle>Control de Estado</CardTitle>
              <CardDescription>Gestionar el estado del procedimiento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {estado === 'programada' && (
                <Button 
                  className="w-full" 
                  onClick={() => cambiarEstado('en-curso')}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Iniciar Cirugía
                </Button>
              )}
              
              {estado === 'en-curso' && (
                <>
                  <Button 
                    className="w-full" 
                    onClick={() => cambiarEstado('finalizada')}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Finalizar Cirugía
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => cambiarEstado('pausada')}
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pausar
                  </Button>
                </>
              )}
              
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => cambiarEstado('cancelada')}
              >
                <Square className="w-4 h-4 mr-2" />
                Cancelar Cirugía
              </Button>
            </CardContent>
          </Card>

          {/* Información de Tiempo */}
          <Card>
            <CardHeader>
              <CardTitle>Tiempo Transcurrido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {Math.floor(tiempoTranscurrido / 60)}h {tiempoTranscurrido % 60}m
                </div>
                <p className="text-sm text-muted-foreground">Desde el inicio</p>
              </div>
            </CardContent>
          </Card>

          {/* Acciones Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" onClick={() => onNavigate('historial')}>
                Ver Historial
              </Button>
              <Button variant="outline" className="w-full" onClick={() => alert('Generando reporte...')}>
                Generar Reporte
              </Button>
              <Button variant="outline" className="w-full" onClick={() => alert('Enviando notificación...')}>
                Notificar Familia
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}