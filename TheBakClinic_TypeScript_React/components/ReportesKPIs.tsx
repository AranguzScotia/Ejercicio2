import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Badge } from './ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { CalendarIcon, Download, TrendingUp, TrendingDown, Activity, Clock, Users, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import clinicLogo from 'figma:asset/edbed43c3db39494f85e7ae6f92ba61a21ce649c.png';

interface ReportesKPIsProps {
  onNavigate: (screen: string) => void;
}

export function ReportesKPIs({ onNavigate }: ReportesKPIsProps) {
  const [filtros, setFiltros] = useState({
    periodo: 'mes',
    area: 'todas',
    profesional: 'todos',
    fechaInicio: undefined as Date | undefined,
    fechaFin: undefined as Date | undefined
  });

  // Datos para los gráficos
  const usoPabellones = [
    { name: 'Pab 1', cirugias: 45, horas: 180 },
    { name: 'Pab 2', cirugias: 38, horas: 152 },
    { name: 'Pab 3', cirugias: 42, horas: 168 },
    { name: 'Pab 4', cirugias: 35, horas: 140 },
    { name: 'Pab 5', cirugias: 40, horas: 160 }
  ];

  const eficienciaPorMes = [
    { mes: 'Ene', programadas: 120, realizadas: 115, canceladas: 5 },
    { mes: 'Feb', programadas: 135, realizadas: 128, canceladas: 7 },
    { mes: 'Mar', programadas: 142, realizadas: 138, canceladas: 4 },
    { mes: 'Abr', programadas: 158, realizadas: 145, canceladas: 13 },
    { mes: 'May', programadas: 165, realizadas: 160, canceladas: 5 },
    { mes: 'Jun', programadas: 180, realizadas: 172, canceladas: 8 }
  ];

  const distribucionEspecialidades = [
    { name: 'Cardiología', value: 35, color: '#2B78AC' },
    { name: 'Traumatología', value: 28, color: '#2DAAE0' },
    { name: 'Neurología', value: 20, color: '#0ea5e9' },
    { name: 'Ginecología', value: 12, color: '#06b6d4' },
    { name: 'Otras', value: 5, color: '#0891b2' }
  ];

  const tiempoPromedio = [
    { especialidad: 'Cardiología', tiempo: 135, meta: 120 },
    { especialidad: 'Traumatología', tiempo: 90, meta: 90 },
    { especialidad: 'Neurología', tiempo: 180, meta: 150 },
    { especialidad: 'Ginecología', tiempo: 75, meta: 80 },
    { especialidad: 'Pediatría', tiempo: 60, meta: 65 }
  ];

  // KPIs principales
  const kpis = [
    {
      titulo: 'Tasa de Ocupación',
      valor: '87.5%',
      cambio: '+2.3%',
      tendencia: 'up',
      descripcion: 'vs mes anterior',
      icon: Activity,
      color: 'text-primary'
    },
    {
      titulo: 'Eficiencia Quirúrgica',
      valor: '95.6%',
      cambio: '+1.2%',
      tendencia: 'up',
      descripcion: 'cirugías completadas',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      titulo: 'Tiempo Promedio',
      valor: '108 min',
      cambio: '-5 min',
      tendencia: 'down',
      descripcion: 'por procedimiento',
      icon: Clock,
      color: 'text-blue-600'
    },
    {
      titulo: 'Cancelaciones',
      valor: '4.4%',
      cambio: '+0.8%',
      tendencia: 'up',
      descripcion: 'tasa mensual',
      icon: AlertTriangle,
      color: 'text-red-600'
    }
  ];

  const areas = ['Todas', 'Cardiología', 'Traumatología', 'Neurología', 'Ginecología', 'Pediatría'];
  const profesionales = ['Todos', 'Dr. García', 'Dra. López', 'Dr. Silva', 'Dra. Torres', 'Dr. Mendoza'];

  const exportarReporte = () => {
    alert('Generando reporte PDF...');
  };

  const generarInforme = () => {
    alert('Generando informe ejecutivo...');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header con Logo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <img 
            src={clinicLogo} 
            alt="The BAK Clinic" 
            className="h-10 w-auto object-contain"
          />
          <div>
            <h1>Reportes y KPIs</h1>
            <p className="text-muted-foreground">Análisis de rendimiento y métricas clave</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={generarInforme}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Informe Ejecutivo
          </Button>
          <Button onClick={exportarReporte}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Análisis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select value={filtros.periodo} onValueChange={(value) => setFiltros(prev => ({ ...prev, periodo: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dia">Último día</SelectItem>
                  <SelectItem value="semana">Última semana</SelectItem>
                  <SelectItem value="mes">Último mes</SelectItem>
                  <SelectItem value="trimestre">Último trimestre</SelectItem>
                  <SelectItem value="ano">Último año</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Área</label>
              <Select value={filtros.area} onValueChange={(value) => setFiltros(prev => ({ ...prev, area: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area} value={area.toLowerCase()}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Profesional</label>
              <Select value={filtros.profesional} onValueChange={(value) => setFiltros(prev => ({ ...prev, profesional: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {profesionales.map((prof) => (
                    <SelectItem key={prof} value={prof.toLowerCase()}>{prof}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha Personalizada</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filtros.fechaInicio ? (
                      format(filtros.fechaInicio, 'PPP', { locale: es })
                    ) : (
                      <span>Seleccionar</span>
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

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => {
          const IconComponent = kpi.icon;
          const isPositive = kpi.tendencia === 'up';
          const TrendIcon = isPositive ? TrendingUp : TrendingDown;
          
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{kpi.titulo}</p>
                    <p className="text-2xl font-bold">{kpi.valor}</p>
                    <div className="flex items-center gap-1">
                      <TrendIcon className={`w-3 h-3 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
                      <span className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {kpi.cambio} {kpi.descripcion}
                      </span>
                    </div>
                  </div>
                  <IconComponent className={`w-8 h-8 ${kpi.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráficos Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Uso de Pabellones */}
        <Card>
          <CardHeader>
            <CardTitle>Uso de Pabellones</CardTitle>
            <CardDescription>Número de cirugías y horas de uso por pabellón</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usoPabellones}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cirugias" fill="#2B78AC" name="Cirugías" />
                <Bar dataKey="horas" fill="#2DAAE0" name="Horas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribución por Especialidades */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Especialidades</CardTitle>
            <CardDescription>Porcentaje de cirugías por especialidad médica</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distribucionEspecialidades}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distribucionEspecialidades.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Secundarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Eficiencia Mensual */}
        <Card>
          <CardHeader>
            <CardTitle>Eficiencia Mensual</CardTitle>
            <CardDescription>Cirugías programadas vs realizadas por mes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={eficienciaPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="programadas" stroke="#2B78AC" name="Programadas" />
                <Line type="monotone" dataKey="realizadas" stroke="#2DAAE0" name="Realizadas" />
                <Line type="monotone" dataKey="canceladas" stroke="#FF2727" name="Canceladas" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tiempo Promedio vs Meta */}
        <Card>
          <CardHeader>
            <CardTitle>Tiempo Promedio vs Meta</CardTitle>
            <CardDescription>Duración promedio de cirugías vs tiempo objetivo (minutos)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tiempoPromedio} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="especialidad" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="tiempo" fill="#2B78AC" name="Tiempo Real" />
                <Bar dataKey="meta" fill="#2DAAE0" name="Meta" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Indicadores Detallados */}
      <Card>
        <CardHeader>
          <CardTitle>Indicadores Detallados</CardTitle>
          <CardDescription>Métricas específicas por período seleccionado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4>Productividad</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Cirugías completadas:</span>
                  <span className="font-medium">172</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Horas quirúrgicas totales:</span>
                  <span className="font-medium">864h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Promedio por día:</span>
                  <span className="font-medium">5.7 cirugías</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Utilización de recursos:</span>
                  <Badge className="bg-green-100 text-green-800">Óptima</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4>Calidad</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Tasa de éxito:</span>
                  <span className="font-medium">98.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Complicaciones:</span>
                  <span className="font-medium">1.8%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Reintervenciones:</span>
                  <span className="font-medium">0.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Satisfacción paciente:</span>
                  <Badge className="bg-green-100 text-green-800">Excelente</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4>Eficiencia</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Retrasos promedio:</span>
                  <span className="font-medium">12 min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Tiempo de limpieza:</span>
                  <span className="font-medium">35 min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Rotación de salas:</span>
                  <span className="font-medium">2.1x/día</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Eficiencia general:</span>
                  <Badge className="bg-blue-100 text-blue-800">Buena</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}