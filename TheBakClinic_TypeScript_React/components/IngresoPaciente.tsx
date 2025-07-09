import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface IngresoPacienteProps {
  onNavigate: (screen: string) => void;
}

export function IngresoPaciente({ onNavigate }: IngresoPacienteProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    rut: '',
    fechaNacimiento: undefined as Date | undefined,
    telefono: '',
    email: '',
    direccion: '',
    prevision: '',
    contactoEmergencia: '',
    telefonoEmergencia: '',
    antecedentes: '',
    alergias: '',
    medicamentos: '',
    observaciones: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simular envío
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Paciente registrado exitosamente');
      onNavigate('dashboard');
    }, 1500);
  };

  const handleCancel = () => {
    if (confirm('¿Está seguro que desea cancelar? Se perderán todos los datos ingresados.')) {
      onNavigate('dashboard');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1>Ingreso de Paciente</h1>
          <p className="text-muted-foreground">Registro de nuevo paciente en el sistema</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos Personales */}
        <Card>
          <CardHeader>
            <CardTitle>Datos Personales</CardTitle>
            <CardDescription>Información básica del paciente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  placeholder="Ingrese el nombre"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellidos">Apellidos *</Label>
                <Input
                  id="apellidos"
                  value={formData.apellidos}
                  onChange={(e) => handleInputChange('apellidos', e.target.value)}
                  placeholder="Ingrese los apellidos"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rut">RUT *</Label>
                <Input
                  id="rut"
                  value={formData.rut}
                  onChange={(e) => handleInputChange('rut', e.target.value)}
                  placeholder="12.345.678-9"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha de Nacimiento *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.fechaNacimiento ? (
                        format(formData.fechaNacimiento, 'PPP', { locale: es })
                      ) : (
                        <span>Seleccione una fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.fechaNacimiento}
                      onSelect={(date) => setFormData(prev => ({ ...prev, fechaNacimiento: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  placeholder="+56 9 1234 5678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="paciente@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                value={formData.direccion}
                onChange={(e) => handleInputChange('direccion', e.target.value)}
                placeholder="Calle, número, comuna, ciudad"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prevision">Previsión</Label>
              <Select value={formData.prevision} onValueChange={(value) => handleInputChange('prevision', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione previsión" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fonasa-a">FONASA A</SelectItem>
                  <SelectItem value="fonasa-b">FONASA B</SelectItem>
                  <SelectItem value="fonasa-c">FONASA C</SelectItem>
                  <SelectItem value="fonasa-d">FONASA D</SelectItem>
                  <SelectItem value="isapre">ISAPRE</SelectItem>
                  <SelectItem value="particular">Particular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Contacto de Emergencia */}
        <Card>
          <CardHeader>
            <CardTitle>Contacto de Emergencia</CardTitle>
            <CardDescription>Persona a contactar en caso de emergencia</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactoEmergencia">Nombre Completo</Label>
                <Input
                  id="contactoEmergencia"
                  value={formData.contactoEmergencia}
                  onChange={(e) => handleInputChange('contactoEmergencia', e.target.value)}
                  placeholder="Nombre del contacto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefonoEmergencia">Teléfono</Label>
                <Input
                  id="telefonoEmergencia"
                  value={formData.telefonoEmergencia}
                  onChange={(e) => handleInputChange('telefonoEmergencia', e.target.value)}
                  placeholder="+56 9 1234 5678"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información Médica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Médica</CardTitle>
            <CardDescription>Antecedentes médicos relevantes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="antecedentes">Antecedentes Médicos</Label>
              <Textarea
                id="antecedentes"
                value={formData.antecedentes}
                onChange={(e) => handleInputChange('antecedentes', e.target.value)}
                placeholder="Describa antecedentes médicos relevantes..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alergias">Alergias</Label>
              <Textarea
                id="alergias"
                value={formData.alergias}
                onChange={(e) => handleInputChange('alergias', e.target.value)}
                placeholder="Liste alergias conocidas..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medicamentos">Medicamentos Actuales</Label>
              <Textarea
                id="medicamentos"
                value={formData.medicamentos}
                onChange={(e) => handleInputChange('medicamentos', e.target.value)}
                placeholder="Liste medicamentos que toma actualmente..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={formData.observaciones}
                onChange={(e) => handleInputChange('observaciones', e.target.value)}
                placeholder="Información adicional relevante..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botones de Acción */}
        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={handleCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Guardando...' : 'Guardar Paciente'}
          </Button>
        </div>
      </form>
    </div>
  );
}