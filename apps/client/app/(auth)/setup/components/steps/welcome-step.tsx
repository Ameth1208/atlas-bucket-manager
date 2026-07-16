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
    <div className="flex flex-col items-center text-center">
      <div className="space-y-1 sm:space-y-2 mb-4 sm:mb-6">
        <h2 className="text-[28px] sm:text-[40px] font-semibold text-foreground leading-[1.10] text-balance">
          {t.welcomeTitle}
        </h2>
        <p className="text-[17px] sm:text-[21px] text-muted-foreground font-normal leading-[1.47] sm:leading-[1.19] max-w-[340px] mx-auto text-pretty">
          {t.welcomeSubtitle}
        </p>
      </div>

      <div className="w-full mb-4 sm:mb-6">
        <div className="grid grid-cols-2 sm:flex sm:flex-col gap-2">
          {features.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-[11px] bg-muted border border-divider-soft"
            >
              <div className="shrink-0 size-7 sm:size-8 rounded-[8px] bg-muted text-muted-foreground flex items-center justify-center">
                <Icon size={15} strokeWidth={1.8} />
              </div>
              <p className="text-[12px] sm:text-[14px] text-ink-muted-80 leading-[1.43] tracking-[-0.224px] text-pretty">
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full space-y-3">
        <Button onClick={onNext} className="w-full">
          {t.welcomeCta}
          <ArrowRight size={17} className="ml-1.5" />
        </Button>

        <button
          type="button"
          onClick={() => router.push('/login')}
          className="w-full h-10 inline-flex items-center justify-center gap-1.5 text-[15px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogIn size={14} strokeWidth={1.8} />
          {t.welcomeSkip}
        </button>
      </div>
    </div>
  );
}
