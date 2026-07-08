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
    { icon: Database, text: t.featBuckets },
    { icon: Cloud, text: t.featProviders },
    { icon: Key, text: t.featApiKeys },
    { icon: Users, text: t.featUsers },
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
        {features.map(({ icon: Icon, text }, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 p-3 rounded-xl border border-transparent hover:border-black/[0.05] hover:bg-black/[0.015] transition-colors duration-150"
          >
            <div className="shrink-0 size-7 rounded-md bg-[#0071E3]/8 flex items-center justify-center text-[#0071E3]">
              <Icon size={14} strokeWidth={1.8} />
            </div>
            <p className="text-[12.5px] text-[#3C3C43] leading-snug pt-0.5">
              {text}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-2 pt-1">
        <Button
          onClick={onNext}
          className="group w-full h-11 bg-[#0071E3] hover:bg-[#0066CC] text-white rounded-lg text-[14.5px] font-medium active:scale-[0.99] transition-all duration-150"
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
