'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, ArrowLeft, Loader2, User, Mail, Lock } from 'lucide-react';
import { useSetupStore } from '../../store';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Strength = 'weak' | 'ok' | 'strong';

function evaluatePassword(pwd: string): { strength: Strength; score: number; label: string } {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const strength: Strength = score <= 2 ? 'weak' : score <= 3 ? 'ok' : 'strong';
  return { strength, score, label: strength };
}

export function AccountStep() {
  const { admin, setAdmin, setStep, loading, setLoading } = useSetupStore();
  const { setUser } = useAppStore();
  const { t } = useI18n();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const pwdEval = useMemo(() => evaluatePassword(admin.password), [admin.password]);
  const strengthColor: Record<Strength, string> = {
    weak: 'bg-destructive',
    ok: 'bg-amber-500',
    strong: 'bg-emerald-500',
  };
  const strengthWidth: Record<Strength, string> = {
    weak: 'w-1/3',
    ok: 'w-2/3',
    strong: 'w-full',
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!admin.name.trim()) e.name = t.required;
    if (!admin.email.trim()) e.email = t.required;
    else if (!EMAIL_RE.test(admin.email)) e.email = t.invalidEmail;
    if (!admin.password) e.password = t.required;
    else if (admin.password.length < 8) e.password = t.passwordTooShort;
    if (!admin.confirm) e.confirm = t.required;
    else if (admin.password !== admin.confirm) e.confirm = t.passwordMismatch;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { user } = await api.auth.setup({
        name: admin.name,
        email: admin.email,
        password: admin.password,
      });
      setUser(user);
      setStep(3);
    } catch (err: any) {
      toast.error(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-[20px] font-semibold tracking-tight text-foreground leading-[1.2]">
          {t.accountTitle}
        </h2>
        <p className="text-[12.5px] text-muted-foreground leading-[1.55]">
          {t.accountSubtitle}
        </p>
      </div>

      <div className="space-y-2.5">
        <Input
          type="text"
          label={t.fieldName}
          value={admin.name}
          onChange={(e) => {
            setAdmin({ name: e.target.value });
            if (errors.name) setErrors((p) => ({ ...p, name: '' }));
          }}
          invalid={!!errors.name}
          valid={admin.name.trim().length >= 2}
          autoComplete="name"
          icon={User}
        />
        {errors.name && (
          <p className="text-[11.5px] text-destructive mt-1 ml-1 flex items-center gap-1.5">
            <span className="inline-block size-1 rounded-full bg-destructive" />
            {errors.name}
          </p>
        )}

        <Input
          type="email"
          label={t.fieldEmail}
          value={admin.email}
          onChange={(e) => {
            setAdmin({ email: e.target.value });
            if (errors.email) setErrors((p) => ({ ...p, email: '' }));
          }}
          invalid={!!errors.email}
          valid={EMAIL_RE.test(admin.email)}
          autoComplete="email"
          icon={Mail}
        />
        {errors.email && (
          <p className="text-[11.5px] text-destructive mt-1 ml-1 flex items-center gap-1.5">
            <span className="inline-block size-1 rounded-full bg-destructive" />
            {errors.email}
          </p>
        )}

        <Input
          type="password"
          label={t.fieldPassword}
          value={admin.password}
          onChange={(e) => {
            setAdmin({ password: e.target.value });
            if (errors.password) setErrors((p) => ({ ...p, password: '' }));
          }}
          invalid={!!errors.password}
          autoComplete="new-password"
          icon={Lock}
        />
        {admin.password && !errors.password && (
          <div className="mt-1.5 space-y-1">
            <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${strengthColor[pwdEval.strength]} ${strengthWidth[pwdEval.strength]}`}
              />
            </div>
            <p className="text-[10.5px] text-muted-foreground flex items-center gap-1.5 ml-1">
              <span>{pwdEval.strength === 'strong' ? t.passwordStrong : pwdEval.strength === 'ok' ? t.passwordOk : t.passwordWeak}</span>
              <span className="text-muted-foreground/60">·</span>
              <span>{t.passwordHint}</span>
            </p>
          </div>
        )}
        {errors.password && (
          <p className="text-[11.5px] text-destructive mt-1 ml-1 flex items-center gap-1.5">
            <span className="inline-block size-1 rounded-full bg-destructive" />
            {errors.password}
          </p>
        )}

        <Input
          type="password"
          label={t.fieldConfirm}
          value={admin.confirm}
          onChange={(e) => {
            setAdmin({ confirm: e.target.value });
            if (errors.confirm) setErrors((p) => ({ ...p, confirm: '' }));
          }}
          invalid={!!errors.confirm}
          valid={admin.confirm.length > 0 && admin.confirm === admin.password}
          autoComplete="new-password"
          icon={Lock}
        />
        {errors.confirm && (
          <p className="text-[11.5px] text-destructive mt-1 ml-1 flex items-center gap-1.5">
            <span className="inline-block size-1 rounded-full bg-destructive" />
            {errors.confirm}
          </p>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          onClick={() => setStep(1)}
          className="h-10 flex-1"
        >
          <ArrowLeft size={15} />
          {t.back}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="h-10 flex-1"
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              {t.creating}
            </>
          ) : (
            <>
              {t.create}
              <ArrowRight size={15} className="ml-0.5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
