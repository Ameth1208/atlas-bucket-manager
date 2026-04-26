import { ApiKey, ApiKeyInfo, CreateApiKeyData, CreatedApiKey } from '../entities/api-key.entity';

export interface IApiKeyRepository {
  findById(id: string): ApiKey | null;
  findByHash(keyHash: string): ApiKey | null;
  create(data: CreateApiKeyData): CreatedApiKey;
  revoke(id: string): boolean;
  updateLastUsed(id: string): void;
  listByUser(userId: string): ApiKeyInfo[];
  listAll(): ApiKeyInfo[];
}
