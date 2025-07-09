import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert'; // Para mostrar errores
import { Loader2 } from 'lucide-react'; // Para el indicador de carga
import clinicLogo from 'figma:asset/edbed43c3db39494f85e7ae6f92ba61a21ce649c.png';
import { iniciarSesion } from '../services/api'; // Importar la función de la API

interface LoginProps {
  onLoginSuccess: () => void; // Cambiado para mayor claridad
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validar formato de RUT aquí si es necesario antes de enviar
      // Ejemplo básico: if (!/^[0-9]{1,2}\.?[0-9]{3}\.?[0-9]{3}-?[0-9kK]{1}$/.test(rut)) { ... }

      await iniciarSesion({ rut: rut, contrasena: password });
      onLoginSuccess(); // Llama a la función de App.tsx para cambiar de pantalla
    } catch (err: any) {
      // Mejorar el manejo de errores según la respuesta de la API
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
              src={clinicLogo} 
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
              <Label htmlFor="rut">RUT</Label>
              <Input
                id="rut"
                placeholder="12.345.678-9"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                required
                disabled={isLoading}
              />
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
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando...
                </>
              ) : (
                'Iniciar sesión'
              )}
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