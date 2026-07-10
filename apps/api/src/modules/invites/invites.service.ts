import { Inject, Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { IInviteRepository, INVITE_REPOSITORY } from '../../domain/repositories/invite.repository';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { Invite } from '../../domain/entities/invite.entity';
import { UserInfo } from '../../domain/entities/user.entity';

@Injectable()
export class InvitesService {
  constructor(
    @Inject(INVITE_REPOSITORY)
    private readonly invites: IInviteRepository,
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
  ) {}

  create(role: 'owner' | 'admin' | 'editor' | 'viewer' = 'viewer', email?: string, createdBy?: string): Invite {
    const token = crypto.randomUUID();
    return this.invites.create({
      token,
      email,
      role,
      createdBy: createdBy ?? '',
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });
  }

  validate(token: string): { valid: boolean; role: string; email?: string } {
    const invite = this.invites.findByToken(token);
    if (!invite || invite.usedAt || (invite.expiresAt && invite.expiresAt < Date.now())) {
      return { valid: false, role: 'viewer' };
    }
    return { valid: true, role: invite.role, email: invite.email };
  }

  accept(token: string, name: string, password: string, email?: string): UserInfo {
    const invite = this.invites.findByToken(token);
    if (!invite) throw new NotFoundException('Invite not found');
    if (invite.usedAt) throw new BadRequestException('Invite already used');
    if (invite.expiresAt && invite.expiresAt < Date.now()) throw new BadRequestException('Invite expired');

    const finalEmail = email || invite.email;
    if (!finalEmail) throw new BadRequestException('Email is required');

    const existing = this.users.findByEmail(finalEmail);
    if (existing) throw new ConflictException('Email already registered');

    const user = this.users.create({
      name,
      email: finalEmail,
      password,
      role: invite.role,
    });

    this.invites.markUsed(invite.id);
    return user;
  }

  list(): Invite[] {
    return this.invites.list();
  }

  remove(id: string): { success: boolean } {
    const ok = this.invites.delete(id);
    if (!ok) throw new NotFoundException('Invite not found');
    return { success: true };
  }
}
