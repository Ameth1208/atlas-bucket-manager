import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private _db!: Database.Database;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const dbPath = this.config.get<string>('dbPath') ?? './data';
    try {
      await fs.access(dbPath);
    } catch {
      await fs.mkdir(dbPath, { recursive: true });
    }
    const file = path.join(dbPath, 'atlas.db');
    this._db = new Database(file);
    this._db.pragma('journal_mode = WAL');
    this._db.pragma('foreign_keys = ON');
    this.runMigrations();
    this.logger.log(`📁 Database ready at ${file}`);
  }

  onModuleDestroy(): void {
    this._db?.close();
  }

  get db(): Database.Database {
    return this._db;
  }

  private runMigrations(): void {
    this._db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'viewer',
        avatar_seed TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );

      CREATE TABLE IF NOT EXISTS api_keys (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        key_hash TEXT NOT NULL UNIQUE,
        prefix TEXT NOT NULL,
        scopes TEXT NOT NULL DEFAULT 'read',
        user_id TEXT NOT NULL,
        bucket_filter TEXT,
        last_used INTEGER,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        revoked_at INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        actor TEXT NOT NULL,
        action TEXT NOT NULL,
        target TEXT,
        bucket TEXT,
        provider TEXT,
        ip TEXT,
        status_code INTEGER,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );

      CREATE TABLE IF NOT EXISTS provider_configs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        kind TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        port INTEGER NOT NULL,
        use_ssl INTEGER NOT NULL DEFAULT 0,
        access_key TEXT NOT NULL,
        secret_key TEXT NOT NULL,
        region TEXT NOT NULL DEFAULT 'us-east-1',
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );

      CREATE TABLE IF NOT EXISTS bucket_configs (
        id TEXT PRIMARY KEY,
        provider_id TEXT NOT NULL,
        name TEXT NOT NULL,
        is_public INTEGER NOT NULL DEFAULT 0,
        max_size INTEGER,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        FOREIGN KEY (provider_id) REFERENCES provider_configs(id) ON DELETE CASCADE,
        UNIQUE(provider_id, name)
      );

      CREATE TABLE IF NOT EXISTS invites (
        id TEXT PRIMARY KEY,
        token TEXT NOT NULL UNIQUE,
        email TEXT,
        role TEXT NOT NULL DEFAULT 'viewer',
        created_by TEXT NOT NULL,
        used_at INTEGER,
        expires_at INTEGER,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );

      CREATE TABLE IF NOT EXISTS copy_jobs (
        id TEXT PRIMARY KEY,
        actor TEXT,
        source_provider_id TEXT NOT NULL,
        source_bucket TEXT NOT NULL,
        dest_provider_id TEXT NOT NULL,
        dest_bucket TEXT NOT NULL,
        prefix TEXT,
        overwrite INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'queued',
        total_objects INTEGER NOT NULL DEFAULT 0,
        copied_objects INTEGER NOT NULL DEFAULT 0,
        total_bytes INTEGER NOT NULL DEFAULT 0,
        copied_bytes INTEGER NOT NULL DEFAULT 0,
        errors_json TEXT NOT NULL DEFAULT '[]',
        started_at INTEGER NOT NULL DEFAULT (unixepoch()),
        finished_at INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_copy_jobs_status ON copy_jobs(status);
      CREATE INDEX IF NOT EXISTS idx_copy_jobs_started ON copy_jobs(started_at DESC);

      CREATE TABLE IF NOT EXISTS favorites (
        user_id TEXT NOT NULL,
        provider_id TEXT NOT NULL,
        bucket_name TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        PRIMARY KEY (user_id, provider_id, bucket_name),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);

      CREATE TABLE IF NOT EXISTS webhooks (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        events TEXT NOT NULL,
        secret TEXT,
        created_by TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );

      CREATE TABLE IF NOT EXISTS notification_prefs (
        user_id TEXT PRIMARY KEY,
        email_enabled INTEGER NOT NULL DEFAULT 1,
        on_upload INTEGER NOT NULL DEFAULT 1,
        on_delete INTEGER NOT NULL DEFAULT 1,
        updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    try {
      this._db.exec('ALTER TABLE users ADD COLUMN avatar_seed TEXT;');
    } catch {
      // Column already exists
    }
    try {
      this._db.exec('ALTER TABLE users ADD COLUMN password_reset_token TEXT;');
    } catch {
      // Column already exists
    }
    try {
      this._db.exec('ALTER TABLE users ADD COLUMN password_reset_expires_at INTEGER;');
    } catch {
      // Column already exists
    }
    this._db.exec('CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(password_reset_token);');
  }
}
