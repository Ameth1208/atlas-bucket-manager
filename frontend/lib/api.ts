const BASE = '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// Auth
export const api = {
  auth: {
    status: () => request<{ isSetup: boolean }>('/auth/status'),
    me: () => request<User>('/auth/me'),
    setup: (body: { name: string; email: string; password: string }) =>
      request<{ success: boolean; user: User }>('/auth/setup', { method: 'POST', body: JSON.stringify(body) }),
    login: (body: { email: string; password: string }) =>
      request<{ success: boolean; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),
  },

  users: {
    list: () => request<User[]>('/users'),
    create: (body: CreateUserBody) => request<User>('/users', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<CreateUserBody>) =>
      request<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request<{ success: boolean }>(`/users/${id}`, { method: 'DELETE' }),
  },

  apiKeys: {
    list: () => request<ApiKeyInfo[]>('/api-keys'),
    create: (body: CreateApiKeyBody) =>
      request<CreatedApiKey>('/api-keys', { method: 'POST', body: JSON.stringify(body) }),
    revoke: (id: string) => request<{ success: boolean }>(`/api-keys/${id}`, { method: 'DELETE' }),
  },

  activity: {
    list: (limit = 50, offset = 0) => request<ActivityEntry[]>(`/activity?limit=${limit}&offset=${offset}`),
  },

  buckets: {
    list: () => request<Bucket[]>('/buckets'),
    create: (body: { name: string; providerId: string }) =>
      request<Bucket>('/buckets', { method: 'POST', body: JSON.stringify(body) }),
    delete: (name: string, providerId: string) =>
      request<{ success: boolean }>(`/buckets/${name}?providerId=${providerId}`, { method: 'DELETE' }),
    stats: (name: string, providerId: string) =>
      request<BucketStats>(`/buckets/${providerId}/${name}/stats`),
    setLimit: (name: string, providerId: string, limit: number) =>
      request<{ success: boolean }>(`/buckets/${providerId}/${name}/limit`, { method: 'PUT', body: JSON.stringify({ limit }) }),
    setPublic: (name: string, providerId: string, isPublic: boolean) =>
      request<{ success: boolean }>(`/buckets/${providerId}/${name}/policy`, { method: 'PUT', body: JSON.stringify({ public: isPublic }) }),
    providers: () => request<Provider[]>('/providers'),
    createProvider: (body: CreateProviderBody) =>
      request<Provider>('/providers', { method: 'POST', body: JSON.stringify(body) }),
  },

  objects: {
    list: (bucket: string, providerId: string, prefix = '') =>
      request<StorageObject[]>(`/objects/${bucket}?providerId=${providerId}&prefix=${encodeURIComponent(prefix)}`),
    search: (bucket: string, providerId: string, query: string) =>
      request<StorageObject[]>(`/objects/${bucket}/search?providerId=${providerId}&query=${encodeURIComponent(query)}`),
    delete: (bucket: string, providerId: string, keys: string[]) =>
      request<{ success: boolean }>(`/objects/${bucket}`, { method: 'DELETE', body: JSON.stringify({ providerId, keys }) }),
    presignedUrl: (bucket: string, key: string, providerId: string) =>
      request<{ url: string }>(`/objects/${bucket}/${encodeURIComponent(key)}/presigned?providerId=${providerId}`),
    createFolder: (bucket: string, providerId: string, folderPath: string) =>
      request<{ success: boolean }>(`/objects/${bucket}/folder`, { method: 'POST', body: JSON.stringify({ providerId, folderPath }) }),
    upload: async (bucket: string, providerId: string, files: File[], prefix = '') => {
      const form = new FormData();
      files.forEach(f => form.append('files', f));
      form.append('providerId', providerId);
      if (prefix) form.append('prefix', prefix);
      const res = await fetch(`${BASE}/objects/${bucket}/upload`, {
        method: 'POST',
        credentials: 'include',
        body: form,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      return res.json();
    },
  },
};

// ── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: number;
}

export interface CreateUserBody {
  name: string;
  email: string;
  password: string;
  role?: string;
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

export interface CreateApiKeyBody {
  name: string;
  scopes: string;
  bucketFilter?: string;
}

export interface ActivityEntry {
  id: number;
  userId?: string;
  actor: string;
  action: string;
  target?: string;
  bucket?: string;
  provider?: string;
  ip?: string;
  statusCode?: number;
  createdAt: number;
}

export interface Bucket {
  name: string;
  creationDate?: string;
  providerId: string;
  providerName?: string;
  isPublic?: boolean;
  limit?: number;
}

export interface BucketStats {
  totalObjects: number;
  totalSize: number;
  limit?: number;
  providerId: string;
}

export interface Provider {
  id: string;
  name: string;
}

export interface CreateProviderBody {
  name: string;
  kind: string;
  endpoint: string;
  port: number;
  ssl: boolean;
  accessKey: string;
  secretKey: string;
  region: string;
}

export interface StorageObject {
  key: string;
  size: number;
  lastModified?: string;
  etag?: string;
  isFolder?: boolean;
}
