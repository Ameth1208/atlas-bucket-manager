'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import { SetupProgress } from './setup-progress';
import { WelcomeStep } from './steps/welcome-step';
import { AccountStep } from './steps/account-step';
import { DoneStep } from './steps/done-step';
import { useSetupStore } from '../store';

export function SetupCard() {
  const { step } = useSetupStore();

  return (
    <Card className="w-full max-w-95 mx-auto bg-white border border-[#D2D2D7]/50 rounded-2xl shadow-sm">
      <CardHeader className="pb-4 px-6 pt-5">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <div className="flex flex-col">
            <CardTitle className="text-[14px] text-[#1D1D1F] font-semibold">
              Configurar Atlas
            </CardTitle>
            <CardDescription className="text-[12px] text-[#86868B] mt-0.5">
              Paso {step} de 3
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-0">
        <div className="mb-6">
          <SetupProgress />
        </div>

        {step === 1 && <WelcomeStep onNext={() => useSetupStore.getState().setStep(2)} />}
        {step === 2 && <AccountStep />}
        {step === 3 && <DoneStep />}
      </CardContent>
    </Card>
  );
}