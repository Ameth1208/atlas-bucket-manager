'use client';
import { Plus, Cloud, ChevronRight, Menu, Search } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { MemojiAvatar } from '@/components/ui/memoji-avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface Crumb { label: string; href?: string; }
interface ToolbarProps { crumbs?: Crumb[]; }

export function Toolbar({ crumbs = [] }: ToolbarProps) {
  const router = useRouter();
  const { t } = useI18n();
  const { user, setCreateBucketOpen, setConnectProviderOpen, setCommandPaletteOpen } = useAppStore();

  return (
    <div className="flex items-center gap-2 px-3 sm:px-6 h-[52px] border-b border-border/70 bg-background/80 backdrop-blur-xl shrink-0 sticky top-0 z-30">
      <SidebarTrigger
        className="md:hidden -ml-1 mr-1 text-muted-foreground hover:text-foreground shrink-0 size-8 rounded-[8px]"
        aria-label="Menu"
      >
        <Menu size={18} strokeWidth={2} />
      </SidebarTrigger>
      <div className="flex items-center gap-1 flex-1 min-w-0 text-[13.5px] tracking-[-0.224px]">
        {crumbs.map((c, i) => (
          <span key={c.href + '-' + c.label} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={12} className="text-muted-foreground/40" />}
            <button
              type="button"
              onClick={() => c.href && router.push(c.href)}
              className={i === crumbs.length - 1
                ? 'font-medium text-foreground cursor-default px-2 py-0.5 rounded-full'
                : 'text-muted-foreground hover:text-foreground transition-colors cursor-pointer px-2 py-0.5 rounded-full hover:bg-muted/60'
              }
            >
              {c.label}
            </button>
          </span>
        ))}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-full bg-muted/40 hover:bg-muted/70 border border-border/60 text-xs text-muted-foreground hover:text-foreground transition-all cursor-pointer mr-1"
          aria-label="Buscar o ejecutar comandos"
        >
          <Search size={13} className="text-muted-foreground/70" />
          <span className="text-[12px]">Buscar...</span>
          <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded-[5px] bg-background border border-border/70 text-muted-foreground font-semibold">
            ⌘K
          </kbd>
        </button>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setCommandPaletteOpen(true)}
          title="Buscar (⌘K)"
          aria-label="Buscar"
          className="sm:hidden"
        >
          <Search size={15} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setConnectProviderOpen(true)}
          title={t.toolbarConnectProviderTitle}
          aria-label={t.toolbarConnectProviderTitle}
        >
          <Cloud size={14} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setCreateBucketOpen(true)}
          title={t.toolbarNewBucketTitle}
          aria-label={t.toolbarNewBucketTitle}
        >
          <Plus size={14} />
        </Button>

        <Separator orientation="vertical" className="h-5 mx-1 bg-border" />

        {user && (
          <button
            type="button"
            onClick={() => router.push('/settings')}
            className="rounded-full"
            aria-label={t.toolbarOpenSettingsAria}
          >
            <MemojiAvatar
              name={user.avatarSeed || user.email || user.name}
              size={28}
              className="rounded-full w-7 h-7"
            />
          </button>
        )}
      </div>
    </div>
  );
}
