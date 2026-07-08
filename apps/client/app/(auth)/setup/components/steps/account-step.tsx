'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, ArrowLeft, Loader2, Check } from 'lucide-react';
import { useSetupStore } from '../../store';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5 sm:gap-2">
      <Label className="text-[12.5px] sm:text-[13px] text-[#3C3C43] font-medium">{label}</Label>
      {children}
      {error && (
        <p className="text-[11.5px] sm:text-[12px] text-[#FF3B30] mt-0.5 flex items-center gap-1.5">
          <span className="inline-block size-1.5 rounded-full bg-[#FF3B30]" />
          {error}
        </p>
      )}
    </div>
  );
}

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
    weak: 'bg-[#FF3B30]',
    ok: 'bg-[#FF9500]',
    strong: 'bg-[#34C759]',
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
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(admin.email)) e.email = t.invalidEmail;
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
    <div className="space-y-6 sm:space-y-7">
      <div className="space-y-1.5">
        <h2 className="text-[21px] sm:text-[24px] font-semibold tracking-tight text-[#1D1D1F] leading-[1.2]">
          {t.accountTitle}
        </h2>
        <p className="text-[13px] sm:text-[13.5px] text-[#6E6E73] leading-[1.55]">
          {t.accountSubtitle}
        </p>
      </div>

      <div className="space-y-3.5 sm:space-y-4.5">
        <Field label={t.fieldName} error={errors.name}>
          <Input
            type="text"
            value={admin.name}
            onChange={(e) => {
              setAdmin({ name: e.target.value });
              if (errors.name) setErrors((p) => ({ ...p, name: '' }));
            }}
            placeholder={t.fieldNamePh}
            aria-invalid={!!errors.name}
            autoComplete="name"
            className="h-11 bg-white/70 border-black/[0.08] focus-visible:border-[#0071E3] focus-visible:ring-[#0071E3]/20 text-[14px]"
          />
        </Field>
        <Field label={t.fieldEmail} error={errors.email}>
          <Input
            type="email"
            value={admin.email}
            onChange={(e) => {
              setAdmin({ email: e.target.value });
              if (errors.email) setErrors((p) => ({ ...p, email: '' }));
            }}
            placeholder={t.fieldEmailPh}
            aria-invalid={!!errors.email}
            autoComplete="email"
            className="h-11 bg-white/70 border-black/[0.08] focus-visible:border-[#0071E3] focus-visible:ring-[#0071E3]/20 text-[14px]"
          />
        </Field>
        <Field label={t.fieldPassword} error={errors.password}>
          <Input
            type="password"
            value={admin.password}
            onChange={(e) => {
              setAdmin({ password: e.target.value });
              if (errors.password) setErrors((p) => ({ ...p, password: '' }));
            }}
            placeholder={t.fieldPasswordPh}
            aria-invalid={!!errors.password}
            autoComplete="new-password"
            className="h-11 bg-white/70 border-black/[0.08] focus-visible:border-[#0071E3] focus-visible:ring-[#0071E3]/20 text-[14px]"
          />
          {admin.password && !errors.password && (
            <div className="mt-2 space-y-1.5">
              <div className="h-1 w-full rounded-full bg-black/[0.06] overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${strengthColor[pwdEval.strength]} ${strengthWidth[pwdEval.strength]}`}
                />
              </div>
              <p className="text-[11px] text-[#86868B] flex items-center gap-1.5">
                {pwdEval.strength === 'strong' && (
                  <Check size={10} className="text-[#34C759]" strokeWidth={3} />
                )}
                {pwdEval.strength === 'strong'
                  ? t.passwordStrong
                  : pwdEval.strength === 'ok'
                    ? t.passwordOk
                    : t.passwordWeak}
                <span className="text-[#AEAEB2]">·</span>
                {t.passwordHint}
              </p>
            </div>
          )}
        </Field>
        <Field label={t.fieldConfirm} error={errors.confirm}>
          <Input
            type="password"
            value={admin.confirm}
            onChange={(e) => {
              setAdmin({ confirm: e.target.value });
              if (errors.confirm) setErrors((p) => ({ ...p, confirm: '' }));
            }}
            placeholder={t.fieldConfirmPh}
            aria-invalid={!!errors.confirm}
            autoComplete="new-password"
            className="h-11 bg-white/70 border-black/[0.08] focus-visible:border-[#0071E3] focus-visible:ring-[#0071E3]/20 text-[14px]"
          />
        </Field>
      </div>

      <div className="flex gap-2.5 sm:gap-3 pt-1.5 sm:pt-2">
        <Button
          variant="outline"
          onClick={() => setStep(1)}
          className="h-11 sm:h-12 flex-1 border-black/[0.08] hover:bg-black/[0.03] text-[14px] sm:text-[14.5px]"
        >
          <ArrowLeft size={14} className="sm:hidden" />
          <ArrowLeft size={15} className="hidden sm:block" />
          {t.back}
        </Button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="h-11 sm:h-12 flex-1 rounded-xl text-white text-[14px] sm:text-[14.5px] font-semibold inline-flex items-center justify-center gap-1.5 active:scale-[0.99] transition-all duration-150 disabled:opacity-60"
          style={{
            background: 'linear-gradient(180deg, #0091FF 0%, #0066CC 100%)',
            boxShadow:
              '0 4px 14px -2px rgba(0, 113, 227, 0.4), 0 1px 2px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          }}
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin sm:hidden" />
              <Loader2 size={15} className="animate-spin hidden sm:block" />
              {t.creating}
            </>
          ) : (
            <>
              {t.create}
              <ArrowRight size={14} className="ml-0.5 sm:hidden" />
              <ArrowRight size={15} className="ml-0.5 hidden sm:block" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
