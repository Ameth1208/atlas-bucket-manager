import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { UserInfo } from '../../domain/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
  ) {}

  list(): UserInfo[] {
    return this.users.list();
  }

  get(id: string): UserInfo {
    const user = this.users.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  create(dto: CreateUserDto): UserInfo {
    return this.users.create(dto);
  }

  update(id: string, dto: UpdateUserDto): UserInfo {
    return this.users.update(id, dto);
  }

  resetPassword(id: string): { temporaryPassword: string } {
    const user = this.users.findById(id);
    if (!user) throw new NotFoundException('User not found');
    const temporaryPassword = crypto.randomBytes(6).toString('hex');
    this.users.update(id, { password: temporaryPassword });
    return { temporaryPassword };
  }

  remove(id: string): { success: boolean } {
    const ok = this.users.delete(id);
    if (!ok) throw new NotFoundException('User not found');
    return { success: true };
  }
}
