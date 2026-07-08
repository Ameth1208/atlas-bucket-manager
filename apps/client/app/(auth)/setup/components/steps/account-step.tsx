'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useSetupStore } from '../../store';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function AccountStep() {
  const { admin, setAdmin, setStep, loading } = useSetupStore();
  const { setUser } = useAppStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!admin.name.trim()) e.name = 'Requerido';
    if (!admin.email.trim()) e.email = 'Requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(admin.email)) e.email = 'Correo inválido';
    if (!admin.password) e.password = 'Requerido';
    else if (admin.password.length < 8) e.password = 'Mínimo 8 caracteres';
    if (admin.password !== admin.confirm) e.confirm = 'No coincide';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const { user } = await api.auth.setup({ name: admin.name, email: admin.email, password: admin.password });
      setUser(user);
      setStep(3);
    } catch (err: any) {
      toast.error(err.message || 'Error al crear la cuenta');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Cuenta de administrador</h2>
        <p className="text-sm text-muted-foreground">Esta será tu cuenta principal.</p>
      </div>

      <div className="space-y-3">
        <Field label="Nombre completo" error={errors.name}>
          <Input
            type="text"
            value={admin.name}
            onChange={e => { setAdmin({ name: e.target.value }); if (errors.name) setErrors(p => ({ ...p, name: '' })); }}
            placeholder="Tu nombre"
            aria-invalid={!!errors.name}
            autoComplete="name"
          />
        </Field>
        <Field label="Correo electrónico" error={errors.email}>
          <Input
            type="email"
            value={admin.email}
            onChange={e => { setAdmin({ email: e.target.value }); if (errors.email) setErrors(p => ({ ...p, email: '' })); }}
            placeholder="admin@empresa.com"
            aria-invalid={!!errors.email}
            autoComplete="email"
          />
        </Field>
        <Field label="Contraseña" error={errors.password}>
          <Input
            type="password"
            value={admin.password}
            onChange={e => { setAdmin({ password: e.target.value }); if (errors.password) setErrors(p => ({ ...p, password: '' })); }}
            placeholder="Mínimo 8 caracteres"
            aria-invalid={!!errors.password}
            autoComplete="new-password"
          />
        </Field>
        <Field label="Confirmar contraseña" error={errors.confirm}>
          <Input
            type="password"
            value={admin.confirm}
            onChange={e => { setAdmin({ confirm: e.target.value }); if (errors.confirm) setErrors(p => ({ ...p, confirm: '' })); }}
            placeholder="Repite la contraseña"
            aria-invalid={!!errors.confirm}
            autoComplete="new-password"
          />
        </Field>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
          <ArrowLeft size={14} /> Atrás
        </Button>
        <Button onClick={handleSubmit} disabled={loading} className="flex-1">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
          {loading ? 'Creando...' : 'Crear cuenta'}
        </Button>
      </div>
    </div>
  );
}
