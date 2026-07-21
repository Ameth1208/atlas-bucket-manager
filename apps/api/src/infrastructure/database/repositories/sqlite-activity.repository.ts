import { DatabaseService } from '../database.service';
import { ActivityEntry } from '../../../domain/entities/activity.entity';
import { IActivityRepository } from '../../../domain/repositories/activity.repository';

export class SqliteActivityRepository implements IActivityRepository {
  constructor(private readonly database: DatabaseService) {}

  log(entry: Omit<ActivityEntry, 'id' | 'createdAt'>): void {
    this.database.db
      .prepare(
        `INSERT INTO activity_log
          (user_id, actor, action, target, bucket, provider, ip, status_code)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
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

  list(
    limit: number,
    offset: number,
    filters: {
      action?: string;
      actions?: string[];
      actor?: string;
      bucket?: string;
      provider?: string;
      from?: number;
      to?: number;
    } = {},
  ): ActivityEntry[] {
    const where: string[] = [];
    const params: any[] = [];
    if (filters.actions && filters.actions.length > 0) {
      where.push(`action IN (${filters.actions.map(() => '?').join(',')})`);
      params.push(...filters.actions);
    } else if (filters.action) {
      where.push('action = ?');
      params.push(filters.action);
    }
    if (filters.actor) {
      where.push('actor LIKE ?');
      params.push(`%${filters.actor}%`);
    }
    if (filters.bucket) {
      where.push('bucket = ?');
      params.push(filters.bucket);
    }
    if (filters.provider) {
      where.push('provider = ?');
      params.push(filters.provider);
    }
    if (typeof filters.from === 'number') {
      where.push('created_at >= ?');
      params.push(filters.from);
    }
    if (typeof filters.to === 'number') {
      where.push('created_at <= ?');
      params.push(filters.to);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const sql = `SELECT * FROM activity_log ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const rows = this.database.db.prepare(sql).all(...params, limit, offset) as any[];
    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      actor: r.actor,
      action: r.action,
      target: r.target,
      bucket: r.bucket,
      provider: r.provider,
      ip: r.ip,
      statusCode: r.status_code,
      createdAt: r.created_at,
    }));
  }
}
