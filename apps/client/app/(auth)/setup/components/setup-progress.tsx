'use client';

import { Check } from 'lucide-react';
import { useSetupStore, type SetupStep } from '../store';
import { useI18n } from '@/lib/i18n';

export function SetupProgress() {
  const { step } = useSetupStore();
  const { t } = useI18n();
  const labels: Record<SetupStep, string> = {
    1: t.stepWelcome,
    2: t.stepAccount,
    3: t.stepDone,
  };
  const steps: SetupStep[] = [1, 2, 3];

  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((num, i) => {
        const done = num < step;
        const active = num === step;
        const isLast = i === steps.length - 1;

        return (
          <div key={num} className="flex items-center">
            <div className="flex flex-col items-center gap-2 min-w-[68px]">
              <div className="relative">
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute -inset-1.5 rounded-full bg-[#0071E3]/15 blur-md"
                  />
                )}
                <div
                  className={`relative size-7 rounded-full flex items-center justify-center text-[12px] font-semibold transition-all duration-300 ${
                    done
                      ? 'bg-gradient-to-br from-cyan-500 to-[#0071E3] text-white shadow-[0_2px_8px_rgba(0,113,227,0.4)]'
                      : active
                        ? 'bg-[#1D1D1F] text-white scale-110 shadow-[0_2px_10px_rgba(0,0,0,0.2)]'
                        : 'bg-[#E8E8ED] text-[#86868B]'
                  }`}
                >
                  {done ? <Check size={12} strokeWidth={3} className="text-white" /> : num}
                </div>
              </div>
              <span
                className={`text-[11px] font-medium tracking-tight transition-colors duration-200 ${
                  active ? 'text-[#1D1D1F]' : done ? 'text-[#0071E3]' : 'text-[#86868B]'
                }`}
              >
                {labels[num]}
              </span>
            </div>

            {!isLast && (
              <div className="relative w-12 h-0.5 mx-1.5 mb-6 rounded-full bg-[#E8E8ED] overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-500 to-[#0071E3] transition-all duration-500 ${
                    done ? 'w-full' : 'w-0'
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
