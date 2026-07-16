'use client';
import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import ES from 'country-flag-icons/react/3x2/ES';
import US from 'country-flag-icons/react/3x2/US';
import BR from 'country-flag-icons/react/3x2/BR';
import { useI18n, type Locale } from '@/lib/i18n';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const FLAGS: Record<Locale, React.ComponentType<{ className?: string }>> = { es: ES, en: US, pt: BR };
const LABELS: Record<Locale, string> = { es: 'Español', en: 'English', pt: 'Português' };
const CODES: Locale[] = ['es', 'en', 'pt'];

export function LanguageSelect({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const CurrentFlag = FLAGS[locale];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={(props) => (
          <button
            {...props}
            type="button"
            aria-label="Seleccionar idioma"
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-card hover:border-border-strong transition-colors w-full sm:w-56',
              className
            )}
          >
            <span className="w-5 h-3.5 rounded-[2px] overflow-hidden ring-1 ring-black/[0.08]">
              <CurrentFlag className="w-full h-full" />
            </span>
            <span className="text-sm font-medium text-foreground">{LABELS[locale]}</span>
            <ChevronDown size={14} className="text-muted-foreground ml-auto" />
          </button>
        )}
      />
      <PopoverContent className="w-56 p-1.5" align="start">
        <div className="space-y-0.5">
          {CODES.map(code => {
            const Flag = FLAGS[code];
            const active = code === locale;
            return (
              <button
                type="button"
                key={code}
                onClick={() => { setLocale(code); setOpen(false); }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left text-sm transition-colors',
                  active ? 'bg-primary/5 text-foreground' : 'hover:bg-muted'
                )}
              >
                <span className="w-5 h-3.5 rounded-[2px] overflow-hidden ring-1 ring-black/[0.08]">
                  <Flag className="w-full h-full" />
                </span>
                <span className="flex-1">{LABELS[code]}</span>
                {active && <Check size={14} className="text-primary" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
