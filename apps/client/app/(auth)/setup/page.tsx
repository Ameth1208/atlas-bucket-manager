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
    <main className="min-h-dvh w-dvw flex items-center justify-center bg-[#FAFAFB]">
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
