import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar, Users, AlertTriangle, FileText, Clock, Activity } from 'lucide-react';

interface DashboardProps {
  onNavigate: (screen: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const today = new Date().toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const metrics = [
    {
      title: 'Cirugías Agendadas',
      value: '12',
      description: 'Para hoy',
      icon: Calendar,
      color: 'text-primary'
    },
    {
      title: 'Pabellones Disponibles',
      value: '3/8',
      description: 'Actualmente libres',
      icon: Activity,
      color: 'text-secondary'
    },
    {
      title: 'Alertas Activas',
      value: '2',
      description: 'Requieren atención',
      icon: AlertTriangle,
      color: 'text-destructive'
    }
  ];

  const quickActions = [
    { title: 'Agenda Quirúrgica', desc: 'Ver y gestionar cirugías', action: () => onNavigate('agenda') },
    { title: 'Pacientes', desc: 'Registrar nuevo paciente', action: () => onNavigate('paciente') },
    { title: 'Reportes', desc: 'Ver KPIs y estadísticas', action: () => onNavigate('reportes') },
    { title: 'Notificaciones', desc: 'Revisar alertas', action: () => onNavigate('notificaciones') }
  ];

  const recentActivities = [
    { time: '14:30', action: 'Cirugía iniciada', details: 'Pab. 2 - Dr. García', type: 'success' },
    { time: '13:45', action: 'Limpieza completada', details: 'Pab. 5 - Terminado', type: 'info' },
    { time: '12:20', action: 'Alerta generada', details: 'Pab. 1 - Retraso', type: 'warning' },
    { time: '11:15', action: 'Paciente ingresado', details: 'Juan Pérez - Reg.', type: 'success' }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1>Resumen del día</h1>
        <p className="text-muted-foreground capitalize">{today}</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Accesos Rápidos</CardTitle>
            <CardDescription>Funciones principales del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start text-left"
                  onClick={action.action}
                >
                  <div className="font-medium">{action.title}</div>
                  <div className="text-sm text-muted-foreground">{action.desc}</div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimos eventos del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="text-sm text-muted-foreground w-12">{activity.time}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{activity.action}</div>
                    <div className="text-xs text-muted-foreground">{activity.details}</div>
                  </div>
                  <Badge 
                    variant={activity.type === 'warning' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {activity.type === 'success' ? 'OK' : activity.type === 'warning' ? '!' : 'i'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}