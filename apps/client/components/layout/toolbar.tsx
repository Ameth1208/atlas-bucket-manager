'use client';
import { Plus, Cloud, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { MemojiAvatar } from '@/components/ui/memoji-avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';

interface Crumb { label: string; href?: string; }
interface ToolbarProps { crumbs?: Crumb[]; }

export function Toolbar({ crumbs = [] }: ToolbarProps) {
  const router = useRouter();
  const { user, setCreateBucketOpen, setConnectProviderOpen } = useAppStore();

  return (
    <div className="flex items-center gap-2 px-4 h-12 border-b border-border bg-background/80 backdrop-blur shrink-0">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 flex-1 min-w-0 text-[14px] tracking-[-0.224px]">
        {crumbs.map((c, i) => (
          <span key={c.href + '-' + c.label} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={12} className="text-muted-foreground/50" />}
            <button
              type="button"
              onClick={() => c.href && router.push(c.href)}
              className={i === crumbs.length - 1
                ? 'font-medium text-foreground cursor-default'
                : 'text-muted-foreground hover:text-foreground transition-colors cursor-pointer'
              }
            >
              {c.label}
            </button>
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Button type="button" variant="ghost" size="icon-sm" onClick={() => setConnectProviderOpen(true)} title="Conectar proveedor" aria-label="Conectar proveedor">
          <Cloud size={14} />
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" onClick={() => setCreateBucketOpen(true)} title="Nuevo bucket" aria-label="Nuevo bucket">
          <Plus size={14} />
        </Button>

        <Separator orientation="vertical" className="h-5 mx-1 bg-border" />

        {user && (
          <button type="button" onClick={() => router.push('/settings')} className="rounded-full" aria-label="Abrir configuración">
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
