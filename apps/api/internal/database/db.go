package database

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
)

type DB struct {
	*sql.DB
}

func Connect(dbDir string) (*DB, error) {
	if err := os.MkdirAll(dbDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create db directory: %w", err)
	}

	dbFile := filepath.Join(dbDir, "atlas.db")
	db, err := sql.Open("sqlite", dbFile)
	if err != nil {
		return nil, fmt.Errorf("failed to open sqlite db: %w", err)
	}

	// Optimize SQLite connection pool
	db.SetMaxOpenConns(1) // SQLite performs best with a single writer connection

	// Pragmas
	if _, err := db.Exec(`
		PRAGMA journal_mode = WAL;
		PRAGMA foreign_keys = ON;
		PRAGMA busy_timeout = 5000;
	`); err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to execute pragmas: %w", err)
	}

	wrapped := &DB{db}
	if err := wrapped.Migrate(); err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to run migrations: %w", err)
	}

	return wrapped, nil
}

func (db *DB) Migrate() error {
	schema := `
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
	`

	if _, err := db.Exec(schema); err != nil {
		return err
	}

	// Idempotent column additions
	_, _ = db.Exec("ALTER TABLE users ADD COLUMN avatar_seed TEXT;")
	_, _ = db.Exec("ALTER TABLE users ADD COLUMN password_reset_token TEXT;")
	_, _ = db.Exec("ALTER TABLE users ADD COLUMN password_reset_expires_at INTEGER;")
	_, _ = db.Exec("CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(password_reset_token);")

	return nil
}
