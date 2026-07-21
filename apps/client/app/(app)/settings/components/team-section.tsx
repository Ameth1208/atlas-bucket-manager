'use client';

import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MemojiAvatar } from '@/components/ui/memoji-avatar';
import { Plus, Mail, Check, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { useTeam } from '../hooks/use-team';
import { useInvite } from '../hooks/use-invite';
import { RoleDropdown } from './role-dropdown';
import { UserActionsMenu } from './user-actions-menu';
import { Spinner } from './spinner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { getRoleLabel, getRoleStyle } from '../lib/role-utils';
import type { User } from '@/lib/api';
import type { Dictionary } from '@/lib/i18n/types';

const formatDate = (ts: number | undefined, locale: string) =>
  ts
    ? new Date(ts).toLocaleDateString(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : '—';

export function TeamSection() {
  const { t, tx, meta } = useI18n();
  const { user, isOwner, users, invites, deleteMutation, roleMutation, resetMutation } = useTeam();
  const dateLocale = meta.htmlLang;
  const {
    inviteOpen,
    setInviteOpen,
    inviteForm,
    setInviteForm,
    inviteResult,
    createInviteMutation,
    revokeInviteMutation,
  } = useInvite();

  const [tab, setTab] = useState<'members' | 'invites'>('members');
  const [query, setQuery] = useState('');
  const [pendingDelete, setPendingDelete] = useState<User | null>(null);
  const [pendingDemote, setPendingDemote] = useState<{ user: User; nextRole: User['role'] } | null>(null);

  const ownerCount = useMemo(() => users.filter((u) => u.role === 'owner').length, [users]);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
  );

  const pendingInvites = invites.filter((i) => !i.usedAt);

  const tabs = [
    { id: 'members' as const, label: t.teamTabMembers, count: users.length },
    { id: 'invites' as const, label: t.teamTabInvitations, count: pendingInvites.length },
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{t.settingsTeam}</h2>
          <p className="text-sm text-muted-foreground">{t.settingsTeamDesc}</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder={t.teamSearchPh}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 rounded-sm bg-muted/30 border-border/60 text-sm w-64"
          />
          {isOwner && (
            <Button type="button" size="sm" onClick={() => setInviteOpen(!inviteOpen)} className="rounded-md">
              <Plus size={13} /> {t.teamInviteButton}
            </Button>
          )}
        </div>
      </div>

      {inviteOpen && (
        <InviteForm
          t={t}
          inviteForm={inviteForm}
          setInviteForm={setInviteForm}
          inviteResult={inviteResult}
          createInviteMutation={createInviteMutation}
          onClose={() => setInviteOpen(false)}
        />
      )}

      <div className="flex gap-1 mb-4 border-b border-border">
        {tabs.map((tabItem) => (
          <button
            type="button"
            key={tabItem.id}
            onClick={() => setTab(tabItem.id)}
            className={cn(
              'relative px-3 py-2 text-sm font-medium transition-colors',
              tab === tabItem.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tabItem.label}
            <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
              {tabItem.count}
            </span>
            {tab === tabItem.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-t-full" />}
          </button>
        ))}
      </div>

      {tab === 'members' && (
        <MembersTab
          t={t}
          user={user}
          isOwner={isOwner}
          ownerCount={ownerCount}
          filtered={filtered}
          roleMutation={roleMutation}
          resetMutation={resetMutation}
          onRequestDelete={setPendingDelete}
          onRequestDemote={(u, nextRole) => setPendingDemote({ user: u, nextRole })}
          query={query}
          formatDate={(ts) => formatDate(ts, dateLocale)}
        />
      )}

      {tab === 'invites' && (
        <InvitesTab
          t={t}
          pendingInvites={pendingInvites}
          revokeInviteMutation={revokeInviteMutation}
          formatDate={(ts) => formatDate(ts, dateLocale)}
        />
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title={tx('teamRemoveConfirm', { name: pendingDelete?.name ?? '' })}
        description={t.settingsTeamDeleted}
        confirmKey="delete"
        onConfirm={() => {
          if (pendingDelete) deleteMutation.mutate(pendingDelete.id);
          setPendingDelete(null);
        }}
        variant="destructive"
      />
      <ConfirmDialog
        open={!!pendingDemote}
        onOpenChange={(o) => !o && setPendingDemote(null)}
        title={t.confirmDemoteLastOwnerTitle}
        description={t.confirmDemoteLastOwnerDesc}
        confirmLabel="OK"
        onConfirm={() => setPendingDemote(null)}
        variant="default"
        icon="warning"
      />
    </>
  );
}

interface InviteFormProps {
  t: Dictionary;
  inviteForm: { email: string; role: User['role'] };
  setInviteForm: Dispatch<SetStateAction<{ email: string; role: User['role'] }>>;
  inviteResult: { url: string; token: string } | null;
  createInviteMutation: { isPending: boolean; mutate: () => void };
  onClose: () => void;
}

function InviteForm({
  t,
  inviteForm,
  setInviteForm,
  inviteResult,
  createInviteMutation,
  onClose,
}: InviteFormProps) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <Card className="border-border/60 rounded-md mb-6">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold">{t.teamInviteMember}</p>
            <p className="text-xs text-muted-foreground">{t.teamInviteDescription}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar invitación"
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.settingsInviteEmail}
            </Label>
            <Input
              value={inviteForm.email}
              onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="colleague@company.com"
              className="h-8 rounded-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.settingsInviteRole}
            </Label>
            <div className="flex rounded-md border border-border overflow-hidden text-sm h-8">
              {(['admin', 'editor', 'viewer'] as User['role'][]).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setInviteForm((f) => ({ ...f, role: r }))}
                  className={cn(
                    'flex-1 px-3 transition-colors border-r border-border last:border-r-0 capitalize',
                    inviteForm.role === r ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  {getRoleLabel(t, r)}
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
              {t.teamInviteGenerate}
            </Button>
          </div>
        </div>

        {inviteResult && (
          <div className="mt-4 p-3 rounded-md bg-muted/30 border border-border/60">
            <p className="text-xs font-medium text-muted-foreground mb-1.5">{t.teamShareLink}</p>
            <div className="flex items-center gap-2">
              <Input
                value={`${origin}${inviteResult.url}`}
                readOnly
                className="h-9 rounded-sm text-sm font-mono"
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="rounded-md shrink-0"
                aria-label={t.settingsInviteCopy}
                onClick={() => {
                  navigator.clipboard.writeText(`${origin}${inviteResult.url}`);
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
  );
}

interface MembersTabProps {
  t: Dictionary;
  user: User | null;
  isOwner: boolean;
  ownerCount: number;
  filtered: User[];
  roleMutation: { mutate: (payload: { id: string; role: User['role'] }) => void };
  resetMutation: { mutate: (id: string) => void };
  onRequestDelete: (user: User) => void;
  onRequestDemote: (user: User, nextRole: User['role']) => void;
  query: string;
  formatDate: (ts?: number) => string;
}

function MembersTab({
  t,
  user,
  isOwner,
  ownerCount,
  filtered,
  roleMutation,
  resetMutation,
  onRequestDelete,
  onRequestDemote,
  formatDate,
  query,
}: MembersTabProps) {
  return (
    <Card className="border-border/60 rounded-md">
      <CardContent className="p-0">
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">{query ? t.teamNoMembers : t.settingsTeamTableNoUsers}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium w-full">{t.settingsTeamTableUser}</th>
                  <th className="px-4 py-2.5 font-medium whitespace-nowrap">{t.settingsTeamTableRole}</th>
                  <th className="px-4 py-2.5 font-medium whitespace-nowrap">{t.teamStatusColumn}</th>
                  <th className="px-4 py-2.5 font-medium whitespace-nowrap">{t.teamJoinedColumn}</th>
                  <th className="px-4 py-2.5 font-medium text-right whitespace-nowrap">{t.settingsTeamTableActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((u) => {
                  const isLastOwner = u.role === 'owner' && ownerCount <= 1;
                  return (
                    <tr key={u.id} className="group hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-border shrink-0">
                            <MemojiAvatar name={u.avatarSeed || u.email || u.name} size={32} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground truncate">{u.name}</p>
                              {u.id === user?.id && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {isOwner && u.id !== user?.id ? (
                          <RoleDropdown
                            current={u.role}
                            isLastOwner={isLastOwner}
                            onSelect={(role) => {
                              if (isLastOwner && role !== 'owner') {
                                onRequestDemote(u, role);
                                return;
                              }
                              roleMutation.mutate({ id: u.id, role });
                            }}
                            t={t}
                          />
                        ) : (
                          <span className={getRoleStyle(u.role)}>{getRoleLabel(t, u.role)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {t.teamStatusActive}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          {isOwner && u.id !== user?.id ? (
                            <UserActionsMenu
                              onReset={() => resetMutation.mutate(u.id)}
                              onDelete={() => {
                                if (isLastOwner) {
                                  onRequestDemote(u, 'admin');
                                } else {
                                  onRequestDelete(u);
                                }
                              }}
                              t={t}
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">{t.settingsTeamOwner}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface InvitesTabProps {
  t: Dictionary;
  pendingInvites: { id: string; email?: string; token: string; role: User['role']; expiresAt?: number; createdAt: number }[];
  revokeInviteMutation: { mutate: (id: string) => void };
  formatDate: (ts?: number) => string;
}

function InvitesTab({ t, pendingInvites, revokeInviteMutation, formatDate }: InvitesTabProps) {
  return (
    <Card className="border-border/60 rounded-md">
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
                  <th className="px-4 py-2.5 font-medium w-full">{t.teamEmailColumn}</th>
                  <th className="px-4 py-2.5 font-medium whitespace-nowrap">{t.settingsTeamTableRole}</th>
                  <th className="px-4 py-2.5 font-medium whitespace-nowrap">{t.settingsInviteExpires}</th>
                  <th className="px-4 py-2.5 font-medium whitespace-nowrap">{t.settingsInviteCreated}</th>
                  <th className="px-4 py-2.5 font-medium text-right whitespace-nowrap">{t.settingsTeamTableActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pendingInvites.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{inv.email || t.teamAnyoneWithLink}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {t.teamToken}: {inv.token.slice(0, 8)}…
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={getRoleStyle(inv.role)}>{getRoleLabel(t, inv.role)}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                      {formatDate(inv.expiresAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                      {formatDate(inv.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
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
  );
}
