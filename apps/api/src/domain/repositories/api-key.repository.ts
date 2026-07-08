import {
  ApiKey,
  ApiKeyInfo,
  CreatedApiKey,
  CreateApiKeyInput,
} from '../entities/api-key.entity';

export const API_KEY_REPOSITORY = Symbol('API_KEY_REPOSITORY');

export interface IApiKeyRepository {
  findByHash(hash: string): ApiKey | null;
  findById(id: string): ApiKey | null;
  list(userId?: string): ApiKeyInfo[];
  create(input: CreateApiKeyInput & { keyHash: string; prefix: string; fullKey: string }): CreatedApiKey;
  revoke(id: string): boolean;
  updateLastUsed(id: string): void;
}
