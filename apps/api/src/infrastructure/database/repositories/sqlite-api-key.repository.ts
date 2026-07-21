import * as crypto from 'crypto';
import { DatabaseService } from '../database.service';
import {
  ApiKey,
  ApiKeyInfo,
  CreatedApiKey,
  CreateApiKeyInput,
} from '../../../domain/entities/api-key.entity';
import { IApiKeyRepository } from '../../../domain/repositories/api-key.repository';

export class SqliteApiKeyRepository implements IApiKeyRepository {
  constructor(private readonly database: DatabaseService) {}

  findByHash(hash: string): ApiKey | null {
    const row = this.database.db
      .prepare('SELECT * FROM api_keys WHERE key_hash = ?')
      .get(hash) as any;
    return row ? this.map(row) : null;
  }

  findById(id: string): ApiKey | null {
    const row = this.database.db
      .prepare('SELECT * FROM api_keys WHERE id = ?')
      .get(id) as any;
    return row ? this.map(row) : null;
  }

  list(userId?: string): ApiKeyInfo[] {
    const rows = userId
      ? (this.database.db
          .prepare('SELECT * FROM api_keys WHERE user_id = ? ORDER BY created_at DESC')
          .all(userId) as any[])
      : (this.database.db
          .prepare('SELECT * FROM api_keys ORDER BY created_at DESC')
          .all() as any[]);
    return rows.map((r) => this.toInfo(r));
  }

  create(input: CreateApiKeyInput & { keyHash: string; prefix: string; fullKey: string }): CreatedApiKey {
    const id = crypto.randomUUID();
    this.database.db
      .prepare(
        `INSERT INTO api_keys (id, name, key_hash, prefix, scopes, user_id, bucket_filter)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        id,
        input.name,
        input.keyHash,
        input.prefix,
        input.scopes,
        input.userId,
        input.bucketFilter ?? null,
      );
    const created = this.findById(id)!;
    return { ...this.toInfo(created as any), fullKey: input.fullKey };
  }

  revoke(id: string): boolean {
    const result = this.database.db
      .prepare('UPDATE api_keys SET revoked_at = unixepoch() WHERE id = ? AND revoked_at IS NULL')
      .run(id);
    return result.changes > 0;
  }

  updateLastUsed(id: string): void {
    this.database.db
      .prepare('UPDATE api_keys SET last_used = unixepoch() WHERE id = ?')
      .run(id);
  }

  private map(row: any): ApiKey {
    return {
      id: row.id,
      name: row.name,
      keyHash: row.key_hash,
      prefix: row.prefix,
      scopes: row.scopes,
      userId: row.user_id,
      bucketFilter: row.bucket_filter,
      lastUsed: row.last_used,
      createdAt: row.created_at,
      revokedAt: row.revoked_at,
    };
  }

  private toInfo(row: any): ApiKeyInfo {
    return {
      id: row.id,
      name: row.name,
      prefix: row.prefix,
      scopes: row.scopes,
      userId: row.user_id,
      bucketFilter: row.bucket_filter,
      lastUsed: row.last_used,
      createdAt: row.created_at,
      revokedAt: row.revoked_at,
    };
  }
}
