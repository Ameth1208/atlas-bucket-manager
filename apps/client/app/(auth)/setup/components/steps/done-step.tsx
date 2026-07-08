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
      className={`text-center py-2 space-y-6 transition-all duration-500 ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <div className="relative mx-auto w-16 h-16">
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/30 to-[#34C759]/30 blur-xl"
        />
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#34C759] to-[#28A745] flex items-center justify-center shadow-[0_8px_24px_rgba(52,199,89,0.35),inset_0_1px_0_rgba(255,255,255,0.25)]">
          <Check size={28} strokeWidth={3} className="text-white" />
        </div>
        <Sparkles
          size={14}
          className="absolute -top-1 -right-1 text-[#FF9500] animate-[sparkle-pulse_2s_ease-in-out_infinite]"
        />
        <Sparkles
          size={10}
          className="absolute -bottom-0.5 -left-1 text-[#0071E3] animate-[sparkle-pulse_2s_ease-in-out_infinite_0.6s]"
        />
      </div>

      <div className="space-y-1.5">
        <h2 className="text-[24px] font-semibold text-[#1D1D1F] tracking-tight">
          {t.doneTitle}
        </h2>
        <p className="text-[13.5px] text-[#6E6E73] leading-relaxed max-w-[320px] mx-auto">
          {t.doneDescription}
        </p>
      </div>

      <div className="text-left p-3.5 rounded-2xl bg-gradient-to-br from-amber-50/80 to-orange-50/40 border border-amber-200/40 flex gap-3">
        <div className="shrink-0 size-8 rounded-lg bg-gradient-to-br from-[#FF9500]/15 to-amber-500/15 flex items-center justify-center text-[#FF9500]">
          <Lightbulb size={15} strokeWidth={1.8} />
        </div>
        <div className="space-y-0.5">
          <p className="text-[12.5px] font-semibold text-[#8A6500]">{t.tipTitle}</p>
          <p className="text-[12px] text-[#6E6E73] leading-relaxed">{t.tipDescription}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => router.push('/dashboard')}
        className="group w-full h-11 rounded-xl bg-gradient-to-b from-[#0088FF] to-[#0066CC] hover:from-[#0077ED] hover:to-[#005BBF] text-white text-[14.5px] font-semibold inline-flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(0,113,227,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] active:scale-[0.985] transition-all duration-150"
      >
        {t.goDashboard}
        <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
      </button>

      <style jsx>{`
        @keyframes sparkle-pulse {
          0%, 100% { opacity: 0.4; transform: scale(0.9) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.1) rotate(8deg); }
        }
      `}</style>
    </div>
  );
}
