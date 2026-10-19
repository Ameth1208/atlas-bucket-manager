'use client';
import { Plus, Cloud, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { MemojiAvatar } from '@/components/ui/memoji-avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';

interface Crumb { label: string; href?: string; }
interface ToolbarProps { crumbs?: Crumb[]; }

export function Toolbar({ crumbs = [] }: ToolbarProps) {
  const router = useRouter();
  const { t } = useI18n();
  const { user, setCreateBucketOpen, setConnectProviderOpen } = useAppStore();

  return (
    <div className="flex items-center gap-2 px-4 sm:px-6 h-[52px] border-b border-border/70 bg-background/80 backdrop-blur-xl shrink-0 sticky top-0 z-30">
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
