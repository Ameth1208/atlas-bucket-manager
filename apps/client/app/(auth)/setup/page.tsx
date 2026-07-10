'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { SetupCard } from './components';
import { LanguageSwitcher } from '@/components/language-switcher';
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
    <main className="light-setup relative min-h-dvh w-dvw overflow-x-hidden overflow-y-auto bg-background">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-20">
        <LanguageSwitcher />
      </div>

      <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-6 sm:px-8 sm:py-10">
        <div className="w-full max-w-[440px]">
          {checking ? (
            <span className="mx-auto block size-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <SetupCard />
          )}
        </div>
      </div>
    </main>
  );
}
