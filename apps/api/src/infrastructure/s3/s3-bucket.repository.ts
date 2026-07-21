import { Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as http from 'http';
import * as https from 'https';
import { S3Service } from './s3.service';
import { DatabaseService } from '../database/database.service';
import { IBucketRepository, BucketListResult } from '../../domain/repositories/bucket.repository';
import {
  Bucket,
  BucketStats,
  CreateBucketInput,
} from '../../domain/entities/bucket.entity';
import { StorageObject, SearchResult } from '../../domain/entities/object.entity';
import { createTtlCache } from '../cache/ttl-cache';
import {
  CreateProviderInput,
  ProviderCredentials,
  ProviderInfo,
} from '../../domain/entities/provider.entity';
import * as crypto from 'crypto';
import { Client as MinioClient } from 'minio';

export class S3BucketRepository implements IBucketRepository {
  private readonly logger = new Logger(S3BucketRepository.name);
  // Cache the file-type breakdown for 60s. The walk is expensive on large buckets
  // and the dashboard polls this endpoint on mount.
  private readonly fileTypesCache = createTtlCache<{ type: string; count: number; size: number }[]>(60_000);
  // Cache the per-bucket stats for 30s. Invalidated on upload/delete.
  private readonly statsCache = createTtlCache<{ totalSize: number; totalObjects: number; limit?: number }>(30_000);

  constructor(
    private readonly s3: S3Service,
    private readonly database: DatabaseService,
  ) {}

  private buildTestAgent(useSSL: boolean): https.Agent | http.Agent {
    const opts = {
      keepAlive: true,
      connectTimeout: 5_000,
      timeout: 8_000,
    };
    return useSSL ? new https.Agent(opts) : new http.Agent(opts);
  }

  // ── Providers ──────────────────────────────────────────────────

  listProviders(): ProviderInfo[] {
    return this.s3.listProviders();
  }

  getProvider(id: string): ProviderInfo | null {
    return this.s3.findProvider(id);
  }

  async createProvider(input: CreateProviderInput): Promise<ProviderInfo> {
    // Test connection before persisting
    const testClient = new MinioClient({
      endPoint: input.endPoint,
      port: input.port,
      useSSL: input.useSSL ?? false,
      accessKey: input.accessKey,
      secretKey: input.secretKey,
      region: input.region ?? 'us-east-1',
      transportAgent: this.buildTestAgent(input.useSSL ?? false),
    });

    try {
      await this.withTimeout(testClient.listBuckets(), 6000, 'listBuckets');
    } catch (err: any) {
      const detail = this.describeError(err);
      this.logger.warn(`Connection test failed for "${input.name}": ${detail}`);
      throw new Error(`No se pudo conectar al proveedor: ${detail}`);
    }

    const id = crypto.randomUUID();
    this.database.db
      .prepare(
        `INSERT INTO provider_configs
          (id, name, kind, endpoint, port, use_ssl, access_key, secret_key, region)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        id,
        input.name,
        input.kind,
        input.endPoint,
        input.port,
        input.useSSL ? 1 : 0,
        input.accessKey,
        input.secretKey,
        input.region ?? 'us-east-1',
      );
    return this.s3.findProvider(id)!;
  }

  private async withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    let timer: NodeJS.Timeout | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Timeout (${ms}ms) esperando ${label}`)), ms);
    });
    try {
      return await Promise.race([promise, timeout]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  private describeError(err: any): string {
    if (!err) return 'Error desconocido';
    if (typeof err === 'string') return err;

    if (err.message?.startsWith('Timeout (')) {
      return `${err.message}. Verifica que el endpoint, puerto y SSL sean correctos.`;
    }

    if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.code === 'EHOSTUNREACH') {
      const endpoint = (err.address || err.host) ? `${err.address ?? err.host}:${err.port ?? '?'}` : '';
      return `Conexión rechazada o timeout (${err.code})${endpoint ? ` hacia ${endpoint}` : ''}. Verifica endpoint, puerto y SSL.`;
    }

    const parts: string[] = [];
    if (err.code) parts.push(`[${err.code}]`);
    if (err.message) parts.push(err.message);
    else if (err.name) parts.push(err.name);
    if (err.cause?.message) parts.push(`causa: ${err.cause.message}`);
    if (!parts.length) {
      try { return JSON.stringify(err); } catch { return String(err); }
    }
    return parts.join(' ');
  }

  async updateProvider(
    id: string,
    input: Partial<CreateProviderInput>,
  ): Promise<ProviderInfo> {
    const existing = this.s3.findProvider(id);
    if (!existing) {
      throw new Error('Provider not found');
    }

    const merged: CreateProviderInput = {
      name: input.name ?? existing.name,
      kind: input.kind ?? (existing.kind as CreateProviderInput['kind']),
      endPoint: input.endPoint ?? existing.endPoint,
      port: input.port ?? existing.port,
      useSSL: input.useSSL ?? existing.useSSL,
      accessKey: input.accessKey ?? existing.accessKey,
      secretKey: input.secretKey ?? existing.secretKey,
      region: input.region ?? existing.region,
    };

    const credentialsChanged =
      merged.endPoint !== existing.endPoint ||
      merged.port !== existing.port ||
      merged.useSSL !== existing.useSSL ||
      merged.accessKey !== existing.accessKey ||
      merged.secretKey !== existing.secretKey ||
      merged.region !== existing.region;

    if (credentialsChanged) {
      const testClient = new MinioClient({
        endPoint: merged.endPoint,
        port: merged.port,
        useSSL: merged.useSSL,
        accessKey: merged.accessKey,
        secretKey: merged.secretKey,
        region: merged.region,
        transportAgent: this.buildTestAgent(merged.useSSL),
      });
      try {
        await this.withTimeout(testClient.listBuckets(), 6000, 'listBuckets');
      } catch (err: any) {
        const detail = this.describeError(err);
        this.logger.warn(
          `Connection test failed for updated "${merged.name}": ${detail}`,
        );
        throw new Error(`No se pudo conectar al proveedor: ${detail}`);
      }
    }

    this.database.db
      .prepare(
        `UPDATE provider_configs
            SET name = ?, kind = ?, endpoint = ?, port = ?, use_ssl = ?,
                access_key = ?, secret_key = ?, region = ?
          WHERE id = ?`,
      )
      .run(
        merged.name,
        merged.kind,
        merged.endPoint,
        merged.port,
        merged.useSSL ? 1 : 0,
        merged.accessKey,
        merged.secretKey,
        merged.region,
        id,
      );

    this.s3.invalidateClient(id);
    return this.s3.findProvider(id)!;
  }

  deleteProvider(id: string): boolean {
    const result = this.database.db
      .prepare('DELETE FROM provider_configs WHERE id = ?')
      .run(id);
    if (result.changes > 0) {
      this.s3.invalidateClient(id);
      return true;
    }
    return false;
  }

  getProviderCredentials(providerId: string): ProviderCredentials | null {
    const p = this.s3.findProvider(providerId);
    return p ? { accessKey: p.accessKey, secretKey: p.secretKey } : null;
  }

  // ── Buckets ────────────────────────────────────────────────────

  async listBuckets(): Promise<BucketListResult> {
    const providers = this.s3.listProviders();
    const buckets: Bucket[] = [];
    const providerErrors: BucketListResult['providerErrors'] = [];

    for (const provider of providers) {
      try {
        const client = this.s3.getClient(provider.id);
        const list = await client.listBuckets();
        for (const b of list) {
          const bucketName = b.name;
          const config = this.database.db
            .prepare('SELECT * FROM bucket_configs WHERE provider_id = ? AND name = ?')
            .get(provider.id, bucketName) as any;

          let isPublic = config?.is_public === 1;
          try {
            const policy = await client.getBucketPolicy(bucketName);
            isPublic = this.isPublicPolicy(policy);
            // Sync local config with actual policy state
            this.database.db
              .prepare(
                'UPDATE bucket_configs SET is_public = ? WHERE provider_id = ? AND name = ?',
              )
              .run(isPublic ? 1 : 0, provider.id, bucketName);
          } catch {
            // No policy set or error — keep config value
          }

          buckets.push({
            name: bucketName,
            providerId: provider.id,
            providerName: provider.name,
            creationDate: b.creationDate ?? new Date(),
            isPublic,
            limit: config?.max_size ?? undefined,
          });
        }
      } catch (err: any) {
        const detail = this.describeError(err);
        this.logger.warn(`Provider ${provider.id} unreachable: ${detail}`);
        providerErrors.push({
          providerId: provider.id,
          providerName: provider.name,
          error: detail,
        });
      }
    }
    return { buckets, providerErrors };
  }

  async createBucket(input: CreateBucketInput): Promise<void> {
    const client = this.s3.getClient(input.providerId);
    await client.makeBucket(input.name, '');

    this.database.db
      .prepare(
        `INSERT OR IGNORE INTO bucket_configs (id, provider_id, name) VALUES (?, ?, ?)`,
      )
      .run(crypto.randomUUID(), input.providerId, input.name);
    this.fileTypesCache.clear();
  }

  async deleteBucket(providerId: string, name: string): Promise<void> {
    const client = this.s3.getClient(providerId);

    // Empty bucket before deletion
    const stream = client.listObjectsV2(name, '', true);
    const keys: string[] = [];
    for await (const obj of stream) {
      if (obj.name) keys.push(obj.name);
    }
    if (keys.length > 0) {
      await client.removeObjects(name, keys);
    }
    await client.removeBucket(name);

    this.database.db
      .prepare('DELETE FROM bucket_configs WHERE provider_id = ? AND name = ?')
      .run(providerId, name);
    this.fileTypesCache.clear();
  }

  async setBucketVisibility(
    providerId: string,
    name: string,
    isPublic: boolean,
  ): Promise<void> {
    const client = this.s3.getClient(providerId);
    const policy = this.buildBucketPolicy(name, isPublic);
    if (isPublic) {
      await client.setBucketPolicy(name, JSON.stringify(policy));
    } else {
      await client.setBucketPolicy(name, '');
    }

    this.database.db
      .prepare(
        `UPDATE bucket_configs SET is_public = ? WHERE provider_id = ? AND name = ?`,
      )
      .run(isPublic ? 1 : 0, providerId, name);
  }

  setBucketLimit(
    providerId: string,
    name: string,
    maxSize: number,
  ): void {
    this.database.db
      .prepare(
        `UPDATE bucket_configs SET max_size = ? WHERE provider_id = ? AND name = ?`,
      )
      .run(maxSize, providerId, name);
    this.statsCache.delete(`${providerId}:${name}`);
  }

  getPublicEndpoint(providerId: string, name: string): string | null {
    const config = this.database.db
      .prepare(
        'SELECT is_public FROM bucket_configs WHERE provider_id = ? AND name = ?',
      )
      .get(providerId, name) as { is_public: number } | undefined;
    if (!config || config.is_public !== 1) return null;
    const provider = this.s3.findProvider(providerId);
    if (!provider) return null;
    const proto = provider.useSSL ? 'https' : 'http';
    const portSegment =
      (provider.useSSL && provider.port === 443) || (!provider.useSSL && provider.port === 80)
        ? ''
        : `:${provider.port}`;
    return `${proto}://${provider.endPoint}${portSegment}/${name}`;
  }

  getBucketLimit(providerId: string, name: string): number | null {
    const row = this.database.db
      .prepare('SELECT max_size FROM bucket_configs WHERE provider_id = ? AND name = ?')
      .get(providerId, name) as { max_size: number | null } | undefined;
    return row?.max_size ?? null;
  }

  async getBucketUsage(providerId: string, name: string): Promise<number> {
    const client = this.s3.getClient(providerId);
    const stream = client.listObjectsV2(name, '', true);
    let size = 0;
    for await (const obj of stream) {
      if (obj.name && !obj.name.endsWith('/')) {
        size += obj.size ?? 0;
      }
    }
    return await Promise.resolve(size);
  }

  async getBucketStats(
    providerId: string,
    name: string,
  ): Promise<BucketStats> {
    const cacheKey = `${providerId}:${name}`;
    const cached = this.statsCache.get(cacheKey);
    if (cached) return { ...cached, providerId };

    const stats = await this.walkBucketStats(providerId, name);
    this.statsCache.set(cacheKey, stats);
    return { ...stats, providerId };
  }

  async getBucketStatsMany(
    buckets: { providerId: string; name: string }[],
  ): Promise<Record<string, { totalSize: number; totalObjects: number; limit?: number }>> {
    const result: Record<string, { totalSize: number; totalObjects: number; limit?: number }> = {};
    const toFetch: { providerId: string; name: string }[] = [];

    for (const b of buckets) {
      const key = `${b.providerId}:${b.name}`;
      const cached = this.statsCache.get(key);
      if (cached) {
        result[key] = cached;
      } else {
        toFetch.push(b);
      }
    }

    if (toFetch.length === 0) return result;

    const allSettled = await Promise.allSettled(
      toFetch.map(async (b) => {
        const stats = await this.walkBucketStats(b.providerId, b.name);
        return { key: `${b.providerId}:${b.name}`, stats };
      }),
    );

    for (const r of allSettled) {
      if (r.status === 'fulfilled') {
        this.statsCache.set(r.value.key, r.value.stats);
        result[r.value.key] = r.value.stats;
      } else {
        const key = (r.reason as { key?: string })?.key;
        if (key) result[key] = { totalSize: 0, totalObjects: 0 };
      }
    }
    return result;
  }

  private async walkBucketStats(
    providerId: string,
    name: string,
  ): Promise<{ totalSize: number; totalObjects: number; limit?: number }> {
    const client = this.s3.getClient(providerId);
    const stream = client.listObjectsV2(name, '', true);
    let count = 0;
    let size = 0;
    for await (const obj of stream) {
      if (obj.name && !obj.name.endsWith('/')) {
        count++;
        size += obj.size ?? 0;
      }
    }
    const config = this.database.db
      .prepare('SELECT max_size FROM bucket_configs WHERE provider_id = ? AND name = ?')
      .get(providerId, name) as { max_size: number | null } | undefined;
    return await Promise.resolve({
      totalSize: size,
      totalObjects: count,
      limit: config?.max_size ?? undefined,
    });
  }

  // ── Objects ────────────────────────────────────────────────────

  async listObjects(
    providerId: string,
    bucket: string,
    prefix = '',
  ): Promise<StorageObject[]> {
    const client = this.s3.getClient(providerId);
    const seen = new Set<string>();
    const list: StorageObject[] = [];
    const stream = client.listObjectsV2(bucket, prefix, false);
    for await (const obj of stream) {
      // MinIO returns real objects with `name` and common prefixes with `prefix`
      const key = obj.name || obj.prefix;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      list.push({
        key,
        size: obj.size ?? 0,
        lastModified: obj.lastModified?.toISOString(),
        etag: obj.etag,
        isFolder: key.endsWith('/'),
      });
    }
    return await Promise.resolve(list);
  }

  async uploadFile(
    providerId: string,
    bucket: string,
    objectName: string,
    filePath: string,
  ): Promise<void> {
    const client = this.s3.getClient(providerId);
    const contentType = this.guessContentType(objectName);
    const metaData = { 'Content-Type': contentType };
    await client.fPutObject(bucket, objectName, filePath, metaData);
    try {
      await fs.unlink(filePath);
    } catch {
      /* ignore */
    }
    this.fileTypesCache.clear();
    this.statsCache.delete(`${providerId}:${bucket}`);
  }

  async deleteObjects(
    providerId: string,
    bucket: string,
    keys: string[],
  ): Promise<void> {
    if (keys.length === 0) return;
    const client = this.s3.getClient(providerId);

    const toDelete = new Set<string>();
    for (const key of keys) {
      toDelete.add(key);
      if (key.endsWith('/')) {
        // Deleting a folder also deletes everything inside it
        const stream = client.listObjectsV2(bucket, key, true);
        for await (const obj of stream) {
          if (obj.name) toDelete.add(obj.name);
        }
      }
    }

    await client.removeObjects(bucket, [...toDelete]);
    this.fileTypesCache.clear();
    this.statsCache.delete(`${providerId}:${bucket}`);
  }

  async createFolder(
    providerId: string,
    bucket: string,
    folderName: string,
    prefix: string,
  ): Promise<void> {
    const client = this.s3.getClient(providerId);
    const key = (prefix ? prefix.replace(/\/$/, '') + '/' : '') + folderName + '/';
    // Create empty object with the folder marker (S3 has no real folders)
    const { Readable } = await import('stream');
    await client.putObject(bucket, key, Readable.from(Buffer.alloc(0)), 0, {});
  }

  async searchObjects(
    bucket: string,
    providerId: string,
    query: string,
  ): Promise<SearchResult[]> {
    const all = await this.listObjects(providerId, bucket, '');
    const q = query.toLowerCase();
    const provider = this.s3.findProvider(providerId);
    return all
      .filter((o) => o.key.toLowerCase().includes(q))
      .map((o) => ({
        ...o,
        bucket,
        providerId,
        providerName: provider?.name ?? 'unknown',
      }));
  }

  async getFileTypes(): Promise<{ type: string; count: number; size: number }[]> {
    const cached = this.fileTypesCache.get('all');
    if (cached) return cached;

    const { buckets } = await this.listBuckets();
    const totals: Record<string, { count: number; size: number }> = {};

    for (const provider of this.s3.listProviders()) {
      const client = this.s3.getClient(provider.id);
      for (const bucket of buckets.filter((b) => b.providerId === provider.id)) {
        const stream = client.listObjectsV2(bucket.name, '', true);
        for await (const obj of stream) {
          if (!obj.name || obj.name.endsWith('/')) continue;
          const ext = obj.name.split('.').pop()?.toLowerCase() ?? '';
          const type = this.classifyFileType(ext);
          totals[type] = totals[type] || { count: 0, size: 0 };
          totals[type].count++;
          totals[type].size += obj.size ?? 0;
        }
      }
    }

    const result = Object.entries(totals)
      .map(([type, { count, size }]) => ({ type, count, size }))
      .sort((a, b) => b.size - a.size);
    this.fileTypesCache.set('all', result);
    return result;
  }

  private classifyFileType(ext: string): string {
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico', 'avif'].includes(ext)) return 'image';
    if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'm4v'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma'].includes(ext)) return 'audio';
    if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'py', 'java', 'cpp', 'c', 'go', 'rs', 'php', 'rb', 'swift', 'kt', 'json', 'xml', 'yaml', 'yml', 'sql', 'sh', 'bash', 'zsh'].includes(ext)) return 'code';
    if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'md', 'csv', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods'].includes(ext)) return 'doc';
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'tgz'].includes(ext)) return 'archive';
    return 'other';
  }

  // ── Streaming ──────────────────────────────────────────────────

  async getPresignedUrl(
    providerId: string,
    bucket: string,
    key: string,
    expirySeconds = 3600,
  ): Promise<string> {
    const provider = this.s3.findProvider(providerId);
    if (!provider) throw new Error(`Provider not found: ${providerId}`);

    // Resolve the correct region for this provider/bucket. If a probe
    // (getBucketLocation) reports a different region than the one stored
    // in the DB, we use it for signing. The result is cached per provider
    // so we only probe once.
    const region = await this.resolveRegion(providerId, bucket, provider);
    const client = this.s3.buildClient(provider, region);
    return client.presignedGetObject(bucket, key, expirySeconds);
  }

  private regionCache = new Map<string, string>();
  private regionProbes = new Map<string, Promise<string>>();

  private async resolveRegion(
    providerId: string,
    bucket: string,
    provider: ProviderInfo,
  ): Promise<string> {
    const cacheKey = `${providerId}:${bucket}`;
    const cached = this.regionCache.get(cacheKey);
    if (cached) return cached;

    const inFlight = this.regionProbes.get(cacheKey);
    if (inFlight) return inFlight;

    const probe = this.probeRegion(provider, bucket);
    this.regionProbes.set(cacheKey, probe);
    const region = await probe;
    this.regionCache.set(cacheKey, region);
    this.regionProbes.delete(cacheKey);
    return region;
  }

  private async probeRegion(provider: ProviderInfo, bucket: string): Promise<string> {
    // 1. Try the provider's stored region first.
    // 2. On failure, try common S3 regions and the empty string.
    // 3. The first region that signs a successful bucket location request wins.
    const fallbacks = uniqueRegions([
      provider.region,
      'us-east-1',
      '',
      'auto',
      'us-west-1',
      'us-west-2',
      'eu-west-1',
      'eu-central-1',
      'ap-southeast-1',
    ]);

    let lastErr: unknown = null;
    for (const region of fallbacks) {
      const client = this.s3.buildClient(provider, region);
      try {
        await client.getBucketRegionAsync(bucket);
        if (region !== provider.region) {
          this.logger.warn(
            `Region fallback for provider ${provider.name}: stored=${provider.region} actual=${region || '<empty>'}`,
          );
        }
        return region;
      } catch (err) {
        lastErr = err;
        // If the S3 server told us the right region, jump straight to it.
        const hinted = extractRegionFromError(err);
        if (hinted && !fallbacks.includes(hinted)) {
          try {
            const hintedClient = this.s3.buildClient(provider, hinted);
            await hintedClient.getBucketRegionAsync(bucket);
            this.logger.warn(
              `Region fallback (server-hinted) for provider ${provider.name}: ${hinted || '<empty>'}`,
            );
            return hinted;
          } catch (e) {
            lastErr = e;
          }
        }
      }
    }
    // Couldn't determine a working region. Fall back to the stored one
    // so the URL is at least signed with consistent credentials.
    this.logger.error(
      `Could not determine region for ${provider.name}/${bucket}: ${(lastErr as Error)?.message ?? 'unknown'}`,
    );
    return provider.region;
  }

  getObjectStream(
    providerId: string,
    bucket: string,
    key: string,
  ): Promise<NodeJS.ReadableStream> {
    const client = this.s3.getClient(providerId);
    return client.getObject(bucket, key);
  }

  // ── Helpers ────────────────────────────────────────────────────

  private buildBucketPolicy(bucket: string, isPublic: boolean) {
    if (!isPublic) return {};
    return {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicRead',
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucket}/*`],
        },
      ],
    };
  }

  private isPublicPolicy(policy: string | object | null | undefined): boolean {
    if (!policy) return false;
    try {
      const p = typeof policy === 'string' ? JSON.parse(policy) : policy;
      const statements = Array.isArray(p?.Statement) ? p.Statement : [p?.Statement].filter(Boolean);
      return statements.some((s: any) =>
        s?.Effect === 'Allow' &&
        (s?.Principal === '*' ||
          (typeof s?.Principal === 'object' &&
            (Array.isArray(s.Principal?.AWS)
              ? s.Principal.AWS.includes('*')
              : s.Principal?.AWS === '*'))) &&
        (Array.isArray(s?.Action)
          ? s.Action.includes('s3:GetObject') || s.Action.includes('s3:*')
          : s?.Action === 's3:GetObject' || s?.Action === 's3:*'),
      );
    } catch {
      return false;
    }
  }

  private guessContentType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() ?? '';
    const map: Record<string, string> = {
      html: 'text/html',
      css: 'text/css',
      js: 'application/javascript',
      json: 'application/json',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      pdf: 'application/pdf',
      txt: 'text/plain',
      mp4: 'video/mp4',
      mp3: 'audio/mpeg',
    };
    return map[ext] ?? 'application/octet-stream';
  }
}

function uniqueRegions(input: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of input) {
    if (!seen.has(r)) {
      seen.add(r);
      out.push(r);
    }
  }
  return out;
}

function extractRegionFromError(err: unknown): string | null {
  if (!err || typeof err !== 'object') return null;
  const e = err as { code?: string; region?: string; message?: string };
  if (typeof e.region === 'string' && e.region.length > 0) return e.region;
  if (e.code === 'PermanentRedirect' && typeof e.message === 'string') {
    const m = e.message.match(/<Region>([^<]+)<\/Region>/i);
    if (m) return m[1];
  }
  return null;
}
