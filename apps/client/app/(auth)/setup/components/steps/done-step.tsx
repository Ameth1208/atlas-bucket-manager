'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, Lightbulb, Check } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export function DoneStep() {
  const router = useRouter();
  const { t } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setShow(true), 60);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div
      className={`text-center space-y-6 sm:space-y-7 transition-all duration-500 ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <div className="relative mx-auto w-16 h-16 sm:w-[72px] sm:h-[72px]">
        <span
          aria-hidden="true"
          className="absolute -inset-2 rounded-full bg-gradient-to-br from-[#34C759]/30 to-cyan-400/30 blur-xl"
        />
        <div className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full bg-gradient-to-br from-[#34C759] to-[#28A745] flex items-center justify-center shadow-[0_8px_24px_rgba(52,199,89,0.45),inset_0_1px_0_rgba(255,255,255,0.25)]">
          <Check size={28} strokeWidth={3} className="text-white sm:hidden" />
          <Check size={32} strokeWidth={3} className="text-white hidden sm:block" />
        </div>
        <Sparkles
          size={13}
          className="absolute -top-1 -right-1 text-[#FF9500] sm:hidden"
          style={{ animation: 'sparkle-pulse 2s ease-in-out infinite' }}
        />
        <Sparkles
          size={15}
          className="absolute -top-1.5 -right-1.5 text-[#FF9500] hidden sm:block"
          style={{ animation: 'sparkle-pulse 2s ease-in-out infinite' }}
        />
        <Sparkles
          size={10}
          className="absolute -bottom-0.5 -left-1.5 text-[#0071E3] sm:hidden"
          style={{ animation: 'sparkle-pulse 2s ease-in-out infinite 0.6s' }}
        />
        <Sparkles
          size={11}
          className="absolute -bottom-1 -left-2 text-[#0071E3] hidden sm:block"
          style={{ animation: 'sparkle-pulse 2s ease-in-out infinite 0.6s' }}
        />
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <h2 className="text-[22px] sm:text-[26px] font-semibold text-[#1D1D1F] tracking-tight leading-[1.2]">
          {t.doneTitle}
        </h2>
        <p className="text-[13.5px] sm:text-[14px] text-[#6E6E73] leading-[1.55] max-w-[340px] mx-auto">
          {t.doneDescription}
        </p>
      </div>

      <div className="text-left p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-50/80 to-orange-50/40 border border-amber-200/50 flex gap-3 sm:gap-3.5">
        <div className="shrink-0 size-8 sm:size-9 rounded-md sm:rounded-lg bg-gradient-to-br from-[#FF9500]/15 to-amber-500/15 flex items-center justify-center text-[#FF9500]">
          <Lightbulb size={14} strokeWidth={1.8} className="sm:hidden" />
          <Lightbulb size={16} strokeWidth={1.8} className="hidden sm:block" />
        </div>
        <div className="space-y-0.5 sm:space-y-1 pt-0.5">
          <p className="text-[12.5px] sm:text-[13px] font-semibold text-[#92400E]">{t.tipTitle}</p>
          <p className="text-[12px] sm:text-[12.5px] text-[#6E6E73] leading-[1.5]">{t.tipDescription}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => router.push('/dashboard')}
        className="group w-full h-11 sm:h-12 rounded-xl text-white text-[14px] sm:text-[15px] font-semibold inline-flex items-center justify-center gap-1.5 active:scale-[0.99] transition-all duration-150"
        style={{
          background: 'linear-gradient(180deg, #0091FF 0%, #0066CC 100%)',
          boxShadow:
            '0 6px 18px -2px rgba(0, 113, 227, 0.45), 0 2px 4px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        }}
      >
        {t.goDashboard}
        <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5 sm:hidden" />
        <ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-0.5 hidden sm:block" />
      </button>
    </div>
  );
}
