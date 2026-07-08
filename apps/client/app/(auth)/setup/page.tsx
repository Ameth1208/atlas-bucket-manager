'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { SetupCard } from './components';
import { useI18n } from '@/lib/i18n';

export default function SetupPage() {
  const router = useRouter();
  const { meta } = useI18n();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    document.documentElement.lang = meta.htmlLang;
  }, [meta.htmlLang]);

  useEffect(() => {
    let cancelled = false;
    api.auth.status()
      .then(({ isSetup }) => {
        if (cancelled) return;
        if (isSetup) router.replace('/dashboard');
        else setChecking(false);
      })
      .catch(() => { if (!cancelled) setChecking(false); });
    return () => { cancelled = true; };
  }, [router]);

  return (
    <main
      className="relative min-h-dvh w-dvw flex items-center justify-center overflow-x-hidden overflow-y-auto py-6 sm:py-8"
      style={{
        background:
          'radial-gradient(ellipse 90% 70% at 50% -10%, #DBEAFE 0%, #EFF6FF 35%, #F8FAFC 70%, #F1F5F9 100%)',
      }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-cyan-200/50 to-blue-300/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-40 w-[560px] h-[560px] rounded-full bg-gradient-to-tl from-indigo-200/40 to-purple-200/20 blur-3xl" />
        <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-blue-100/30 to-cyan-100/30 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(8, 51, 68, 0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(8, 51, 68, 0.6) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            maskImage:
              'radial-gradient(ellipse 70% 60% at 50% 50%, black 0%, transparent 80%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 70% 60% at 50% 50%, black 0%, transparent 80%)',
          }}
        />
      </div>

      <div className="relative w-full px-4 sm:px-5 flex items-center justify-center">
        {checking ? (
          <span className="w-7 h-7 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin" />
        ) : (
          <SetupCard />
        )}
      </div>
    </main>
  );
}
