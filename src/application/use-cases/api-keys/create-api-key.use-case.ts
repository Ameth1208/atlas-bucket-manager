import { IApiKeyRepository } from '../../../domain/repositories/api-key.repository.interface';
import { CreatedApiKey, CreateApiKeyData } from '../../../domain/entities/api-key.entity';

export class CreateApiKeyUseCase {
  constructor(private apiKeyRepository: IApiKeyRepository) {}

  execute(data: CreateApiKeyData): CreatedApiKey {
    return this.apiKeyRepository.create(data);
  }
}
