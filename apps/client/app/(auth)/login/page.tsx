import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';
import { LoginForm } from './components/login-form';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  let isSetup = true;
  try {
    const res = await fetch(`${API_URL}/api/auth/status`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      isSetup = data.isSetup;
    }
  } catch {
    // If the status check fails, fall through to the login form.
  }

  if (!isSetup) {
    redirect('/setup');
  }

  return (
    <main className="h-dvh w-dvw flex items-center justify-center bg-background">
      <div className="w-full max-w-[380px]">
        <div className="flex justify-center mb-8">
          <Logo size="lg" showText />
        </div>

        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-foreground">Iniciar sesión</CardTitle>
            <CardDescription>Ingresa tus credenciales para continuar</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <LoginForm />
            <div className="mt-5 pt-4 border-t border-border flex flex-col items-center gap-2">
              <p className="text-center text-sm text-muted-foreground">
                ¿Primera vez en Atlas?
              </p>
              <Link
                href="/setup"
                className="w-full inline-flex items-center justify-center gap-1.5 h-9 px-2.5 rounded-[8px] border border-border bg-muted text-[13px] font-medium hover:bg-background transition-colors"
              >
                <UserPlus size={15} /> Configurar cuenta de administrador
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
