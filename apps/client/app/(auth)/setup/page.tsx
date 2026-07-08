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
    <main className="relative min-h-dvh w-dvw flex items-center justify-center overflow-x-hidden overflow-y-auto px-4 py-6 sm:px-6 sm:py-10">
      {/* Soft, single ambient gradient — no orbs competing with the card */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 100% 80% at 50% 0%, #E0F2FE 0%, #F0F9FF 30%, #F8FAFC 70%, #F1F5F9 100%)',
        }}
      />

      <div className="relative w-full max-w-[460px] sm:max-w-[480px] md:max-w-[520px] flex items-center justify-center">
        {checking ? (
          <span className="w-7 h-7 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin" />
        ) : (
          <SetupCard />
        )}
      </div>
    </main>
  );
}
