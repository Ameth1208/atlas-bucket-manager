import * as crypto from 'crypto';
import { DatabaseService } from '../database.service';
import { IInviteRepository } from '../../../domain/repositories/invite.repository';
import { Invite } from '../../../domain/entities/invite.entity';

export class SqliteInviteRepository implements IInviteRepository {
  constructor(private readonly database: DatabaseService) {}

  create(input: Omit<Invite, 'id' | 'createdAt'>): Invite {
    const id = crypto.randomUUID();
    const token = input.token || crypto.randomUUID();
    const createdAt = Date.now();
    this.database.db
      .prepare(
        `INSERT INTO invites (id, token, email, role, created_by, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        id,
        token,
        input.email ?? null,
        input.role,
        input.createdBy,
        input.expiresAt ?? null,
        createdAt,
      );
    return this.findById(id)!;
  }

  findById(id: string): Invite | null {
    const row = this.database.db.prepare('SELECT * FROM invites WHERE id = ?').get(id) as any;
    return row ? this.map(row) : null;
  }

  findByToken(token: string): Invite | null {
    const row = this.database.db.prepare('SELECT * FROM invites WHERE token = ?').get(token) as any;
    return row ? this.map(row) : null;
  }

  markUsed(id: string): void {
    this.database.db
      .prepare('UPDATE invites SET used_at = ? WHERE id = ?')
      .run(Date.now(), id);
  }

  list(): Invite[] {
    const rows = this.database.db
      .prepare('SELECT * FROM invites ORDER BY created_at DESC')
      .all() as any[];
    return rows.map((r) => this.map(r));
  }

  delete(id: string): boolean {
    const result = this.database.db.prepare('DELETE FROM invites WHERE id = ?').run(id);
    return result.changes > 0;
  }

  private map(row: any): Invite {
    return {
      id: row.id,
      token: row.token,
      email: row.email ?? undefined,
      role: row.role,
      createdBy: row.created_by,
      usedAt: row.used_at ?? undefined,
      expiresAt: row.expires_at ?? undefined,
      createdAt: row.created_at,
    };
  }
}
