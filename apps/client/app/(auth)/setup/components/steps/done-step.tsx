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
          className="absolute inset-0 rounded-full bg-gradient-to-br from-[#34C759]/30 to-cyan-400/30 blur-xl"
        />
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#34C759] to-[#28A745] flex items-center justify-center shadow-[0_8px_20px_rgba(52,199,89,0.4),inset_0_1px_0_rgba(255,255,255,0.25)]">
          <Check size={28} strokeWidth={3} className="text-white" />
        </div>
        <Sparkles
          size={14}
          className="absolute -top-1 -right-1 text-[#FF9500]"
          style={{ animation: 'sparkle-pulse 2s ease-in-out infinite' }}
        />
        <Sparkles
          size={10}
          className="absolute -bottom-0.5 -left-1 text-[#0071E3]"
          style={{ animation: 'sparkle-pulse 2s ease-in-out infinite 0.6s' }}
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

      <div className="text-left p-3.5 rounded-2xl bg-gradient-to-br from-amber-50/80 to-orange-50/40 border border-amber-200/50 flex gap-3">
        <div className="shrink-0 size-7 rounded-md bg-gradient-to-br from-[#FF9500]/15 to-amber-500/15 flex items-center justify-center text-[#FF9500]">
          <Lightbulb size={14} strokeWidth={1.8} />
        </div>
        <div className="space-y-0.5">
          <p className="text-[12.5px] font-semibold text-[#8A6500]">{t.tipTitle}</p>
          <p className="text-[12px] text-[#6E6E73] leading-relaxed">{t.tipDescription}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => router.push('/dashboard')}
        className="group w-full h-11 rounded-xl text-white text-[14.5px] font-semibold inline-flex items-center justify-center gap-1.5 active:scale-[0.99] transition-all duration-150"
        style={{
          background: 'linear-gradient(180deg, #0091FF 0%, #0066CC 100%)',
          boxShadow:
            '0 6px 16px -2px rgba(0, 113, 227, 0.4), 0 2px 4px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        }}
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
