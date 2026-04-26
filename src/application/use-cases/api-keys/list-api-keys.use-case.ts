import { IApiKeyRepository } from '../../../domain/repositories/api-key.repository.interface';
import { ApiKeyInfo } from '../../../domain/entities/api-key.entity';

export class ListApiKeysUseCase {
  constructor(private apiKeyRepository: IApiKeyRepository) {}

  execute(userId: string, role: string): ApiKeyInfo[] {
    if (role === 'owner' || role === 'admin') {
      return this.apiKeyRepository.listAll();
    }
    return this.apiKeyRepository.listByUser(userId);
  }
}
