'use client';

import { Logo } from '@/components/ui/logo';
import { SetupProgress } from './setup-progress';
import { WelcomeStep } from './steps/welcome-step';
import { AccountStep } from './steps/account-step';
import { DoneStep } from './steps/done-step';
import { useSetupStore } from '../store';

export function SetupCard() {
  const { step, setStep } = useSetupStore();

  return (
    <div className="relative w-full max-w-[440px]">
      <div className="relative rounded-[18px] border border-border bg-card overflow-hidden">
        <div className="px-4 py-5 sm:px-8 sm:py-10">
          <div className="flex justify-center mb-4 sm:mb-6">
            <Logo size="sm" showText />
          </div>

          <div className="mb-4 sm:mb-6">
            <SetupProgress />
          </div>

          <div>
            {step === 1 && <WelcomeStep onNext={() => setStep(2)} />}
            {step === 2 && <AccountStep />}
            {step === 3 && <DoneStep />}
          </div>
        </div>
      </div>
    </div>
  );
}
