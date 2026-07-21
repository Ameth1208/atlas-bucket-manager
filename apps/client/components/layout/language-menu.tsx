'use client';

import { Check, Globe, ChevronRight } from 'lucide-react';
import { Menu } from '@base-ui/react/menu';
import { LOCALES, LOCALE_META, type Locale } from '@/lib/i18n/types';
import { useI18n } from '@/lib/i18n';
import { Flag } from '@/components/ui/flag';

export function LanguageMenu() {
  const { locale, setLocale, t } = useI18n();

  return (
    <Menu.SubmenuRoot>
      <Menu.SubmenuTrigger className="group/sub flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-popover-foreground data-[highlighted]:bg-muted outline-none cursor-pointer w-full">
        <Globe size={14} className="text-muted-foreground shrink-0" />
        <span className="flex-1 text-left font-medium">{t.sidebarUserLanguage}</span>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground uppercase tracking-wide">
          <span className="inline-block w-4 h-2.5 rounded-[1.5px] overflow-hidden ring-1 ring-black/[0.08]">
            <Flag
              code={LOCALE_META[locale].flagCode}
              style={{ width: '100%', height: '100%', display: 'block' }}
            />
          </span>
          {LOCALE_META[locale].label}
        </span>
        <ChevronRight size={13} className="text-muted-foreground shrink-0" />
      </Menu.SubmenuTrigger>

      <Menu.Portal>
        <Menu.Positioner align="start" side="right" sideOffset={4} className="isolate z-50">
          <Menu.Popup className="z-50 flex w-64 origin-(--transform-origin) flex-col gap-1 rounded-[18px] bg-popover p-1.5 text-[13px] text-popover-foreground ring-1 ring-border outline-hidden data-[side=right]:slide-in-from-left-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <div role="listbox" aria-label={t.sidebarUserLanguage} className="max-h-72 overflow-y-auto overscroll-contain">
              <Menu.RadioGroup value={locale} onValueChange={(v: string) => setLocale(v as Locale)}>
                {LOCALES.map((l: Locale) => (
                  <Menu.RadioItem
                    key={l}
                    value={l}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[12.5px] text-popover-foreground data-[highlighted]:bg-muted outline-none cursor-pointer"
                  >
                    <span className="inline-block w-5 h-3.5 rounded-[2px] overflow-hidden ring-1 ring-black/[0.08] shrink-0">
                      <Flag
                        code={LOCALE_META[l].flagCode}
                        style={{ width: '100%', height: '100%', display: 'block' }}
                      />
                    </span>
                    <span className="font-medium">{LOCALE_META[l].label}</span>
                    <Menu.RadioItemIndicator className="ml-auto flex items-center justify-center">
                      <Check size={13} strokeWidth={2.5} className="text-foreground" />
                    </Menu.RadioItemIndicator>
                  </Menu.RadioItem>
                ))}
              </Menu.RadioGroup>
            </div>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.SubmenuRoot>
  );
}
