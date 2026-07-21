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
    changePassword: (body: { currentPassword: string; newPassword: string }) =>
      request<{ success: boolean }>('/auth/change-password', { method: 'POST', body: JSON.stringify(body) }),
    resetPassword: (body: { token: string; password: string }) =>
      request<{ success: boolean }>('/users/public/reset-password/accept', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },

  users: {
    list: () => request<User[]>('/users'),
    create: (body: CreateUserBody) => request<User>('/users', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<CreateUserBody>) =>
      request<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    resetPassword: (id: string) =>
      request<{ resetUrl: string; expiresAt: number }>(`/users/${id}/reset-password`, { method: 'POST' }),
    delete: (id: string) => request<{ success: boolean }>(`/users/${id}`, { method: 'DELETE' }),
    deleteSelf: () => request<{ success: boolean }>('/users/me', { method: 'DELETE' }),
  },

  apiKeys: {
    list: () => request<ApiKeyInfo[]>('/api-keys'),
    create: (body: CreateApiKeyBody) =>
      request<CreatedApiKey>('/api-keys', { method: 'POST', body: JSON.stringify(body) }),
    revoke: (id: string) => request<{ success: boolean }>(`/api-keys/${id}`, { method: 'DELETE' }),
  },

  invites: {
    create: (body: { email?: string; role?: User['role'] }) =>
      request<{ invite: Invite; url: string }>('/invites', { method: 'POST', body: JSON.stringify(body) }),
    list: () => request<Invite[]>('/invites'),
    delete: (id: string) => request<{ success: boolean }>(`/invites/${id}`, { method: 'DELETE' }),
    validate: (token: string) =>
      request<{ valid: boolean; role: string; email?: string }>(`/invites/public/${token}/validate`, { method: 'POST' }),
    accept: (token: string, body: { name: string; email: string; password: string }) =>
      request<User>(`/invites/public/${token}/accept`, { method: 'POST', body: JSON.stringify(body) }),
  },

  activity: {
    list: (
      limit = 50,
      offset = 0,
      filters: {
        action?: string;
        actions?: string[];
        actor?: string;
        bucket?: string;
        provider?: string;
        from?: number;
        to?: number;
      } = {},
    ) => {
      const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
      if (filters.actions && filters.actions.length > 0) {
        params.set('actions', filters.actions.join(','));
      } else if (filters.action) {
        params.set('action', filters.action);
      }
      if (filters.actor) params.set('actor', filters.actor);
      if (filters.bucket) params.set('bucket', filters.bucket);
      if (filters.provider) params.set('provider', filters.provider);
      if (typeof filters.from === 'number') params.set('from', String(filters.from));
      if (typeof filters.to === 'number') params.set('to', String(filters.to));
      return request<ActivityEntry[]>(`/activity?${params.toString()}`);
    },
  },

  buckets: {
    list: () => request<BucketsListResult>('/buckets'),
    statsMany: () => request<{ stats: Record<string, { totalSize: number; totalObjects: number }> }>('/buckets/stats'),
    create: (body: { name: string; providerId: string; limit?: number; limitUnit?: 'B' | 'KB' | 'MB' | 'GB' | 'TB' }) =>
      request<{ success: boolean }>('/buckets', { method: 'POST', body: JSON.stringify(body) }),
    delete: (name: string, providerId: string) =>
      request<{ success: boolean }>(`/buckets/${providerId}/${encodeURIComponent(name)}`, { method: 'DELETE' }),
    stats: (name: string, providerId: string) =>
      request<BucketStats>(`/buckets/${providerId}/${name}/stats`),
    setLimit: (name: string, providerId: string, limit: number, unit: 'B' | 'KB' | 'MB' | 'GB' | 'TB' = 'B') =>
      request<{ success: boolean }>(`/buckets/${providerId}/${name}/limit`, {
        method: 'PUT',
        body: JSON.stringify({ limit, unit }),
      }),
    setPublic: (name: string, providerId: string, isPublic: boolean) =>
      request<{ success: boolean }>(`/buckets/${providerId}/${name}/policy`, { method: 'PUT', body: JSON.stringify({ isPublic }) }),
    publicEndpoint: (name: string, providerId: string) =>
      request<{ url: string | null }>(`/buckets/${providerId}/${name}/public-endpoint`),
    providers: () => request<Provider[]>('/providers'),
    getProvider: (id: string) => request<Provider>(`/providers/${id}`),
    createProvider: (body: CreateProviderBody) =>
      request<Provider>('/providers', { method: 'POST', body: JSON.stringify(body) }),
    updateProvider: (id: string, body: CreateProviderBody) =>
      request<Provider>(`/providers/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  },

  copy: {
    list: () => request<CopyJob[]>('/copy/jobs'),
    get: (id: string) => request<CopyJob>(`/copy/jobs/${id}`),
    start: (body: StartCopyBody) => request<CopyJob>('/copy/start', { method: 'POST', body: JSON.stringify(body) }),
    cancel: (id: string) => request<CopyJob>(`/copy/jobs/${id}/cancel`, { method: 'POST' }),
    delete: (id: string) => request<{ success: boolean }>(`/copy/jobs/${id}`, { method: 'DELETE' }),
  },

  objects: {
    list: (bucket: string, providerId: string, prefix = '') =>
      request<StorageObject[]>(`/buckets/${providerId}/${bucket}/objects?prefix=${encodeURIComponent(prefix)}`),
    search: (bucket: string, providerId: string, query: string) =>
      request<StorageObject[]>(`/search?q=${encodeURIComponent(query)}&bucket=${bucket}&providerId=${providerId}`),
    delete: (bucket: string, providerId: string, keys: string[]) =>
      request<{ success: boolean }>(`/buckets/${providerId}/${bucket}/objects`, { method: 'DELETE', body: JSON.stringify({ keys }) }),
    fileTypes: () => request<FileTypeCount[]>('/objects/types'),
    presignedUrl: (bucket: string, key: string, providerId: string) =>
      request<{ url: string }>(`/buckets/${providerId}/${bucket}/objects/${encodeURIComponent(key)}/url`),
    createFolder: (bucket: string, providerId: string, folderName: string, prefix: string) =>
      request<{ success: boolean }>(`/buckets/${providerId}/${bucket}/folder`, { method: 'POST', body: JSON.stringify({ folderName, prefix }) }),
    upload: async (bucket: string, providerId: string, files: File[], prefix = '') => {
      const form = new FormData();
      files.forEach(f => form.append('files', f));
      if (prefix) form.append('prefix', prefix);
      const res = await fetch(`${BASE}/buckets/${providerId}/${bucket}/upload`, {
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

  favorites: {
    list: () => request<{ providerId: string; bucketName: string }[]>('/favorites'),
    add: (providerId: string, bucketName: string) =>
      request<{ success: boolean }>('/favorites', { method: 'POST', body: JSON.stringify({ providerId, bucketName }) }),
    remove: (providerId: string, bucketName: string) =>
      request<{ success: boolean }>(`/favorites/${providerId}/${encodeURIComponent(bucketName)}`, { method: 'DELETE' }),
  },

  integrations: {
    listWebhooks: () => request<Webhook[]>('/integrations/webhooks'),
    createWebhook: (body: { url: string; events: string[] }) =>
      request<Webhook>('/integrations/webhooks', { method: 'POST', body: JSON.stringify(body) }),
    deleteWebhook: (id: string) =>
      request<{ success: boolean }>(`/integrations/webhooks/${id}`, { method: 'DELETE' }),
    testWebhook: (id: string) =>
      request<{ success: boolean }>(`/integrations/webhooks/${id}/test`, { method: 'POST' }),
    getNotificationPrefs: () => request<NotificationPrefs>('/integrations/notifications'),
    updateNotificationPrefs: (prefs: Partial<NotificationPrefs>) =>
      request<NotificationPrefs>('/integrations/notifications', { method: 'PUT', body: JSON.stringify(prefs) }),
  },
};

// ── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  avatarSeed?: string;
  createdAt: number;
}

export interface Invite {
  id: string;
  token: string;
  email?: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  createdBy: string;
  usedAt?: number;
  expiresAt?: number;
  createdAt: number;
}

export interface CreateUserBody {
  name: string;
  email: string;
  password: string;
  role?: 'owner' | 'admin' | 'editor' | 'viewer';
  avatarSeed?: string;
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
  isFavorite?: boolean;
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
  kind?: string;
  endPoint?: string;
  port?: number;
  useSSL?: boolean;
  accessKey?: string;
  secretKey?: string;
  region?: string;
  createdAt?: number;
}

export interface CreateProviderBody {
  name: string;
  kind: string;
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  region: string;
}

export interface ProviderListError {
  providerId: string;
  providerName: string;
  error: string;
}

export interface BucketsListResult {
  buckets: Bucket[];
  providerErrors: ProviderListError[];
}

export interface StorageObject {
  key: string;
  size: number;
  lastModified?: string;
  etag?: string;
  isFolder?: boolean;
}

export interface FileTypeCount {
  type: string;
  count: number;
  size: number;
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  createdAt: number;
}

export interface NotificationPrefs {
  emailEnabled: boolean;
  onUpload: boolean;
  onDelete: boolean;
}

export type CopyJobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface CopyJob {
  id: string;
  sourceProviderId: string;
  sourceBucket: string;
  destProviderId: string;
  destBucket: string;
  prefix?: string;
  overwrite: boolean;
  status: CopyJobStatus;
  totalObjects: number;
  copiedObjects: number;
  totalBytes: number;
  copiedBytes: number;
  errors: { key: string; message: string }[];
  startedAt: number;
  finishedAt?: number;
}

export interface StartCopyBody {
  sourceProviderId: string;
  sourceBucket: string;
  destProviderId: string;
  destBucket: string;
  prefix?: string;
  overwrite?: boolean;
}
