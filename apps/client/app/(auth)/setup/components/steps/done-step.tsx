'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Check, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

export function DoneStep() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <div className="text-center space-y-6 sm:space-y-8">
      <div className="mx-auto size-14 sm:size-16 rounded-full bg-success/10 flex items-center justify-center">
        <Check size={26} strokeWidth={2.5} className="text-success" />
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <h2 className="text-[24px] sm:text-[32px] font-semibold text-foreground tracking-[-0.02em] leading-[1.1] text-balance">
          {t.doneTitle}
        </h2>
        <p className="text-[15px] sm:text-[17px] text-muted-foreground leading-[1.47] max-w-[340px] mx-auto text-pretty">
          {t.doneDescription}
        </p>
      </div>

      <div className="text-left p-3 sm:p-4 rounded-[14px] sm:rounded-[18px] bg-muted border border-border flex gap-3">
        <div className="shrink-0 size-8 sm:size-9 rounded-[10px] sm:rounded-[11px] bg-warning/10 text-warning flex items-center justify-center">
          <Lightbulb size={16} strokeWidth={1.8} />
        </div>
        <div className="space-y-0.5">
          <p className="text-[14px] sm:text-[15px] font-semibold text-foreground">{t.tipTitle}</p>
          <p className="text-[12px] sm:text-[13px] text-muted-foreground leading-[1.5] text-pretty">
            {t.tipDescription}
          </p>
        </div>
      </div>

      <Button
        onClick={() => router.push('/dashboard')}
        className="w-full"
      >
        {t.goDashboard}
        <ArrowRight size={16} className="ml-1.5" />
      </Button>
    </div>
  );
}
