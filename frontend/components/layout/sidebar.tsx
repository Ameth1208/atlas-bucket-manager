'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Star, Activity, Key, Settings, Plus, ChevronRight, Database, Sun, Moon, LogOut } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { useBuckets } from '@/hooks/use-buckets';
import { useProviders } from '@/hooks/use-providers';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
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

const NAV = [
  { id: 'dashboard', href: '/dashboard', icon: Home, label: 'Todos los buckets' },
  { id: 'favorites', href: '/favorites', icon: Star, label: 'Favoritos' },
  { id: 'activity', href: '/activity', icon: Activity, label: 'Actividad' },
];

const TOOLS = [
  { id: 'api-keys', href: '/api-keys', icon: Key, label: 'Claves de API' },
  { id: 'settings', href: '/settings', icon: Settings, label: 'Ajustes' },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
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

  return (
    <Sidebar collapsible="none" className='h-dvh'>
      <SidebarHeader className="px-3 py-3">
        <Logo size="sm" showText />
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {/* Main nav */}
        <SidebarGroup>
          <SidebarGroupLabel>Fuentes</SidebarGroupLabel>
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
          <SidebarGroupLabel>Proveedores</SidebarGroupLabel>
          <SidebarGroupAction
            title="Conectar proveedor"
            onClick={() => useAppStore.getState().setConnectProviderOpen(true)}
          >
            <Plus />
          </SidebarGroupAction>
          <SidebarGroupContent>
            {providers.length === 0 && (
              <p className="px-2 py-1 text-xs text-muted-foreground">Sin proveedores</p>
            )}
            <SidebarMenu>
              {providers.map(p => {
                const pBuckets = buckets.filter(b => b.providerId === p.id);
                const isOpen = !!providersOpen[p.id];
                return (
                  <SidebarMenuItem key={p.id}>
                    <SidebarMenuButton size="sm" onClick={() => toggleProvider(p.id)}>
                      <ChevronRight className={cn('transition-transform', isOpen && 'rotate-90')} />
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                      <span className="flex-1 truncate font-medium">{p.name}</span>
                      <span className="tabular-nums text-xs opacity-50">{pBuckets.length}</span>
                    </SidebarMenuButton>
                    {isOpen && (
                      <SidebarMenuSub>
                        {pBuckets.length === 0 && (
                          <p className="px-2 py-1 text-xs text-muted-foreground">Sin buckets</p>
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
          <SidebarGroupLabel>Herramientas</SidebarGroupLabel>
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

      <SidebarFooter>
        <div className="flex items-center gap-2 px-1 py-1">
          <Avatar size="sm">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {user ? initials(user.name) : '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user?.name || '—'}</p>
            <p className="text-xs text-muted-foreground truncate capitalize">{user?.role}</p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Cambiar tema"
          >
            {mounted ? (theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />) : <Moon size={13} />}
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={logout} title="Cerrar sesión">
            <LogOut size={13} />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
