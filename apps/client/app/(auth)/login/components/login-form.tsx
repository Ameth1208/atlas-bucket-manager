'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const router = useRouter();
  const qc = useQueryClient();
  const { setUser } = useAppStore();
  const { t, tx } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = t.required;
    else if (!EMAIL_RE.test(email.trim())) newErrors.email = t.invalidEmail;
    if (!password) newErrors.password = t.required;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { user } = await api.auth.login({ email: email.trim(), password });
      setUser(user);
      qc.invalidateQueries();
      toast.success(t.authLoginWelcome, { description: tx('authLoginWelcomeDesc', { name: user.name }) });
      router.push('/dashboard');
    } catch (err) {
      toast.error(t.authLoginError, { description: err instanceof Error ? err.message : '' });
    } finally {
      setLoading(false);
    }
  };

  const errorMessage = errors.email || errors.password;

  return (
    <form onSubmit={submit} className="w-full space-y-3.5">
      {/* Apple Inset Grouped Container */}
      <div className={`w-full rounded-[16px] bg-[#1c1c1e] border ${errorMessage ? 'border-[#ff453a] ring-2 ring-[#ff453a]/25' : 'border-white/[0.1] focus-within:border-[#0a84ff] focus-within:ring-4 focus-within:ring-[#0a84ff]/20'} overflow-hidden divide-y divide-white/[0.08] transition-all shadow-[0_2px_12px_rgba(0,0,0,0.5)]`}>
        {/* Email row */}
        <div className="relative flex items-center px-4 h-[50px]">
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => {
              setEmail(e.target.value);
              if (errors.email) setErrors(p => ({ ...p, email: '' }));
            }}
            placeholder={t.authLoginEmail}
            autoComplete="email"
            autoFocus
            className="w-full bg-transparent text-[15px] text-white placeholder:text-[#636366] outline-none font-normal tracking-[-0.01em]"
          />
        </div>

        {/* Password row */}
        <div className="relative flex items-center px-4 h-[50px]">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => {
              setPassword(e.target.value);
              if (errors.password) setErrors(p => ({ ...p, password: '' }));
            }}
            placeholder={t.authLoginPassword}
            autoComplete="current-password"
            className="w-full bg-transparent text-[15px] text-white placeholder:text-[#636366] outline-none font-normal tracking-[-0.01em] pr-8"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? t.uiHidePassword : t.uiShowPassword}
            className="absolute right-3.5 text-[#86868b] hover:text-white transition-colors cursor-pointer p-1"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Error feedback */}
      {errorMessage && (
        <p className="text-[12px] text-[#ff453a] text-center font-normal tracking-[-0.01em] animate-in fade-in-50">
          {errorMessage}
        </p>
      )}

      {/* Apple Pill Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-[46px] rounded-full bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.98] text-white text-[14.5px] font-medium tracking-[-0.01em] transition-all flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(0,113,227,0.32)] cursor-pointer disabled:opacity-50 mt-2"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-white" />
        ) : (
          <>
            <span>{t.authLoginSubmit}</span>
            <ArrowRight size={15} />
          </>
        )}
      </button>
    </form>
  );
}
