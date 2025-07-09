import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ChevronLeft, ChevronRight, Clock, User, MapPin } from 'lucide-react';

interface AgendaQuirurgicaProps {
  onNavigate: (screen: string, data?: any) => void;
}

export function AgendaQuirurgica({ onNavigate }: AgendaQuirurgicaProps) {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [selectedPabellon, setSelectedPabellon] = useState('todos');
  const [selectedEspecialidad, setSelectedEspecialidad] = useState('todas');

  const pabellones = ['Pabellón 1', 'Pabellón 2', 'Pabellón 3', 'Pabellón 4', 'Pabellón 5'];
  const especialidades = ['Cardiología', 'Traumatología', 'Neurología', 'Ginecología', 'Pediatría'];

  const getWeekDays = (date: Date) => {
    const week = [];
    const startDate = new Date(date);
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // Lunes como primer día
    startDate.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + i);
      week.push(dayDate);
    }
    return week;
  };

  const weekDays = getWeekDays(selectedWeek);
  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const cirugias = [
    {
      id: 1,
      paciente: 'María González',
      medico: 'Dr. García',
      especialidad: 'Cardiología',
      pabellon: 'Pabellón 1',
      inicio: '08:00',
      duracion: '2h',
      dia: 1,
      estado: 'programada'
    },
    {
      id: 2,
      paciente: 'Juan Pérez',
      medico: 'Dra. López',
      especialidad: 'Traumatología',
      pabellon: 'Pabellón 2',
      inicio: '09:30',
      duracion: '1.5h',
      dia: 1,
      estado: 'en-curso'
    },
    {
      id: 3,
      paciente: 'Ana Morales',
      medico: 'Dr. Silva',
      especialidad: 'Neurología',
      pabellon: 'Pabellón 3',
      inicio: '14:00',
      duracion: '3h',
      dia: 2,
      estado: 'programada'
    },
    {
      id: 4,
      paciente: 'Carlos Ruiz',
      medico: 'Dra. Torres',
      especialidad: 'Ginecología',
      pabellon: 'Pabellón 1',
      inicio: '11:00',
      duracion: '1h',
      dia: 3,
      estado: 'finalizada'
    }
  ];

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'programada': return 'bg-primary/20 text-primary border-primary/30';
      case 'en-curso': return 'bg-secondary/20 text-secondary border-secondary/30';
      case 'finalizada': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(selectedWeek.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedWeek(newDate);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1>Agenda Quirúrgica</h1>
          <p className="text-muted-foreground">Gestión de cirugías programadas</p>
        </div>
        
        {/* Filtros */}
        <div className="flex flex-wrap gap-2">
          <Select value={selectedPabellon} onValueChange={setSelectedPabellon}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Pabellón" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {pabellones.map((pab) => (
                <SelectItem key={pab} value={pab.toLowerCase()}>{pab}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedEspecialidad} onValueChange={setSelectedEspecialidad}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Especialidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {especialidades.map((esp) => (
                <SelectItem key={esp} value={esp.toLowerCase()}>{esp}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Semana del {weekDays[0].getDate()} al {weekDays[6].getDate()} de {weekDays[0].toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {dayNames.map((day, index) => (
              <div key={day} className="p-3 text-center border-b">
                <div className="font-medium">{day}</div>
                <div className="text-sm text-muted-foreground">
                  {weekDays[index].getDate()}
                </div>
              </div>
            ))}
            
            {/* Calendar Cells */}
            {weekDays.map((day, dayIndex) => (
              <div key={dayIndex} className="min-h-[200px] p-2 border-r border-b space-y-2">
                {cirugias
                  .filter(cirugia => cirugia.dia === dayIndex)
                  .map((cirugia) => (
                    <div
                      key={cirugia.id}
                      className={`p-2 rounded-md border cursor-pointer hover:shadow-sm transition-shadow ${getEstadoColor(cirugia.estado)}`}
                      onClick={() => onNavigate('detalle-cirugia', cirugia)}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span className="text-xs">{cirugia.inicio} ({cirugia.duracion})</span>
                        </div>
                        <div className="font-medium text-sm">{cirugia.paciente}</div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span className="text-xs">{cirugia.medico}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="text-xs">{cirugia.pabellon}</span>
                        </div>
                        <Badge variant={cirugia.estado === 'programada' ? 'default' : cirugia.estado === 'en-curso' ? 'secondary' : 'outline'} className="text-xs">
                          {cirugia.estado.replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}