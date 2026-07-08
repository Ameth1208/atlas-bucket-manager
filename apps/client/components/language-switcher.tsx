'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import US from 'country-flag-icons/react/3x2/US';
import ES from 'country-flag-icons/react/3x2/ES';
import BR from 'country-flag-icons/react/3x2/BR';
import { LOCALES, type Locale } from '@/lib/i18n/types';
import { useI18n } from '@/lib/i18n';

const FLAG_COMPONENTS: Record<string, (props: { style?: CSSProperties; className?: string; title?: string }) => React.JSX.Element> = {
  US,
  ES,
  BR,
};

function Flag({ code, style, className }: { code: string; style?: CSSProperties; className?: string }) {
  const FlagComponent = FLAG_COMPONENTS[code] ?? US;
  return <FlagComponent style={style} className={className} title={code} />;
}

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const current = useI18n().meta;

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
        <span className="inline-block w-5 h-3.5 rounded-[2px] overflow-hidden ring-1 ring-black/[0.08]">
          <Flag
            code={current.flagCode}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
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
          className="absolute right-0 top-full mt-2 min-w-[200px] py-1 rounded-xl bg-white border border-black/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04)] overflow-hidden z-50 origin-top-right"
          style={{ animation: 'lang-pop 120ms ease-out' }}
        >
          {LOCALES.map((l: Locale) => {
            const m = current.flagCode; // local closure
            const mAll = useI18n().meta; // re-fetch for label
            const active = l === locale;
            const flag = (l === 'en' ? 'US' : l === 'es' ? 'ES' : 'BR');
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
                <span className="inline-block w-5 h-3.5 rounded-[2px] overflow-hidden ring-1 ring-black/[0.08] shrink-0">
                  <Flag
                    code={flag}
                    style={{ width: '100%', height: '100%', display: 'block' }}
                  />
                </span>
                <span className="font-medium">
                  {l === 'en' ? 'English' : l === 'es' ? 'Español' : 'Português'}
                </span>
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
