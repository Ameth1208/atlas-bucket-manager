'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Star, Activity, Key, Settings, Plus, ChevronRight, Database, Sun, Moon, LogOut } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useState } from 'react';
import { cn, initials } from '@/lib/utils';

const NAV = [
  { id: 'dashboard', href: '/dashboard', icon: Home, label: 'Todos los buckets' },
  { id: 'favorites', href: '/favorites', icon: Star, label: 'Favoritos' },
  { id: 'activity', href: '/activity', icon: Activity, label: 'Actividad' },
];

const TOOLS = [
  { id: 'api-keys', href: '/api-keys', icon: Key, label: 'Claves de API' },
  { id: 'settings', href: '/settings', icon: Settings, label: 'Ajustes' },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 select-none">
      {children}
    </p>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, theme, toggleTheme, setUser } = useAppStore();
  const [providersOpen, setProvidersOpen] = useState<Record<string, boolean>>({});

  const { data: buckets = [] } = useQuery({ queryKey: ['buckets'], queryFn: api.buckets.list });
  const { data: providers = [] } = useQuery({ queryKey: ['providers'], queryFn: api.buckets.providers });

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

  return (
    <aside className="flex flex-col h-full w-60 border-r border-border bg-sidebar shrink-0 overflow-hidden">
      {/* Brand */}
      <div className="px-3 pt-4 pb-3">
        <Logo size="sm" showText />
      </div>

      <Separator />

      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5">
        {/* Main nav */}
        <SectionLabel>Fuentes</SectionLabel>
        {NAV.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon size={14} className="shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}

        {/* Providers */}
        <div className="mt-2">
          <div className="flex items-center justify-between pr-1">
            <SectionLabel>Proveedores</SectionLabel>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => useAppStore.getState().setConnectProviderOpen(true)}
              title="Conectar proveedor"
            >
              <Plus size={10} />
            </Button>
          </div>

          {providers.length === 0 && (
            <p className="px-2.5 py-1 text-xs text-muted-foreground">Sin proveedores</p>
          )}

          {providers.map(p => {
            const pBuckets = buckets.filter(b => b.providerId === p.id);
            const isOpen = !!providersOpen[p.id];
            return (
              <div key={p.id}>
                <button
                  onClick={() => toggleProvider(p.id)}
                  className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <ChevronRight size={10} className={cn('shrink-0 transition-transform', isOpen && 'rotate-90')} />
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                  <span className="truncate flex-1 text-left font-medium">{p.name}</span>
                  <span className="text-xs tabular-nums opacity-50">{pBuckets.length}</span>
                </button>
                {isOpen && (
                  <div className="ml-4">
                    {pBuckets.map(b => {
                      const active = pathname === `/buckets/${b.name}`;
                      return (
                        <Link
                          key={b.name}
                          href={`/buckets/${encodeURIComponent(b.name)}?provider=${b.providerId}`}
                          className={cn(
                            'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm transition-colors',
                            active
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                        >
                          <Database size={11} className="shrink-0 opacity-60" />
                          <span className="truncate">{b.name}</span>
                        </Link>
                      );
                    })}
                    {pBuckets.length === 0 && (
                      <p className="px-2.5 py-1 text-xs text-muted-foreground">Sin buckets</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tools */}
        <div className="mt-2">
          <SectionLabel>Herramientas</SectionLabel>
          {TOOLS.map(item => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon size={14} className="shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Footer */}
      <div className="px-3 py-2.5 flex items-center gap-2">
        <Avatar size="sm">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
            {user ? initials(user.name) : '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{user?.name || '—'}</p>
          <p className="text-xs text-muted-foreground truncate capitalize">{user?.role}</p>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={toggleTheme} title="Cambiar tema">
          {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={logout} title="Cerrar sesión">
          <LogOut size={13} />
        </Button>
      </div>
    </aside>
  );
}
