import { getDatabase } from '../database/database';
import { IActivityRepository, ActivityEntry } from '../../domain/repositories/activity.repository.interface';

interface ActivityRow {
  id: number;
  user_id: string | null;
  actor: string;
  action: string;
  target: string | null;
  bucket: string | null;
  provider: string | null;
  ip: string | null;
  status_code: number | null;
  created_at: number;
}

function rowToEntry(row: ActivityRow): ActivityEntry {
  return {
    id: row.id,
    userId: row.user_id ?? undefined,
    actor: row.actor,
    action: row.action,
    target: row.target ?? undefined,
    bucket: row.bucket ?? undefined,
    provider: row.provider ?? undefined,
    ip: row.ip ?? undefined,
    statusCode: row.status_code ?? undefined,
    createdAt: row.created_at,
  };
}

export class SqliteActivityRepository implements IActivityRepository {
  private get db() { return getDatabase(); }

  log(entry: ActivityEntry): void {
    this.db.prepare(
      `INSERT INTO activity_log (user_id, actor, action, target, bucket, provider, ip, status_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      entry.userId ?? null,
      entry.actor,
      entry.action,
      entry.target ?? null,
      entry.bucket ?? null,
      entry.provider ?? null,
      entry.ip ?? null,
      entry.statusCode ?? null,
    );
  }

  list(limit = 50, offset = 0): ActivityEntry[] {
    const rows = this.db.prepare(
      'SELECT * FROM activity_log ORDER BY created_at DESC LIMIT ? OFFSET ?'
    ).all(limit, offset) as ActivityRow[];
    return rows.map(rowToEntry);
  }

  listByBucket(bucket: string, limit = 50): ActivityEntry[] {
    const rows = this.db.prepare(
      'SELECT * FROM activity_log WHERE bucket = ? ORDER BY created_at DESC LIMIT ?'
    ).all(bucket, limit) as ActivityRow[];
    return rows.map(rowToEntry);
  }

  listByUser(userId: string, limit = 50): ActivityEntry[] {
    const rows = this.db.prepare(
      'SELECT * FROM activity_log WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
    ).all(userId, limit) as ActivityRow[];
    return rows.map(rowToEntry);
  }
}
