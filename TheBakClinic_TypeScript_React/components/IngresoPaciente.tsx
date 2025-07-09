import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { CalendarIcon, Save, X, Loader2 } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { crearPaciente, PacienteCreatePayload } from '../services/api';

interface IngresoPacienteProps {
  onNavigate: (screen: string, data?: any) => void; // Permitir pasar datos, ej. ID del paciente creado
}

// Estado del formulario local
interface PacienteFormData {
  nombre: string;
  apellido: string; // Cambiado de 'apellidos'
  rut: string;
  fechaNacimiento?: Date;
  telefono: string;
  email: string;
  direccion: string;
  prevision: string;
  // Campos adicionales que no están en PacienteCreatePayload pero se guardan en el form
  contactoEmergencia: string;
  telefonoEmergencia: string;
  antecedentes: string;
  alergias: string;
  medicamentos: string;
  observaciones: string;
  numero_ficha: string; // Añadido para coincidir con schema, aunque opcional
}

export function IngresoPaciente({ onNavigate }: IngresoPacienteProps) {
  const initialFormData: PacienteFormData = {
    nombre: '',
    apellido: '',
    rut: '',
    fechaNacimiento: undefined,
    telefono: '',
    email: '',
    direccion: '',
    prevision: '',
    contactoEmergencia: '',
    telefonoEmergencia: '',
    antecedentes: '',
    alergias: '',
    medicamentos: '',
    observaciones: '',
    numero_ficha: ''
  };
  const [formData, setFormData] = useState<PacienteFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const handleInputChange = (field: keyof PacienteFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrorApi(null); // Limpiar error al escribir
    setMensajeExito(null);
  };

  const handleDateChange = (date?: Date) => {
    setFormData(prev => ({ ...prev, fechaNacimiento: date }));
    setErrorApi(null);
    setMensajeExito(null);
  };

  const mostrarMensajeTemporal = (setter: React.Dispatch<React.SetStateAction<string | null>>, mensaje: string) => {
    setter(mensaje);
    setTimeout(() => setter(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorApi(null);
    setMensajeExito(null);

    if (!formData.fechaNacimiento || !isValid(formData.fechaNacimiento)) {
      mostrarMensajeTemporal(setErrorApi, 'Por favor, ingrese una fecha de nacimiento válida.');
      return;
    }
    if (!formData.nombre || !formData.apellido || !formData.rut) {
      mostrarMensajeTemporal(setErrorApi, 'Nombre, Apellido y RUT son campos obligatorios.');
      return;
    }

    setIsLoading(true);
    
    const payload: PacienteCreatePayload = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      rut: formData.rut,
      fecha_nacimiento: format(formData.fechaNacimiento, 'yyyy-MM-dd'), // Formato ISO
      telefono: formData.telefono || undefined, // Enviar undefined si está vacío y es opcional
      email: formData.email || undefined,
      direccion: formData.direccion || undefined,
      prevision: formData.prevision || undefined,
      numero_ficha: formData.numero_ficha || undefined,
    };

    try {
      const nuevoPaciente = await crearPaciente(payload);
      mostrarMensajeTemporal(setMensajeExito, `Paciente ${nuevoPaciente.nombre} ${nuevoPaciente.apellido} registrado exitosamente con ID: ${nuevoPaciente.id_paciente}.`);
      // Limpiar formulario o navegar
      setFormData(initialFormData);
      // Opcionalmente, navegar a una vista de detalle del paciente o a un listado
      // onNavigate('detallePaciente', { pacienteId: nuevoPaciente.id_paciente });
      // onNavigate('dashboard'); // O simplemente volver al dashboard
    } catch (error: any) {
      mostrarMensajeTemporal(setErrorApi, error.response?.data?.detail || error.message || 'Error al registrar paciente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (confirm('¿Está seguro que desea cancelar? Se perderán todos los datos ingresados.')) {
      setFormData(initialFormData);
      setErrorApi(null);
      setMensajeExito(null);
      onNavigate('dashboard'); // O a donde corresponda
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div> <h1>Ingreso de Paciente</h1> <p className="text-muted-foreground">Registro de nuevo paciente en el sistema</p> </div>
      </div>

      {errorApi && (
        <Alert variant="destructive" className="my-4">
          <AlertTitle>Error</AlertTitle> <AlertDescription>{errorApi}</AlertDescription>
        </Alert>
      )}
      {mensajeExito && (
        <Alert variant="default" className="my-4 bg-green-100 border-green-300 text-green-700">
          <AlertTitle>Éxito</AlertTitle> <AlertDescription>{mensajeExito}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader> <CardTitle>Datos Personales</CardTitle> <CardDescription>Información básica del paciente</CardDescription> </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input id="nombre" value={formData.nombre} onChange={(e) => handleInputChange('nombre', e.target.value)} placeholder="Ingrese el nombre" required disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellidos *</Label> {/* Cambiado a 'apellido' */}
                <Input id="apellido" value={formData.apellido} onChange={(e) => handleInputChange('apellido', e.target.value)} placeholder="Ingrese los apellidos" required disabled={isLoading} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rut">RUT *</Label>
                <Input id="rut" value={formData.rut} onChange={(e) => handleInputChange('rut', e.target.value)} placeholder="12.345.678-9" required disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label>Fecha de Nacimiento *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal" disabled={isLoading}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.fechaNacimiento ? format(formData.fechaNacimiento, 'PPP', { locale: es }) : <span>Seleccione una fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={formData.fechaNacimiento} onSelect={handleDateChange} initialFocus captionLayout="dropdown-buttons" fromYear={1900} toYear={new Date().getFullYear()} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"> <Label htmlFor="telefono">Teléfono</Label> <Input id="telefono" value={formData.telefono} onChange={(e) => handleInputChange('telefono', e.target.value)} placeholder="+56 9 1234 5678" disabled={isLoading} /> </div>
              <div className="space-y-2"> <Label htmlFor="email">Email</Label> <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="paciente@email.com" disabled={isLoading} /> </div>
            </div>
            <div className="space-y-2"> <Label htmlFor="direccion">Dirección</Label> <Input id="direccion" value={formData.direccion} onChange={(e) => handleInputChange('direccion', e.target.value)} placeholder="Calle, número, comuna, ciudad" disabled={isLoading} /> </div>
            <div className="space-y-2"> <Label htmlFor="prevision">Previsión</Label>
              <Select value={formData.prevision} onValueChange={(value) => handleInputChange('prevision', value)} disabled={isLoading}>
                <SelectTrigger> <SelectValue placeholder="Seleccione previsión" /> </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FONASA A">FONASA A</SelectItem> <SelectItem value="FONASA B">FONASA B</SelectItem> <SelectItem value="FONASA C">FONASA C</SelectItem> <SelectItem value="FONASA D">FONASA D</SelectItem>
                  <SelectItem value="ISAPRE">ISAPRE</SelectItem> <SelectItem value="PARTICULAR">Particular</SelectItem> <SelectItem value="OTRA">Otra</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2"> <Label htmlFor="numero_ficha">Número de Ficha</Label> <Input id="numero_ficha" value={formData.numero_ficha} onChange={(e) => handleInputChange('numero_ficha', e.target.value)} placeholder="Número de ficha o historial" disabled={isLoading} /> </div>
          </CardContent>
        </Card>

        {/* Campos adicionales (Contacto Emergencia, Info Médica) - No se envían a la API por ahora */}
        <Card>
          <CardHeader> <CardTitle>Información Adicional (Opcional)</CardTitle> <CardDescription>Estos datos se guardan localmente en el formulario pero no se envían a la API de creación de paciente en esta versión.</CardDescription> </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"> <Label htmlFor="contactoEmergencia">Contacto de Emergencia</Label> <Input id="contactoEmergencia" value={formData.contactoEmergencia} onChange={(e) => handleInputChange('contactoEmergencia', e.target.value)} placeholder="Nombre del contacto" disabled={isLoading} /> </div>
              <div className="space-y-2"> <Label htmlFor="telefonoEmergencia">Teléfono Emergencia</Label> <Input id="telefonoEmergencia" value={formData.telefonoEmergencia} onChange={(e) => handleInputChange('telefonoEmergencia', e.target.value)} placeholder="+56 9 XXXX XXXX" disabled={isLoading} /> </div>
            </div>
            <div className="space-y-2"> <Label htmlFor="antecedentes">Antecedentes Médicos</Label> <Textarea id="antecedentes" value={formData.antecedentes} onChange={(e) => handleInputChange('antecedentes', e.target.value)} placeholder="Antecedentes médicos relevantes..." rows={2} disabled={isLoading} /> </div>
            <div className="space-y-2"> <Label htmlFor="alergias">Alergias</Label> <Textarea id="alergias" value={formData.alergias} onChange={(e) => handleInputChange('alergias', e.target.value)} placeholder="Alergias conocidas..." rows={2} disabled={isLoading} /> </div>
            <div className="space-y-2"> <Label htmlFor="medicamentos">Medicamentos Actuales</Label> <Textarea id="medicamentos" value={formData.medicamentos} onChange={(e) => handleInputChange('medicamentos', e.target.value)} placeholder="Medicamentos actuales..." rows={2} disabled={isLoading} /> </div>
            <div className="space-y-2"> <Label htmlFor="observaciones">Observaciones Generales</Label> <Textarea id="observaciones" value={formData.observaciones} onChange={(e) => handleInputChange('observaciones', e.target.value)} placeholder="Observaciones adicionales..." rows={2} disabled={isLoading} /> </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}> <X className="w-4 h-4 mr-2" /> Cancelar </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Guardando...' : 'Guardar Paciente'}
          </Button>
        </div>
      </form>
    </div>
  );
}