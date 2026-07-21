'use client';

import { LogOut, User, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Menu } from '@base-ui/react/menu';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { MemojiAvatar } from '@/components/ui/memoji-avatar';
import { ThemeMenu } from './theme-menu';
import { LanguageMenu } from './language-menu';

interface UserMenuProps {
  name: string;
  role: string;
  avatarSeed: string;
  onLogout: () => void;
}

export function UserMenu({ name, role, avatarSeed, onLogout }: UserMenuProps) {
  const { t } = useI18n();
  const router = useRouter();

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={t.sidebarUserMenu}
        title={t.sidebarUserMenu}
        className={cn(
          'group w-full flex items-center gap-1.5 py-1.5 pl-2 pr-4 rounded-full bg-secondary border border-border text-left cursor-pointer transition-colors',
          'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 data-[popup-open]:bg-muted'
        )}
      >
        <MemojiAvatar name={avatarSeed} size={32} className="rounded-full shrink-0 w-8 h-8" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-sidebar-foreground truncate">{name}</p>
          <p className="text-xs text-sidebar-foreground/60 truncate capitalize">{role}</p>
        </div>
        <ChevronUp
          size={14}
          className="text-sidebar-foreground/50 transition-transform duration-200 group-data-[popup-open]:rotate-180"
        />
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner align="end" side="top" sideOffset={8} className="isolate z-50">
          <Menu.Popup className="z-50 flex w-56 origin-(--transform-origin) flex-col gap-1 rounded-[18px] bg-popover p-1.5 text-[13px] text-popover-foreground ring-1 ring-border outline-hidden data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <Menu.Item
              onClick={() => router.push('/settings')}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-popover-foreground data-[highlighted]:bg-muted outline-none cursor-pointer"
            >
              <User size={14} className="text-muted-foreground shrink-0" />
              <span className="font-medium">{t.sidebarUserProfile}</span>
            </Menu.Item>

            <ThemeMenu />
            <LanguageMenu />

            <Menu.Separator className="h-px bg-border my-1" />

            <Menu.Item
              onClick={onLogout}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg font-medium text-destructive data-[highlighted]:bg-destructive/10 outline-none cursor-pointer"
            >
              <LogOut size={14} className="shrink-0" />
              <span>{t.sidebarUserLogout}</span>
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
