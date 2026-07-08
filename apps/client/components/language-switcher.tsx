'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { LOCALES, LOCALE_META, type Locale } from '@/lib/i18n/types';
import { useI18n } from '@/lib/i18n';

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const current = LOCALE_META[locale];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-lang-switcher]')) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <div data-lang-switcher ref={wrapperRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t.languageLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 h-8 pl-1.5 pr-2.5 rounded-full border border-black/[0.08] bg-white text-[#1D1D1F] hover:border-black/[0.15] hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)] active:scale-95 transition-all duration-150"
      >
        <span className="text-[15px] leading-none" aria-hidden="true">
          {current.flag}
        </span>
        <span className="text-[12px] font-semibold tracking-wide uppercase text-[#3C3C43]">
          {locale}
        </span>
        <ChevronDown
          size={11}
          strokeWidth={2.5}
          className={`text-[#86868B] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t.languageLabel}
          className="absolute right-0 top-full mt-2 min-w-[180px] py-1 rounded-xl bg-white border border-black/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04)] overflow-hidden z-50 origin-top-right"
          style={{ animation: 'lang-pop 120ms ease-out' }}
        >
          {LOCALES.map((l: Locale) => {
            const m = LOCALE_META[l];
            const active = l === locale;
            return (
              <button
                key={l}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  setLocale(l);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] transition-colors ${
                  active
                    ? 'bg-[#0071E3]/8 text-[#0071E3]'
                    : 'text-[#1D1D1F] hover:bg-black/[0.04]'
                }`}
              >
                <span
                  className="text-[16px] leading-none inline-block w-5 text-center"
                  aria-hidden="true"
                >
                  {m.flag}
                </span>
                <span className="font-medium">{m.label}</span>
                {active && (
                  <Check size={14} strokeWidth={2.5} className="ml-auto text-[#0071E3]" />
                )}
              </button>
            );
          })}
        </div>
      )}

      <style jsx>{`
        @keyframes lang-pop {
          from {
            opacity: 0;
            transform: translateY(-4px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
