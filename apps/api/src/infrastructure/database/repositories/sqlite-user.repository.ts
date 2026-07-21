import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from '../database.service';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import {
  CreateUserInput,
  User,
  UserInfo,
} from '../../../domain/entities/user.entity';

export class SqliteUserRepository implements IUserRepository {
  constructor(
    private readonly database: DatabaseService,
  ) {}

  findById(id: string): User | null {
    const row = this.database.db
      .prepare('SELECT * FROM users WHERE id = ?')
      .get(id) as any;
    return row ? this.map(row) : null;
  }

  findByEmail(email: string): User | null {
    const row = this.database.db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(email) as any;
    return row ? this.map(row) : null;
  }

  findByResetToken(token: string): User | null {
    const row = this.database.db
      .prepare('SELECT * FROM users WHERE password_reset_token = ?')
      .get(token) as any;
    return row ? this.map(row) : null;
  }

  setPasswordResetToken(id: string, token: string, expiresAt: number): void {
    this.database.db
      .prepare(
        'UPDATE users SET password_reset_token = ?, password_reset_expires_at = ? WHERE id = ?',
      )
      .run(token, expiresAt, id);
  }

  clearPasswordResetToken(id: string): void {
    this.database.db
      .prepare(
        'UPDATE users SET password_reset_token = NULL, password_reset_expires_at = NULL WHERE id = ?',
      )
      .run(id);
  }

  list(): UserInfo[] {
    const rows = this.database.db
      .prepare('SELECT * FROM users ORDER BY created_at DESC')
      .all() as any[];
    return rows.map((r) => this.toInfo(r));
  }

  count(): number {
    const row = this.database.db
      .prepare('SELECT COUNT(*) as c FROM users')
      .get() as { c: number };
    return row.c;
  }

  create(input: CreateUserInput): UserInfo {
    const id = crypto.randomUUID();
    const passwordHash = bcrypt.hashSync(input.password, 10);
    const role = input.role ?? 'viewer';
    const avatarSeed = input.avatarSeed ?? null;
    this.database.db
      .prepare(
        `INSERT INTO users (id, name, email, password_hash, role, avatar_seed) VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(id, input.name, input.email, passwordHash, role, avatarSeed);
    const row = this.database.db
      .prepare('SELECT * FROM users WHERE id = ?')
      .get(id) as any;
    return this.toInfo(row);
  }

  update(id: string, data: Partial<CreateUserInput>): UserInfo {
    const current = this.findById(id);
    if (!current) throw new Error('User not found');
    const name = data.name ?? current.name;
    const email = data.email ?? current.email;
    const role = data.role ?? current.role;
    const avatarSeed = data.avatarSeed !== undefined ? data.avatarSeed : current.avatarSeed ?? null;
    const passwordHash = data.password
      ? bcrypt.hashSync(data.password, 10)
      : current.passwordHash;
    this.database.db
      .prepare(
        `UPDATE users SET name = ?, email = ?, role = ?, password_hash = ?, avatar_seed = ? WHERE id = ?`,
      )
      .run(name, email, role, passwordHash, avatarSeed, id);
    const row = this.database.db
      .prepare('SELECT * FROM users WHERE id = ?')
      .get(id) as any;
    return this.toInfo(row);
  }

  delete(id: string): boolean {
    const result = this.database.db
      .prepare('DELETE FROM users WHERE id = ?')
      .run(id);
    return result.changes > 0;
  }

  private map(row: any): User {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      avatarSeed: row.avatar_seed ?? undefined,
      passwordResetToken: row.password_reset_token ?? undefined,
      passwordResetExpiresAt: row.password_reset_expires_at ?? undefined,
      createdAt: row.created_at,
    };
  }

  private toInfo(row: any): UserInfo {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      avatarSeed: row.avatar_seed ?? undefined,
      createdAt: row.created_at,
    };
  }
}
