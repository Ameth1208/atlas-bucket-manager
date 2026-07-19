'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Webhook, Bell, Plus, Send, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { Spinner } from './spinner';
import { api } from '@/lib/api';
import type { Dictionary } from '@/lib/i18n/types';

const ALL_EVENTS = ['upload', 'delete', 'bucket.create', 'bucket.delete', 'clone'] as const;
type WebhookEvent = (typeof ALL_EVENTS)[number];

export function IntegrationsSection() {
  const { t } = useI18n();
  const [tab, setTab] = useState<'webhooks' | 'notifications'>('webhooks');

  const tabs = [
    { id: 'webhooks' as const, label: t.settingsWebhooks, icon: Webhook },
    { id: 'notifications' as const, label: t.notifyEmailLabel, icon: Bell },
  ];

  return (
    <>
      <div className="flex gap-1.5 p-1 rounded-md border border-border/60 bg-muted/20 w-fit mb-6">
        {tabs.map((item) => (
          <button
            type="button"
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

      {tab === 'webhooks' && <WebhooksTab t={t} />}
      {tab === 'notifications' && <NotificationsTab t={t} />}
    </>
  );
}

function WebhooksTab({ t }: { t: Dictionary }) {
  const qc = useQueryClient();
  const { data: webhooks = [], isLoading } = useQuery({
    queryKey: ['webhooks'],
    queryFn: api.integrations.listWebhooks,
  });
  const [newUrl, setNewUrl] = useState('');
  const [newEvents, setNewEvents] = useState<WebhookEvent[]>(['upload']);

  const createMutation = useMutation({
    mutationFn: () => api.integrations.createWebhook({ url: newUrl.trim(), events: newEvents }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['webhooks'] });
      setNewUrl('');
      setNewEvents(['upload']);
      toast.success(t.webhookSaved);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.integrations.deleteWebhook(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['webhooks'] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const testMutation = useMutation({
    mutationFn: (id: string) => api.integrations.testWebhook(id),
    onSuccess: (res) => {
      if (res.success) toast.success(t.webhookTestSent);
      else toast.error(t.webhookTestFailed.replace('{error}', 'webhook returned non-2xx'));
    },
    onError: (e: Error) => toast.error(t.webhookTestFailed.replace('{error}', e.message)),
  });

  const toggleEvent = (ev: WebhookEvent) => {
    setNewEvents((prev) => (prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev]));
  };

  return (
    <Card className="border-border/60 rounded-md">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center">
            <Webhook size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">{t.settingsWebhooks}</p>
            <p className="text-xs text-muted-foreground">{t.settingsWebhooksDesc}</p>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t.webhookEventsLabel}
              </Label>
              <Input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder={t.webhookUrlPh}
                className="h-8 rounded-sm font-mono text-xs"
              />
            </div>
            <div className="flex items-end">
              <Button
                size="sm"
                className="rounded-md w-full"
                disabled={!newUrl.trim() || newEvents.length === 0 || createMutation.isPending}
                onClick={() => createMutation.mutate()}
              >
                {createMutation.isPending ? <Spinner /> : <Plus size={13} />}
                {t.webhookSave}
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ALL_EVENTS.map((ev) => {
              const active = newEvents.includes(ev);
              return (
                <button
                  type="button"
                  key={ev}
                  onClick={() => toggleEvent(ev)}
                  className={cn(
                    'text-[11px] font-medium px-2.5 py-1 rounded-md border transition-colors',
                    active
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-background text-muted-foreground border-border hover:text-foreground'
                  )}
                >
                  {ev}
                </button>
              );
            })}
          </div>
        </div>

        {isLoading ? (
          <p className="text-xs text-muted-foreground">{t.settingsLoading}</p>
        ) : webhooks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">{t.settingsWebhookEmpty}</p>
        ) : (
          <div className="space-y-3">
            {webhooks.map((wh) => (
              <div
                key={wh.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-md border border-border/60 bg-muted/20"
              >
                <div className="min-w-0">
                  <p className="text-sm font-mono truncate">{wh.url}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {wh.events.map((e) => (
                      <span
                        key={e}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-background border border-border/60"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-md"
                    disabled={testMutation.isPending}
                    onClick={() => testMutation.mutate(wh.id)}
                  >
                    {testMutation.isPending ? <Spinner /> : <Send size={12} />}
                    {t.webhookTest}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive rounded-md"
                    onClick={() => deleteMutation.mutate(wh.id)}
                  >
                    <Trash2 size={12} />
                    {t.settingsWebhookDelete}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function NotificationsTab({ t }: { t: Dictionary }) {
  const qc = useQueryClient();
  const { data: prefs, isLoading } = useQuery({
    queryKey: ['notification-prefs'],
    queryFn: api.integrations.getNotificationPrefs,
  });

  const saveMutation = useMutation({
    mutationFn: api.integrations.updateNotificationPrefs,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notification-prefs'] });
      toast.success(t.notifySaved);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = (patch: Parameters<typeof api.integrations.updateNotificationPrefs>[0]) => {
    saveMutation.mutate(patch);
  };

  if (isLoading || !prefs) {
    return (
      <Card className="border-border/60 rounded-md">
        <CardContent className="p-6">
          <p className="text-xs text-muted-foreground">{t.settingsLoading}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 rounded-md">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center">
            <Bell size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">{t.notifyEmailLabel}</p>
            <p className="text-xs text-muted-foreground">{t.notifyEmailDesc}</p>
          </div>
        </div>

        <div className="space-y-3">
          <PrefRow
            label={t.notifyOnUploadLabel}
            description={t.notifyOnUploadDesc}
            checked={prefs.onUpload}
            disabled={!prefs.emailEnabled}
            onChange={(v) => update({ onUpload: v })}
          />
          <PrefRow
            label={t.notifyOnDeleteLabel}
            description={t.notifyOnDeleteDesc}
            checked={prefs.onDelete}
            disabled={!prefs.emailEnabled}
            onChange={(v) => update({ onDelete: v })}
          />
          <PrefRow
            label={t.notifyEmailLabel}
            description={t.notifyEmailDesc}
            checked={prefs.emailEnabled}
            onChange={(v) => update({ emailEnabled: v })}
            highlight
          />
        </div>

        <p className="text-[11px] text-muted-foreground/80 border-t border-border pt-3">
          SMTP delivery is configured separately by the admin. Ask your owner to wire it up in the Atlas deployment.
        </p>
      </CardContent>
    </Card>
  );
}

function PrefRow({
  label,
  description,
  checked,
  onChange,
  disabled,
  highlight,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 rounded-md border bg-muted/20',
        highlight ? 'border-primary/30' : 'border-border/60',
        disabled && 'opacity-60'
      )}
    >
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}
