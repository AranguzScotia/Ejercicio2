import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Search, Filter, CalendarIcon, Download, Eye, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface HistorialCirugiasProps {
  onNavigate: (screen: string, data?: any) => void;
}

export function HistorialCirugias({ onNavigate }: HistorialCirugiasProps) {
  const [filtros, setFiltros] = useState({
    busqueda: '',
    medico: 'todos',
    estado: 'todos',
    fechaInicio: undefined as Date | undefined,
    fechaFin: undefined as Date | undefined
  });

  const medicos = [
    'Dr. García', 'Dra. López', 'Dr. Silva', 'Dra. Torres', 'Dr. Mendoza'
  ];

  const estados = [
    { value: 'todos', label: 'Todos los estados' },
    { value: 'programada', label: 'Programada' },
    { value: 'en-curso', label: 'En Curso' },
    { value: 'finalizada', label: 'Finalizada' },
    { value: 'cancelada', label: 'Cancelada' },
    { value: 'reprogramada', label: 'Reprogramada' }
  ];

  const cirugias = [
    {
      id: 1,
      fecha: '2025-06-25',
      hora: '08:00',
      paciente: 'María González',
      medico: 'Dr. García',
      procedimiento: 'Cateterismo Cardíaco',
      pabellon: 'Pabellón 1',
      duracion: '2h 15m',
      estado: 'finalizada',
      eventos: [
        { tipo: 'inicio', hora: '08:00', descripcion: 'Cirugía iniciada' },
        { tipo: 'fin', hora: '10:15', descripcion: 'Cirugía finalizada exitosamente' }
      ]
    },
    {
      id: 2,
      fecha: '2025-06-25',
      hora: '09:30',
      paciente: 'Juan Pérez',
      medico: 'Dra. López',
      procedimiento: 'Artroscopia de Rodilla',
      pabellon: 'Pabellón 2',
      duracion: '1h 45m',
      estado: 'en-curso',
      eventos: [
        { tipo: 'inicio', hora: '09:30', descripcion: 'Cirugía iniciada' }
      ]
    },
    {
      id: 3,
      fecha: '2025-06-24',
      hora: '14:00',
      paciente: 'Ana Morales',
      medico: 'Dr. Silva',
      procedimiento: 'Resección Cerebral',
      pabellon: 'Pabellón 3',
      duracion: '3h 30m',
      estado: 'cancelada',
      eventos: [
        { tipo: 'programada', hora: '13:45', descripcion: 'Paciente no se presentó' },
        { tipo: 'cancelacion', hora: '14:15', descripcion: 'Cirugía cancelada por ausencia del paciente' }
      ]
    },
    {
      id: 4,
      fecha: '2025-06-24',
      hora: '11:00',
      paciente: 'Carlos Ruiz',
      medico: 'Dra. Torres',
      procedimiento: 'Histerectomía',
      pabellon: 'Pabellón 1',
      duracion: '2h 00m',
      estado: 'reprogramada',
      eventos: [
        { tipo: 'programada', hora: '10:45', descripcion: 'Preparación iniciada' },
        { tipo: 'reprogramacion', hora: '10:55', descripcion: 'Reprogramada por emergencia en pabellón' }
      ]
    },
    {
      id: 5,
      fecha: '2025-06-23',
      hora: '15:30',
      paciente: 'Luis Herrera',
      medico: 'Dr. Mendoza',
      procedimiento: 'Apendicectomía',
      pabellon: 'Pabellón 4',
      duracion: '45m',
      estado: 'finalizada',
      eventos: [
        { tipo: 'inicio', hora: '15:30', descripcion: 'Cirugía de emergencia iniciada' },
        { tipo: 'fin', hora: '16:15', descripcion: 'Cirugía finalizada exitosamente' }
      ]
    }
  ];

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'programada': return Clock;
      case 'en-curso': return Clock;
      case 'finalizada': return CheckCircle;
      case 'cancelada': return XCircle;
      case 'reprogramada': return AlertTriangle;
      default: return Clock;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'programada': return 'bg-primary/20 text-primary border-primary/30';
      case 'en-curso': return 'bg-secondary/20 text-secondary border-secondary/30';
      case 'finalizada': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelada': return 'bg-red-100 text-red-800 border-red-300';
      case 'reprogramada': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getEventoColor = (tipo: string) => {
    switch (tipo) {
      case 'inicio': return 'text-blue-600';
      case 'fin': return 'text-green-600';
      case 'cancelacion': return 'text-red-600';
      case 'reprogramacion': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const cirugiasFiltradas = cirugias.filter(cirugia => {
    const cumpleBusqueda = !filtros.busqueda || 
      cirugia.paciente.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      cirugia.procedimiento.toLowerCase().includes(filtros.busqueda.toLowerCase());
    
    const cumpleMedico = filtros.medico === 'todos' || cirugia.medico === filtros.medico;
    const cumpleEstado = filtros.estado === 'todos' || cirugia.estado === filtros.estado;
    
    return cumpleBusqueda && cumpleMedico && cumpleEstado;
  });

  const exportarDatos = () => {
    alert('Exportando historial a Excel...');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1>Historial de Cirugías</h1>
          <p className="text-muted-foreground">Registro completo de procedimientos realizados</p>
        </div>
        
        <Button onClick={exportarDatos}>
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Búsqueda</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar paciente o procedimiento..."
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Médico</label>
              <Select value={filtros.medico} onValueChange={(value) => setFiltros(prev => ({ ...prev, medico: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los médicos</SelectItem>
                  {medicos.map((medico) => (
                    <SelectItem key={medico} value={medico}>{medico}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select value={filtros.estado} onValueChange={(value) => setFiltros(prev => ({ ...prev, estado: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {estados.map((estado) => (
                    <SelectItem key={estado.value} value={estado.value}>{estado.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filtros.fechaInicio ? (
                      format(filtros.fechaInicio, 'PPP', { locale: es })
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filtros.fechaInicio}
                    onSelect={(date) => setFiltros(prev => ({ ...prev, fechaInicio: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados ({cirugiasFiltradas.length})</CardTitle>
          <CardDescription>Historial de cirugías con eventos registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cirugiasFiltradas.map((cirugia) => {
              const EstadoIcon = getEstadoIcon(cirugia.estado);
              
              return (
                <div key={cirugia.id} className="border rounded-lg p-4 space-y-3">
                  {/* Header de la cirugía */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    <div className="flex items-center gap-3">
                      <div className="font-medium">#{cirugia.id}</div>
                      <div>
                        <p className="font-medium">{cirugia.paciente}</p>
                        <p className="text-sm text-muted-foreground">{cirugia.procedimiento}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={getEstadoColor(cirugia.estado)}>
                        <EstadoIcon className="w-3 h-3 mr-1" />
                        {cirugia.estado.charAt(0).toUpperCase() + cirugia.estado.slice(1)}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onNavigate('detalle-cirugia', cirugia)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver Detalle
                      </Button>
                    </div>
                  </div>
                  
                  {/* Información básica */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Fecha:</span>
                      <p>{new Date(cirugia.fecha).toLocaleDateString('es-CL')}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Hora:</span>
                      <p>{cirugia.hora}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Médico:</span>
                      <p>{cirugia.medico}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pabellón:</span>
                      <p>{cirugia.pabellon}</p>
                    </div>
                  </div>
                  
                  {/* Eventos */}
                  {cirugia.eventos.length > 0 && (
                    <div className="border-t pt-3">
                      <p className="text-sm font-medium mb-2">Eventos Registrados:</p>
                      <div className="space-y-1">
                        {cirugia.eventos.map((evento, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                            <span className={getEventoColor(evento.tipo)}>{evento.hora}</span>
                            <span>-</span>
                            <span>{evento.descripcion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {cirugiasFiltradas.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron cirugías que coincidan con los filtros aplicados.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}