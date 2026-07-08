'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Database, Cloud, Key, Users, LogIn } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useRouter } from 'next/navigation';

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const { t } = useI18n();
  const router = useRouter();

  const features = [
    { icon: Database, text: t.featBuckets, accent: 'from-cyan-500/20' },
    { icon: Cloud, text: t.featProviders, accent: 'from-blue-500/20' },
    { icon: Key, text: t.featApiKeys, accent: 'from-indigo-500/20' },
    { icon: Users, text: t.featUsers, accent: 'from-purple-500/20' },
  ];

  return (
    <div className="space-y-9">
      <div className="text-center space-y-3">
        <h2 className="text-[28px] sm:text-[30px] font-semibold text-[#1D1D1F] tracking-tight leading-[1.15]">
          {t.welcomeTitle}
        </h2>
        <p className="text-[14.5px] text-[#6E6E73] leading-[1.55] max-w-[360px] mx-auto">
          {t.welcomeDescription}
        </p>
      </div>

      <div className="space-y-2.5">
        {features.map(({ icon: Icon, text, accent }, i) => (
          <div
            key={i}
            className="group relative flex items-center gap-3.5 p-3.5 rounded-2xl border border-black/[0.05] bg-white/55 hover:bg-white/85 hover:border-black/[0.08] hover:shadow-[0_4px_14px_rgba(0,113,227,0.08)] transition-all duration-200 overflow-hidden"
          >
            <div
              aria-hidden="true"
              className={`absolute inset-0 bg-gradient-to-br ${accent} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            />
            <div className="relative shrink-0 size-9 rounded-lg bg-gradient-to-br from-cyan-500/15 to-[#0071E3]/15 flex items-center justify-center text-[#0071E3]">
              <Icon size={16} strokeWidth={1.8} />
            </div>
            <p className="relative text-[13.5px] text-[#3C3C43] leading-snug">
              {text}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-2">
        <Button
          onClick={onNext}
          className="group w-full h-12 rounded-xl text-white text-[15px] font-semibold active:scale-[0.99] transition-all duration-150"
          style={{
            background: 'linear-gradient(180deg, #0091FF 0%, #0066CC 100%)',
            boxShadow:
              '0 6px 18px -2px rgba(0, 113, 227, 0.45), 0 2px 4px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          }}
        >
          {t.welcomeCta}
          <ArrowRight
            size={17}
            className="ml-2 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Button>
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="w-full inline-flex items-center justify-center gap-1.5 h-8 text-[13px] text-[#6E6E73] hover:text-[#1D1D1F] transition-colors"
        >
          <LogIn size={12} strokeWidth={1.8} />
          {t.welcomeSkip}
        </button>
      </div>
    </div>
  );
}
