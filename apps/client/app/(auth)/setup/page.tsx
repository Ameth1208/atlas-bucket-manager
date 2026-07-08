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
      className="relative min-h-dvh w-dvw flex items-center justify-center overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 50% 0%, #DBEAFE 0%, #F0F7FF 25%, #F8F9FB 60%, #F5F5F7 100%)',
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-gradient-to-br from-cyan-200/40 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 -right-32 w-[520px] h-[520px] rounded-full bg-gradient-to-tl from-indigo-200/30 to-transparent blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(15,23,42,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.7) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative w-full px-5 py-10 flex items-center justify-center">
        {checking ? (
          <span className="w-7 h-7 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin" />
        ) : (
          <SetupCard />
        )}
      </div>
    </main>
  );
}
