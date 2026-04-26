import { IApiKeyRepository } from '../../../domain/repositories/api-key.repository.interface';

export class RevokeApiKeyUseCase {
  constructor(private apiKeyRepository: IApiKeyRepository) {}

  execute(id: string, requesterId: string, requesterRole: string): void {
    const key = this.apiKeyRepository.findById(id);
    if (!key) throw new Error('NOT_FOUND');

    const isOwnerOrAdmin = requesterRole === 'owner' || requesterRole === 'admin';
    if (!isOwnerOrAdmin && key.userId !== requesterId) {
      throw new Error('FORBIDDEN');
    }

    const revoked = this.apiKeyRepository.revoke(id);
    if (!revoked) throw new Error('ALREADY_REVOKED');
  }
}
