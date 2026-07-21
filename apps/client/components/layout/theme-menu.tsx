'use client';

import { Sun, Moon, Monitor, Palette, Check, ChevronRight } from 'lucide-react';
import { Menu } from '@base-ui/react/menu';
import { useTheme } from 'next-themes';
import { useI18n } from '@/lib/i18n';

type ThemeValue = 'light' | 'dark' | 'system';

const THEME_OPTIONS: { v: ThemeValue; icon: typeof Sun }[] = [
  { v: 'light', icon: Sun },
  { v: 'dark', icon: Moon },
  { v: 'system', icon: Monitor },
];

export function ThemeMenu() {
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();

  const currentLabel =
    theme === 'dark'
      ? t.sidebarUserThemeDark
      : theme === 'light'
        ? t.sidebarUserThemeLight
        : t.sidebarUserThemeSystem;

  return (
    <Menu.SubmenuRoot>
      <Menu.SubmenuTrigger
        className="group/sub flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-popover-foreground data-[highlighted]:bg-muted outline-none cursor-pointer w-full"
      >
        <Palette size={14} className="text-muted-foreground shrink-0" />
        <span className="flex-1 text-left font-medium">{t.sidebarUserTheme}</span>
        <span className="text-[11px] text-muted-foreground uppercase tracking-wide">{currentLabel}</span>
        <ChevronRight size={13} className="text-muted-foreground shrink-0" />
      </Menu.SubmenuTrigger>

      <Menu.Portal>
        <Menu.Positioner align="start" side="right" sideOffset={4} className="isolate z-50">
          <Menu.Popup className="z-50 flex w-56 origin-(--transform-origin) flex-col gap-1 rounded-[18px] bg-popover p-1.5 text-[13px] text-popover-foreground ring-1 ring-border outline-hidden data-[side=right]:slide-in-from-left-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <Menu.RadioGroup value={theme} onValueChange={(v: string) => setTheme(v as ThemeValue)}>
              {THEME_OPTIONS.map(opt => (
                <Menu.RadioItem
                  key={opt.v}
                  value={opt.v}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-popover-foreground data-[highlighted]:bg-muted outline-none cursor-pointer"
                >
                  <opt.icon size={14} className="text-muted-foreground shrink-0" />
                  <span className="flex-1 text-left font-medium">{labelFor(opt.v, t)}</span>
                  <Menu.RadioItemIndicator className="flex items-center justify-center">
                    <Check size={13} strokeWidth={2.5} className="text-foreground" />
                  </Menu.RadioItemIndicator>
                </Menu.RadioItem>
              ))}
            </Menu.RadioGroup>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.SubmenuRoot>
  );
}

function labelFor(v: ThemeValue, t: ReturnType<typeof useI18n>['t']) {
  if (v === 'light') return t.sidebarUserThemeLight;
  if (v === 'dark') return t.sidebarUserThemeDark;
  return t.sidebarUserThemeSystem;
}
