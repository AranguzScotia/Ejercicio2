import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Switch } from './ui/switch';
import { Search, Plus, Edit, Trash2, UserCheck, UserX, Shield, User, Stethoscope, Users } from 'lucide-react';

interface GestionUsuariosProps {
  onNavigate: (screen: string) => void;
}

export function GestionUsuarios({ onNavigate }: GestionUsuariosProps) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const [userForm, setUserForm] = useState({
    nombre: '',
    apellido: '',
    rut: '',
    email: '',
    telefono: '',
    rol: '',
    especialidad: '',
    activo: true
  });

  const roles = [
    { value: 'administrador', label: 'Administrador', icon: Shield, color: 'bg-purple-100 text-purple-800' },
    { value: 'medico', label: 'Médico', icon: Stethoscope, color: 'bg-blue-100 text-blue-800' },
    { value: 'enfermero', label: 'Enfermero/a', icon: User, color: 'bg-green-100 text-green-800' },
    { value: 'limpieza', label: 'Personal de Limpieza', icon: Users, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'ti', label: 'Soporte TI', icon: Shield, color: 'bg-gray-100 text-gray-800' }
  ];

  const usuarios = [
    {
      id: 1,
      nombre: 'Dr. Carlos García',
      rut: '12.345.678-9',
      email: 'c.garcia@clinicabak.cl',
      telefono: '+56 9 1234 5678',
      rol: 'medico',
      especialidad: 'Cardiología',
      fechaIngreso: '2023-01-15',
      ultimoAcceso: '2025-06-25 14:30',
      activo: true,
      cirugias: 145
    },
    {
      id: 2,
      nombre: 'Dra. María López',
      rut: '23.456.789-0',
      email: 'm.lopez@clinicabak.cl',
      telefono: '+56 9 2345 6789',
      rol: 'medico',
      especialidad: 'Traumatología',
      fechaIngreso: '2023-03-20',
      ultimoAcceso: '2025-06-25 16:15',
      activo: true,
      cirugias: 98
    },
    {
      id: 3,
      nombre: 'Enf. Ana Martínez',
      rut: '34.567.890-1',
      email: 'a.martinez@clinicabak.cl',
      telefono: '+56 9 3456 7890',
      rol: 'enfermero',
      especialidad: 'Pabellón',
      fechaIngreso: '2022-09-10',
      ultimoAcceso: '2025-06-25 17:00',
      activo: true,
      cirugias: 234
    },
    {
      id: 4,
      nombre: 'Juan Pérez',
      rut: '45.678.901-2',
      email: 'j.perez@clinicabak.cl',
      telefono: '+56 9 4567 8901',
      rol: 'limpieza',
      especialidad: 'Aseo Hospitalario',
      fechaIngreso: '2023-06-01',
      ultimoAcceso: '2025-06-25 15:45',
      activo: true,
      cirugias: 0
    },
    {
      id: 5,
      nombre: 'Admin Sistema',
      rut: '56.789.012-3',
      email: 'admin@clinicabak.cl',
      telefono: '+56 9 5678 9012',
      rol: 'administrador',
      especialidad: 'Sistemas',
      fechaIngreso: '2022-01-01',
      ultimoAcceso: '2025-06-25 18:20',
      activo: true,
      cirugias: 0
    },
    {
      id: 6,
      nombre: 'Dr. Luis Silva',
      rut: '67.890.123-4',
      email: 'l.silva@clinicabak.cl',
      telefono: '+56 9 6789 0123',
      rol: 'medico',
      especialidad: 'Neurología',
      fechaIngreso: '2023-02-15',
      ultimoAcceso: '2025-06-20 12:30',
      activo: false,
      cirugias: 67
    }
  ];

  const getRolInfo = (rolValue: string) => {
    return roles.find(r => r.value === rolValue) || roles[0];
  };

  const usuariosFiltrados = usuarios.filter(usuario => {
    const cumpleBusqueda = !busqueda || 
      usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.rut.includes(busqueda);
    
    const cumpleRol = filtroRol === 'todos' || usuario.rol === filtroRol;
    const cumpleEstado = filtroEstado === 'todos' || 
      (filtroEstado === 'activo' && usuario.activo) ||
      (filtroEstado === 'inactivo' && !usuario.activo);
    
    return cumpleBusqueda && cumpleRol && cumpleEstado;
  });

  const abrirFormulario = (mode: 'create' | 'edit', user?: any) => {
    setFormMode(mode);
    if (mode === 'edit' && user) {
      setSelectedUser(user);
      setUserForm({
        nombre: user.nombre.split(' ')[1] || '',
        apellido: user.nombre.split(' ')[2] || user.nombre.split(' ')[1] || '',
        rut: user.rut,
        email: user.email,
        telefono: user.telefono,
        rol: user.rol,
        especialidad: user.especialidad,
        activo: user.activo
      });
    } else {
      setUserForm({
        nombre: '',
        apellido: '',
        rut: '',
        email: '',
        telefono: '',
        rol: '',
        especialidad: '',
        activo: true
      });
    }
    setIsDialogOpen(true);
  };

  const guardarUsuario = () => {
    if (formMode === 'create') {
      alert('Usuario creado exitosamente');
    } else {
      alert('Usuario actualizado exitosamente');
    }
    setIsDialogOpen(false);
  };

  const toggleUsuario = (userId: number) => {
    const usuario = usuarios.find(u => u.id === userId);
    const accion = usuario?.activo ? 'desactivar' : 'activar';
    if (confirm(`¿Está seguro que desea ${accion} este usuario?`)) {
      alert(`Usuario ${accion}do exitosamente`);
    }
  };

  const eliminarUsuario = (userId: number) => {
    if (confirm('¿Está seguro que desea eliminar este usuario? Esta acción no se puede deshacer.')) {
      alert('Usuario eliminado exitosamente');
    }
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
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {roles.map((rol) => {
          const count = usuarios.filter(u => u.rol === rol.value && u.activo).length;
          const RolIcon = rol.icon;
          
          return (
            <Card key={rol.value}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${rol.color}`}>
                  <RolIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm text-muted-foreground">{rol.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Búsqueda</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email o RUT..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select value={filtroRol} onValueChange={setFiltroRol}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los roles</SelectItem>
                  {roles.map((rol) => (
                    <SelectItem key={rol.value} value={rol.value}>{rol.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
          <CardTitle>Usuarios Registrados ({usuariosFiltrados.length})</CardTitle>
          <CardDescription>Lista completa de usuarios del sistema</CardDescription>
        </CardHeader>
        <CardContent>
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
                    <TableRow key={usuario.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{usuario.nombre}</p>
                          <p className="text-sm text-muted-foreground">{usuario.email}</p>
                          <p className="text-xs text-muted-foreground">{usuario.rut}</p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={rolInfo.color}>
                          <RolIcon className="w-3 h-3 mr-1" />
                          {rolInfo.label}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>{usuario.especialidad}</TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          <p>{new Date(usuario.ultimoAcceso).toLocaleDateString('es-CL')}</p>
                          <p className="text-muted-foreground">
                            {new Date(usuario.ultimoAcceso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant={usuario.activo ? 'secondary' : 'destructive'}>
                          {usuario.activo ? (
                            <>
                              <UserCheck className="w-3 h-3 mr-1" />
                              Activo
                            </>
                          ) : (
                            <>
                              <UserX className="w-3 h-3 mr-1" />
                              Inactivo
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => abrirFormulario('edit', usuario)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            variant={usuario.activo ? 'destructive' : 'secondary'}
                            size="sm"
                            onClick={() => toggleUsuario(usuario.id)}
                          >
                            {usuario.activo ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </Button>
                          
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => eliminarUsuario(usuario.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {usuariosFiltrados.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron usuarios que coincidan con los filtros aplicados.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para crear/editar usuario */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {formMode === 'create' ? 'Crear Nuevo Usuario' : 'Editar Usuario'}
            </DialogTitle>
            <DialogDescription>
              {formMode === 'create' 
                ? 'Complete la información para crear un nuevo usuario en el sistema'
                : 'Modifique la información del usuario seleccionado'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={userForm.nombre}
                onChange={(e) => setUserForm(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Nombre"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Apellido</Label>
              <Input
                value={userForm.apellido}
                onChange={(e) => setUserForm(prev => ({ ...prev, apellido: e.target.value }))}
                placeholder="Apellido"
              />
            </div>
            
            <div className="space-y-2">
              <Label>RUT</Label>
              <Input
                value={userForm.rut}
                onChange={(e) => setUserForm(prev => ({ ...prev, rut: e.target.value }))}
                placeholder="12.345.678-9"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="usuario@clinicabak.cl"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input
                value={userForm.telefono}
                onChange={(e) => setUserForm(prev => ({ ...prev, telefono: e.target.value }))}
                placeholder="+56 9 1234 5678"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select value={userForm.rol} onValueChange={(value) => setUserForm(prev => ({ ...prev, rol: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((rol) => (
                    <SelectItem key={rol.value} value={rol.value}>{rol.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label>Especialidad</Label>
              <Input
                value={userForm.especialidad}
                onChange={(e) => setUserForm(prev => ({ ...prev, especialidad: e.target.value }))}
                placeholder="Especialidad o área de trabajo"
              />
            </div>
            
            <div className="flex items-center space-x-2 md:col-span-2">
              <Switch
                checked={userForm.activo}
                onCheckedChange={(checked) => setUserForm(prev => ({ ...prev, activo: checked }))}
              />
              <Label>Usuario activo</Label>
            </div>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={guardarUsuario}>
              {formMode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}