'use client';

import { useState, type CSSProperties } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import US from 'country-flag-icons/react/3x2/US';
import ES from 'country-flag-icons/react/3x2/ES';
import BR from 'country-flag-icons/react/3x2/BR';
import { LOCALES, type Locale } from '@/lib/i18n/types';
import { useI18n } from '@/lib/i18n';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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
  const current = useI18n().meta;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <button
          type="button"
          aria-label={t.languageLabel}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={`inline-flex items-center gap-1.5 h-8 pl-1.5 pr-2.5 rounded-full border border-black/[0.08] bg-canvas text-foreground hover:border-black/[0.15] hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)] active:scale-95 transition-all duration-150 ${className}`}
        >
          <span className="inline-block w-5 h-3.5 rounded-[2px] overflow-hidden ring-1 ring-black/[0.08]">
            <Flag
              code={current.flagCode}
              style={{ width: '100%', height: '100%', display: 'block' }}
            />
          </span>
          <span className="text-[12px] font-semibold tracking-wide uppercase text-foreground/80">
            {locale}
          </span>
          <ChevronDown
            size={11}
            strokeWidth={2.5}
            className={`text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[200px] p-1 rounded-xl border border-border bg-popover shadow-[0_8px_24px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04)]"
      >
        <div role="listbox" aria-label={t.languageLabel}>
          {LOCALES.map((l: Locale) => {
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
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] transition-colors ${
                  active
                    ? 'bg-secondary text-foreground'
                    : 'text-popover-foreground hover:bg-muted'
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
                  <Check size={14} strokeWidth={2.5} className="ml-auto text-foreground" />
                )}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
