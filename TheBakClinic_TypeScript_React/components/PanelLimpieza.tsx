import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input'; // No se usa directamente, pero puede ser útil para Dialog
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'; // Para cambiar estado
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Separator } from './ui/separator'; // Si se usa
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Play, CheckCircle, Clock, AlertTriangle, Loader2, Edit3 } from 'lucide-react'; // Edit3 para editar notas
import {
  obtenerEstadosQuirofanos,
  actualizarEstadoQuirofano,
  EstadoQuirofano as EstadoQuirofanoApi,
  EstadoQuirofanoUpdatePayload
} from '../services/limpiezaService'; // Cambiado a limpiezaService
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// interface PanelLimpiezaProps {
//   onNavigate: (screen: string) => void; // Si se necesita navegación
// }

// Estados de limpieza posibles que el usuario puede seleccionar
const ESTADOS_LIMPIEZA_SELECCIONABLES = [
  "Disponible", // Limpio y listo
  "Limpieza Pendiente", // Sucio, necesita limpieza
  "En Limpieza", // Limpieza en curso
  "No Disponible", // Por mantenimiento u otra razón
  // "Completado" se maneja internamente al pasar a Disponible. "Ocupado" se manejaría por cirugías.
];


export function PanelLimpieza(/*{ onNavigate }: PanelLimpiezaProps*/) {
  const [estadosQuirofanos, setEstadosQuirofanos] = useState<EstadoQuirofanoApi[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const [selectedQuirofano, setSelectedQuirofano] = useState<EstadoQuirofanoApi | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<{ estado_limpieza: string; notas_limpieza: string }>({
    estado_limpieza: '',
    notas_limpieza: ''
  });

  const fetchEstados = useCallback(async () => {
    setIsLoading(true);
    setErrorApi(null);
    try {
      const response = await obtenerEstadosQuirofanos();
      setEstadosQuirofanos(response.quirofanos || []);
    } catch (error: any) {
      setErrorApi(error.response?.data?.detail || error.message || 'Error al cargar estados de limpieza.');
      setEstadosQuirofanos([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEstados();
  }, [fetchEstados]);

  const mostrarMensajeTemporal = (setter: React.Dispatch<React.SetStateAction<string | null>>, mensaje: string) => {
    setter(mensaje);
    setTimeout(() => setter(null), 4000);
  };

  const getEstadoVisualInfo = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'limpieza pendiente':
      case 'pendiente': // alias del mock
        return { color: 'bg-red-100 text-red-800 border-red-300', text: 'Limpieza Pendiente', icon: AlertTriangle };
      case 'en limpieza':
      case 'en-proceso': // alias del mock
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', text: 'En Limpieza', icon: Clock };
      case 'disponible':
      case 'limpio': // alias
      case 'completado': // alias del mock
        return { color: 'bg-green-100 text-green-800 border-green-300', text: 'Disponible', icon: CheckCircle };
      case 'no disponible':
        return { color: 'bg-gray-400 text-white border-gray-500', text: 'No Disponible', icon: AlertTriangle };
      case 'ocupado': // Este estado vendría de la agenda, no directamente de limpieza
        return { color: 'bg-purple-100 text-purple-800 border-purple-300', text: 'Ocupado', icon: Clock };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-300', text: estado || 'Desconocido', icon: Clock };
    }
  };

  // Simulación de prioridad basada en estado (ya que no viene del backend)
  const getPrioridadInfo = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'limpieza pendiente': return { text: 'Alta', color: 'bg-red-500' };
      case 'en limpieza': return { text: 'Media', color: 'bg-yellow-500' };
      default: return { text: 'N/A', color: 'bg-gray-300' };
    }
  };


  const handleAbrirDialogEdicion = (quirofano: EstadoQuirofanoApi) => {
    setSelectedQuirofano(quirofano);
    setEditForm({
      estado_limpieza: quirofano.estado_limpieza,
      notas_limpieza: quirofano.notas_limpieza || ''
    });
    setIsDialogOpen(true);
    setErrorApi(null);
    setMensajeExito(null);
  };

  const handleGuardarCambiosEstado = async () => {
    if (!selectedQuirofano) return;

    setIsLoading(true);
    setErrorApi(null);
    const payload: EstadoQuirofanoUpdatePayload = {
      estado_limpieza: editForm.estado_limpieza,
      notas_limpieza: editForm.notas_limpieza,
    };
    // Si el estado es "Disponible", la API se encarga de `ultima_limpieza_realizada_dt`
    // Si se pasa de "Ocupado" a "Limpieza Pendiente", se podría actualizar `ultima_vez_ocupado_hasta`
    // Esta lógica podría estar en el backend o requerir más info aquí.

    try {
      await actualizarEstadoQuirofano(selectedQuirofano.nombre_quirofano, payload);
      mostrarMensajeTemporal(setMensajeExito, `Estado de ${selectedQuirofano.nombre_quirofano} actualizado.`);
      setIsDialogOpen(false);
      fetchEstados(); // Recargar
    } catch (error: any) {
      mostrarMensajeTemporal(setErrorApi, error.response?.data?.detail || error.message || 'Error al actualizar estado.');
    } finally {
      setIsLoading(false);
    }
  };

  const resumen = estadosQuirofanos.reduce((acc, q) => {
    const estadoKey = q.estado_limpieza?.toLowerCase().replace(' ', '') || 'desconocido';
    acc[estadoKey] = (acc[estadoKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);


  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div> <h1>Panel de Limpieza</h1> <p className="text-muted-foreground">Gestión y control de aseo de pabellones</p> </div>
        <div className="flex gap-2">
          {/* Podríamos mostrar contadores dinámicos aquí */}
           <Badge variant="outline" className="text-red-600 border-red-300">Pendientes: {resumen['limpiezapendiente'] || 0}</Badge>
           <Badge variant="outline" className="text-yellow-600 border-yellow-300">En Proceso: {resumen['enlimpieza'] || 0}</Badge>
        </div>
      </div>

      {errorApi && <Alert variant="destructive" className="my-2"><AlertTitle>Error</AlertTitle><AlertDescription>{errorApi}</AlertDescription></Alert>}
      {mensajeExito && <Alert variant="default" className="my-2 bg-green-100 border-green-300 text-green-700"><AlertTitle>Éxito</AlertTitle><AlertDescription>{mensajeExito}</AlertDescription></Alert>}

      {isLoading && estadosQuirofanos.length === 0 && (
        <div className="text-center py-10"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /><p>Cargando panel de limpieza...</p></div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {estadosQuirofanos.map((quirofano) => {
          const estadoInfo = getEstadoVisualInfo(quirofano.estado_limpieza);
          const EstadoIcon = estadoInfo.icon;
          const prioridadInfo = getPrioridadInfo(quirofano.estado_limpieza);

          return (
            <Card key={quirofano.nombre_quirofano}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${prioridadInfo.color}`}></div>
                    <CardTitle>{quirofano.nombre_quirofano}</CardTitle>
                  </div>
                  <Badge className={estadoInfo.color}> <EstadoIcon className="w-3 h-3 mr-1" /> {estadoInfo.text} </Badge>
                </div>
                 {quirofano.ultima_vez_ocupado_hasta && (
                    <CardDescription className="text-xs pt-1">
                        Última vez ocupado: {format(parseISO(quirofano.ultima_vez_ocupado_hasta), 'Pp', { locale: es })}
                    </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-xs text-muted-foreground">Última limpieza completada:</span>
                  <p className="text-sm font-medium">
                    {quirofano.ultima_limpieza_realizada_dt
                      ? format(parseISO(quirofano.ultima_limpieza_realizada_dt), 'Pp', { locale: es })
                      : 'N/A'}
                  </p>
                </div>
                {quirofano.notas_limpieza && (
                  <div>
                    <span className="text-xs text-muted-foreground">Notas:</span>
                    <p className="text-sm whitespace-pre-wrap">{quirofano.notas_limpieza}</p>
                  </div>
                )}
                <Button size="sm" variant="outline" onClick={() => handleAbrirDialogEdicion(quirofano)} disabled={isLoading}>
                  <Edit3 className="w-4 h-4 mr-1" /> Actualizar Estado/Notas
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!isLoading && estadosQuirofanos.length === 0 && !errorApi && (
        <div className="text-center py-10 text-muted-foreground">No hay información de limpieza de quirófanos disponible.</div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isLoading) setIsDialogOpen(isOpen); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Actualizar Estado de {selectedQuirofano?.nombre_quirofano}</DialogTitle>
            <DialogDescription>Modifique el estado de limpieza y añada notas si es necesario.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {errorApi && isDialogOpen && <Alert variant="destructive" className="my-1"><AlertDescription>{errorApi}</AlertDescription></Alert>}
            <div className="space-y-1.5">
              <Label htmlFor="estado_limpieza_form">Nuevo Estado</Label>
              <Select
                value={editForm.estado_limpieza}
                onValueChange={(value) => setEditForm(prev => ({ ...prev, estado_limpieza: value }))}
              >
                <SelectTrigger id="estado_limpieza_form"> <SelectValue /> </SelectTrigger>
                <SelectContent>
                  {ESTADOS_LIMPIEZA_SELECCIONABLES.map((estado) => (
                    <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notas_limpieza_form">Notas</Label>
              <Textarea
                id="notas_limpieza_form"
                value={editForm.notas_limpieza}
                onChange={(e) => setEditForm(prev => ({ ...prev, notas_limpieza: e.target.value }))}
                placeholder="Observaciones o detalles..."
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>Cancelar</Button>
              <Button onClick={handleGuardarCambiosEstado} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar Cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}