import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { UserInfo } from '../../domain/entities/user.entity';
import { ActivityService } from '../activity/activity.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
    private readonly activity: ActivityService,
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

  create(dto: CreateUserDto, actor?: string): UserInfo {
    const created = this.users.create(dto);
    if (actor) {
      this.activity.log({ actor, action: 'user', target: created.email });
    }
    return created;
  }

  update(id: string, dto: UpdateUserDto, actor?: string): UserInfo {
    const before = this.users.findById(id);
    if (!before) throw new NotFoundException('User not found');
    if (
      before.role === 'owner' &&
      dto.role &&
      dto.role !== 'owner' &&
      this.users.list().filter((u) => u.role === 'owner').length <= 1
    ) {
      throw new NotFoundException('Cannot demote the last owner');
    }
    const updated = this.users.update(id, dto);
    if (actor) {
      this.activity.log({ actor, action: 'user', target: updated.email });
    }
    return updated;
  }

  resetPassword(id: string, actor?: string): { resetUrl: string; expiresAt: number } {
    const user = this.users.findById(id);
    if (!user) throw new NotFoundException('User not found');
    const token = crypto.randomBytes(24).toString('base64url');
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    this.users.setPasswordResetToken(id, token, expiresAt);
    if (actor) {
      this.activity.log({ actor, action: 'user', target: `${user.email} (reset)` });
    }
    return { resetUrl: `/reset-password?token=${token}`, expiresAt };
  }

  acceptPasswordReset(token: string, newPassword: string): { success: boolean } {
    const user = this.users.findByResetToken(token);
    if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt < Date.now()) {
      throw new NotFoundException('Invalid or expired reset token');
    }
    this.users.update(user.id, { password: newPassword });
    this.users.clearPasswordResetToken(user.id);
    return { success: true };
  }

  remove(id: string, actor?: string): { success: boolean } {
    const user = this.users.findById(id);
    if (!user) throw new NotFoundException('User not found');
    const remainingOwners = this.users.list().filter((u) => u.role === 'owner' && u.id !== id).length;
    if (user.role === 'owner' && remainingOwners === 0) {
      throw new NotFoundException('Cannot remove the last owner');
    }
    const ok = this.users.delete(id);
    if (!ok) throw new NotFoundException('User not found');
    if (actor) {
      this.activity.log({ actor, action: 'user', target: user.email });
    }
    return { success: true };
  }

  deleteSelf(actor: AuthUser): { success: boolean } {
    if (!actor?.userId) throw new NotFoundException('User not found');
    return this.remove(actor.userId, actor.email);
  }
}
