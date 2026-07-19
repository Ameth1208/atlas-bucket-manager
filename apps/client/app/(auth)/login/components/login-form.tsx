'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const router = useRouter();
  const qc = useQueryClient();
  const { setUser } = useAppStore();
  const { t, tx } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const requiredLabel = t.required;

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = requiredLabel;
    else if (!EMAIL_RE.test(email)) newErrors.email = t.invalidEmail;
    if (!password) newErrors.password = requiredLabel;
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
      // Invalidate caches so the dashboard fetches fresh data for the new user.
      qc.invalidateQueries();
      toast.success(t.authLoginWelcome, { description: tx('authLoginWelcomeDesc', { name: user.name }) });
      router.push('/dashboard');
    } catch (err) {
      toast.error(t.authLoginError, { description: err instanceof Error ? err.message : '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-1.5">
        <Label htmlFor="email">{t.authLoginEmail}</Label>
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
        <Label htmlFor="password">{t.authLoginPassword}</Label>
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
          : <><LogIn size={15} /> {t.authLoginSubmit}</>
        }
      </Button>
    </form>
  );
}
