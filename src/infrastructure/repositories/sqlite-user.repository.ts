import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { getDatabase } from '../database/database';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User, UserInfo, CreateUserData, UpdateUserData, UserRole } from '../../domain/entities/user.entity';

interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: number;
}

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role as UserRole,
    createdAt: row.created_at,
  };
}

function rowToUserInfo(row: UserRow): UserInfo {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as UserRole,
    createdAt: row.created_at,
  };
}

export class SqliteUserRepository implements IUserRepository {
  private get db() { return getDatabase(); }

  findById(id: string): User | null {
    const row = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
    return row ? rowToUser(row) : null;
  }

  findByEmail(email: string): User | null {
    const row = this.db.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRow | undefined;
    return row ? rowToUser(row) : null;
  }

  create(data: CreateUserData): User {
    const id = uuidv4();
    const passwordHash = bcrypt.hashSync(data.password, 10);
    const role = data.role || 'viewer';
    this.db.prepare(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    ).run(id, data.name, data.email, passwordHash, role);
    return this.findById(id)!;
  }

  update(id: string, data: UpdateUserData): User | null {
    const user = this.findById(id);
    if (!user) return null;

    const name = data.name ?? user.name;
    const email = data.email ?? user.email;
    const role = data.role ?? user.role;
    const passwordHash = data.password ? bcrypt.hashSync(data.password, 10) : user.passwordHash;

    this.db.prepare(
      'UPDATE users SET name = ?, email = ?, password_hash = ?, role = ? WHERE id = ?'
    ).run(name, email, passwordHash, role, id);

    return this.findById(id);
  }

  delete(id: string): boolean {
    const result = this.db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return result.changes > 0;
  }

  list(): UserInfo[] {
    const rows = this.db.prepare('SELECT * FROM users ORDER BY created_at ASC').all() as UserRow[];
    return rows.map(rowToUserInfo);
  }

  count(): number {
    const row = this.db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    return row.count;
  }
}
