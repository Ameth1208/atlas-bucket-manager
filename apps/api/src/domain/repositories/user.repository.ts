import { User, UserInfo, CreateUserInput } from '../entities/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface IUserRepository {
  findById(id: string): User | null;
  findByEmail(email: string): User | null;
  findByResetToken(token: string): User | null;
  list(): UserInfo[];
  count(): number;
  create(input: CreateUserInput): UserInfo;
  update(id: string, data: Partial<CreateUserInput>): UserInfo;
  delete(id: string): boolean;
  setPasswordResetToken(id: string, token: string, expiresAt: number): void;
  clearPasswordResetToken(id: string): void;
}
