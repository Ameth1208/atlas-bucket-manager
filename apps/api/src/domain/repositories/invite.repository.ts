import { Invite } from '../entities/invite.entity';

export const INVITE_REPOSITORY = Symbol('INVITE_REPOSITORY');

export interface IInviteRepository {
  create(input: Omit<Invite, 'id' | 'createdAt'>): Invite;
  findByToken(token: string): Invite | null;
  findById(id: string): Invite | null;
  markUsed(id: string): void;
  list(): Invite[];
  delete(id: string): boolean;
}
