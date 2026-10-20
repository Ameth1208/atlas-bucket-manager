'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Home,
  Star,
  Activity,
  Settings,
  Key,
  Plus,
  Cloud,
  Sun,
  Moon,
  Languages,
  Database,
  ArrowRight,
  Command,
  X,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAppStore } from '@/lib/store';
import { useBuckets } from '@/hooks/use-buckets';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: any;
  iconColor: string;
  category: 'nav' | 'buckets' | 'actions';
  action: () => void;
}

export function CommandPalette() {
  const router = useRouter();
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setCreateBucketOpen,
    setConnectProviderOpen,
    setCreateKeyOpen,
    toggleLang,
    lang,
  } = useAppStore();

  const { buckets = [] } = useBuckets();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Global keydown listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      } else if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  // Focus input on open and reset state
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  // Build items list
  const allItems: CommandItem[] = useMemo(() => {
    const navItems: CommandItem[] = [
      {
        id: 'nav-dashboard',
        title: t.sidebarNavDashboard || 'Dashboard',
        subtitle: 'Panel principal y estadísticas',
        icon: Home,
        iconColor: 'text-[#007aff]',
        category: 'nav',
        action: () => {
          router.push('/dashboard');
          setCommandPaletteOpen(false);
        },
      },
      {
        id: 'nav-favorites',
        title: t.sidebarNavFavorites || 'Favoritos',
        subtitle: 'Tus buckets destacados',
        icon: Star,
        iconColor: 'text-[#ff9500]',
        category: 'nav',
        action: () => {
          router.push('/favorites');
          setCommandPaletteOpen(false);
        },
      },
      {
        id: 'nav-activity',
        title: t.sidebarNavActivity || 'Actividad',
        subtitle: 'Registro de eventos en tiempo real',
        icon: Activity,
        iconColor: 'text-[#34c759]',
        category: 'nav',
        action: () => {
          router.push('/activity');
          setCommandPaletteOpen(false);
        },
      },
      {
        id: 'nav-api-keys',
        title: t.apiKeysTitle || 'Claves de API',
        subtitle: 'Tokens de acceso programático',
        icon: Key,
        iconColor: 'text-[#5856d6]',
        category: 'nav',
        action: () => {
          router.push('/api-keys');
          setCommandPaletteOpen(false);
        },
      },
      {
        id: 'nav-settings',
        title: t.sidebarNavSettings || 'Ajustes',
        subtitle: 'Perfil, equipo y preferencias',
        icon: Settings,
        iconColor: 'text-[#8e8e93]',
        category: 'nav',
        action: () => {
          router.push('/settings');
          setCommandPaletteOpen(false);
        },
      },
    ];

    const bucketItems: CommandItem[] = buckets.map((b) => ({
      id: `bucket-${b.providerId}-${b.name}`,
      title: b.name,
      subtitle: `${b.providerName || 'S3'} · ${b.limit ? 'Con cuota' : 'Sin límite'}`,
      icon: Database,
      iconColor: 'text-[#007aff]',
      category: 'buckets',
      action: () => {
        router.push(`/buckets/${encodeURIComponent(b.name)}?provider=${b.providerId}`);
        setCommandPaletteOpen(false);
      },
    }));

    const actionItems: CommandItem[] = [
      {
        id: 'act-new-bucket',
        title: t.toolbarNewBucketTitle || 'Crear nuevo bucket',
        subtitle: 'Almacenamiento S3 / MinIO',
        icon: Plus,
        iconColor: 'text-[#007aff]',
        category: 'actions',
        action: () => {
          setCommandPaletteOpen(false);
          setCreateBucketOpen(true);
        },
      },
      {
        id: 'act-connect-provider',
        title: t.toolbarConnectProviderTitle || 'Conectar proveedor',
        subtitle: 'AWS S3, MinIO, Wasabi, Cloudflare R2',
        icon: Cloud,
        iconColor: 'text-[#34c759]',
        category: 'actions',
        action: () => {
          setCommandPaletteOpen(false);
          setConnectProviderOpen(true);
        },
      },
      {
        id: 'act-new-key',
        title: t.apiKeysCreate || 'Crear clave de API',
        subtitle: 'Nuevo token para scripts o SDK',
        icon: Key,
        iconColor: 'text-[#5856d6]',
        category: 'actions',
        action: () => {
          setCommandPaletteOpen(false);
          setCreateKeyOpen(true);
        },
      },
      {
        id: 'act-toggle-theme',
        title: theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro',
        subtitle: `Actualmente en modo ${theme === 'dark' ? 'oscuro' : 'claro'}`,
        icon: theme === 'dark' ? Sun : Moon,
        iconColor: 'text-[#ff9500]',
        category: 'actions',
        action: () => {
          setTheme(theme === 'dark' ? 'light' : 'dark');
          setCommandPaletteOpen(false);
        },
      },
      {
        id: 'act-toggle-lang',
        title: lang === 'es' ? 'Switch to English' : 'Cambiar a Español',
        subtitle: `Idioma actual: ${lang === 'es' ? 'Español' : 'English'}`,
        icon: Languages,
        iconColor: 'text-[#af52de]',
        category: 'actions',
        action: () => {
          toggleLang();
          setCommandPaletteOpen(false);
        },
      },
    ];

    return [...navItems, ...bucketItems, ...actionItems];
  }, [
    buckets,
    t,
    router,
    theme,
    setTheme,
    lang,
    toggleLang,
    setCommandPaletteOpen,
    setCreateBucketOpen,
    setConnectProviderOpen,
    setCreateKeyOpen,
  ]);

  // Filter items according to search query
  const filteredItems = useMemo(() => {
    if (!query.trim()) return allItems;
    const q = query.toLowerCase().trim();
    return allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q))
    );
  }, [allItems, query]);

  // Keyboard navigation up / down / enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredItems.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = filteredItems[selectedIndex];
      if (current) current.action();
    }
  };

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    if (el) {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] sm:pt-[16vh] px-4 animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-md"
        onClick={() => setCommandPaletteOpen(false)}
      />

      {/* Spotlight Window */}
      <div
        className="relative w-full max-w-xl rounded-[22px] bg-card/90 dark:bg-[#1c1c1e]/90 backdrop-blur-3xl border border-white/[0.12] shadow-2xl overflow-hidden flex flex-col max-h-[75vh] animate-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/60">
          <Search size={18} className="text-muted-foreground/70 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Escribe un comando o busca buckets..."
            className="flex-1 bg-transparent text-sm sm:text-base outline-none text-foreground placeholder:text-muted-foreground/50"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
                inputRef.current?.focus();
              }}
              className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted/50 cursor-pointer"
            >
              <X size={14} />
            </button>
          ) : (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-[6px] bg-muted/60 text-muted-foreground border border-border/60">
              ESC
            </span>
          )}
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No se encontraron resultados para &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  data-index={idx}
                  type="button"
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-[12px] text-left transition-all duration-100 cursor-pointer',
                    isSelected
                      ? 'bg-primary/10 dark:bg-white/[0.1] text-foreground font-medium ring-1 ring-primary/20 dark:ring-white/10'
                      : 'text-foreground/80 hover:bg-muted/40'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      size={18}
                      strokeWidth={2}
                      className={cn(
                        'shrink-0 transition-transform group-hover:scale-105',
                        item.iconColor
                      )}
                    />
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-semibold text-foreground truncate">
                        {item.title}
                      </p>
                      {item.subtitle && (
                        <p className="text-[11px] text-muted-foreground truncate">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <ArrowRight
                    size={13}
                    className={cn(
                      'text-muted-foreground/40 transition-transform shrink-0',
                      isSelected && 'text-primary dark:text-foreground opacity-100 translate-x-0.5'
                    )}
                  />
                </button>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-4 py-2 border-t border-border/50 bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-mono">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">↓</kbd>
              <span>navegar</span>
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1 font-mono">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">↵</kbd>
              <span>seleccionar</span>
            </span>
          </div>

          <div className="flex items-center gap-1 font-mono">
            <Command size={11} />
            <span>K</span>
          </div>
        </div>
      </div>
    </div>
  );
}
