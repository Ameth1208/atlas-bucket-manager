'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/ui/logo';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LogIn } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const { setUser } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = 'Requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Correo inválido';
    if (!password) newErrors.password = 'Requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { user } = await api.auth.login({ email, password });
      setUser(user);
      toast.success('Bienvenido', { description: `Sesión iniciada como ${user.name}` });
      router.push('/dashboard');
    } catch (err: any) {
      toast.error('Error de autenticación', { description: err.message || 'Credenciales inválidas' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-1.5">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: '' })); }}
          placeholder="admin@atlas.app"
          aria-invalid={!!errors.email}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: '' })); }}
          placeholder="••••••••"
          aria-invalid={!!errors.password}
        />
        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
      </div>

      <Button type="submit" disabled={loading} className="w-full mt-2">
        {loading
          ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          : <><LogIn size={15} /> Iniciar sesión</>
        }
      </Button>
    </form>
  );
}

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    api.auth.status()
      .then(({ isSetup }) => { if (!isSetup) router.replace('/setup'); })
      .catch(() => router.replace('/setup'));
  }, []);

  return (
    <main className="h-dvh w-dvw flex items-center justify-center bg-secondary/30">
      <div className="w-full max-w-[380px]">
        <div className="flex justify-center mb-8">
          <Logo size="lg" showText />
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Iniciar sesión</CardTitle>
            <CardDescription>Ingresa tus credenciales para continuar</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <LoginForm />
            <div className="mt-5 pt-4 border-t border-border">
              <p className="text-center text-sm text-muted-foreground">
                ¿Sin cuenta?{' '}
                <span className="text-primary font-medium">Contacta al administrador</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
