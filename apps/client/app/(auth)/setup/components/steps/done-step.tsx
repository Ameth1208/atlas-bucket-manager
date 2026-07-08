'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lightbulb, Check } from 'lucide-react';
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
      className={`text-center py-2 space-y-6 transition-all duration-500 ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <div className="mx-auto w-14 h-14 rounded-full bg-[#34C759] flex items-center justify-center shadow-[0_4px_12px_rgba(52,199,89,0.3)]">
        <Check size={26} strokeWidth={2.5} className="text-white" />
      </div>

      <div className="space-y-1.5">
        <h2 className="text-[24px] font-semibold text-[#1D1D1F] tracking-tight">
          {t.doneTitle}
        </h2>
        <p className="text-[13.5px] text-[#6E6E73] leading-relaxed max-w-[320px] mx-auto">
          {t.doneDescription}
        </p>
      </div>

      <div className="text-left p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FCD34D]/30 flex gap-3">
        <div className="shrink-0 size-7 rounded-md bg-[#FF9500]/10 flex items-center justify-center text-[#FF9500]">
          <Lightbulb size={14} strokeWidth={1.8} />
        </div>
        <div className="space-y-0.5">
          <p className="text-[12.5px] font-semibold text-[#92400E]">{t.tipTitle}</p>
          <p className="text-[12px] text-[#6E6E73] leading-relaxed">{t.tipDescription}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => router.push('/dashboard')}
        className="group w-full h-11 rounded-lg bg-[#0071E3] hover:bg-[#0066CC] text-white text-[14.5px] font-medium inline-flex items-center justify-center gap-1.5 active:scale-[0.99] transition-all duration-150"
      >
        {t.goDashboard}
        <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}
