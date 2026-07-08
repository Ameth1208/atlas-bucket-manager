'use client';

import { Languages } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LOCALES, LOCALE_META, type Locale } from '@/lib/i18n/types';
import { useI18n } from '@/lib/i18n';

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { locale, setLocale, t, meta } = useI18n();
  const [open, setOpen] = useState(false);

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
    <div data-lang-switcher className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t.languageLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/70 backdrop-blur-md border border-black/[0.06] text-[#6E6E73] hover:bg-white hover:text-[#1D1D1F] hover:border-black/[0.1] hover:shadow-sm active:scale-95 transition-all duration-150"
      >
        <Languages size={14} strokeWidth={1.8} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t.languageLabel}
          className="absolute right-0 top-full mt-2 min-w-[160px] py-1 rounded-xl bg-white/95 backdrop-blur-xl border border-black/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04)] overflow-hidden z-50 origin-top-right animate-[lang-pop_120ms_ease-out]"
          style={{ animationName: 'lang-pop' }}
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
                <span className="text-base leading-none" aria-hidden="true">
                  {m.flag}
                </span>
                <span className="font-medium">{m.label}</span>
                {active && (
                  <span className="ml-auto text-[10px] uppercase tracking-wider text-[#0071E3] font-semibold">
                    ✓
                  </span>
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
