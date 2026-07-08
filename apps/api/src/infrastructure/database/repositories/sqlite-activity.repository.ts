import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { ActivityEntry } from '../../../domain/entities/activity.entity';
import { IActivityRepository } from '../../../domain/repositories/activity.repository';

@Injectable()
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

  list(limit: number, offset: number): ActivityEntry[] {
    const rows = this.database.db
      .prepare(
        `SELECT * FROM activity_log ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      )
      .all(limit, offset) as any[];
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
