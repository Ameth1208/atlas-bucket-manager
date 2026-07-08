import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private _db!: Database.Database;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const dbPath = this.config.get<string>('dbPath') ?? './data';
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
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
    `);
  }
}
