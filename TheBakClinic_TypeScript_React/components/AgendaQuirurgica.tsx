import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { ChevronLeft, ChevronRight, Clock, User, MapPin, Plus, CalendarIcon, Loader2 } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, parseISO, setHours, setMinutes, setSeconds } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  obtenerCirugias,
  crearCirugia,
  Cirugia as CirugiaApi,
  CirugiaCreatePayload,
  CirugiaListParams,
} from '../services/cirugiaService';
import { useNavigate } from 'react-router-dom';

// interface AgendaQuirurgicaProps {
//   onNavigate: (screen: string, data?: any) => void; // Ya no se usa
// }

// Estado para el formulario de nueva cirugía
const initialCirugiaFormState: Partial<CirugiaCreatePayload> = {
  id_paciente: undefined,
  id_medico_principal: undefined,
  nombre_quirofano: '',
  fecha_hora_inicio_programada: new Date(),
  duracion_estimada_minutos: 60,
  tipo_cirugia: '',
  estado_cirugia: 'Programada',
  notas_preoperatorias: '',
};

export function AgendaQuirurgica(/*{ onNavigate }: AgendaQuirurgicaProps*/) {
  const navigate = useNavigate(); // Hook para navegación
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'semana' | 'mes'>('semana');

  const [cirugiasReales, setCirugiasReales] = useState<CirugiaApi[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const [filtroPabellon, setFiltroPabellon] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCirugiaForm, setNewCirugiaForm] = useState<Partial<CirugiaCreatePayload>>(initialCirugiaFormState);
  const [formSelectedDate, setFormSelectedDate] = useState<Date>(new Date());
  const [formSelectedHour, setFormSelectedHour] = useState<string>("08");
  const [formSelectedMinute, setFormSelectedMinute] = useState<string>("00");

  const pabellonesHardcoded = ['Pabellón 1', 'Pabellón 2', 'Pabellón 3', 'Pabellón Central', 'Pabellón Urgencias'];
  const estadosCirugiaHardcoded = ['Programada', 'Confirmada', 'En Quirofano', 'Realizada', 'Cancelada', 'Postpuesta'];

  const getWeekDays = (date: Date) => { // Esta función se reemplazará por eachDayOfInterval
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
    startDate.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + i);
      week.push(dayDate);
    }
    return week;
  }; // Esta función se reemplazará o no se usará.

  const fetchCirugias = useCallback(async () => {
    setIsLoading(true);
    setErrorApi(null);
    const inicioSemana = startOfWeek(currentDate, { weekStartsOn: 1 });
    const finSemana = endOfWeek(currentDate, { weekStartsOn: 1 });

    const params: CirugiaListParams = {
      fecha_desde: format(inicioSemana, 'yyyy-MM-dd'),
      fecha_hasta: format(finSemana, 'yyyy-MM-dd'),
      skip: 0,
      limit: 1000,
    };
    if (filtroEstado !== 'todos') params.estado = filtroEstado;
    // if (filtroPabellon !== 'todos') params.nombre_quirofano = filtroPabellon; // Backend no soporta este filtro aún

    try {
      const data = await obtenerCirugias(params);
      setCirugiasReales(data.cirugias || []);
    } catch (error: any) {
      setErrorApi(error.response?.data?.detail || error.message || 'Error al cargar cirugías.');
      setCirugiasReales([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentDate, filtroEstado /*, filtroPabellon */]);

  useEffect(() => {
    fetchCirugias();
  }, [fetchCirugias]);

  const weekDays = eachDayOfInterval({ start: startOfWeek(currentDate, { weekStartsOn: 1 }), end: endOfWeek(currentDate, { weekStartsOn: 1 }) });
  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const getEstadoBadgeStyle = (estado: string): string => {
    switch (estado?.toLowerCase()) {
      case 'programada': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'confirmada': return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'en quirofano': return 'bg-yellow-100 text-yellow-800 border-yellow-300'; // Asumiendo que 'En Quirofano' es un estado
      case 'realizada': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelada': return 'bg-red-100 text-red-800 border-red-300';
      case 'postpuesta': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const mostrarMensajeTemporal = (setter: React.Dispatch<React.SetStateAction<string | null>>, mensaje: string) => {
    setter(mensaje);
    setTimeout(() => setter(null), 4000);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCirugiaForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSelectChange = (name: string, value: string | number ) => {
     setNewCirugiaForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFormDateTimeChange = () => {
    if (formSelectedDate) {
      const newDateTime = setSeconds(setMinutes(setHours(formSelectedDate, parseInt(formSelectedHour)), parseInt(formSelectedMinute)),0);
      setNewCirugiaForm(prev => ({ ...prev, fecha_hora_inicio_programada: newDateTime }));
    }
  };
  useEffect(handleFormDateTimeChange, [formSelectedDate, formSelectedHour, formSelectedMinute]);


  const handleAgendarNuevaCirugia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCirugiaForm.id_paciente || !newCirugiaForm.id_medico_principal || !newCirugiaForm.tipo_cirugia || !newCirugiaForm.fecha_hora_inicio_programada) {
      mostrarMensajeTemporal(setErrorApi, "Paciente, Médico, Tipo de cirugía y Fecha/Hora de inicio son obligatorios.");
      return;
    }

    setIsLoading(true);
    setErrorApi(null);
    setMensajeExito(null);

    // Asegurar que fecha_hora_inicio_programada es un objeto Date antes de convertir a ISO string
    let fechaHoraInicioISO: string;
    if (newCirugiaForm.fecha_hora_inicio_programada instanceof Date) {
        fechaHoraInicioISO = newCirugiaForm.fecha_hora_inicio_programada.toISOString();
    } else if (typeof newCirugiaForm.fecha_hora_inicio_programada === 'string') {
        fechaHoraInicioISO = new Date(newCirugiaForm.fecha_hora_inicio_programada).toISOString();
    } else {
        mostrarMensajeTemporal(setErrorApi, "Fecha y hora de inicio no es válida.");
        setIsLoading(false);
        return;
    }

    const payload: CirugiaCreatePayload = {
      id_paciente: Number(newCirugiaForm.id_paciente),
      id_medico_principal: Number(newCirugiaForm.id_medico_principal),
      nombre_quirofano: newCirugiaForm.nombre_quirofano,
      fecha_hora_inicio_programada: fechaHoraInicioISO,
      duracion_estimada_minutos: newCirugiaForm.duracion_estimada_minutos ? Number(newCirugiaForm.duracion_estimada_minutos) : undefined,
      tipo_cirugia: newCirugiaForm.tipo_cirugia,
      estado_cirugia: newCirugiaForm.estado_cirugia || 'Programada',
      notas_preoperatorias: newCirugiaForm.notas_preoperatorias,
    };

    try {
      await crearCirugia(payload);
      mostrarMensajeTemporal(setMensajeExito, 'Cirugía agendada exitosamente.');
      setIsModalOpen(false);
      setNewCirugiaForm(initialCirugiaFormState); // Reset form
      fetchCirugias(); // Recargar
    } catch (error: any) {
      mostrarMensajeTemporal(setErrorApi, error.response?.data?.detail || error.message || 'Error al agendar cirugía.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="p-6 space-y-6 max-w-full mx-auto"> {/* max-w-7xl cambiado a full */}
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1>Agenda Quirúrgica</h1>
          <p className="text-muted-foreground">Gestión de cirugías programadas</p>
        </div>
        
        {/* Filtros y Botón Agendar */}
        <div className="flex flex-wrap items-center gap-2">
          <Select value={filtroPabellon} onValueChange={setFiltroPabellon}>
            <SelectTrigger className="w-auto md:w-[150px]">
              <SelectValue placeholder="Pabellón" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos Pabellones</SelectItem>
              {pabellonesHardcoded.map((pab) => (
                <SelectItem key={pab} value={pab}>{pab}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="w-auto md:w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos Estados</SelectItem>
              {estadosCirugiaHardcoded.map((est) => (
                <SelectItem key={est} value={est}>{est}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setIsModalOpen(true)}> <Plus className="w-4 h-4 mr-2" /> Agendar Cirugía </Button>
        </div>
      </div>

      {errorApi && <Alert variant="destructive" className="my-2"><AlertTitle>Error</AlertTitle><AlertDescription>{errorApi}</AlertDescription></Alert>}
      {mensajeExito && <Alert variant="default" className="my-2 bg-green-100 border-green-300 text-green-700"><AlertTitle>Éxito</AlertTitle><AlertDescription>{mensajeExito}</AlertDescription></Alert>}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Semana del {format(weekDays[0], 'd')} al {format(weekDays[6], 'd MMM yyyy', { locale: es })}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')} disabled={isLoading}> <ChevronLeft className="h-4 w-4" /> </Button>
              <Button variant="outline" size="sm" onClick={() => navigateWeek('next')} disabled={isLoading}> <ChevronRight className="h-4 w-4" /> </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && cirugiasReales.length === 0 && (
            <div className="text-center py-10"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /><p>Cargando agenda...</p></div>
          )}
          <div className="grid grid-cols-7 gap-px border bg-muted/40"> {/* Estilo de calendario tipo Google */}
            {dayNames.map((dayName, index) => (
              <div key={dayName} className="p-2 text-center font-medium text-sm bg-muted">
                <div>{dayName}</div> <div className="text-xs text-muted-foreground">{format(weekDays[index], 'd')}</div>
              </div>
            ))}
            {weekDays.map((day, dayIndex) => (
              <div key={dayIndex} className="min-h-[150px] p-1.5 border-t bg-background space-y-1.5">
                {cirugiasReales
                  .filter(cirugia => format(parseISO(cirugia.fecha_hora_inicio_programada), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
                  .filter(cirugia => filtroPabellon === 'todos' || cirugia.nombre_quirofano === filtroPabellon) // Filtro cliente (idealmente backend)
                  .sort((a,b) => parseISO(a.fecha_hora_inicio_programada).getTime() - parseISO(b.fecha_hora_inicio_programada).getTime() )
                  .map((cirugia) => (
                    <div
                      key={cirugia.id_cirugia}
                      className={`p-1.5 rounded-md border text-xs cursor-pointer hover:shadow-md transition-shadow ${getEstadoBadgeStyle(cirugia.estado_cirugia)}`}
                      // onClick={() => onNavigate('detalle-cirugia', cirugia)} // TODO: Cambiar a navigate
                      onClick={() => navigate(`/cirugias/${cirugia.id_cirugia}`)} // Asumiendo una ruta de detalle
                      title={`Paciente ID: ${cirugia.id_paciente}, Médico ID: ${cirugia.id_medico_principal}`}
                    >
                      <div className="font-semibold truncate">{cirugia.tipo_cirugia}</div>
                      <div className="flex items-center gap-1 opacity-80"><Clock size={12} /> {format(parseISO(cirugia.fecha_hora_inicio_programada), 'HH:mm')} ({cirugia.duracion_estimada_minutos}m)</div>
                      <div className="truncate opacity-80"><User size={12} className="inline mr-1" /> Pac.ID: {cirugia.id_paciente}</div>
                      <div className="truncate opacity-80"><MapPin size={12} className="inline mr-1" /> {cirugia.nombre_quirofano || 'N/A'}</div>
                      <Badge variant="outline" className={`mt-1 text-xs ${getEstadoBadgeStyle(cirugia.estado_cirugia)} border-opacity-50`}>{cirugia.estado_cirugia}</Badge>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal para Nueva Cirugía */}
      <Dialog open={isModalOpen} onOpenChange={(isOpen) => { if (!isLoading) setIsModalOpen(isOpen); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader> <DialogTitle>Agendar Nueva Cirugía</DialogTitle> <DialogDescription>Complete los detalles para programar una nueva intervención.</DialogDescription> </DialogHeader>
          <form onSubmit={handleAgendarNuevaCirugia} className="space-y-4 py-2">
            {errorApi && isModalOpen && <Alert variant="destructive"><AlertDescription>{errorApi}</AlertDescription></Alert>}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"> <Label htmlFor="id_paciente_form">ID Paciente *</Label> <Input id="id_paciente_form" name="id_paciente" type="number" value={newCirugiaForm.id_paciente || ''} onChange={(e) => handleFormSelectChange('id_paciente', Number(e.target.value))} required /> </div>
                <div className="space-y-1.5"> <Label htmlFor="id_medico_principal_form">ID Médico Principal *</Label> <Input id="id_medico_principal_form" name="id_medico_principal" type="number" value={newCirugiaForm.id_medico_principal || ''} onChange={(e) => handleFormSelectChange('id_medico_principal', Number(e.target.value))} required /> </div>
            </div>
            {/* Aquí irían Selects para Paciente y Médico si se cargan los datos */}

            <div className="space-y-1.5"> <Label htmlFor="tipo_cirugia_form">Tipo de Cirugía *</Label> <Input id="tipo_cirugia_form" name="tipo_cirugia" value={newCirugiaForm.tipo_cirugia || ''} onChange={handleFormInputChange} required /> </div>

            <div className="grid grid-cols-2 gap-4 items-end">
                <div className="space-y-1.5"> <Label>Fecha Programada *</Label>
                    <Popover> <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal"> <CalendarIcon className="mr-2 h-4 w-4" /> {formSelectedDate ? format(formSelectedDate, 'PPP', { locale: es }) : <span>Seleccione fecha</span>} </Button>
                    </PopoverTrigger> <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formSelectedDate} onSelect={setFormSelectedDate} initialFocus /></PopoverContent> </Popover>
                </div>
                <div className="flex gap-2">
                    <div className="space-y-1.5 w-1/2"> <Label htmlFor="formHour">Hora *</Label> <Select value={formSelectedHour} onValueChange={setFormSelectedHour}> <SelectTrigger><SelectValue/></SelectTrigger> <SelectContent>{Array.from({length:24},(_,i)=>i.toString().padStart(2,'0')).map(h=><SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent> </Select> </div>
                    <div className="space-y-1.5 w-1/2"> <Label htmlFor="formMinute">Min *</Label> <Select value={formSelectedMinute} onValueChange={setFormSelectedMinute}> <SelectTrigger><SelectValue/></SelectTrigger> <SelectContent>{['00','15','30','45'].map(m=><SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent> </Select> </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"> <Label htmlFor="duracion_estimada_minutos_form">Duración Estimada (min)</Label> <Input id="duracion_estimada_minutos_form" name="duracion_estimada_minutos" type="number" value={newCirugiaForm.duracion_estimada_minutos || ''} onChange={handleFormInputChange} /> </div>
                <div className="space-y-1.5"> <Label htmlFor="nombre_quirofano_form">Pabellón</Label>
                    <Select name="nombre_quirofano" onValueChange={(v) => handleFormSelectChange('nombre_quirofano', v)} value={newCirugiaForm.nombre_quirofano || ''}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar Pabellón"/></SelectTrigger>
                        <SelectContent>{pabellonesHardcoded.map(p=><SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-1.5"> <Label htmlFor="estado_cirugia_form">Estado Inicial</Label>
                <Select name="estado_cirugia" onValueChange={(v) => handleFormSelectChange('estado_cirugia', v)} value={newCirugiaForm.estado_cirugia || 'Programada'}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>{estadosCirugiaHardcoded.filter(e=>['Programada','Confirmada'].includes(e)).map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
            </div>
            <div className="space-y-1.5"> <Label htmlFor="notas_preoperatorias_form">Notas Preoperatorias</Label> <Textarea id="notas_preoperatorias_form" name="notas_preoperatorias" value={newCirugiaForm.notas_preoperatorias || ''} onChange={handleFormInputChange} rows={2} /> </div>
            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isLoading}>Cancelar</Button>
              <Button type="submit" disabled={isLoading}> {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Agendar </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}