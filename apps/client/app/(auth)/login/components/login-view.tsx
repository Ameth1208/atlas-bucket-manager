'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useI18n } from '@/lib/i18n';
import { LoginForm } from './login-form';
import { AtlasLogo } from '@/components/ui/atlas-logo';

export function LoginView() {
  const { t } = useI18n();

  return (
    <main className="min-h-dvh w-dvw flex flex-col items-center justify-between bg-black text-white px-4 py-6 relative overflow-x-hidden select-none">
      {/* Top bar with language switcher */}
      <header className="w-full max-w-5xl flex justify-end items-center h-10">
        <LanguageSwitcher />
      </header>

      {/* Center column: Authentic Apple Sign-In layout */}
      <div className="w-full max-w-[340px] flex flex-col items-center my-auto">
        {/* Atlas Titan Logo */}
        <div className="mb-5 flex items-center justify-center">
          <AtlasLogo size={68} className="drop-shadow-[0_4px_24px_rgba(10,132,255,0.45)]" />
        </div>

        {/* Headings */}
        <div className="text-center mb-6 space-y-1.5">
          <h1 className="text-[25px] sm:text-[27px] font-semibold text-white tracking-[-0.035em] leading-tight">
            Atlas Bucket Manager
          </h1>
          <p className="text-[14px] text-[#86868b] font-normal tracking-[-0.015em] text-pretty">
            {t.authLoginDescription}
          </p>
        </div>

        {/* Apple Inset Form */}
        <LoginForm />

        {/* Secondary Action */}
        <div className="mt-6 text-center">
          <Link
            href="/setup"
            className="text-[13px] font-normal text-[#2997ff] hover:text-[#52adff] hover:underline transition-colors"
          >
            {t.authLoginSetupCta} &rarr;
          </Link>
        </div>
      </div>

      {/* Apple-style Privacy Footnote */}
      <footer className="w-full max-w-[420px] text-center space-y-1 py-2">
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#86868b]">
          <Lock size={11} className="text-[#86868b]" />
          <span>Credenciales y datos procesados de forma local y privada.</span>
        </div>
        <p className="text-[10.5px] text-[#48484a] tracking-wide">
          Atlas Bucket Manager &bull; v2.0.4
        </p>
      </footer>
    </main>
  );
}
