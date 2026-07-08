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
    { icon: Database, text: t.featBuckets, accent: 'from-cyan-500/20 to-cyan-500/5' },
    { icon: Cloud, text: t.featProviders, accent: 'from-blue-500/20 to-blue-500/5' },
    { icon: Key, text: t.featApiKeys, accent: 'from-indigo-500/20 to-indigo-500/5' },
    { icon: Users, text: t.featUsers, accent: 'from-purple-500/20 to-purple-500/5' },
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

      <div className="grid grid-cols-2 gap-2.5">
        {features.map(({ icon: Icon, text, accent }, i) => (
          <div
            key={i}
            className="group relative flex flex-col items-start gap-2.5 p-3.5 rounded-2xl border border-black/[0.04] bg-white/60 hover:bg-white hover:border-black/[0.08] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-200 overflow-hidden"
          >
            <div
              aria-hidden="true"
              className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            />
            <div className="relative size-8 rounded-lg bg-gradient-to-br from-[#0071E3]/10 to-cyan-500/10 flex items-center justify-center text-[#0071E3]">
              <Icon size={16} strokeWidth={1.8} />
            </div>
            <p className="relative text-[12.5px] text-[#3C3C43] leading-snug font-medium">
              {text}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-2 pt-1">
        <Button
          onClick={onNext}
          className="group w-full h-11 bg-gradient-to-b from-[#0088FF] to-[#0066CC] hover:from-[#0077ED] hover:to-[#005BBF] text-white rounded-xl text-[14.5px] font-semibold shadow-[0_4px_12px_rgba(0,113,227,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] active:scale-[0.985] transition-all duration-150"
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
