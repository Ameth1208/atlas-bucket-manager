'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useSetupStore } from '../../store';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STRENGTH_BAR_COLOR: Record<Strength, string> = {
  weak: 'bg-destructive',
  ok: 'bg-warning',
  strong: 'bg-success',
};

const STRENGTH_WIDTH: Record<Strength, string> = {
  weak: 'w-1/3',
  ok: 'w-2/3',
  strong: 'w-full',
};

type Strength = 'weak' | 'ok' | 'strong';

function evaluatePassword(pwd: string): { strength: Strength } {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return { strength: score <= 2 ? 'weak' : score <= 3 ? 'ok' : 'strong' };
}

export function AccountStep() {
  const { admin, setAdmin, setStep, loading, setLoading } = useSetupStore();
  const { setUser } = useAppStore();
  const { t } = useI18n();
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (touched.name && !admin.name.trim()) e.name = t.required;
    if (touched.email && admin.email && !EMAIL_RE.test(admin.email)) e.email = t.invalidEmail;
    if (touched.password && admin.password && admin.password.length < 8) e.password = t.passwordTooShort;
    if (touched.confirm && admin.confirm && admin.confirm !== admin.password) e.confirm = t.passwordMismatch;
    return e;
  }, [admin, touched, t]);

  const pwdEval = useMemo(() => evaluatePassword(admin.password), [admin.password]);

  const validate = () => {
    setTouched({ name: true, email: true, password: true, confirm: true });
    if (!admin.name.trim() || !admin.email.trim() || !admin.password || !admin.confirm) return false;
    if (!EMAIL_RE.test(admin.email)) return false;
    if (admin.password.length < 8) return false;
    if (admin.password !== admin.confirm) return false;
    return true;
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
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="text-center space-y-1 sm:space-y-1.5">
        <h2 className="text-[22px] sm:text-[28px] font-semibold text-foreground leading-[1.10] text-balance">
          {t.accountTitle}
        </h2>
        <p className="text-[15px] sm:text-[17px] text-muted-foreground leading-[1.47] text-pretty">
          {t.accountSubtitle}
        </p>
      </div>

      <div className="space-y-2 sm:space-y-3">
        <Input
          label={t.fieldName}
          placeholder={t.fieldNamePh}
          value={admin.name}
          onChange={(e) => setAdmin({ name: e.target.value })}
          onBlur={() => setTouched((p) => ({ ...p, name: true }))}
          invalid={!!errors.name}
          autoComplete="name"
        />
        <Input
          type="email"
          label={t.fieldEmail}
          placeholder={t.fieldEmailPh}
          value={admin.email}
          onChange={(e) => setAdmin({ email: e.target.value })}
          onBlur={() => setTouched((p) => ({ ...p, email: true }))}
          invalid={!!errors.email}
          autoComplete="email"
        />
        <div>
          <Input
            type="password"
            label={t.fieldPassword}
            placeholder={t.fieldPasswordPh}
            value={admin.password}
            onChange={(e) => setAdmin({ password: e.target.value })}
            onBlur={() => setTouched((p) => ({ ...p, password: true }))}
            invalid={!!errors.password}
            autoComplete="new-password"
          />
          {admin.password && !errors.password && (
            <div className="mt-2 space-y-1.5">
              <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full ${STRENGTH_BAR_COLOR[pwdEval.strength]} ${STRENGTH_WIDTH[pwdEval.strength]}`}
                />
              </div>
              <p className="text-[11px] sm:text-[12px] text-muted-foreground flex items-center gap-1.5">
                <span>
                  {pwdEval.strength === 'strong'
                    ? t.passwordStrong
                    : pwdEval.strength === 'ok'
                      ? t.passwordOk
                      : t.passwordWeak}
                </span>
                <span className="text-border">·</span>
                <span>{t.passwordHint}</span>
              </p>
            </div>
          )}
        </div>
        <Input
          type="password"
          label={t.fieldConfirm}
          placeholder={t.fieldConfirmPh}
          value={admin.confirm}
          onChange={(e) => setAdmin({ confirm: e.target.value })}
          onBlur={() => setTouched((p) => ({ ...p, confirm: true }))}
          invalid={!!errors.confirm}
          autoComplete="new-password"
        />
      </div>

      {Object.keys(errors).length > 0 && (
        <p className="text-[13px] text-destructive text-center">
          {Object.values(errors)[0]}
        </p>
      )}

      <div className="flex gap-3">
        <Button
          variant="pearl"
          onClick={() => setStep(1)}
          className="flex-1"
        >
          <ArrowLeft size={15} />
          {t.back}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1"
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
