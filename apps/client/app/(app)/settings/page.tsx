'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Toolbar } from '@/components/layout/toolbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useAppStore } from '@/lib/store';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/lib/i18n';
import { LanguageSelect } from '@/components/ui/language-select';
import { MemojiAvatar } from '@/components/ui/memoji-avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  User, Shield, Users, Sun, Moon, Monitor, Plus, Trash2, Bell,
  Mail, Lock, Palette, AlertTriangle, Plug, MailCheck, Check, ChevronDown, X,
  KeyRound, Webhook, Send, ShieldAlert, Sparkles, Settings, MoreHorizontal,
  Calendar, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User as UserType } from '@/lib/api';

type Section = 'account' | 'team' | 'integrations' | 'security';

export default function SettingsPage() {
  const { t } = useI18n();
  const [section, setSection] = useState<Section>('account');
  const { user } = useAppStore();
  const isOwner = user?.role === 'owner';
  const isAdmin = user?.role === 'admin' || isOwner;

  const SECTIONS = [
    { id: 'account' as Section, label: t.settingsProfile, icon: User },
    { id: 'team' as Section, label: t.settingsTeam, icon: Users, hidden: !isAdmin },
    { id: 'integrations' as Section, label: t.settingsIntegrations, icon: Plug, hidden: !isAdmin },
    { id: 'security' as Section, label: t.settingsSecurity, icon: Shield },
  ].filter(s => !s.hidden);

  const SectionIcon = SECTIONS.find(s => s.id === section)?.icon || User;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-muted via-background to-background">
      <Toolbar crumbs={[{ label: 'Atlas', href: '/dashboard' }, { label: t.settingsTitle }]} />

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-60 border-r border-border/60 bg-background/40 backdrop-blur-sm p-4 flex flex-col shrink-0">
          <div className="mb-6">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
              {t.settingsTitle}
            </p>
          </div>
          <nav className="flex flex-col gap-1">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={cn(
                  'group relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200',
                  section === s.id
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                )}
              >
                <s.icon size={16} strokeWidth={section === s.id ? 2.5 : 2} className="shrink-0" />
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1 overflow-y-auto p-5 lg:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-md bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center">
                <SectionIcon size={18} className="text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  {section === 'account' && t.settingsProfile}
                  {section === 'team' && t.settingsTeam}
                  {section === 'integrations' && t.settingsIntegrations}
                  {section === 'security' && t.settingsSecurity}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {section === 'account' && 'Gestiona tu información personal y preferencias.'}
                  {section === 'team' && 'Invita y controla el acceso de tu equipo.'}
                  {section === 'integrations' && 'Conecta Atlas con servicios externos.'}
                  {section === 'security' && 'Protege tu cuenta y datos.'}
                </p>
              </div>
            </div>

            {section === 'account' && <AccountSection />}
            {section === 'team' && <TeamSection />}
            {section === 'integrations' && <IntegrationsSection />}
            {section === 'security' && <SecuritySection />}
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountSection() {
  const { t } = useI18n();
  const { user, setUser } = useAppStore();
  const qc = useQueryClient();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [avatarSeed, setAvatarSeed] = useState(user?.avatarSeed || user?.email || 'user');
  const [notifications, setNotifications] = useState({ email: true, activity: false, digest: false });

  const updateMutation = useMutation({
    mutationFn: (body: Partial<Pick<UserType, 'name' | 'avatarSeed'>>) =>
      api.users.update(user!.id, body),
    onSuccess: async (updated) => {
      setUser(updated);
      await qc.invalidateQueries({ queryKey: ['me'] });
      toast.success(t.settingsProfileUpdated);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const dirty = name !== user?.name || avatarSeed !== (user?.avatarSeed || user?.email || 'user');

  const themeOptions = [
    { v: 'light', label: t.settingsThemeLight, icon: Sun },
    { v: 'dark', label: t.settingsThemeDark, icon: Moon },
    { v: 'system', label: t.settingsThemeSystem, icon: Monitor },
  ] as const;

  const roleLabel = (role: UserType['role']) => {
    switch (role) {
      case 'owner': return t.settingsRoleOwner;
      case 'admin': return t.settingsRoleAdmin;
      case 'editor': return t.settingsRoleEditor;
      case 'viewer': return t.settingsRoleViewer;
    }
  };

  return (
    <>
      <Card className="border-border/60  rounded-md overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Popover>
              <PopoverTrigger>
                <button className="relative w-12 h-12 rounded-full overflow-hidden ring-1 ring-border bg-muted hover:ring-primary transition-colors">
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
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.settingsProfileName}</Label>
              <Input value={name} onChange={e => setName(e.target.value)} className="h-8 rounded-sm bg-muted/30 border-border/60 focus:bg-background" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.settingsProfileEmail}</Label>
              <Input value={user?.email || ''} readOnly className="h-8 rounded-sm bg-muted/30 border-border/60 text-muted-foreground cursor-not-allowed" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.settingsProfileRole}</Label>
              <div className="h-8 flex items-center px-3 rounded-md border border-border/60 bg-muted/30 text-sm font-medium capitalize">
                {roleLabel(user?.role || 'viewer')}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.settingsLanguage}</Label>
              <LanguageSelect />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button size="sm" disabled={!dirty || updateMutation.isPending} onClick={() => updateMutation.mutate({ name, avatarSeed })} className="rounded-md">
              {updateMutation.isPending && <Spinner />}
              {t.settingsSave}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60  rounded-md mt-6">
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
              {themeOptions.map(opt => (
                <button
                  key={opt.v}
                  onClick={() => setTheme(opt.v)}
                  className={cn(
                    'flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-all',
                    theme === opt.v
                      ? 'bg-background text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <opt.icon size={15} /> {opt.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60  rounded-md mt-5">
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
              ].map(n => {
                const key = n.key as keyof typeof notifications;
                return (
                  <div key={n.key} className="flex items-center justify-between gap-4 p-3 rounded-md border border-border/60 bg-muted/20 sm:min-w-[180px]"
                  >
                    <div>
                      <p className="text-sm font-medium">{n.label}</p>
                      <p className="text-xs text-muted-foreground">{n.desc}</p>
                    </div>
                    <Switch
                      checked={notifications[key]}
                      onCheckedChange={(v) => setNotifications(s => ({ ...s, [key]: v }))}
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

function TeamSection() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const { user } = useAppStore();
  const isOwner = user?.role === 'owner';

  const [tab, setTab] = useState<'members' | 'invites'>('members');
  const [query, setQuery] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'viewer' as UserType['role'] });
  const [inviteResult, setInviteResult] = useState<{ url: string; token: string } | null>(null);

  const { data: users = [], isLoading: usersLoading } = useQuery({ queryKey: ['users'], queryFn: api.users.list });
  const { data: invites = [], isLoading: invitesLoading } = useQuery({ queryKey: ['invites'], queryFn: api.invites.list });

  const createInviteMutation = useMutation({
    mutationFn: () => api.invites.create({ email: inviteForm.email || undefined, role: inviteForm.role }),
    onSuccess: (res) => {
      setInviteResult({ url: res.url, token: res.invite.token });
      qc.invalidateQueries({ queryKey: ['invites'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const revokeInviteMutation = useMutation({
    mutationFn: api.invites.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invites'] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.users.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success(t.settingsTeamDeleted); },
    onError: (e: Error) => toast.error(e.message),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserType['role'] }) => api.users.update(id, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const resetMutation = useMutation({
    mutationFn: (id: string) => api.users.resetPassword(id),
    onSuccess: (res) => {
      navigator.clipboard.writeText(res.temporaryPassword);
      toast.success(`${t.settingsResetPasswordDone}: ${res.temporaryPassword}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const roleLabel = (role: UserType['role']) => {
    switch (role) {
      case 'owner': return t.settingsRoleOwner;
      case 'admin': return t.settingsRoleAdmin;
      case 'editor': return t.settingsRoleEditor;
      case 'viewer': return t.settingsRoleViewer;
    }
  };

  const roleStyle = (role: UserType['role']) => cn(
    'inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border',
    role === 'owner' && 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800',
    role === 'admin' && 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800',
    role === 'editor' && 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800',
    role === 'viewer' && 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-800'
  );

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(query.toLowerCase()) ||
    u.email.toLowerCase().includes(query.toLowerCase())
  );

  const pendingInvites = invites.filter(i => !i.usedAt);

  const formatDate = (ts?: number) => ts ? new Date(ts).toLocaleDateString() : '—';

  const tabs = [
    { id: 'members', label: 'Members', count: users.length },
    { id: 'invites', label: 'Invitations', count: pendingInvites.length },
  ] as const;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{t.settingsTeam}</h2>
          <p className="text-sm text-muted-foreground">Manage your team members and invitations.</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search members..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="h-9 rounded-sm bg-muted/30 border-border/60 text-sm w-64"
          />
          {isOwner && (
            <Button size="sm" onClick={() => setInviteOpen(!inviteOpen)} className="rounded-md">
              <Plus size={13} /> Invite
            </Button>
          )}
        </div>
      </div>

      {inviteOpen && (
        <Card className="border-border/60  rounded-md mb-6">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold">Invite member</p>
                <p className="text-xs text-muted-foreground">Generate a link or send an invite by email.</p>
              </div>
              <button onClick={() => setInviteOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.settingsInviteEmail}</Label>
                <Input
                  value={inviteForm.email}
                  onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="colleague@company.com"
                  className="h-8 rounded-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.settingsInviteRole}</Label>
                <div className="flex rounded-md border border-border overflow-hidden text-sm h-8">
                  {(['admin', 'editor', 'viewer'] as UserType['role'][]).map(r => (
                    <button
                      key={r}
                      onClick={() => setInviteForm(f => ({ ...f, role: r }))}
                      className={cn(
                        'flex-1 px-3 transition-colors border-r border-border last:border-r-0 capitalize',
                        inviteForm.role === r ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted'
                      )}
                    >
                      {roleLabel(r)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-end">
                <Button
                  size="sm"
                  className="rounded-md w-full"
                  disabled={createInviteMutation.isPending}
                  onClick={() => createInviteMutation.mutate()}
                >
                  {createInviteMutation.isPending ? <Spinner /> : <Mail size={13} />}
                  Generate invite
                </Button>
              </div>
            </div>

            {inviteResult && (
              <div className="mt-4 p-3 rounded-md bg-muted/30 border border-border/60">
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Share this link</p>
                <div className="flex items-center gap-2">
                  <Input value={`${typeof window !== 'undefined' ? window.location.origin : ''}${inviteResult.url}`} readOnly className="h-9 rounded-sm text-sm font-mono" />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-md shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText(`${typeof window !== 'undefined' ? window.location.origin : ''}${inviteResult.url}`);
                      toast.success(t.settingsInviteCopied);
                    }}
                  >
                    <Check size={13} />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-1 mb-4 border-b border-border">
        {tabs.map(tabItem => (
          <button
            key={tabItem.id}
            onClick={() => setTab(tabItem.id as typeof tab)}
            className={cn(
              'relative px-3 py-2 text-sm font-medium transition-colors',
              tab === tabItem.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tabItem.label}
            <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{tabItem.count}</span>
            {tab === tabItem.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-t-full" />}
          </button>
        ))}
      </div>

      {tab === 'members' && (
        <Card className="border-border/60  rounded-md">
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">{query ? 'No members found' : t.settingsTeamTableNoUsers}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-2.5 font-medium w-full">{t.settingsTeamTableUser}</th>
                      <th className="px-4 py-2.5 font-medium whitespace-nowrap">{t.settingsTeamTableRole}</th>
                      <th className="px-4 py-2.5 font-medium whitespace-nowrap">Status</th>
                      <th className="px-4 py-2.5 font-medium whitespace-nowrap">Joined</th>
                      <th className="px-4 py-2.5 font-medium text-right whitespace-nowrap">{t.settingsTeamTableActions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map(u => (
                      <tr key={u.id} className="group hover:bg-muted/20">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-border shrink-0">
                              <MemojiAvatar name={u.avatarSeed || u.email || u.name} size={32} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-foreground truncate">{u.name}</p>
                                {u.id === user?.id && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">You</span>}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {isOwner && u.id !== user?.id ? (
                            <RoleDropdown current={u.role} onSelect={(role) => roleMutation.mutate({ id: u.id, role })} t={t} />
                          ) : (
                            <span className={roleStyle(u.role)}>{roleLabel(u.role)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">{formatDate(u.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end">
                            {isOwner && u.id !== user?.id ? (
                              <UserActionsMenu
                                onReset={() => resetMutation.mutate(u.id)}
                                onDelete={() => {
                                  if (window.confirm(`Remove ${u.name} from the team?`)) deleteMutation.mutate(u.id);
                                }}
                                t={t}
                              />
                            ) : (
                              <span className="text-xs text-muted-foreground">{t.settingsTeamOwner}</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'invites' && (
        <Card className="border-border/60  rounded-md">
          <CardContent className="p-0">
            {pendingInvites.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">{t.settingsInviteEmpty}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-2.5 font-medium w-full">Email</th>
                      <th className="px-4 py-2.5 font-medium whitespace-nowrap">{t.settingsTeamTableRole}</th>
                      <th className="px-4 py-2.5 font-medium whitespace-nowrap">{t.settingsInviteExpires}</th>
                      <th className="px-4 py-2.5 font-medium whitespace-nowrap">{t.settingsInviteCreated}</th>
                      <th className="px-4 py-2.5 font-medium text-right whitespace-nowrap">{t.settingsTeamTableActions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {pendingInvites.map(inv => (
                      <tr key={inv.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3">
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{inv.email || 'Anyone with the link'}</p>
                            <p className="text-xs text-muted-foreground truncate">Token: {inv.token.slice(0, 8)}…</p>
                          </div>
                        </td>
                        <td className="px-4 py-3"><span className={roleStyle(inv.role)}>{roleLabel(inv.role)}</span></td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">{formatDate(inv.expiresAt)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">{formatDate(inv.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end">
                            <button
                              onClick={() => revokeInviteMutation.mutate(inv.id)}
                              className="inline-flex items-center gap-1 text-xs text-destructive hover:bg-destructive/10 px-2 py-1.5 rounded-md transition-colors"
                            >
                              <Trash2 size={12} /> {t.settingsInviteRevoke}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}

function UserActionsMenu({ onReset, onDelete, t }: { onReset: () => void; onDelete: () => void; t: ReturnType<typeof useI18n>['t'] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-center w-8 h-8 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-md border border-border/60 bg-popover p-1">
          <button
            onClick={() => { onReset(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-foreground hover:bg-muted transition-colors"
          >
            <KeyRound size={13} /> {t.settingsResetPassword}
          </button>
          <button
            onClick={() => { onDelete(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 size={13} /> {t.delete}
          </button>
        </div>
      )}
    </div>
  );
}

function RoleDropdown({ current, onSelect, t }: { current: UserType['role']; onSelect: (role: UserType['role']) => void; t: ReturnType<typeof useI18n>['t'] }) {
  const [open, setOpen] = useState(false);
  const roles: UserType['role'][] = ['admin', 'editor', 'viewer'];

  const roleLabel = (role: UserType['role']) => {
    switch (role) {
      case 'owner': return t.settingsRoleOwner;
      case 'admin': return t.settingsRoleAdmin;
      case 'editor': return t.settingsRoleEditor;
      case 'viewer': return t.settingsRoleViewer;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 hover:bg-slate-200 transition-colors"
      >
        {roleLabel(current)} <ChevronDown size={10} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[130px] rounded-md border border-border/60 bg-popover p-1">
          {roles.map(r => (
            <button
              key={r}
              onClick={() => { onSelect(r); setOpen(false); }}
              className={cn(
                'w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors',
                r === current && 'bg-primary/5 text-primary'
              )}
            >
              {roleLabel(r)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function IntegrationsSection() {
  const { t } = useI18n();
  const [tab, setTab] = useState<'smtp' | 'webhooks' | 'notifications'>('smtp');
  const [smtp, setSmtp] = useState({ host: '', port: '587', user: '', pass: '', from: '', secure: true });
  const [webhooks, setWebhooks] = useState<{ id: string; url: string; events: string[] }[]>([
    { id: '1', url: 'https://example.com/webhook', events: ['upload', 'delete'] },
  ]);

  const events = ['upload', 'delete', 'bucket.created', 'bucket.deleted'];

  const tabs = [
    { id: 'smtp', label: t.settingsSmtpTitle, icon: MailCheck },
    { id: 'webhooks', label: t.settingsWebhookTitle, icon: Webhook },
    { id: 'notifications', label: t.settingsNotificationsTitle, icon: Bell },
  ] as const;

  return (
    <>
      <div className="flex gap-1.5 p-1 rounded-md border border-border/60 bg-muted/20 w-fit mb-6">
        {tabs.map(item => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
              tab === item.id ? 'bg-background text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <item.icon size={14} /> {item.label}
          </button>
        ))}
      </div>

      {tab === 'smtp' && (
        <Card className="border-border/60  rounded-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-md bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center">
                <MailCheck size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">{t.settingsSmtpTitle}</p>
                <p className="text-xs text-muted-foreground">{t.settingsSmtpDesc}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <InputField label={t.settingsSmtpHost} value={smtp.host} onChange={v => setSmtp(s => ({ ...s, host: v }))} placeholder="smtp.example.com" />
              <InputField label={t.settingsSmtpPort} value={smtp.port} onChange={v => setSmtp(s => ({ ...s, port: v }))} />
              <InputField label={t.settingsSmtpFrom} value={smtp.from} onChange={v => setSmtp(s => ({ ...s, from: v }))} placeholder="atlas@example.com" />
              <InputField label={t.settingsSmtpUser} value={smtp.user} onChange={v => setSmtp(s => ({ ...s, user: v }))} />
              <InputField label={t.settingsSmtpPass} type="password" value={smtp.pass} onChange={v => setSmtp(s => ({ ...s, pass: v }))} />
              <div className="flex items-end">
                <label className="flex items-center gap-2.5 text-sm text-muted-foreground cursor-pointer h-8 px-3 rounded-md border border-border/60 bg-muted/30 w-full"
                >
                  <Switch checked={smtp.secure} onCheckedChange={(v) => setSmtp(s => ({ ...s, secure: v }))} />
                  {t.settingsSmtpSecure}
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button size="sm" variant="outline" className="rounded-md">
                <Send size={13} /> {t.settingsSmtpTest}
              </Button>
              <Button size="sm" className="rounded-md">{t.settingsSmtpSave}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'webhooks' && (
        <Card className="border-border/60  rounded-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-md bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center">
                  <Webhook size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.settingsWebhookTitle}</p>
                  <p className="text-xs text-muted-foreground">{t.settingsWebhookDesc}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="rounded-md" disabled>
                <Plus size={13} /> {t.settingsWebhookAdd}
              </Button>
            </div>

            {webhooks.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-border/60 rounded-md">
                <Webhook size={32} className="mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">{t.settingsWebhookEmpty}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {webhooks.map(wh => (
                  <div key={wh.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-md border border-border/60 bg-muted/20"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{wh.url}</p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {wh.events.map(e => <span key={e} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-background border border-border/60">{e}</span>)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" className="rounded-md">
                        <Send size={12} /> {t.settingsWebhookTest}
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive rounded-md">
                        <Trash2 size={12} /> {t.settingsWebhookDelete}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'notifications' && (
        <Card className="border-border/60  rounded-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-md bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center">
                <Bell size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">{t.settingsIntegrationsEmail}</p>
                <p className="text-xs text-muted-foreground">{t.settingsIntegrationsEmailDesc}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: t.settingsNotifyOnUpload, checked: true },
                { label: t.settingsNotifyOnDelete, checked: false },
              ].map((n, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-md border border-border/60 bg-muted/20"
                >
                  <span className="text-sm font-medium">{n.label}</span>
                  <Switch defaultChecked={n.checked} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

function InputField({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 rounded-sm bg-muted/30 border-border/60 focus:bg-background"
      />
    </div>
  );
}

function SecuritySection() {
  const { t } = useI18n();
  const { user } = useAppStore();
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  const mutation = useMutation({
    mutationFn: () => api.auth.changePassword({ currentPassword: currentPwd, newPassword: newPwd }),
    onSuccess: () => {
      toast.success(t.settingsPasswordChanged);
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mismatch = confirmPwd.length > 0 && newPwd !== confirmPwd;
  const canSubmit = currentPwd.length > 0 && newPwd.length >= 6 && newPwd === confirmPwd && !mutation.isPending;

  return (
    <>
      <Card className="border-border/60 rounded-md">
        <CardContent className="p-6">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center">
              <KeyRound size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">{t.settingsPasswordChange}</p>
              <p className="text-xs text-muted-foreground">{t.settingsPasswordHint}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <InputField label={t.settingsPasswordCurrent} type="password" value={currentPwd} onChange={setCurrentPwd} placeholder={t.settingsPasswordCurrentPlaceholder} />
            <InputField label={t.settingsPasswordNew} type="password" value={newPwd} onChange={setNewPwd} placeholder={t.settingsPasswordNewPlaceholder} />
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.settingsPasswordConfirm}</Label>
              <Input
                type="password"
                value={confirmPwd}
                onChange={e => setConfirmPwd(e.target.value)}
                placeholder={t.settingsPasswordConfirmPlaceholder}
                className={cn('h-8 rounded-sm bg-muted/30 border-border/60 focus:bg-background', mismatch && 'border-destructive')}
              />
              {mismatch && <p className="text-xs text-destructive">{t.settingsPasswordMismatch}</p>}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button size="sm" disabled={!canSubmit} onClick={() => mutation.mutate()} className="rounded-md"
            >
              {mutation.isPending && <Spinner />}
              {t.settingsPasswordChange}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/40  rounded-md mt-6">
        <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-destructive/10 flex items-center justify-center">
              <ShieldAlert size={18} className="text-destructive" />
            </div>
            <div>
              <p className="text-sm font-semibold">{t.settingsDangerDelete}</p>
              <p className="text-xs text-muted-foreground">{t.settingsDangerDeleteHint}</p>
            </div>
          </div>
          <Button variant="destructive" size="sm" className="rounded-md w-fit">{t.settingsDangerDelete}…</Button>
        </CardContent>
      </Card>
    </>
  );
}

const AVATAR_SEEDS = [
  'atlas-1', 'atlas-2', 'atlas-3', 'atlas-4', 'atlas-5', 'atlas-6',
  'memoji-a', 'memoji-b', 'memoji-c', 'memoji-d', 'memoji-e', 'memoji-f',
  'user-1', 'user-2', 'user-3', 'user-4', 'user-5', 'user-6',
];

function AvatarGrid({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="grid grid-cols-6 gap-1.5">
      {AVATAR_SEEDS.map(seed => {
        const active = seed === value;
        return (
          <button
            key={seed}
            type="button"
            onClick={() => onChange(seed)}
            className={cn(
              'relative p-1 rounded-full transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted'
            )}
          >
            <MemojiAvatar name={seed} size={36} className="rounded-full" />
            {active && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center border border-background"
              >
                <Check size={9} strokeWidth={3} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function Spinner() {
  return <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />;
}
