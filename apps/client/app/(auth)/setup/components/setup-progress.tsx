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
    <div className="flex items-center justify-center">
      {steps.map((num, i) => {
        const done = num < step;
        const active = num === step;
        const isLast = i === steps.length - 1;

        return (
          <div key={num} className="flex items-center">
            <div className="flex flex-col items-center gap-2 min-w-[76px]">
              <div
                className={`size-8 rounded-full flex items-center justify-center text-[13px] font-semibold transition-colors duration-150 ${
                  done
                    ? 'bg-foreground text-background'
                    : active
                      ? 'bg-foreground text-background'
                      : 'bg-card text-muted-foreground border border-border'
                }`}
              >
                {done ? <Check size={14} strokeWidth={2.5} /> : num}
              </div>
              <span
                className={`text-[11px] font-medium tracking-tight transition-colors duration-150 ${
                  active ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {labels[num]}
              </span>
            </div>

            {!isLast && (
              <div className="relative w-10 h-px mx-2 mb-5 bg-border overflow-hidden">
                <div
                  className={`absolute inset-0 bg-foreground transition-transform duration-150 origin-left ${
                    done ? 'scale-x-100' : 'scale-x-0'
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
