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
    <div className="space-y-5 sm:space-y-6">
      <div className="text-center space-y-1.5">
        <h2 className="text-[22px] sm:text-[26px] md:text-[28px] font-semibold text-[#1D1D1F] tracking-tight leading-[1.15]">
          {t.welcomeTitle}
        </h2>
        <p className="text-[12.5px] sm:text-[13.5px] text-[#6E6E73] leading-[1.5] max-w-[360px] mx-auto">
          {t.welcomeDescription}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
        {features.map(({ icon: Icon, text, accent }, i) => (
          <div
            key={i}
            className="group relative flex items-start gap-2 p-2.5 sm:p-3 rounded-xl border border-black/[0.05] bg-white/55 hover:bg-white/85 hover:border-black/[0.08] hover:shadow-[0_4px_14px_rgba(0,113,227,0.08)] transition-all duration-200 overflow-hidden aspect-[2.2/1] sm:aspect-[2.4/1]"
          >
            <div
              aria-hidden="true"
              className={`absolute inset-0 bg-gradient-to-br ${accent} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            />
            <div className="relative shrink-0 size-7 sm:size-8 rounded-lg bg-gradient-to-br from-cyan-500/15 to-[#0071E3]/15 flex items-center justify-center text-[#0071E3]">
              <Icon size={14} strokeWidth={1.8} className="sm:hidden" />
              <Icon size={15} strokeWidth={1.8} className="hidden sm:block" />
            </div>
            <p className="relative text-[12px] sm:text-[12.5px] text-[#3C3C43] leading-[1.35] line-clamp-2 self-stretch flex items-center">
              {text}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-1.5 pt-1">
        <Button
          onClick={onNext}
          className="group w-full h-11 sm:h-12 rounded-xl text-white text-[14px] sm:text-[15px] font-semibold active:scale-[0.99] transition-all duration-150"
          style={{
            background: 'linear-gradient(180deg, #0091FF 0%, #0066CC 100%)',
            boxShadow:
              '0 6px 18px -2px rgba(0, 113, 227, 0.45), 0 2px 4px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          }}
        >
          {t.welcomeCta}
          <ArrowRight
            size={16}
            className="ml-1.5 sm:ml-2 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Button>
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="w-full inline-flex items-center justify-center gap-1.5 h-7 sm:h-8 text-[12px] sm:text-[12.5px] text-[#6E6E73] hover:text-[#1D1D1F] transition-colors"
        >
          <LogIn size={11} strokeWidth={1.8} className="sm:hidden" />
          <LogIn size={12} strokeWidth={1.8} className="hidden sm:block" />
          {t.welcomeSkip}
        </button>
      </div>
    </div>
  );
}
