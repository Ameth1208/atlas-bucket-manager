'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MemojiAvatar } from '@/components/ui/memoji-avatar';
import { LanguageSelect } from '@/components/ui/language-select';
import { Sun, Moon, Monitor, Bell, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { useAccount } from '../hooks/use-account';
import { AvatarGrid } from './avatar-grid';
import { Spinner } from './spinner';
import { SettingsInput } from './settings-input';
import { getRoleLabel } from '../lib/role-utils';

export function AccountSection() {
  const { t } = useI18n();
  const {
    user,
    name,
    setName,
    avatarSeed,
    setAvatarSeed,
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
    <>
      <Card className="border-border/60 rounded-md overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Popover>
              <PopoverTrigger>
                <button type="button" aria-label="Cambiar avatar" className="relative w-12 h-12 rounded-full overflow-hidden ring-1 ring-border bg-muted hover:ring-primary transition-colors">
                  <MemojiAvatar name={avatarSeed} size={48} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2.5" align="start">
                <AvatarGrid value={avatarSeed} onChange={setAvatarSeed} />
              </PopoverContent>
            </Popover>
            <div>
              <p className="text-sm font-semibold">{t.settingsProfile}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <SettingsInput label={t.settingsProfileName} value={name} onChange={setName} />
            <SettingsInput
              label={t.settingsProfileEmail}
              value={user?.email || ''}
              readOnly
              inputClassName="text-muted-foreground cursor-not-allowed"
            />
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t.settingsProfileRole}
              </Label>
              <div className="h-8 flex items-center px-3 rounded-md border border-border/60 bg-muted/30 text-sm font-medium capitalize">
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

          <div className="mt-6 flex justify-end">
            <Button
              type="button"
              size="sm"
              disabled={!dirty || updateMutation.isPending}
              onClick={() => updateMutation.mutate({ name, avatarSeed })}
              className="rounded-md"
            >
              {updateMutation.isPending && <Spinner />}
              {t.settingsSave}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 rounded-md mt-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-sm bg-primary/10 flex items-center justify-center">
                <Palette size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">{t.settingsTheme}</p>
                <p className="text-xs text-muted-foreground">{t.settingsThemeDesc}</p>
              </div>
            </div>
            <div className="flex rounded-md border border-border/60 p-1 bg-muted/20 w-fit">
              {themeOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.v}
                  onClick={() => setTheme(opt.v)}
                  className={cn(
                    'flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-all',
                    theme === opt.v ? 'bg-background text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <opt.icon size={15} /> {opt.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 rounded-md mt-5">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-sm bg-primary/10 flex items-center justify-center">
                <Bell size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">{t.settingsNotificationsTitle}</p>
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
                    className="flex items-center justify-between gap-4 p-3 rounded-md border border-border/60 bg-muted/20 sm:min-w-[180px]"
                  >
                    <div>
                      <p className="text-sm font-medium">{n.label}</p>
                      <p className="text-xs text-muted-foreground">{n.desc}</p>
                    </div>
                    <Switch
                      checked={notifications[key]}
                      onCheckedChange={(v) => setNotifications((s) => ({ ...s, [key]: v }))}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
