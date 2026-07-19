'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Star, Activity, Settings, Plus, ChevronRight, Database, Sun, Moon, LogOut, Pencil, Trash2, Copy, Check, MoreHorizontal } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Provider } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { useBuckets } from '@/hooks/use-buckets';
import { useProviders } from '@/hooks/use-providers';
import { MemojiAvatar } from '@/components/ui/memoji-avatar';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { cn, initials } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useI18n } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/language-switcher';

const NAV = [
  { id: 'dashboard', href: '/dashboard', icon: Home, label: 'Todos los buckets' },
  { id: 'favorites', href: '/favorites', icon: Star, label: 'Favoritos' },
  { id: 'activity', href: '/activity', icon: Activity, label: 'Actividad' },
];

const TOOLS = [
  { id: 'settings', href: '/settings', icon: Settings, label: 'Ajustes' },
];

const openProviderEdit = (id: string) => {
  useAppStore.getState().setEditProviderId(id);
};

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const { user, setUser } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [providersOpen, setProvidersOpen] = useState<Record<string, boolean>>({});

  useEffect(() => setMounted(true), []);
  const { buckets } = useBuckets();
  const { providers } = useProviders();

  const logout = async () => {
    try {
      await api.auth.logout();
      setUser(null);
      router.push('/login');
    } catch {
      toast.error('Error al cerrar sesión');
    }
  };

  const toggleProvider = (id: string) => setProvidersOpen(s => ({ ...s, [id]: !s[id] }));

  const [deleteProviderTarget, setDeleteProviderTarget] = useState<{ id: string; name: string } | null>(null);

  const handleDeleteProvider = (id: string, name: string) => {
    setDeleteProviderTarget({ id, name });
  };

  const confirmDeleteProvider = async () => {
    if (!deleteProviderTarget) return;
    const { id, name } = deleteProviderTarget;
    try {
      const res = await fetch(`/api/providers/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      toast.success(`Proveedor "${name}" eliminado`);
      setDeleteProviderTarget(null);
      window.location.reload();
    } catch (e: any) {
      toast.error(e.message ?? 'Error al eliminar el proveedor');
    }
  };

  return (
    <Sidebar collapsible="none" className='h-dvh border-r border-border'>
      <SidebarHeader className="px-4 py-4">
        <Logo size="sm" showText />
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="px-2 py-3">
        {/* Main nav */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/80 px-2 mb-1">Fuentes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map(item => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={active}
                      size="sm"
                      className="h-9"
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Providers */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/80 px-2 mb-1">Proveedores</SidebarGroupLabel>
          <SidebarGroupAction
            title={t.providerConnect}
            onClick={() => useAppStore.getState().setConnectProviderOpen(true)}
          >
            <Plus />
          </SidebarGroupAction>
          <SidebarGroupContent>
            {providers.length === 0 && (
              <p className="px-2 py-1 text-[11px] text-sidebar-foreground/60">Sin proveedores</p>
            )}
            <SidebarMenu>
              {providers.map(p => {
                const pBuckets = buckets.filter(b => b.providerId === p.id);
                const isOpen = !!providersOpen[p.id];
                return (
                  <SidebarMenuItem key={p.id}>
                    <div className="group flex items-center gap-0.5">
                      <SidebarMenuButton
                        size="sm"
                        onClick={() => toggleProvider(p.id)}
                        className="h-9 flex-1"
                      >
                        <ChevronRight className={cn('transition-transform', isOpen && 'rotate-90')} />
                        <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                        <span className="flex-1 truncate font-medium">{p.name}</span>
                        <span className="tabular-nums text-[11px] text-sidebar-foreground/50">{pBuckets.length}</span>
                      </SidebarMenuButton>
                      <Popover>
                        <PopoverTrigger
                          className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 size-7 rounded-md hover:bg-muted flex items-center justify-center transition-opacity text-muted-foreground hover:text-foreground data-[open]:opacity-100 data-[open]:bg-muted data-[open]:text-foreground"
                          aria-label={`${t.sidebarInfo} · ${p.name}`}
                          title={`${t.sidebarInfo} · ${p.name}`}
                        >
                          <MoreHorizontal size={13} />
                        </PopoverTrigger>
                        <ProviderInfoContent provider={p} bucketCount={pBuckets.length} onEdit={() => openProviderEdit(p.id)} onDelete={() => handleDeleteProvider(p.id, p.name)} />
                      </Popover>
                    </div>
                    {isOpen && (
                      <SidebarMenuSub>
                        {pBuckets.length === 0 && (
                          <p className="px-2 py-1 text-[11px] text-sidebar-foreground/60">Sin buckets</p>
                        )}
                        {pBuckets.map(b => {
                          const active = pathname === `/buckets/${b.name}`;
                          return (
                            <SidebarMenuSubItem key={b.name}>
                              <SidebarMenuSubButton
                                render={<Link href={`/buckets/${encodeURIComponent(b.name)}?provider=${b.providerId}`} />}
                                isActive={active}
                              >
                                <Database />
                                <span>{b.name}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tools */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/80 px-2 mb-1">Herramientas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {TOOLS.map(item => {
                const active = pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={active}
                      size="sm"
                      className="h-9"
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="p-3">
        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-secondary border border-border">
          <MemojiAvatar
            name={user?.avatarSeed || user?.email || user?.name || 'user'}
            size={32}
            className="rounded-full shrink-0 w-8 h-8"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name || '—'}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate capitalize">{user?.role}</p>
          </div>
          <LanguageSwitcher />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={t.sidebarToggleTheme}
            aria-label={t.sidebarToggleTheme}
          >
            {mounted ? (theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />) : <Moon size={13} />}
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" onClick={logout} title={t.sidebarLogout} aria-label={t.sidebarLogout}>
            <LogOut size={13} />
          </Button>
        </div>
      </SidebarFooter>

      <ConfirmDialog
        open={!!deleteProviderTarget}
        onOpenChange={(o) => !o && setDeleteProviderTarget(null)}
        titleKey="confirmDeleteProviderTitle"
        descriptionKey="confirmDeleteProviderDescription"
        confirmKey="confirmDeleteProviderConfirm"
        vars={{ name: deleteProviderTarget?.name ?? '' }}
        onConfirm={confirmDeleteProvider}
      />
    </Sidebar>
  );
}

interface ProviderInfoContentProps {
  provider: Provider;
  bucketCount: number;
  onEdit: () => void;
  onDelete: () => void;
}

function ProviderInfoContent({ provider, bucketCount, onEdit, onDelete }: ProviderInfoContentProps) {
  const [copied, setCopied] = useState(false);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <PopoverContent className="w-72 p-0" align="start" side="right" sideOffset={8}>
      <div className="px-4 pt-3.5 pb-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0">
            <Database size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-popover-foreground truncate">{provider.name}</p>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{provider.kind}</p>
          </div>
        </div>
      </div>

      <div className="p-3 space-y-2.5">
        <Row label="Buckets" value={String(bucketCount)} />
        <Row
          label="Endpoint"
          value={`${provider.endPoint}:${provider.port}${provider.useSSL ? ' · SSL' : ''}`}
          mono
          copyable
          onCopy={() => copy(`${provider.endPoint}:${provider.port}`)}
          copied={copied}
        />
        <Row label="Access Key" value={provider.accessKey ?? '—'} mono copyable onCopy={() => copy(provider.accessKey ?? '')} copied={copied} />
        <Row label="Región" value={provider.region ?? 'us-east-1'} />
      </div>

      <div className="flex border-t border-border">
        <button
          type="button"
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-[12px] font-medium text-popover-foreground hover:bg-muted transition-colors border-r border-border"
        >
          <Pencil size={12} /> Editar
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-[12px] font-medium text-destructive hover:bg-destructive-soft transition-colors"
        >
          <Trash2 size={12} /> Eliminar
        </button>
      </div>
    </PopoverContent>
  );
}

function Row({ label, value, mono, copyable, onCopy, copied }: { label: string; value: string; mono?: boolean; copyable?: boolean; onCopy?: () => void; copied?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 min-w-0">
      <span className="text-[11px] text-muted-foreground shrink-0">{label}</span>
      <div className="flex items-center gap-1 min-w-0">
        <span className={cn('text-[12px] text-popover-foreground truncate', mono && 'font-mono')}>{value}</span>
        {copyable && onCopy && (
          <button
            type="button"
            onClick={onCopy}
            className="shrink-0 w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Copiar"
          >
            {copied ? <Check size={11} className="text-success" /> : <Copy size={11} />}
          </button>
        )}
      </div>
    </div>
  );
}
