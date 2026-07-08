export interface ApiKey {
  id: string;
  name: string;
  keyHash: string;
  prefix: string;
  scopes: string;
  userId: string;
  bucketFilter: string | null;
  lastUsed: number | null;
  createdAt: number;
  revokedAt: number | null;
}

export interface ApiKeyInfo {
  id: string;
  name: string;
  prefix: string;
  scopes: string;
  userId: string;
  bucketFilter: string | null;
  lastUsed: number | null;
  createdAt: number;
  revokedAt: number | null;
}

export interface CreatedApiKey extends ApiKeyInfo {
  fullKey: string;
}

export interface CreateApiKeyInput {
  name: string;
  scopes: string;
  bucketFilter?: string;
  userId: string;
}
