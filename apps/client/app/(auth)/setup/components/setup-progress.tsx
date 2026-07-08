import { Check } from 'lucide-react';
import { useSetupStore, SetupStep } from '../store';

const STEP_LABELS = {
  1: 'Bienvenida',
  2: 'Cuenta',
  3: 'Listo',
} as const;

export function SetupProgress() {
  const { step } = useSetupStore();
  const steps: SetupStep[] = [1, 2, 3];

  return (
    <div className="flex items-center justify-center gap-1">
      {steps.map((num, i) => {
        const done = num < step;
        const active = num === step;
        const isLast = i === steps.length - 1;

        return (
          <div key={num} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`size-5 rounded-full flex items-center justify-center transition-all duration-200 ${done
                  ? 'bg-[#0071E3]'
                  : active
                    ? 'bg-[#1D1D1F]'
                    : 'bg-[#D2D2D7]'
                  }`}
              >
                {done ? (
                  <Check size={8} strokeWidth={3} className="text-white" aria-hidden="true" />
                ) : (
                  <span className={`text-[10px] font-semibold ${done || active ? 'text-white' : 'text-[#86868B]'}`}>
                    {num}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium hidden sm:block ${active ? 'text-[#1D1D1F]' : 'text-[#86868B]'
                  }`}
              >
                {STEP_LABELS[num]}
              </span>
            </div>

            {!isLast && (
              <div
                className={`w-6 h-0.5 mx-2 transition-colors duration-300 rounded-full ${done ? 'bg-[#0071E3]' : 'bg-[#D2D2D7]'
                  }`}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}