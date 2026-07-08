'use client';

import { useEffect, useState } from 'react';
import { Logo } from '@/components/ui/logo';
import { LanguageSwitcher } from '@/components/language-switcher';
import { SetupProgress } from './setup-progress';
import { WelcomeStep } from './steps/welcome-step';
import { AccountStep } from './steps/account-step';
import { DoneStep } from './steps/done-step';
import { useSetupStore } from '../store';
import { useI18n } from '@/lib/i18n';

export function SetupCard() {
  const { step, setStep } = useSetupStore();
  const { tx } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative w-full max-w-[460px] mx-auto">
      {/* Language switcher — floats over the card top-right */}
      <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 z-10">
        <LanguageSwitcher />
      </div>

      {/* Card — glass with cyan-tinted soft shadows */}
      <div
        className={`relative rounded-3xl border border-white/70 bg-white/80 backdrop-blur-2xl overflow-hidden transition-all duration-500 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
        style={{
          boxShadow:
            '0 24px 48px -12px rgba(8, 145, 178, 0.14), 0 10px 24px -8px rgba(15, 23, 42, 0.05), 0 1px 0 rgba(255, 255, 255, 0.8) inset',
        }}
      >
        <div className="px-7 sm:px-9 pt-8 pb-7">
          {/* Header */}
          <div className="flex flex-col items-center text-center gap-2 mb-6">
            <div className="flex items-center gap-2.5">
              <Logo size="md" showText />
            </div>
            <p className="text-[12.5px] text-[#6E6E73] mt-0.5">
              {tx('cardSubtitle', { step })}
            </p>
          </div>

          {/* Progress */}
          <div className="mb-7">
            <SetupProgress />
          </div>

          {/* Step content — animated switch */}
          <div className="relative min-h-[300px]">
            <div
              key={step}
              className="animate-[step-in_360ms_cubic-bezier(0.22,1,0.36,1)]"
              style={{ animationName: 'step-in' }}
            >
              {step === 1 && <WelcomeStep onNext={() => setStep(2)} />}
              {step === 2 && <AccountStep />}
              {step === 3 && <DoneStep />}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes step-in {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
