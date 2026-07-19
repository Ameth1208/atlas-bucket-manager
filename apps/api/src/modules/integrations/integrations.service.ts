import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { DatabaseService } from '../../infrastructure/database/database.service';
import { ActivityService } from '../activity/activity.service';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  createdBy: string;
  createdAt: number;
}

export interface NotificationPrefs {
  emailEnabled: boolean;
  onUpload: boolean;
  onDelete: boolean;
}

@Injectable()
export class IntegrationsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly activity: ActivityService,
  ) {}

  listWebhooks(): Webhook[] {
    const rows = this.database.db
      .prepare('SELECT id, url, events, created_by, created_at FROM webhooks ORDER BY created_at DESC')
      .all() as { id: string; url: string; events: string; created_by: string; created_at: number }[];
    return rows.map((r) => ({
      id: r.id,
      url: r.url,
      events: r.events ? (JSON.parse(r.events) as string[]) : [],
      createdBy: r.created_by,
      createdAt: r.created_at * 1000,
    }));
  }

  createWebhook(url: string, events: string[], user: AuthUser): Webhook {
    const id = crypto.randomUUID();
    this.database.db
      .prepare(
        'INSERT INTO webhooks (id, url, events, created_by) VALUES (?, ?, ?, ?)',
      )
      .run(id, url, JSON.stringify(events), user?.email ?? 'system');
    const created = this.listWebhooks().find((w) => w.id === id)!;
    this.activity.log({
      actor: user?.email ?? 'system',
      action: 'webhook',
      target: created.url,
    });
    return created;
  }

  deleteWebhook(id: string, user: AuthUser): { success: boolean } {
    const result = this.database.db.prepare('DELETE FROM webhooks WHERE id = ?').run(id);
    if (result.changes === 0) throw new NotFoundException('Webhook not found');
    this.activity.log({ actor: user?.email ?? 'system', action: 'webhook', target: id });
    return { success: true };
  }

  async testWebhook(id: string): Promise<{ success: boolean }> {
    const row = this.database.db
      .prepare('SELECT url FROM webhooks WHERE id = ?')
      .get(id) as { url: string } | undefined;
    if (!row) throw new NotFoundException('Webhook not found');
    try {
      const res = await fetch(row.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Atlas-Test': '1' },
        body: JSON.stringify({ test: true, ts: Date.now() }),
      });
      return { success: res.ok };
    } catch {
      return { success: false };
    }
  }

  getNotificationPrefs(user: AuthUser): NotificationPrefs {
    const row = this.database.db
      .prepare('SELECT email_enabled, on_upload, on_delete FROM notification_prefs WHERE user_id = ?')
      .get(user?.userId ?? '') as
      | { email_enabled: number; on_upload: number; on_delete: number }
      | undefined;
    if (!row) {
      return { emailEnabled: true, onUpload: true, onDelete: true };
    }
    return {
      emailEnabled: row.email_enabled === 1,
      onUpload: row.on_upload === 1,
      onDelete: row.on_delete === 1,
    };
  }

  updateNotificationPrefs(user: AuthUser, prefs: Partial<NotificationPrefs>): NotificationPrefs {
    const current = this.getNotificationPrefs(user);
    const next: NotificationPrefs = {
      emailEnabled: prefs.emailEnabled ?? current.emailEnabled,
      onUpload: prefs.onUpload ?? current.onUpload,
      onDelete: prefs.onDelete ?? current.onDelete,
    };
    this.database.db
      .prepare(
        `INSERT INTO notification_prefs (user_id, email_enabled, on_upload, on_delete, updated_at)
         VALUES (?, ?, ?, ?, unixepoch())
         ON CONFLICT(user_id) DO UPDATE SET
           email_enabled = excluded.email_enabled,
           on_upload = excluded.on_upload,
           on_delete = excluded.on_delete,
           updated_at = unixepoch()`,
      )
      .run(
        user?.userId ?? '',
        next.emailEnabled ? 1 : 0,
        next.onUpload ? 1 : 0,
        next.onDelete ? 1 : 0,
      );
    return next;
  }
}
