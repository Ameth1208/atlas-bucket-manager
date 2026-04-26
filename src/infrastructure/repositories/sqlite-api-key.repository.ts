import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/database';
import { IApiKeyRepository } from '../../domain/repositories/api-key.repository.interface';
import { ApiKey, ApiKeyInfo, CreateApiKeyData, CreatedApiKey } from '../../domain/entities/api-key.entity';

interface ApiKeyRow {
  id: string;
  name: string;
  key_hash: string;
  prefix: string;
  scopes: string;
  user_id: string;
  bucket_filter: string | null;
  last_used: number | null;
  created_at: number;
  revoked_at: number | null;
}

function rowToApiKey(row: ApiKeyRow): ApiKey {
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

function rowToApiKeyInfo(row: ApiKeyRow): ApiKeyInfo {
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

export class SqliteApiKeyRepository implements IApiKeyRepository {
  private get db() { return getDatabase(); }

  findById(id: string): ApiKey | null {
    const row = this.db.prepare('SELECT * FROM api_keys WHERE id = ?').get(id) as ApiKeyRow | undefined;
    return row ? rowToApiKey(row) : null;
  }

  findByHash(keyHash: string): ApiKey | null {
    const row = this.db.prepare(
      'SELECT * FROM api_keys WHERE key_hash = ? AND revoked_at IS NULL'
    ).get(keyHash) as ApiKeyRow | undefined;
    return row ? rowToApiKey(row) : null;
  }

  create(data: CreateApiKeyData): CreatedApiKey {
    const id = uuidv4();
    const random = crypto.randomBytes(24).toString('base64url');
    const fullKey = `atl_live_${random}`;
    const keyHash = crypto.createHash('sha256').update(fullKey).digest('hex');
    const prefix = `atl_live_${random.substring(0, 8)}`;

    this.db.prepare(
      `INSERT INTO api_keys (id, name, key_hash, prefix, scopes, user_id, bucket_filter)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(id, data.name, keyHash, prefix, data.scopes, data.userId, data.bucketFilter ?? null);

    return {
      id,
      name: data.name,
      prefix,
      scopes: data.scopes,
      userId: data.userId,
      bucketFilter: data.bucketFilter ?? null,
      lastUsed: null,
      createdAt: Math.floor(Date.now() / 1000),
      revokedAt: null,
      fullKey,
    };
  }

  revoke(id: string): boolean {
    const result = this.db.prepare(
      'UPDATE api_keys SET revoked_at = unixepoch() WHERE id = ? AND revoked_at IS NULL'
    ).run(id);
    return result.changes > 0;
  }

  updateLastUsed(id: string): void {
    this.db.prepare('UPDATE api_keys SET last_used = unixepoch() WHERE id = ?').run(id);
  }

  listByUser(userId: string): ApiKeyInfo[] {
    const rows = this.db.prepare(
      'SELECT * FROM api_keys WHERE user_id = ? ORDER BY created_at DESC'
    ).all(userId) as ApiKeyRow[];
    return rows.map(rowToApiKeyInfo);
  }

  listAll(): ApiKeyInfo[] {
    const rows = this.db.prepare(
      'SELECT * FROM api_keys ORDER BY created_at DESC'
    ).all() as ApiKeyRow[];
    return rows.map(rowToApiKeyInfo);
  }
}
