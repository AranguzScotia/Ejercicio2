import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Switch } from './ui/switch';
import { Alert, AlertDescription, AlertTitle } from './ui/alert'; // Para notificaciones
import { Loader2, Search, Plus, Edit, Trash2, UserCheck, UserX, Shield, User, Stethoscope, Users } from 'lucide-react';
import {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  Usuario as UsuarioApi, // Renombrar para evitar conflicto con el icono User
  UsuarioListResponse,
  UsuarioCreatePayload
} from '../services/api';

// Ajustar UserFormState para que coincida con UsuarioCreatePayload para la creación
// y con campos de UsuarioApi para la edición.
interface UserFormState extends Omit<UsuarioApi,
  'id_usuario' |
  'fecha_creacion' |
  'ultimo_acceso' |
  'fecha_ingreso' // Estos son campos que generalmente no se envían en un formulario de creación/edición directamente
> {
  contrasena?: string;
}

// Props del componente (si las tuviera, ej. onNavigate)
// interface GestionUsuariosProps {
//   onNavigate: (screen: string) => void;
// }

export function GestionUsuarios(/*{ onNavigate }: GestionUsuariosProps*/) {
  const [usuariosReales, setUsuariosReales] = useState<UsuarioApi[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const initialUserFormState: UserFormState = {
    nombre: '',
    apellido: '',
    rut: '',
    email: '',
    telefono: '',
    rol: '',
    especialidad: '',
    activo: true,
    contrasena: ''
  };
  const [userForm, setUserForm] = useState<UserFormState>(initialUserFormState);

  const roles = [
    { value: 'administrador', label: 'Administrador', icon: Shield, color: 'bg-purple-100 text-purple-800' },
    { value: 'medico', label: 'Médico', icon: Stethoscope, color: 'bg-blue-100 text-blue-800' },
    { value: 'enfermero', label: 'Enfermero/a', icon: User, color: 'bg-green-100 text-green-800' },
    { value: 'limpieza', label: 'Personal de Limpieza', icon: Users, color: 'bg-yellow-100 text-yellow-800' },
    // { value: 'ti', label: 'Soporte TI', icon: Shield, color: 'bg-gray-100 text-gray-800' } // Descomentar si se usa
  ];

  const fetchUsuarios = useCallback(async () => {
    setIsLoading(true);
    setErrorApi(null);
    try {
      // Ajuste: obtenerUsuarios ahora devuelve UsuarioListResponse
      const response = await obtenerUsuarios();
      setUsuariosReales(response.usuarios || []);
      // setTotalUsuarios(response.total); // Si se necesita para paginación
    } catch (error: any) {
      setErrorApi(error.response?.data?.detail || error.message || 'Error al cargar usuarios.');
      setUsuariosReales([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const mostrarMensajeTemporal = (setter: React.Dispatch<React.SetStateAction<string | null>>, mensaje: string) => {
    setter(mensaje);
    setTimeout(() => setter(null), 4000);
  };

  const getRolInfo = (rolValue: string) => {
    return roles.find(r => r.value === rolValue) || { value: rolValue, label: rolValue, icon: User, color: 'bg-gray-100 text-gray-800' };
  };

  const usuariosFiltrados = usuariosReales.filter(usuario => {
    const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`.toLowerCase();
    const cumpleBusqueda = !busqueda || 
      nombreCompleto.includes(busqueda.toLowerCase()) ||
      usuario.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.rut.includes(busqueda);
    
    const cumpleRol = filtroRol === 'todos' || usuario.rol === filtroRol;
    const cumpleEstado = filtroEstado === 'todos' || 
      (filtroEstado === 'activo' && usuario.activo) ||
      (filtroEstado === 'inactivo' && !usuario.activo);
    
    return cumpleBusqueda && cumpleRol && cumpleEstado;
  });

  const abrirFormulario = (mode: 'create' | 'edit', usuario?: UsuarioApi) => {
    setFormMode(mode);
    setErrorApi(null);
    setMensajeExito(null);
    if (mode === 'edit' && usuario) {
      setSelectedUserId(usuario.id_usuario);
      setUserForm({
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rut: usuario.rut,
        email: usuario.email,
        telefono: usuario.telefono || '',
        rol: usuario.rol,
        especialidad: usuario.especialidad || '',
        activo: usuario.activo,
        contrasena: '' // No se carga la contraseña para edición
      });
    } else {
      setSelectedUserId(null);
      setUserForm(initialUserFormState);
    }
    setIsDialogOpen(true);
  };

  const handleGuardarUsuario = async () => {
    setIsLoading(true);
    setErrorApi(null);
    setMensajeExito(null);

    try {
      if (formMode === 'create') {
        if (!userForm.contrasena || userForm.contrasena.length < 8) {
          setErrorApi("La contraseña es requerida y debe tener al menos 8 caracteres.");
          setIsLoading(false);
          return;
        }
        // Ajuste: Mapear UserFormState a UsuarioCreatePayload
        const payload: UsuarioCreatePayload = {
          nombre: userForm.nombre,
          apellido: userForm.apellido,
          rut: userForm.rut,
          email: userForm.email,
          telefono: userForm.telefono,
          rol: userForm.rol,
          especialidad: userForm.especialidad,
          activo: userForm.activo,
          contrasena: userForm.contrasena, // contrasena es string, no string? aquí
        };
        await crearUsuario(payload);
        mostrarMensajeTemporal(setMensajeExito, 'Usuario creado exitosamente.');
      } else if (selectedUserId) {
        // Para actualizar, no enviamos la contraseña. El payload de actualización es Partial<UsuarioApi>
        const { contrasena, ...updateFields } = userForm;
        const updatePayload: Partial<UsuarioApi> = updateFields;
        await actualizarUsuario(selectedUserId, updatePayload);
        mostrarMensajeTemporal(setMensajeExito, 'Usuario actualizado exitosamente.');
      }
      setIsDialogOpen(false);
      fetchUsuarios(); // Recargar lista
    } catch (error: any) {
      mostrarMensajeTemporal(setErrorApi, error.response?.data?.detail || error.message || `Error al ${formMode === 'create' ? 'crear' : 'actualizar'} usuario.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUsuarioActivo = async (usuario: UsuarioApi) => {
    if (!confirm(`¿Está seguro que desea ${usuario.activo ? 'desactivar' : 'activar'} este usuario?`)) return;

    setIsLoading(true);
    setErrorApi(null);
    setMensajeExito(null);
    try {
      await actualizarUsuario(usuario.id_usuario, { activo: !usuario.activo });
      mostrarMensajeTemporal(setMensajeExito, `Usuario ${usuario.activo ? 'desactivado' : 'activado'} exitosamente.`);
      fetchUsuarios();
    } catch (error: any) {
      mostrarMensajeTemporal(setErrorApi, error.response?.data?.detail || error.message || 'Error al cambiar estado del usuario.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEliminarUsuario = async (idUsuario: number) => {
    if (!confirm('¿Está seguro que desea eliminar este usuario? Esta acción no se puede deshacer.')) return;

    setIsLoading(true);
    setErrorApi(null);
    setMensajeExito(null);
    try {
      await eliminarUsuario(idUsuario);
      mostrarMensajeTemporal(setMensajeExito, 'Usuario eliminado exitosamente.');
      fetchUsuarios();
    } catch (error: any) {
      mostrarMensajeTemporal(setErrorApi, error.response?.data?.detail || error.message || 'Error al eliminar usuario.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setUserForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setUserForm(prev => ({ ...prev, [name]: checked }));
  };


  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1>Gestión de Usuarios</h1>
          <p className="text-muted-foreground">Administración de usuarios del sistema</p>
        </div>
        <Button onClick={() => abrirFormulario('create')}>
          <Plus className="w-4 h-4 mr-2" /> Nuevo Usuario
        </Button>
      </div>

      {/* Notificaciones Globales */}
      {errorApi && (
        <Alert variant="destructive" className="my-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorApi}</AlertDescription>
        </Alert>
      )}
      {mensajeExito && (
        <Alert variant="default" className="my-4 bg-green-100 border-green-300 text-green-700">
          <AlertTitle>Éxito</AlertTitle>
          <AlertDescription>{mensajeExito}</AlertDescription>
        </Alert>
      )}

      {/* Estadísticas (adaptar si es necesario o eliminar si no se pueden calcular fácilmente del backend) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {roles.map((rol) => {
          const count = usuariosReales.filter(u => u.rol === rol.value && u.activo).length;
          const RolIcon = rol.icon;
          return (
            <Card key={rol.value}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${rol.color}`}> <RolIcon className="w-5 h-5" /> </div>
                <div> <p className="text-2xl font-bold">{count}</p> <p className="text-sm text-muted-foreground">{rol.label}</p> </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader> <CardTitle>Filtros de Búsqueda</CardTitle> </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Búsqueda</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por nombre, email o RUT..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select value={filtroRol} onValueChange={setFiltroRol}>
                <SelectTrigger> <SelectValue /> </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los roles</SelectItem>
                  {roles.map((rol) => (<SelectItem key={rol.value} value={rol.value}>{rol.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger> <SelectValue /> </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="activo">Activos</SelectItem>
                  <SelectItem value="inactivo">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios Registrados ({isLoading ? <Loader2 className="inline w-4 h-4 animate-spin" /> : usuariosFiltrados.length})</CardTitle>
          <CardDescription>Lista completa de usuarios del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && usuariosReales.length === 0 ? (
            <div className="text-center py-8"><Loader2 className="mx-auto w-8 h-8 animate-spin text-primary" /> <p>Cargando usuarios...</p></div>
          ) : !isLoading && errorApi && usuariosReales.length === 0 ? (
             <div className="text-center py-8 text-red-600">Error al cargar usuarios. Intente de nuevo.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Especialidad</TableHead>
                    <TableHead>Último Acceso</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuariosFiltrados.map((usuario) => {
                    const rolInfo = getRolInfo(usuario.rol);
                    const RolIcon = rolInfo.icon;
                    return (
                      <TableRow key={usuario.id_usuario}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{usuario.nombre} {usuario.apellido}</p>
                            <p className="text-sm text-muted-foreground">{usuario.email}</p>
                            <p className="text-xs text-muted-foreground">{usuario.rut}</p>
                          </div>
                        </TableCell>
                        <TableCell> <Badge className={rolInfo.color}> <RolIcon className="w-3 h-3 mr-1" /> {rolInfo.label} </Badge> </TableCell>
                        <TableCell>{usuario.especialidad || '-'}</TableCell>
                        <TableCell>
                          {usuario.ultimo_acceso ? (
                            <div className="text-sm">
                              <p>{new Date(usuario.ultimo_acceso).toLocaleDateString('es-CL')}</p>
                              <p className="text-muted-foreground">{new Date(usuario.ultimo_acceso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          ) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={usuario.activo ? 'secondary' : 'destructive'}>
                            {usuario.activo ? (<><UserCheck className="w-3 h-3 mr-1" />Activo</>) : (<><UserX className="w-3 h-3 mr-1" />Inactivo</>)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => abrirFormulario('edit', usuario)} disabled={isLoading}> <Edit className="w-4 h-4" /> </Button>
                            <Button variant={usuario.activo ? 'destructive' : 'secondary'} size="sm" onClick={() => handleToggleUsuarioActivo(usuario)} disabled={isLoading}>
                              {usuario.activo ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleEliminarUsuario(usuario.id_usuario)} disabled={isLoading}> <Trash2 className="w-4 h-4" /> </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          {!isLoading && usuariosFiltrados.length === 0 && usuariosReales.length > 0 && (
            <div className="text-center py-8 text-muted-foreground">No se encontraron usuarios que coincidan con los filtros.</div>
          )}
          {!isLoading && usuariosReales.length === 0 && !errorApi && (
             <div className="text-center py-8 text-muted-foreground">No hay usuarios registrados.</div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para crear/editar usuario */}
      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isLoading) setIsDialogOpen(isOpen); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{formMode === 'create' ? 'Crear Nuevo Usuario' : 'Editar Usuario'}</DialogTitle>
            <DialogDescription>
              {formMode === 'create' ? 'Complete la información para crear un nuevo usuario.' : 'Modifique la información del usuario.'}
            </DialogDescription>
          </DialogHeader>
          {/* Notificaciones dentro del Dialog */}
          {errorApi && isDialogOpen && ( // Mostrar error solo si el dialogo está abierto y hay error específico de la op del dialogo
            <Alert variant="destructive" className="my-2">
              <AlertTitle>Error en Formulario</AlertTitle>
              <AlertDescription>{errorApi}</AlertDescription>
            </Alert>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2"> <Label htmlFor="nombre">Nombre</Label> <Input id="nombre" name="nombre" value={userForm.nombre} onChange={handleInputChange} placeholder="Nombre" disabled={isLoading} /> </div>
            <div className="space-y-2"> <Label htmlFor="apellido">Apellido</Label> <Input id="apellido" name="apellido" value={userForm.apellido} onChange={handleInputChange} placeholder="Apellido" disabled={isLoading} /> </div>
            <div className="space-y-2"> <Label htmlFor="rut">RUT</Label> <Input id="rut" name="rut" value={userForm.rut} onChange={handleInputChange} placeholder="12.345.678-9" disabled={isLoading} /> </div>
            <div className="space-y-2"> <Label htmlFor="email">Email</Label> <Input id="email" name="email" type="email" value={userForm.email} onChange={handleInputChange} placeholder="usuario@clinicabak.cl" disabled={isLoading} /> </div>
            <div className="space-y-2"> <Label htmlFor="telefono">Teléfono</Label> <Input id="telefono" name="telefono" value={userForm.telefono} onChange={handleInputChange} placeholder="+56 9 1234 5678" disabled={isLoading} /> </div>
            <div className="space-y-2">
              <Label htmlFor="rol">Rol</Label>
              <Select name="rol" value={userForm.rol} onValueChange={(value) => handleSelectChange('rol', value)} disabled={isLoading}>
                <SelectTrigger> <SelectValue placeholder="Seleccionar rol" /> </SelectTrigger>
                <SelectContent> {roles.map((rol) => (<SelectItem key={rol.value} value={rol.value}>{rol.label}</SelectItem>))} </SelectContent>
              </Select>
            </div>
            {formMode === 'create' && (
              <div className="space-y-2 md:col-span-2"> <Label htmlFor="contrasena">Contraseña</Label> <Input id="contrasena" name="contrasena" type="password" value={userForm.contrasena} onChange={handleInputChange} placeholder="Mínimo 8 caracteres" disabled={isLoading} /> </div>
            )}
            <div className="space-y-2 md:col-span-2"> <Label htmlFor="especialidad">Especialidad</Label> <Input id="especialidad" name="especialidad" value={userForm.especialidad} onChange={handleInputChange} placeholder="Especialidad o área (opcional)" disabled={isLoading} /> </div>
            <div className="flex items-center space-x-2 md:col-span-2">
              <Switch id="activo" name="activo" checked={userForm.activo} onCheckedChange={(checked) => handleSwitchChange('activo', checked)} disabled={isLoading} />
              <Label htmlFor="activo">Usuario activo</Label>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}> Cancelar </Button>
            <Button onClick={handleGuardarUsuario} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {formMode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}