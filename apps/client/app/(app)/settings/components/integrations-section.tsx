'use client';

import { useState, type Dispatch, type SetStateAction } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { MailCheck, Webhook, Bell, Plus, Send, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { SettingsInput } from './settings-input';
import type { Dictionary } from '@/lib/i18n/types';

type SmtpState = { host: string; port: string; user: string; pass: string; from: string; secure: boolean };

type WebhookItem = { id: string; url: string; events: string[] };

export function IntegrationsSection() {
  const { t } = useI18n();
  const [tab, setTab] = useState<'smtp' | 'webhooks' | 'notifications'>('smtp');
  const [smtp, setSmtp] = useState<SmtpState>({ host: '', port: '587', user: '', pass: '', from: '', secure: true });
  const [webhooks] = useState<WebhookItem[]>([
    { id: '1', url: 'https://example.com/webhook', events: ['upload', 'delete'] },
  ]);

  const tabs = [
    { id: 'smtp' as const, label: t.settingsSmtpTitle, icon: MailCheck },
    { id: 'webhooks' as const, label: t.settingsWebhookTitle, icon: Webhook },
    { id: 'notifications' as const, label: t.settingsNotificationsTitle, icon: Bell },
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

      {tab === 'smtp' && <SmtpTab t={t} smtp={smtp} setSmtp={setSmtp} />}
      {tab === 'webhooks' && <WebhooksTab t={t} webhooks={webhooks} />}
      {tab === 'notifications' && <NotificationsTab t={t} />}
    </>
  );
}

interface SmtpTabProps {
  t: Dictionary;
  smtp: SmtpState;
  setSmtp: Dispatch<SetStateAction<SmtpState>>;
}

function SmtpTab({ t, smtp, setSmtp }: SmtpTabProps) {
  return (
    <Card className="border-border/60 rounded-md">
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
          <SettingsInput
            label={t.settingsSmtpHost}
            value={smtp.host}
            onChange={(v: string) => setSmtp((s) => ({ ...s, host: v }))}
            placeholder="smtp.example.com"
          />
          <SettingsInput
            label={t.settingsSmtpPort}
            value={smtp.port}
            onChange={(v: string) => setSmtp((s) => ({ ...s, port: v }))}
          />
          <SettingsInput
            label={t.settingsSmtpFrom}
            value={smtp.from}
            onChange={(v: string) => setSmtp((s) => ({ ...s, from: v }))}
            placeholder="atlas@example.com"
          />
          <SettingsInput
            label={t.settingsSmtpUser}
            value={smtp.user}
            onChange={(v: string) => setSmtp((s) => ({ ...s, user: v }))}
          />
          <SettingsInput
            label={t.settingsSmtpPass}
            type="password"
            value={smtp.pass}
            onChange={(v: string) => setSmtp((s) => ({ ...s, pass: v }))}
          />
          <div className="flex items-end">
            <label className="flex items-center gap-2.5 text-sm text-muted-foreground cursor-pointer h-8 px-3 rounded-md border border-border/60 bg-muted/30 w-full">
              <Switch checked={smtp.secure} onCheckedChange={(v) => setSmtp((s) => ({ ...s, secure: v }))} />
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
  );
}

interface WebhooksTabProps {
  t: Dictionary;
  webhooks: WebhookItem[];
}

function WebhooksTab({ t, webhooks }: WebhooksTabProps) {
  return (
    <Card className="border-border/60 rounded-md">
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
            {webhooks.map((wh) => (
              <div
                key={wh.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-md border border-border/60 bg-muted/20"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{wh.url}</p>
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
  );
}

interface NotificationsTabProps {
  t: Dictionary;
}

function NotificationsTab({ t }: NotificationsTabProps) {
  return (
    <Card className="border-border/60 rounded-md">
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
          ].map((n) => (
            <div
              key={n.label}
              className="flex items-center justify-between p-4 rounded-md border border-border/60 bg-muted/20"
            >
              <span className="text-sm font-medium">{n.label}</span>
              <Switch defaultChecked={n.checked} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
