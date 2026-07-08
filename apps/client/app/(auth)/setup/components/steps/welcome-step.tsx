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
    <div className="space-y-7">
      <div className="text-center space-y-2">
        <h2 className="text-[26px] sm:text-[28px] font-semibold text-[#1D1D1F] tracking-tight leading-tight">
          {t.welcomeTitle}
        </h2>
        <p className="text-[14px] text-[#6E6E73] leading-relaxed max-w-[340px] mx-auto">
          {t.welcomeDescription}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {features.map(({ icon: Icon, text, accent }, i) => (
          <div
            key={i}
            className="group relative flex items-start gap-2.5 p-3 rounded-xl border border-black/[0.05] bg-white/50 hover:bg-white/80 hover:border-black/[0.08] hover:shadow-[0_4px_12px_rgba(0,113,227,0.06)] transition-all duration-200 overflow-hidden"
          >
            <div
              aria-hidden="true"
              className={`absolute inset-0 bg-gradient-to-br ${accent} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            />
            <div className="relative size-7 rounded-md bg-gradient-to-br from-cyan-500/15 to-[#0071E3]/15 flex items-center justify-center text-[#0071E3]">
              <Icon size={14} strokeWidth={1.8} />
            </div>
            <p className="relative text-[12.5px] text-[#3C3C43] leading-snug pt-0.5">
              {text}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-2 pt-1">
        <Button
          onClick={onNext}
          className="group w-full h-11 rounded-xl text-white text-[14.5px] font-semibold active:scale-[0.99] transition-all duration-150"
          style={{
            background: 'linear-gradient(180deg, #0091FF 0%, #0066CC 100%)',
            boxShadow:
              '0 6px 16px -2px rgba(0, 113, 227, 0.4), 0 2px 4px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          }}
        >
          {t.welcomeCta}
          <ArrowRight
            size={16}
            className="ml-1.5 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Button>
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="w-full inline-flex items-center justify-center gap-1.5 h-8 text-[12.5px] text-[#6E6E73] hover:text-[#1D1D1F] transition-colors"
        >
          <LogIn size={12} strokeWidth={1.8} />
          {t.welcomeSkip}
        </button>
      </div>
    </div>
  );
}
