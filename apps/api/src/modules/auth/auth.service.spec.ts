import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { AuthService } from './auth.service';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { User, UserInfo } from '../../domain/entities/user.entity';

class FakeUserRepository implements IUserRepository {
  users: User[] = [];

  findById(id: string): User | null {
    return this.users.find((u) => u.id === id) ?? null;
  }
  findByEmail(email: string): User | null {
    return this.users.find((u) => u.email === email) ?? null;
  }
  list(): UserInfo[] {
    return this.users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
    }));
  }
  count(): number {
    return this.users.length;
  }
  create(input: any): UserInfo {
    const id = crypto.randomUUID();
    const user: User = {
      id,
      name: input.name,
      email: input.email,
      passwordHash: bcrypt.hashSync(input.password, 4),
      role: input.role ?? 'viewer',
      createdAt: Date.now(),
    };
    this.users.push(user);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
  update(): UserInfo {
    throw new Error('not implemented');
  }
  delete(id: string): boolean {
    const before = this.users.length;
    this.users = this.users.filter((u) => u.id !== id);
    return this.users.length < before;
  }
}

describe('AuthService', () => {
  let service: AuthService;
  let repo: FakeUserRepository;

  beforeEach(async () => {
    repo = new FakeUserRepository();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ ignoreEnvFile: true, ignoreEnvVars: true }),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (cfg: ConfigService) => ({
            secret: cfg.get<string>('jwtSecret') ?? 'test-secret',
          }),
        }),
      ],
      providers: [
        AuthService,
        { provide: USER_REPOSITORY, useValue: repo },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('isSetupComplete returns false initially', () => {
    expect(service.isSetupComplete()).toBe(false);
  });

  it('setup creates an owner and returns a token', async () => {
    const result = await service.setup({
      name: 'Owner',
      email: 'a@b.com',
      password: 'secret123',
    });
    expect(result.token).toBeDefined();
    expect(result.user.role).toBe('owner');
    expect(service.isSetupComplete()).toBe(true);
  });

  it('setup throws when already complete', async () => {
    await service.setup({ name: 'A', email: 'a@b.com', password: 'secret123' });
    await expect(
      service.setup({ name: 'B', email: 'c@d.com', password: 'secret123' }),
    ).rejects.toThrow();
  });

  it('login succeeds with valid credentials', async () => {
    await service.setup({ name: 'A', email: 'a@b.com', password: 'secret123' });
    const result = await service.login({ email: 'a@b.com', password: 'secret123' });
    expect(result.token).toBeDefined();
  });

  it('login fails with wrong password', async () => {
    await service.setup({ name: 'A', email: 'a@b.com', password: 'secret123' });
    await expect(
      service.login({ email: 'a@b.com', password: 'wrong' }),
    ).rejects.toThrow();
  });
});
