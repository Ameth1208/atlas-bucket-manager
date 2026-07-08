import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import { S3Service } from './s3.service';
import { DatabaseService } from '../database/database.service';
import { IBucketRepository } from '../../domain/repositories/bucket.repository';
import {
  Bucket,
  BucketStats,
  CreateBucketInput,
} from '../../domain/entities/bucket.entity';
import { StorageObject, SearchResult } from '../../domain/entities/object.entity';
import {
  CreateProviderInput,
  ProviderCredentials,
  ProviderInfo,
} from '../../domain/entities/provider.entity';
import * as crypto from 'crypto';

@Injectable()
export class S3BucketRepository implements IBucketRepository {
  private readonly logger = new Logger(S3BucketRepository.name);

  constructor(
    private readonly s3: S3Service,
    private readonly database: DatabaseService,
  ) {}

  // ── Providers ──────────────────────────────────────────────────

  listProviders(): ProviderInfo[] {
    return this.s3.listProviders();
  }

  getProvider(id: string): ProviderInfo | null {
    return this.s3.findProvider(id);
  }

  createProvider(input: CreateProviderInput): ProviderInfo {
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

  async listBuckets(): Promise<Bucket[]> {
    const providers = this.s3.listProviders();
    const results: Bucket[] = [];

    for (const provider of providers) {
      try {
        const client = this.s3.getClient(provider.id);
        const buckets = await client.listBuckets();
        for (const b of buckets) {
          const bucketName = b.name;
          const config = this.database.db
            .prepare('SELECT * FROM bucket_configs WHERE provider_id = ? AND name = ?')
            .get(provider.id, bucketName) as any;
          results.push({
            name: bucketName,
            providerId: provider.id,
            providerName: provider.name,
            creationDate: b.creationDate ?? new Date(),
            isPublic: config?.is_public === 1,
            limit: config?.max_size ?? undefined,
          });
        }
      } catch (err: any) {
        this.logger.warn(`Provider ${provider.id} unreachable: ${err.message}`);
      }
    }
    return results;
  }

  async createBucket(input: CreateBucketInput): Promise<void> {
    const client = this.s3.getClient(input.providerId);
    await client.makeBucket(input.name, '');

    this.database.db
      .prepare(
        `INSERT OR IGNORE INTO bucket_configs (id, provider_id, name) VALUES (?, ?, ?)`,
      )
      .run(crypto.randomUUID(), input.providerId, input.name);
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

  async getBucketStats(
    providerId: string,
    name: string,
  ): Promise<BucketStats> {
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
      .get(providerId, name) as any;

    return {
      count,
      size,
      limit: config?.max_size ?? undefined,
      providerId,
    };
  }

  // ── Objects ────────────────────────────────────────────────────

  async listObjects(
    providerId: string,
    bucket: string,
    prefix = '',
  ): Promise<StorageObject[]> {
    const client = this.s3.getClient(providerId);
    const list: StorageObject[] = [];
    const stream = client.listObjectsV2(bucket, prefix, false);
    for await (const obj of stream) {
      if (obj.name) {
        list.push({
          key: obj.name,
          size: obj.size ?? 0,
          lastModified: obj.lastModified?.toISOString(),
          etag: obj.etag,
          isFolder: obj.name.endsWith('/'),
        });
      }
    }
    return list;
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
      fs.unlinkSync(filePath);
    } catch {
      /* ignore */
    }
  }

  async deleteObjects(
    providerId: string,
    bucket: string,
    keys: string[],
  ): Promise<void> {
    if (keys.length === 0) return;
    const client = this.s3.getClient(providerId);
    await client.removeObjects(bucket, keys);
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

  // ── Streaming ──────────────────────────────────────────────────

  async getPresignedUrl(
    providerId: string,
    bucket: string,
    key: string,
    expirySeconds = 3600,
  ): Promise<string> {
    const client = this.s3.getClient(providerId);
    return client.presignedGetObject(bucket, key, expirySeconds);
  }

  async getObjectStream(
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
