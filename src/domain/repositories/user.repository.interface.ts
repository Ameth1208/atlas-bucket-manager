import { User, UserInfo, CreateUserData, UpdateUserData } from '../entities/user.entity';

export interface IUserRepository {
  findById(id: string): User | null;
  findByEmail(email: string): User | null;
  create(data: CreateUserData): User;
  update(id: string, data: UpdateUserData): User | null;
  delete(id: string): boolean;
  list(): UserInfo[];
  count(): number;
}
