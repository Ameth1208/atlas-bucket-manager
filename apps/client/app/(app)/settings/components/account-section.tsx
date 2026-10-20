'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MemojiAvatar } from '@/components/ui/memoji-avatar';
import { LanguageSelect } from '@/components/ui/language-select';
import { Sun, Moon, Monitor, Bell, Palette, Camera, Info, Database, Lock, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { useAccount } from '../hooks/use-account';
import { AvatarGrid } from './avatar-grid';
import { Spinner } from './spinner';
import { SettingsInput } from './settings-input';
import { getRoleLabel } from '../lib/role-utils';
import { AtlasLogo } from '@/components/ui/atlas-logo';

export function AccountSection() {
  const { t } = useI18n();
  const {
    user,
    name,
    setName,
    avatarSeed,
    handleSelectAvatar,
    notifications,
    setNotifications,
    theme,
    setTheme,
    updateMutation,
    dirty,
  } = useAccount();

  const themeOptions = [
    { v: 'light' as const, label: t.settingsThemeLight, icon: Sun },
    { v: 'dark' as const, label: t.settingsThemeDark, icon: Moon },
    { v: 'system' as const, label: t.settingsThemeSystem, icon: Monitor },
  ];

  return (
    <div className="space-y-6">
      {/* ── Perfil de Usuario (Apple Inset Grouped Card) ── */}
      <Card className="rounded-[20px] bg-card/75 backdrop-blur-2xl border border-white/[0.08] shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-border/50">
            <div className="flex items-center gap-4">
              <Popover>
                <PopoverTrigger
                  aria-label="Cambiar avatar"
                  className="group relative size-16 rounded-full overflow-hidden ring-2 ring-primary/30 hover:ring-primary shadow-sm transition-all shrink-0 cursor-pointer p-0 border-0 bg-transparent"
                >
                  <MemojiAvatar name={avatarSeed} size={64} className="size-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                    <Camera size={18} />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3 rounded-[16px] bg-popover/90 backdrop-blur-2xl border border-white/[0.1] shadow-xl" align="start">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                    Selecciona tu avatar
                  </p>
                  <AvatarGrid value={avatarSeed} onChange={handleSelectAvatar} />
                </PopoverContent>
              </Popover>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-foreground truncate">
                    {user?.name || t.settingsProfile}
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-primary/10 text-primary border border-primary/20 capitalize">
                    <ShieldCheck size={11} />
                    {getRoleLabel(t, user?.role || 'viewer')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{user?.email}</p>
                <p className="text-[11px] text-primary/80 mt-1 cursor-pointer hover:underline">
                  Toca el avatar para cambiarlo al instante
                </p>
              </div>
            </div>

            <Button
              type="button"
              size="sm"
              disabled={!dirty || updateMutation.isPending}
              onClick={() => updateMutation.mutate({ name, avatarSeed })}
              className="rounded-full px-5 py-2 bg-[#007aff] hover:bg-[#0069d9] text-white font-medium shadow-sm transition-all text-xs shrink-0"
            >
              {updateMutation.isPending && <Spinner />}
              {t.settingsSave}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-6">
            <SettingsInput label={t.settingsProfileName} value={name} onChange={setName} />
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Lock size={11} className="text-muted-foreground/70" />
                {t.settingsProfileEmail}
              </Label>
              <div className="h-8 flex items-center px-3 rounded-md border border-border/60 bg-muted/20 text-sm font-medium text-muted-foreground">
                {user?.email || '—'}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t.settingsProfileRole}
              </Label>
              <div className="h-8 flex items-center px-3 rounded-md border border-border/60 bg-muted/20 text-sm font-medium capitalize">
                {getRoleLabel(t, user?.role || 'viewer')}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t.settingsLanguage}
              </Label>
              <LanguageSelect />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Aspecto / Tema (Apple Segmented Control) ── */}
      <Card className="rounded-[20px] bg-card/75 backdrop-blur-2xl border border-white/[0.08] shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-3.5">
              <Palette size={22} className="text-[#af52de] shrink-0" strokeWidth={2} />
              <div>
                <p className="text-sm font-semibold text-foreground">{t.settingsTheme}</p>
                <p className="text-xs text-muted-foreground">{t.settingsThemeDesc}</p>
              </div>
            </div>
            <div className="flex rounded-[12px] border border-white/[0.08] p-1 bg-black/10 dark:bg-black/30 backdrop-blur-md w-fit">
              {themeOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.v}
                  onClick={() => setTheme(opt.v)}
                  className={cn(
                    'flex items-center gap-2 px-3.5 py-1.5 rounded-[9px] text-xs font-medium transition-all cursor-pointer',
                    theme === opt.v
                      ? 'bg-background text-foreground shadow-xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <opt.icon size={13} /> {opt.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Notificaciones (Apple Switches) ── */}
      <Card className="rounded-[20px] bg-card/75 backdrop-blur-2xl border border-white/[0.08] shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
            <div className="flex items-center gap-3.5">
              <Bell size={22} className="text-[#ff9500] shrink-0" strokeWidth={2} />
              <div>
                <p className="text-sm font-semibold text-foreground">{t.settingsNotificationsTitle}</p>
                <p className="text-xs text-muted-foreground">{t.settingsNotificationsDesc}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full sm:w-auto">
              {[
                { key: 'email', label: t.settingsNotificationsEmail, desc: t.settingsNotificationsEmailDesc },
                { key: 'activity', label: t.settingsNotificationsActivity, desc: t.settingsNotificationsActivityDesc },
                { key: 'digest', label: t.settingsNotificationsDigest, desc: t.settingsNotificationsDigestDesc },
              ].map((n) => {
                const key = n.key as keyof typeof notifications;
                return (
                  <div
                    key={n.key}
                    className="flex items-center justify-between gap-4 p-3 rounded-[14px] border border-white/[0.06] bg-background/40 sm:min-w-[190px]"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-medium text-foreground">{n.label}</p>
                      <p className="text-[10.5px] text-muted-foreground truncate">{n.desc}</p>
                    </div>
                    <Switch
                      checked={notifications[key]}
                      onCheckedChange={(v) => setNotifications((s) => ({ ...s, [key]: v }))}
                      className="data-[state=checked]:bg-[#34c759]"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Acerca de Atlas (Versión del Sistema) ── */}
      <Card className="rounded-[20px] bg-card/75 backdrop-blur-2xl border border-white/[0.08] shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <AtlasLogo size={28} className="shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">Atlas Bucket Manager</p>
                  <span className="font-mono text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-[#007aff]/15 text-[#007aff] border border-[#007aff]/30">
                    v2.0.4
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Plataforma Unificada de Almacenamiento Multicloud & S3 Compatible
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-muted-foreground/80 font-mono">
              <span className="inline-block size-2 rounded-full bg-[#34c759] animate-pulse" />
              <span>Producción · Docker</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
