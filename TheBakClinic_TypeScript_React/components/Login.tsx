import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, Mail } from 'lucide-react';
// clinicLogo ahora se referencia directamente desde /public
// import clinicLogo from 'figma:asset/edbed43c3db39494f85e7ae6f92ba61a21ce649c.png';
import { iniciarSesion, LoginPayload } from '../services/authService';

interface LoginProps {
  onLoginSuccess: () => void; // Esta prop es para que App.tsx actualice su estado y re-renderice
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState(''); // Cambiado de rut a email
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // Hook para navegación

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const payload: LoginPayload = { email: email, contrasena: password };
      await iniciarSesion(payload);

      onLoginSuccess(); // Notificar a App.tsx para que actualice el estado de autenticación global
      navigate('/dashboard'); // Redirigir a dashboard después del login exitoso

    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Error desconocido al intentar iniciar sesión. Por favor, inténtelo más tarde.');
      }
      console.error("Error de login:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <img 
              src="/img/clinica_logo.png" // Ruta actualizada a /public/img/
              alt="The BAK Clinic" 
              className="h-20 w-auto object-contain"
            />
          </div>
          <CardTitle>Gestión de Pabellones</CardTitle>
          <CardDescription>Sistema de Administración Clínica</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error de Autenticación</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label> {/* Cambiado de RUT a Email */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email" // Tipo de input cambiado a email
                  placeholder="usuario@clinicabak.cl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10" // Padding para el icono
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Iniciando... </>
              ) : ( 'Iniciar sesión' )}
            </Button>
            <div className="text-center">
              <button 
                type="button" 
                className="text-sm text-primary hover:underline disabled:opacity-50"
                onClick={() => alert('Funcionalidad próximamente disponible')}
                disabled={isLoading}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}